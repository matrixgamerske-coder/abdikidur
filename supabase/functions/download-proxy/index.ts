import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { linkId } = await req.json();
    if (!linkId) {
      return new Response(JSON.stringify({ error: "linkId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the drive link
    const { data: link, error: linkError } = await supabase
      .from("game_drive_links")
      .select("*")
      .eq("id", linkId)
      .single();

    if (linkError || !link) {
      return new Response(JSON.stringify({ error: "Link not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("game_id", link.game_id)
      .eq("payment_status", "completed")
      .maybeSingle();

    if (purchaseError || !purchase) {
      return new Response(
        JSON.stringify({ error: "Purchase required to download" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch file from Google Drive
    // Convert sharing URL to direct download URL
    let downloadUrl = link.drive_url;
    const gdMatch = downloadUrl.match(/\/d\/([^/]+)/);
    if (gdMatch) {
      downloadUrl = `https://drive.google.com/uc?export=download&id=${gdMatch[1]}`;
    }

    const fileResponse = await fetch(downloadUrl, { redirect: "follow" });
    if (!fileResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch file from storage" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const contentType =
      fileResponse.headers.get("content-type") || "application/octet-stream";
    const body = fileResponse.body;

    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${link.label || "download"}"`,
      },
    });
  } catch (err) {
    console.error("Download proxy error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
