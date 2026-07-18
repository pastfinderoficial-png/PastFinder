import { Link } from 'react-router-dom';
import { FileText, Mic, Video, Crown } from 'lucide-react';

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

export function StoryCard({ post }: { post: StoryCardPost }) {
  const Icon = mediaIcon[post.media_type] || FileText;
  const creatorName = post.creators?.display_name || 'Narrador PastFinder';
  const creatorAvatar =
    post.creators?.profile_image_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=0F172A&color=D4AF37`;
  const isPremium = Boolean(post.is_ppv || post.is_sub_only);

  return (
    <article className="overflow-hidden rounded-2xl bg-surface-elevated shadow-sm transition-all hover:shadow-md">
      <Link to={`/historia/${post.id}`} className="block p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-3 py-1 text-xs font-bold uppercase tracking-widest text-deep-navy/65">
            <Icon size={13} />
            {post.category || 'Relato'}
          </span>
          {isPremium && (
            <span className="inline-flex items-center gap-1 rounded-full bg-heritage-gold px-3 py-1 text-xs font-bold uppercase tracking-widest text-deep-navy">
              <Crown size={13} />
              Premium
            </span>
          )}
        </div>

        <h3 className="mb-2 text-xl font-bold leading-snug text-deep-navy">{post.title}</h3>
        {post.description && <p className="mb-4 line-clamp-2 text-sm text-deep-navy/60">{post.description}</p>}

        <div className="flex items-center gap-2">
          <img src={creatorAvatar} alt={creatorName} className="h-8 w-8 rounded-full object-cover" />
          <span className="text-sm font-bold text-deep-navy/70">{creatorName}</span>
        </div>
      </Link>
    </article>
  );
}
