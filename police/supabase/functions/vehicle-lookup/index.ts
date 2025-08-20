import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { plateNumber } = await req.json()

    // Look up vehicle information
    const { data: vehicle, error: vehicleError } = await supabaseClient
      .from('vehicles')
      .select('*')
      .eq('plate_number', plateNumber)
      .single()

    if (vehicleError && vehicleError.code !== 'PGRST116') {
      throw vehicleError
    }

    // Look up violations for this plate
    const { data: violations, error: violationsError } = await supabaseClient
      .from('violations')
      .select('*')
      .eq('plate_number', plateNumber)

    if (violationsError) {
      throw violationsError
    }

    return new Response(
      JSON.stringify({
        vehicle: vehicle || null,
        violations: violations || [],
        outstandingViolations: violations?.filter(v => v.status === 'Pending').length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})