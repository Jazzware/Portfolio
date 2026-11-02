// Capas de experiencia, de la más reciente a la más antigua.
// El grosor de cada capa en la página es proporcional a su duración.
// pending: true marca datos de ejemplo que hay que reemplazar con los del CV (se ven punteados).
import type { Lang } from './content';

export interface Layer {
  company: string;
  role: Record<Lang, string>;
  /** Año y mes de inicio, 'AAAA-MM'. */
  from: string;
  /** 'AAAA-MM', o null si sigue vigente. */
  to: string | null;
  place?: string;
  highlights: Record<Lang, string[]>;
  pending?: boolean;
}

export const experience: Layer[] = [
  {
    company: 'Empresa más reciente',
    role: { es: 'Software Engineer', en: 'Software Engineer' },
    from: '2022-01',
    to: '2026-08',
    place: 'Ciudad de México',
    highlights: {
      es: ['Logro concreto con números: qué cambió, para quién y cuánto.', 'Segundo logro: un sistema, una migración o un incidente que resolviste.'],
      en: ['A concrete result with numbers: what changed, for whom and by how much.', 'A second result: a system, a migration or an incident you resolved.'],
    },
    pending: true,
  },
  {
    company: 'Empresa anterior',
    role: { es: 'Desarrollador .NET', en: '.NET Developer' },
    from: '2019-06',
    to: '2021-12',
    highlights: {
      es: ['Logro concreto de este puesto.'],
      en: ['A concrete result from this role.'],
    },
    pending: true,
  },
  {
    company: 'Primer empleo',
    role: { es: 'Desarrollador de software', en: 'Software Developer' },
    from: '2018-01',
    to: '2019-05',
    highlights: {
      es: ['Lo que aprendiste o construiste aquí.'],
      en: ['What you learned or built here.'],
    },
    pending: true,
  },
];
