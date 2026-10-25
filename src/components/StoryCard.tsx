import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Mic, Video, Crown, Lock, Play } from 'lucide-react';

export type StoryCardPost = {
  id: string;
  title: string;
  description?: string | null;
  media_type: 'audio' | 'photo' | 'video';
  category?: string | null;
  is_ppv?: boolean | null;
  is_sub_only?: boolean | null;
  created_at: string;
  creators?: {
    user_id?: string;
    display_name?: string | null;
    profile_image_url?: string | null;
  } | null;
};

const mediaIcon = { audio: Mic, photo: FileText, video: Video };
const panelTone = { audio: 'bg-deep-navy', video: 'bg-heritage-gold-dark', photo: 'bg-taupe-dark' };

export function StoryCard({ post }: { post: StoryCardPost }) {
  const Icon = mediaIcon[post.media_type] || FileText;
  const creatorName = post.creators?.display_name || 'Narrador PastFinder';
  const creatorAvatar =
    post.creators?.profile_image_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=37424A&color=F5F4EE`;
  const isPremium = Boolean(post.is_ppv || post.is_sub_only);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-[1.75rem] bg-surface-elevated shadow-[0_20px_40px_-24px_rgba(55,66,74,0.25)] transition-shadow duration-200 hover:shadow-[0_24px_48px_-20px_rgba(55,66,74,0.3)]"
    >
      <Link to={`/historia/${post.id}`} className="block">
        <div className={`relative aspect-[16/8] w-full overflow-hidden md:aspect-[4/3] ${panelTone[post.media_type] || 'bg-deep-navy'}`}>
          <div className="flex h-full w-full items-center justify-center">
            <Icon size={44} className="text-cream/25" strokeWidth={1.5} />
          </div>

          {post.media_type === 'video' && !isPremium && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream/90 text-deep-navy shadow-md transition-transform duration-200 group-hover:scale-110">
                <Play size={20} fill="currentColor" />
              </span>
            </div>
          )}

          {isPremium && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-deep-navy/55 text-cream backdrop-blur-[2px]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream/15 backdrop-blur">
                <Lock size={18} />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest">Contenido premium</span>
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-cream/90 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-deep-navy backdrop-blur">
              <Icon size={12} />
              {post.category || 'Relato'}
            </span>
          </div>

          {isPremium && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-heritage-gold px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-cream">
              <Crown size={12} />
              Premium
            </span>
          )}
        </div>

        <div className="p-5">
          <h3 className="mb-1.5 line-clamp-2 text-lg font-bold leading-snug tracking-tight text-deep-navy">{post.title}</h3>
          {post.description && <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-deep-navy/60">{post.description}</p>}

          <div className="flex items-center gap-2">
            <img src={creatorAvatar} alt={creatorName} className="h-7 w-7 rounded-full object-cover" />
            <span className="truncate text-sm font-semibold text-deep-navy/70">{creatorName}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
