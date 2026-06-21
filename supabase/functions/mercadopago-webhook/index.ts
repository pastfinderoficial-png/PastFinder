// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { MercadoPagoConfig, Payment } from "npm:mercadopago";

const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN") || "APP_USR-780169382214975-060322-0b0b85480ad78f811216d3d21e002fd2-3138432350";
const mpClient = new MercadoPagoConfig({ accessToken: mpAccessToken });

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
// Usamos el cliente de supabase con service_role para tener privilegios de admin y saltar RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default {
  async fetch(req: Request) {
    if (req.method === "POST") {
      try {
        const url = new URL(req.url);
        const action = url.searchParams.get("topic") || url.searchParams.get("type");
        const id = url.searchParams.get("data.id") || url.searchParams.get("id");

        if (action === "payment" && id) {
          const paymentClient = new Payment(mpClient);
          const payment = await paymentClient.get({ id });

          // Verificar que esté aprobado
          if (payment.status === "approved" && payment.metadata) {
            const { creator_id, fan_id, type } = payment.metadata;
            const totalAmount = Number(payment.transaction_amount) || 0;

            if (creator_id && totalAmount > 0) {
              // LÓGICA DE DIVISIÓN DE GANANCIAS (20% Admin, 80% Creador)
              const platformFee = totalAmount * 0.20;
              const netAmount = totalAmount * 0.80;

              // Insertar en la tabla de ganancias
              await supabase.from("earnings").insert({
                creator_id,
                total_amount: totalAmount,
                platform_fee: platformFee,
                net_amount: netAmount,
                status: "available",
              });

              // Si es una suscripción mensual, darle el acceso al usuario
              if (type === "subscription" && fan_id !== "guest") {
                const currentPeriodEnd = new Date();
                currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

                await supabase.from("subscriptions").upsert(
                  {
                    fan_id,
                    creator_id,
                    status: "active",
                    current_period_end: currentPeriodEnd.toISOString(),
                  },
                  { onConflict: "fan_id, creator_id" }
                );
              }
            }
          }
        }

        return new Response("OK", { status: 200 });
      } catch (error) {
        console.error("Webhook error:", error);
        return new Response("Webhook processing error", { status: 500 });
      }
    }

    return new Response("Method Not Allowed", { status: 405 });
  },
};
