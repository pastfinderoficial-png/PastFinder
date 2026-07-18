import { useEffect, useState } from 'react';
import { DollarSign, FileText, Heart, MessageSquare, Users, Wallet } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { formatCLP } from '../utils/currency';

export function Dashboard() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(0);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [likesTotal, setLikesTotal] = useState(0);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);

      const [{ data: earningsData }, { count: subCount }, { data: myPosts }] = await Promise.all([
        supabase.from('earnings').select('net_amount').eq('creator_id', user.id).eq('status', 'available'),
        supabase.from('subscriptions').select('fan_id', { count: 'exact', head: true }).eq('creator_id', user.id).eq('status', 'active'),
        supabase.from('posts').select('id, likes ( user_id ), comments ( id )').eq('creator_id', user.id),
      ]);

      setEarnings(earningsData?.reduce((acc, curr) => acc + Number(curr.net_amount), 0) || 0);
      setSubscriberCount(subCount || 0);
      setPostCount(myPosts?.length || 0);
      setLikesTotal((myPosts || []).reduce((acc: number, post) => acc + (post.likes?.length || 0), 0));
      setCommentsTotal((myPosts || []).reduce((acc: number, post) => acc + (post.comments?.length || 0), 0));
      setAmount(String(earningsData?.reduce((acc, curr) => acc + Number(curr.net_amount), 0) || 0));
      setLoading(false);
    }

    void load();
  }, [user]);

  const handleWithdraw = async () => {
    if (!user) return;
    if (Number(amount) <= 0 || Number(amount) > earnings) {
      notifications.show({ title: 'Error', message: 'Monto inválido. No puede ser mayor a tus ganancias disponibles.', color: 'red' });
      return;
    }
    if (!payoutMethod.trim()) {
      notifications.show({ title: 'Error', message: 'Indica un método de pago (ej. número de cuenta o correo de Mercado Pago).', color: 'red' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('withdrawals').insert({
        creator_id: user.id,
        amount: Number(amount),
        payout_method: payoutMethod.trim(),
        status: 'pending',
      });

      if (error) throw error;
      notifications.show({ title: 'Solicitud enviada', message: 'El administrador procesará tu pago.', color: 'green' });
      setPayoutMethod('');
    } catch (error) {
      notifications.show({ title: 'Error', message: error instanceof Error ? error.message : 'No se pudo enviar la solicitud.', color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-heritage-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-32 md:py-10">
      <h1 className="mb-2 text-3xl font-bold text-deep-navy md:text-4xl">Panel</h1>
      <p className="mb-8 text-deep-navy/60">Tus ganancias y estadisticas en PastFinder.</p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Suscriptores" value={subscriberCount} />
        <StatCard icon={FileText} label="Historias" value={postCount} />
        <StatCard icon={Heart} label="Me gusta" value={likesTotal} />
        <StatCard icon={MessageSquare} label="Comentarios" value={commentsTotal} />
      </div>

      <div className="rounded-2xl bg-surface-elevated p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-heritage-gold text-deep-navy">
            <DollarSign size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-deep-navy">Tu Billetera</h2>
            <p className="text-sm font-bold text-heritage-gold">Ganancias Disponibles</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-surface-subtle p-6 text-center">
          <span className="text-5xl font-bold text-deep-navy">{formatCLP(earnings)}</span>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold uppercase tracking-widest text-deep-navy/60">
            Monto a Retirar
            <input
              type="number"
              max={earnings}
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-2 min-h-12 w-full rounded-xl bg-surface-subtle px-4 text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
            />
          </label>
          <label className="block text-sm font-bold uppercase tracking-widest text-deep-navy/60">
            Cuenta Bancaria o Correo
            <textarea
              rows={2}
              value={payoutMethod}
              onChange={(event) => setPayoutMethod(event.target.value)}
              placeholder="Ej: BCP: 123-456-789 a nombre de Juan Perez"
              className="mt-2 w-full resize-none rounded-xl bg-surface-subtle p-4 text-deep-navy outline-none focus:ring-2 focus:ring-heritage-gold"
            />
          </label>
          <button
            onClick={() => void handleWithdraw()}
            disabled={submitting || earnings <= 0}
            className="mt-4 flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-deep-navy font-bold text-cream hover:bg-deep-navy/90 disabled:opacity-50"
          >
            <Wallet size={18} />
            {submitting ? 'Enviando...' : 'Solicitar Retiro'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-surface-elevated p-5 shadow-sm">
      <Icon className="mb-3 text-heritage-gold" size={24} />
      <span className="block text-2xl font-bold text-deep-navy">{value}</span>
      <span className="text-xs font-bold uppercase tracking-widest text-deep-navy/55">{label}</span>
    </div>
  );
}
