import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { RtcTokenBuilder, RtcRole } from "npm:agora-access-token"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("[get-agora-token] Processing request...");

    // Authorization check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("[get-agora-token] No authorization header provided");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { channelName, userAccount, isVideoCall } = await req.json();
    console.log("[get-agora-token] Generating token for channel:", channelName, "userAccount:", userAccount);

    const appId = Deno.env.get('AGORA_APP_ID');
    const appCertificate = Deno.env.get('AGORA_APP_CERTIFICATE');

    if (!appId || !appCertificate) {
      console.error("[get-agora-token] Missing Agora credentials in environment");
      return new Response(
        JSON.stringify({ error: 'Agora configuration error on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!channelName || !userAccount) {
      return new Response(
        JSON.stringify({ error: 'channelName and userAccount are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Agora role: Publisher (1) or Subscriber (2)
    const role = RtcRole.PUBLISHER;
    
    // Token expiration: 24 hours
    const expirationTimeInSeconds = 24 * 60 * 60;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Build token using user account (string UUID from Supabase)
    const token = RtcTokenBuilder.buildTokenWithUserAccount(
      appId,
      appCertificate,
      channelName,
      userAccount,
      role,
      privilegeExpiredTs
    );

    console.log("[get-agora-token] Token generated successfully");

    return new Response(
      JSON.stringify({ token, appId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("[get-agora-token] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
