import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PESAPAL_BASE = "https://pay.pesapal.com/v3";

async function getPesapalToken(): Promise<string> {
  const consumerKey = Deno.env.get("PESAPAL_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("PESAPAL_CONSUMER_SECRET");
  if (!consumerKey || !consumerSecret) throw new Error("Pesapal credentials not configured");

  const res = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ consumer_key: consumerKey, consumer_secret: consumerSecret }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error?.message || "Pesapal auth failed");
  return data.token;
}

async function registerIPN(token: string, ipnUrl: string): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: "GET",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("IPN registration failed");
  return data.ipn_id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { items, callbackUrl, phone } = await req.json();
    if (!items?.length) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
    const merchantRef = crypto.randomUUID();

    // Create pending purchase records
    for (const item of items) {
      await supabase.from("purchases").insert({
        user_id: user.id,
        game_id: item.gameId,
        amount: item.price,
        payment_status: "pending",
        pesapal_merchant_ref: merchantRef,
      });
    }

    // Get Pesapal token
    const pesapalToken = await getPesapalToken();

    // Register IPN
    const ipnUrl = `${supabaseUrl}/functions/v1/pesapal-ipn`;
    const ipnId = await registerIPN(pesapalToken, ipnUrl);

    // Submit order
    const orderPayload: any = {
      id: merchantRef,
      currency: "KES",
      amount: totalAmount,
      description: `Game purchase - ${items.length} item(s)`,
      callback_url: callbackUrl || `${supabaseUrl.replace('.supabase.co', '')}/profile`,
      notification_id: ipnId,
      billing_address: {
        email_address: user.email,
        phone_number: phone || "",
        first_name: user.user_metadata?.username || "Customer",
        last_name: "",
      },
    };

    const orderRes = await fetch(`${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${pesapalToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok || orderData.error) {
      throw new Error(orderData.error?.message || "Order submission failed");
    }

    // Store tracking ID
    await supabase
      .from("purchases")
      .update({ pesapal_tracking_id: orderData.order_tracking_id })
      .eq("pesapal_merchant_ref", merchantRef);

    return new Response(
      JSON.stringify({
        redirect_url: orderData.redirect_url,
        order_tracking_id: orderData.order_tracking_id,
        merchant_reference: merchantRef,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Pesapal pay error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
