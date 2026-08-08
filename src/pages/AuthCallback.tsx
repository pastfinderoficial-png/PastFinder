import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { supabase } from '../services/supabase';
import { ensureCreatorProfile } from '../services/profile';
import { FullScreenSpinner } from '../components/FullScreenSpinner';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const finishLogin = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (cancelled) return;

      if (error || !data.session?.user) {
        notifications.show({
          title: 'Error',
          message: 'No se pudo completar el acceso con Google.',
          color: 'red',
        });
        navigate('/login');
        return;
      }

      const { user } = data.session;
      await ensureCreatorProfile(user.id, user.email ?? '');

      if (cancelled) return;
      navigate('/explorar');
    };

    finishLogin();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return <FullScreenSpinner />;
}
