import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { notifications } from '@mantine/notifications';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { formatCLP } from '../utils/currency';

initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'es-CL' });

type CreatorInfo = {
  display_name: string | null;
  profile_image_url: string | null;
  monthly_price: number | string | null;
};

export function Checkout() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const creatorId = searchParams.get('creator');

  const [creator, setCreator] = useState<CreatorInfo | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!creatorId || !user) return;
      setLoading(true);
      setError(null);

      const { data: creatorData } = await supabase
        .from('creators')
        .select('display_name, profile_image_url, monthly_price')
        .eq('user_id', creatorId)
        .maybeSingle();

      setCreator((creatorData as CreatorInfo) || null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('create-preference', {
          body: { creator_id: creatorId, fan_id: user.id },
        });

        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);

        if (data?.preferenceId) {
          setPreferenceId(data.preferenceId);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo iniciar el pago.';
        setError(message);
        notifications.show({ title: 'Error', message, color: 'red' });
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [creatorId, user]);

  if (!creatorId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-deep-navy">Falta seleccionar un narrador</h1>
        <Link to="/historias" className="mt-4 inline-block font-bold text-heritage-gold hover:underline">
          Volver a explorar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 pb-32 md:py-16">
      <div className="rounded-3xl bg-cream p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold text-deep-navy">Completar suscripcion</h1>
        {creator && (
          <div className="mb-4 flex items-center gap-3">
            <img
              src={
                creator.profile_image_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.display_name || 'Narrador')}&background=0F172A&color=D4AF37`
              }
              alt={creator.display_name || 'Narrador'}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="font-bold text-deep-navy">{creator.display_name || 'Narrador PastFinder'}</p>
              {Number(creator.monthly_price) > 0 && (
                <p className="text-sm text-deep-navy/60">{formatCLP(creator.monthly_price)}/mes</p>
              )}
            </div>
          </div>
        )}
        <p className="mb-6 text-sm text-deep-navy/70">Elige tu metodo de pago seguro con Mercado Pago.</p>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-heritage-gold border-t-transparent" />
          </div>
        ) : error ? (
          <p className="text-center text-sm font-semibold text-red-600">{error}</p>
        ) : preferenceId ? (
          <div className="min-h-[200px]">
            <Wallet initialization={{ preferenceId }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
