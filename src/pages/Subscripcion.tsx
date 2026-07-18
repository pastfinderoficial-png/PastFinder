import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

type SubscriptionRow = {
  creator_id: string;
  status: string;
  current_period_end: string | null;
  creators: {
    display_name: string | null;
    profile_image_url: string | null;
    monthly_price: number | string | null;
  } | null;
};

export function Subscripcion() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);

      const { data } = await supabase
        .from('subscriptions')
        .select('creator_id, status, current_period_end, creators ( display_name, profile_image_url, monthly_price )')
        .eq('fan_id', user.id)
        .order('current_period_end', { ascending: false });

      setSubscriptions((data || []) as unknown as SubscriptionRow[]);
      setLoading(false);
    }

    void load();
  }, [user]);

  const handleCancelRequest = () => {
    notifications.show({
      title: 'Solicitud de cancelacion',
      message: 'Para cancelar tu suscripcion escribenos a pastfinder.oficial@gmail.com y la procesaremos con Mercado Pago.',
      color: 'blue',
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-32 md:py-10">
      <h1 className="mb-2 text-3xl font-bold text-deep-navy md:text-4xl">Mi suscripcion</h1>
      <p className="mb-8 text-deep-navy/60">Narradores a los que apoyas actualmente en PastFinder.</p>

      {loading ? (
        <div className="rounded-2xl bg-surface-elevated p-12 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-heritage-gold border-t-transparent" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="rounded-2xl bg-surface-elevated p-10 text-center shadow-sm">
          <Crown className="mx-auto mb-4 text-heritage-gold" size={38} />
          <h2 className="mb-2 text-2xl font-bold text-deep-navy">Aun no tienes suscripciones activas</h2>
          <p className="mb-6 text-deep-navy/60">Explora narradores y apoya a los que mas te inspiren.</p>
          <Link to="/planes" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-deep-navy px-6 font-bold text-cream">
            Conocer planes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <div key={sub.creator_id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface-elevated p-5 shadow-sm">
              <Link to={`/autor/${sub.creator_id}`} className="flex min-w-0 items-center gap-4">
                <img
                  src={
                    sub.creators?.profile_image_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.creators?.display_name || 'Narrador')}&background=0F172A&color=D4AF37`
                  }
                  alt={sub.creators?.display_name || 'Narrador'}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-deep-navy">{sub.creators?.display_name || 'Narrador PastFinder'}</h3>
                  <p className="text-sm text-deep-navy/60">
                    {sub.status === 'active' ? 'Activa' : sub.status}
                    {sub.current_period_end && ` · Renueva el ${new Date(sub.current_period_end).toLocaleDateString()}`}
                  </p>
                </div>
              </Link>
              <button
                onClick={handleCancelRequest}
                className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-red-200 px-4 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                Cancelar suscripcion
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
