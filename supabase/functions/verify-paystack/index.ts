const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference, order_id } = await req.json();
    if (!reference || !order_id) {
      return new Response(JSON.stringify({ error: 'Missing reference or order_id' }), { status: 400, headers: corsHeaders });
    }

    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!paystackSecret) {
      return new Response(JSON.stringify({ error: 'Payment configuration error' }), { status: 500, headers: corsHeaders });
    }

    // Verify transaction with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` },
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data?.status !== 'success') {
      return new Response(JSON.stringify({ error: 'Payment not verified', details: verifyData.message }), { status: 400, headers: corsHeaders });
    }

    // Update order in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        payment_intent_id: reference,
        status: 'processing',
      })
      .eq('id', order_id);

    if (updateError) {
      return new Response(JSON.stringify({ error: 'Failed to update order', details: updateError.message }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, amount: verifyData.data.amount / 100 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
