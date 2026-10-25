import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

type FaqItem = { question: string; answer: string };

const faqs: FaqItem[] = [
  {
    question: '¿Necesito pagar para explorar PastFinder?',
    answer:
      'No. Puedes navegar historias, categorías y perfiles de narradores sin costo ni registro. Solo pagas si decides suscribirte directamente a un narrador.',
  },
  {
    question: '¿Cómo funcionan las suscripciones?',
    answer:
      'Cada narrador define su propio precio mensual. Al suscribirte a uno, desbloqueas su contenido premium mientras tu suscripción esté activa.',
  },
  {
    question: '¿Puedo compartir mis propias historias?',
    answer:
      'Sí. Desde el Estudio puedes publicar relatos escritos, audios grabados desde el navegador o videos cortos, gratis o exclusivos para suscriptores.',
  },
  {
    question: '¿Es una plataforma solo para personas mayores de 60?',
    answer:
      'PastFinder está pensada especialmente para narradores de 60+ y sus comunidades, pero cualquier persona puede explorar, seguir y apoyar sus historias.',
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl divide-y divide-deep-navy/10">
      {faqs.map((faq, index) => {
        const isOpen = open === index;
        return (
          <div key={faq.question} className="py-2">
            <button
              onClick={() => setOpen(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-lg font-bold text-deep-navy">{faq.question}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-deep-navy"
              >
                <Plus size={16} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 pr-12 leading-relaxed text-deep-navy/65">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
