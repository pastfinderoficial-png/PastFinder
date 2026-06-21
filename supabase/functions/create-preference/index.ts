// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { MercadoPagoConfig, Preference } from "npm:mercadopago";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Se inicializa con el token de acceso seguro
// Fallback en duro para desarrollo si la env var no está (NO recomendado en prod, pero útil para MVP local)
const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN") || "APP_USR-780169382214975-060322-0b0b85480ad78f811216d3d21e002fd2-3138432350";
const mpClient = new MercadoPagoConfig({ accessToken: mpAccessToken });

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    try {
      const body = await req.json();
      const { creator_id, fan_id } = body;

      if (!creator_id) {
        throw new Error("Missing creator_id");
      }

      // Obtener detalles del creador desde Supabase
      const { data: creator, error: dbError } = await ctx.supabase
        .from('creators')
        .select('monthly_price, display_name')
        .eq('user_id', creator_id)
        .single();

      if (dbError || !creator) {
        throw new Error("Creador no encontrado o error en la BD");
      }

      // Si el precio es 0 o null, lanzar error o manejar distinto
      const price = Number(creator.monthly_price) || 0;
      if (price <= 0) {
        throw new Error("El precio de suscripción no puede ser cero.");
      }

      // Crear preferencia en Mercado Pago
      const preference = new Preference(mpClient);
      const result = await preference.create({
        body: {
          items: [
            {
              id: `sub_${creator_id}`,
              title: `Suscripción Mensual - ${creator.display_name}`,
              quantity: 1,
              unit_price: price,
            }
          ],
          metadata: {
            creator_id,
            fan_id: fan_id || "guest",
            type: "subscription"
          },
          // URL pública del webhook (se debe reemplazar por la URL en producción de Supabase)
          notification_url: Deno.env.get("SUPABASE_URL") 
            ? `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`
            : "https://tudominio.com/api/webhook",
        }
      });

      return new Response(JSON.stringify({ preferenceId: result.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  }),
};
