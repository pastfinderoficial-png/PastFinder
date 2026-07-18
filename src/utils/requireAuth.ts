import type { User } from '@supabase/supabase-js';
import type { NavigateFunction } from 'react-router-dom';
import { openAuthRequiredModal } from '../components/AuthRequiredModal';

/**
 * Guard for in-page actions (like/follow/comment/favorite/subscribe) that
 * should not silently no-op for a logged-out visitor. Returns true if the
 * caller may proceed; otherwise opens the "sign in / register" modal.
 */
export function requireAuth(user: User | null, navigate: NavigateFunction, intent?: string): user is User {
  if (user) return true;
  openAuthRequiredModal(navigate, intent);
  return false;
}
