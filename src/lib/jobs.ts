// Fechas y duraciones de cada trabajo. Las comparten el mapa de la portada y la sección de experiencia.
import { content, type Lang } from '../data/content';
import { experience, type Layer } from '../data/experience';

export interface Job extends Layer {
  /** Ancla de la sección de experiencia, por ejemplo 'exp-solera'. */
  id: string;
  current: boolean;
  startYear: number;
  /** Año en que terminó, o null si sigue vigente. */
  endYear: number | null;
  /** 'feb 2022 – hoy' */
  dates: string;
  /** '4 años y 10 meses' */
  duration: string;
  /** Meses en el puesto, contando el primero y el último. */
  months: number;
}

const parse = (s: string) => { const [y, m] = s.split('-').map(Number); return new Date(y, m - 1, 1); };
const slug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Trabajos del más reciente al más antiguo, en el mismo orden que experience.ts. */
export function jobs(lang: Lang, now = new Date()): Job[] {
  const t = content[lang].experience;
  const fmt = new Intl.DateTimeFormat(lang === 'es' ? 'es-MX' : 'en-US', { month: 'short', year: 'numeric' });
  return experience.map((job) => {
    const from = parse(job.from);
    const to = job.to ? parse(job.to) : now;
    const months = Math.max(1, (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth() + 1);
    return {
      ...job,
      id: `exp-${slug(job.key ?? job.company)}`,
      current: job.to === null,
      startYear: from.getFullYear(),
      endYear: job.to ? to.getFullYear() : null,
      dates: `${fmt.format(from)} – ${job.to ? fmt.format(to) : t.present}`,
      duration: t.duration(Math.floor(months / 12), months % 12),
      months,
    };
  });
}
