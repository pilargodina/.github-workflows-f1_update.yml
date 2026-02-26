import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url);
    const year = url.searchParams.get('year') || '2025';
   const round = url.searchParams.get('round') || '1';

const { data, error } = await supabase
    .from('race_results')
    .select('*')
    .eq('year', parseInt(year))
    .eq('round', parseInt(round))
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: "Resultados no encontrados" }), { status: 404 });
  }

  // 4. Devolvemos los datos que el script de Python guardó en el JSONB
  return new Response(JSON.stringify(data.results), {
  headers: { ...corsHeaders, "Content-Type": "application/json" },
  status: 200,
  });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});