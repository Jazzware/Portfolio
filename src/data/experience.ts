// Capas de experiencia, de la más reciente a la más antigua (datos del CV).
// El grosor de cada capa en la página es proporcional a su duración.
// pending: true marca datos de ejemplo (se ven punteados).
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
  stack?: string;
  pending?: boolean;
}

export const experience: Layer[] = [
  {
    company: 'Solera',
    role: { es: 'Software Engineer II', en: 'Software Engineer II' },
    from: '2022-02',
    to: null,
    highlights: {
      es: [
        'Dirigí el proyecto para sincronizar los índices de base de datos entre ambientes, de pruebas a producción.',
        'Participé en la integración con Covideo, que permite incluir videos en los correos promocionales de agencias automotrices.',
        'Colaboré en la migración del framework de desarrollo y de la base de datos, y en la configuración de los ambientes virtuales de desarrollo y pruebas.',
        'Mantuve y actualicé reportes SSRS, ETLs y stored procedures, y la conexión entre las capas de la aplicación.',
      ],
      en: [
        'Led the project to synchronize database indexes across environments, from testing to production.',
        'Contributed to the Covideo integration, which lets automotive dealerships include videos in promotional emails.',
        'Helped migrate the development framework and the database, and set up the virtual environments for development and testing.',
        'Maintained and updated SSRS reports, ETLs and stored procedures, and the connectivity between application layers.',
      ],
    },
    stack: 'C#, .NET, SQL Server, ELK, React, AngularJS, TypeScript, Docker, Octopus Deploy, Jenkins, TeamCity, Jira',
  },
  {
    company: 'GoNet',
    role: { es: 'Jr. Software Developer', en: 'Jr. Software Developer' },
    from: '2020-12',
    to: '2022-02',
    highlights: {
      es: [
        'Diseñé y desarrollé un ERP con ASP.NET 5, patrones de arquitectura y EF Core sobre PostgreSQL.',
        'Escribí un programa en Excel VBA con expresiones regulares que deja el 99 % de los datos de prenómina limpios y corrige sus errores.',
        'Di soporte y mantenimiento a módulos del sistema hechos en Java.',
      ],
      en: [
        'Designed and built an ERP with ASP.NET 5, architectural patterns and EF Core on PostgreSQL.',
        'Wrote an Excel VBA program with regular expressions that keeps 99% of pre-payroll data clean and fixes its errors.',
        'Supported and maintained system modules written in Java.',
      ],
    },
    stack: 'C#, .NET, Blazor, Java, JavaScript, PostgreSQL, VBA',
  },
  {
    company: 'MW Software',
    role: { es: 'Software Developer', en: 'Software Developer' },
    from: '2018-12',
    to: '2020-12',
    highlights: {
      es: [
        'Migré WINSIAF, un sistema hecho a la medida en Visual FoxPro, a una aplicación web en PHP.',
        'Rehice la página principal del cliente con Bootstrap 4 y Django.',
      ],
      en: [
        'Migrated WINSIAF, a custom Visual FoxPro system, to a PHP web application.',
        "Rebuilt the client's homepage with Bootstrap 4 and Django.",
      ],
    },
    stack: 'PHP, Python, Django, JavaScript, SQL Server',
  },
  {
    company: 'LATBC Design',
    role: { es: 'Desarrollador web (prácticas)', en: 'Web Developer (internship)' },
    from: '2018-08',
    to: '2018-12',
    highlights: {
      es: [
        'Participé en Surfncasas desde el diseño de la arquitectura hasta el despliegue en producción.',
        'Desarrollé y probé proyectos en Laravel 5.8, con control de versiones en Bitbucket.',
      ],
      en: [
        'Worked on Surfncasas from architecture design to production deployment.',
        'Built and tested projects in Laravel 5.8, with version control on Bitbucket.',
      ],
    },
    stack: 'PHP, Laravel, JavaScript, MySQL, Bitbucket',
  },
];
