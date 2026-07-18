import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';
import { formatCLP } from '../utils/currency';

type Withdrawal = {
  id: string;
  creator_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payout_method: string;
  created_at: string;
  creators: {
    display_name: string;
    users: {
      email: string;
    };
  };
};

type AppUser = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'retiros' | 'usuarios'>('retiros');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (authLoading) return;

      if (!isAdmin) {
        setLoading(false);
        return;
      }

      const { data: withdrawalsData } = await supabase
        .from('withdrawals')
        .select(`
          *,
          creators (
            display_name,
            users!creators_user_id_fkey ( email )
          )
        `)
        .order('created_at', { ascending: false });

      if (withdrawalsData) {
        setWithdrawals(withdrawalsData as Withdrawal[]);
      }

      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (usersData) {
        setUsersList(usersData as AppUser[]);
      }

      setLoading(false);
    }

    void loadData();
  }, [authLoading, isAdmin]);

  const handleUpdateStatus = async (id: string, newStatus: 'completed' | 'failed') => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ status: newStatus, processed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      notifications.show({
        title: 'Estado actualizado',
        message: 'El estado se actualizó correctamente.',
        color: 'green'
      });

      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
      );
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error al actualizar estado: ' + (error instanceof Error ? error.message : 'Desconocido'),
        color: 'red'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-heritage-gold border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
        <h1 className="text-3xl font-bold text-deep-navy">Acceso Denegado</h1>
        <p className="mt-2 text-deep-navy/60">No tienes permisos de administrador para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-32">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-deep-navy md:text-4xl">Panel de Administración</h1>
        <p className="mt-2 text-deep-navy/70">Gestiona la plataforma, usuarios y finanzas.</p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('retiros')}
          className={`rounded-full px-6 py-2 text-sm font-bold transition-colors ${
            activeTab === 'retiros' ? 'bg-deep-navy text-cream' : 'bg-surface-subtle text-deep-navy/60 hover:text-deep-navy'
          }`}
        >
          Retiros de Dinero
        </button>
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`rounded-full px-6 py-2 text-sm font-bold transition-colors ${
            activeTab === 'usuarios' ? 'bg-deep-navy text-cream' : 'bg-surface-subtle text-deep-navy/60 hover:text-deep-navy'
          }`}
        >
          Usuarios Registrados ({usersList.length})
        </button>
      </div>

      {activeTab === 'retiros' && (
        <div className="overflow-hidden rounded-2xl bg-surface-elevated shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-deep-navy">
              <thead className="bg-surface-subtle text-xs uppercase text-deep-navy/60">
                <tr>
                  <th className="px-6 py-4 font-bold">Creador</th>
                  <th className="px-6 py-4 font-bold">Monto</th>
                  <th className="px-6 py-4 font-bold">Método/Cuenta</th>
                  <th className="px-6 py-4 font-bold">Estado</th>
                  <th className="px-6 py-4 font-bold">Fecha</th>
                  <th className="px-6 py-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-navy/10">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-deep-navy/50">
                      No hay solicitudes de retiro registradas.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-surface-subtle/50">
                      <td className="px-6 py-4">
                        <div className="font-bold">{withdrawal.creators.display_name || 'Desconocido'}</div>
                        <div className="text-xs text-deep-navy/60">{withdrawal.creators.users.email}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-heritage-gold">
                        {formatCLP(withdrawal.amount)}
                      </td>
                      <td className="px-6 py-4">{withdrawal.payout_method}</td>
                      <td className="px-6 py-4">
                        {withdrawal.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-800">
                            <Clock size={12} /> Pendiente
                          </span>
                        )}
                        {withdrawal.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">
                            <CheckCircle size={12} /> Completado
                          </span>
                        )}
                        {withdrawal.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">
                            <XCircle size={12} /> Fallido
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {new Date(withdrawal.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {withdrawal.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdateStatus(withdrawal.id, 'completed')}
                              className="rounded-lg bg-deep-navy px-3 py-1.5 text-xs font-bold text-cream hover:bg-deep-navy/90"
                            >
                              Marcar Pagado
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(withdrawal.id, 'failed')}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                            >
                              Rechazar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'usuarios' && (
        <div className="overflow-hidden rounded-2xl bg-surface-elevated shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-deep-navy">
              <thead className="bg-surface-subtle text-xs uppercase text-deep-navy/60">
                <tr>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Rol</th>
                  <th className="px-6 py-4 font-bold">Fecha de Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-navy/10">
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-deep-navy/50">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-subtle/50">
                      <td className="px-6 py-4 font-medium">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-widest ${u.role === 'creator' ? 'bg-heritage-gold/20 text-deep-navy' : 'bg-surface-subtle text-deep-navy/70'}`}>
                          {u.role === 'creator' ? 'Creador' : 'Fan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
