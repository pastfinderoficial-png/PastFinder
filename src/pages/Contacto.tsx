import { Mail, Phone } from 'lucide-react';

export function Contacto() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-32 md:py-10">
      <h1 className="mb-4 text-4xl font-bold text-deep-navy md:text-5xl">Contacto</h1>
      <p className="mb-8 text-lg text-deep-navy/70">
        ¿Tienes dudas, sugerencias o problemas con tu cuenta? Escríbenos, con gusto te ayudamos.
      </p>

      <div className="space-y-4">
        <a
          href="mailto:pastfinder.oficial@gmail.com"
          className="flex items-center gap-4 rounded-[1.75rem] bg-surface-elevated p-5 shadow-[0_20px_40px_-24px_rgba(55,66,74,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-20px_rgba(55,66,74,0.3)] active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-heritage-gold/20 text-heritage-gold">
            <Mail size={22} />
          </div>
          <div>
            <h3 className="font-bold text-deep-navy">Correo</h3>
            <p className="text-sm text-deep-navy/60">pastfinder.oficial@gmail.com</p>
          </div>
        </a>

        <a
          href="tel:+56972263172"
          className="flex items-center gap-4 rounded-[1.75rem] bg-surface-elevated p-5 shadow-[0_20px_40px_-24px_rgba(55,66,74,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-20px_rgba(55,66,74,0.3)] active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-heritage-gold/20 text-heritage-gold">
            <Phone size={22} />
          </div>
          <div>
            <h3 className="font-bold text-deep-navy">Teléfono</h3>
            <p className="text-sm text-deep-navy/60">+56 9 7226 3172</p>
          </div>
        </a>
      </div>
    </div>
  );
}
