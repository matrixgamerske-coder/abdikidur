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
  if (!res.ok) throw new Error("Pesapal auth failed");
  return data.token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Pesapal IPN sends GET with query params
    const url = new URL(req.url);
    const orderTrackingId = url.searchParams.get("OrderTrackingId");
    const orderMerchantReference = url.searchParams.get("OrderMerchantReference");

    if (!orderTrackingId || !orderMerchantReference) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get transaction status from Pesapal
    const pesapalToken = await getPesapalToken();
    const statusRes = await fetch(
      `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${pesapalToken}`,
        },
      }
    );

    const statusData = await statusRes.json();
    console.log("Pesapal IPN status:", JSON.stringify(statusData));

    // Status codes: 0 = INVALID, 1 = COMPLETED, 2 = FAILED, 3 = REVERSED
    let paymentStatus = "pending";
    if (statusData.payment_status_description === "Completed" || statusData.status_code === 1) {
      paymentStatus = "completed";
    } else if (statusData.status_code === 2) {
      paymentStatus = "failed";
    } else if (statusData.status_code === 3) {
      paymentStatus = "reversed";
    }

    // Update all purchases with this merchant reference
    const { error } = await supabase
      .from("purchases")
      .update({
        payment_status: paymentStatus,
        pesapal_tracking_id: orderTrackingId,
      })
      .eq("pesapal_merchant_ref", orderMerchantReference);

    if (error) {
      console.error("Failed to update purchase:", error);
    }

    // Pesapal expects a 200 response with the status
    return new Response(
      JSON.stringify({
        orderNotificationType: "IPNCHANGE",
        orderTrackingId,
        orderMerchantReference,
        status: paymentStatus === "completed" ? 200 : 500,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Pesapal IPN error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
