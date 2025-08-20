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

    const { plateNumber, violationType, violationDetails, location, officerId } = await req.json()

    // Insert violation record
    const { data: violation, error: violationError } = await supabaseClient
      .from('violations')
      .insert({
        plate_number: plateNumber,
        violation_type: violationType,
        violation_details: violationDetails,
        location: location,
        officer_id: officerId,
        status: 'Pending'
      })
      .select()
      .single()

    if (violationError) {
      throw violationError
    }

    return new Response(
      JSON.stringify({ violation }),
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