import { HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import { PastFinderLogo } from '../components/PastFinderLogo';

export function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-32 md:py-10">
      <div className="mb-8 flex justify-center">
        <PastFinderLogo />
      </div>

      <h1 className="mb-4 text-center text-4xl font-bold text-deep-navy md:text-5xl">
        Un espacio para las historias que merecen ser contadas.
      </h1>
      <p className="mx-auto mb-10 max-w-2xl text-center text-lg leading-8 text-deep-navy/70">
        PastFinder es una comunidad donde adultos mayores comparten relatos, memorias y videos
        cortos, construyen audiencia y reciben apoyo directo de quienes los siguen.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        <AboutCard icon={ShieldCheck} title="Perfiles 60+" text="Un espacio pensado para narradores mayores de 60 años y sus comunidades." />
        <AboutCard icon={Sparkles} title="Historias reales" text="Relatos, memorias y consejos de vida contados en primera persona." />
        <AboutCard icon={HeartHandshake} title="Apoyo directo" text="Cada suscripcion apoya directamente al narrador que la recibe." />
      </div>
    </div>
  );
}

function AboutCard({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-surface-elevated p-6 text-center shadow-sm">
      <Icon className="mx-auto mb-3 text-heritage-gold" size={32} />
      <h3 className="mb-2 text-lg font-bold text-deep-navy">{title}</h3>
      <p className="text-sm text-deep-navy/60">{text}</p>
    </div>
  );
}
