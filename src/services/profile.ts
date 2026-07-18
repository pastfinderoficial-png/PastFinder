import { supabase } from './supabase';

export async function ensureCreatorProfile(userId: string, email: string) {
  await supabase.from('users').upsert({
    id: userId,
    email,
    role: 'creator',
  });

  await supabase.from('creators').upsert({
    user_id: userId,
    bio: 'Creador de PastFinder 60+',
    monthly_price: 0,
    kyc_status: 'pending',
  });

  await supabase.from('fans').upsert({
    user_id: userId,
    display_name: email.split('@')[0] || 'Miembro',
  });
}
