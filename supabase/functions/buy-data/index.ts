// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const NETWORK_MAP: any = {
  'mtn': 1, 'MTN': 1, '1': 1, 1: 1,
  'glo': 2, 'GLO': 2, '2': 2, 2: 2,
  '9mobile': 3, '9MOBILE': 3, 'etisalat': 3, '3': 3, 3: 3,
  'airtel': 4, 'AIRTEL': 4, '4': 4, 4: 4
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, mobile_number, network, plan, plan_id, amount } = await req.json()
    const token = Deno.env.get('DATASTATION_API_TOKEN') || Deno.env.get('DATASTATION_API_TOKEN')

    if (!token) {
      return new Response(JSON.stringify({ Status: 'failed', message: 'API Token not set on server' }), {
        headers: {...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const finalPhone = (phone || mobile_number || '').toString().replace(/\s+/g, '')
    const finalNetwork = NETWORK_MAP[network]?? 1
    const finalPlan = plan || plan_id

    console.log('Buying:', { finalPhone, finalNetwork, finalPlan, tokenPrefix: token.substring(0,6) })

    const res = await fetch('https://datastation.com.ng/api/data/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token.trim()}`
      },
      body: JSON.stringify({
        network: finalNetwork,
        mobile_number: finalPhone,
        plan: finalPlan,
        Ported_number: false
      })
    })

    const data = await res.json()
    console.log('DataStation response:', data)

    return new Response(JSON.stringify(data), {
      headers: {...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ Status: 'failed', message: err.message }), {
      headers: {...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})