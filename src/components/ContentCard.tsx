
import { AudioPlayer } from './AudioPlayer';

interface ContentCardProps {
  creatorName: string;
  creatorAvatar: string;
  title: string;
  audioUrl: string;
  isPpv?: boolean;
  price?: string;
  hasAccess?: boolean;
}

export function ContentCard({ 
  creatorName, 
  creatorAvatar, 
  title, 
  audioUrl, 
  isPpv = false, 
  price, 
  hasAccess = false 
}: ContentCardProps) {
  return (
    <div className="card-tonal mb-6 transition-all duration-300 hover:shadow-md group">
      <div className="flex items-center gap-4 mb-4">
        <img 
          src={creatorAvatar} 
          alt={creatorName} 
          className="w-14 h-14 rounded-full object-cover shadow-sm"
        />
        <div>
          <h4 className="font-medium text-deep-navy text-lg">{creatorName}</h4>
          <p className="text-deep-navy/60 text-sm">Hace 2 horas</p>
        </div>
      </div>
      
      <h2 className="text-2xl font-newsreader font-semibold text-deep-navy mb-4">
        {title}
      </h2>
      
      <AudioPlayer 
        audioUrl={audioUrl} 
        isPpv={isPpv} 
        hasAccess={hasAccess} 
        price={price} 
      />
      
      <div className="mt-6 flex gap-3">
        <button className="flex-1 btn-secondary text-sm px-4 py-3 min-h-[48px]">
          Me gusta
        </button>
        <button className="flex-1 btn-gold text-sm px-4 py-3 min-h-[48px]">
          Suscribirme Gratis
        </button>
      </div>
    </div>
  );
}
