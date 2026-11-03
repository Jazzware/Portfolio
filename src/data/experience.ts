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
  /** Identificador propio para el ancla, cuando dos capas comparten empresa. */
  key?: string;
  /** true: se ve en la sección de experiencia pero no es una estación del mapa de la portada. */
  minor?: boolean;
}

export const experience: Layer[] = [
  {
    company: 'Solera',
    role: { es: 'Software Engineer II', en: 'Software Engineer II' },
    from: '2022-02',
    to: '2026-09',
    highlights: {
      es: [
        'Lideré de principio a fin la sincronización de índices en ~120 bases de datos que dan servicio a ~3,200 clientes del CRM.',
        'Primer ingeniero de software contratado en México para el equipo de CRM; fundé el equipo local y definí sus acuerdos de trabajo y ceremonias ágiles, como desarrollador y Scrum Master.',
        'Fui punto de escalación en caídas de producción, de un error genérico a la causa raíz, y mentor de compañeros en C#, SQL y depuración.',
        'Construí una integración con Covideo para incluir videos personalizados en los correos de agencias automotrices, y mantuve reportes SSRS y stored procedures.',
        'Orquesté un flujo de ticket a PR con mínima intervención humana: GitHub Copilot (Agent mode) y GitHub Actions para validar antes del merge.',
      ],
      en: [
        'Led end-to-end the index synchronization across ~120 databases serving ~3,200 CRM customers.',
        'First software engineer hired in Mexico for the CRM team; founded the local team and defined its working agreements and agile ceremonies, as both developer and Scrum Master.',
        'Was the escalation point for production outages, from a generic error to root cause, and mentored teammates on C#, SQL and debugging.',
        'Built an integration with Covideo that embeds personalized videos in promotional emails for automotive dealerships, and maintained SSRS reports and stored procedures.',
        'Orchestrated a ticket-to-PR workflow with minimal human intervention: GitHub Copilot (Agent mode) and GitHub Actions for pre-merge validation.',
      ],
    },
    stack: 'C#, .NET, SQL Server, SSRS, ELK, React, AngularJS, TypeScript, Docker, GitHub Actions, Octopus Deploy, Jenkins, TeamCity, Jira',
  },
  {
    company: 'GoNet',
    role: { es: 'Jr. Software Developer', en: 'Jr. Software Developer' },
    from: '2020-12',
    to: '2022-02',
    highlights: {
      es: [
        'Identifiqué la necesidad y lideré de principio a fin el proceso de credenciales de empleados conforme a la nueva normativa laboral: de $29 a $13 MXN por credencial (~55 % de ahorro).',
        'Diseñé y desarrollé con mi equipo un ERP desde cero en ASP.NET 5 y EF Core sobre PostgreSQL que reemplazó el sistema legado.',
        'Automaticé la prenómina con Excel VBA y expresiones regulares (99 % de datos limpios) y reemplacé un proceso manual de reportes con una automatización en C#.',
        'Di soporte y mantenimiento a módulos del sistema hechos en Java.',
      ],
      en: [
        'Identified the need and led end-to-end the employee ID badge process, compliant with new Mexican labor regulations: from $29 to $13 MXN per badge (~55% savings).',
        'Designed and built, with my team, an ERP from scratch in ASP.NET 5 and EF Core on PostgreSQL that replaced the legacy system.',
        'Automated pre-payroll with Excel VBA and regular expressions (99% clean data) and replaced a manual reporting process with a C# automation.',
        'Supported and maintained system modules written in Java.',
      ],
    },
    stack: 'C#, .NET, Blazor, Java, JavaScript, PostgreSQL, VBA',
  },
  {
    company: 'Apeyron Informática',
    key: 'apeyron-2020',
    minor: true,
    role: { es: 'Jr. Software Developer', en: 'Jr. Software Developer' },
    from: '2020-04',
    to: '2020-10',
    highlights: {
      es: ['Desarrollé una aplicación web en PHP para administrar flotillas, citas y control de asistencia (GestoCar).'],
      en: ['Built a PHP web application to manage fleets, appointments and attendance control (GestoCar).'],
    },
    stack: 'PHP, HTML5',
  },
  {
    company: 'MW Software',
    role: { es: 'Jr. Software Developer', en: 'Jr. Software Developer' },
    from: '2018-12',
    to: '2019-12',
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
  {
    company: 'Apeyron Informática',
    key: 'apeyron-2017',
    minor: true,
    role: { es: 'Jr. Software Developer', en: 'Jr. Software Developer' },
    from: '2017-08',
    to: '2018-01',
    highlights: {
      es: ['Construí una app nativa de Android en Java, con arquitectura MVC y bases de datos local y remota.'],
      en: ['Built a native Android app in Java, with MVC architecture and local and remote databases.'],
    },
    stack: 'Java, Android Studio, Materialize CSS',
  },
  {
    company: 'Buró de Crédito',
    role: { es: 'Administrador de bases de datos Jr.', en: 'Junior Database Administrator' },
    from: '2016-08',
    to: '2017-08',
    highlights: {
      es: [
        'Automaticé con Bash la validación de datos entre instancias Informix en una migración a gran escala.',
        'Administré respaldos y restauraciones entre cintas e instancias, verificando la integridad de los datos.',
      ],
      en: [
        'Automated data validation between Informix instances with Bash during a large-scale migration.',
        'Managed backups and restores between tape storage and instances, verifying data integrity.',
      ],
    },
    stack: 'Informix, Bash',
  },
];
