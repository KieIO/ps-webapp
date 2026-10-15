import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'PokeSlide Docs',
  tagline: 'Internal platform documentation',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://pokeslide-docs.vercel.app',
  baseUrl: '/',

  organizationName: 'pokeslide',
  projectName: 'ps-webapp',

  onBrokenLinks: 'warn',

  markdown: {
    format: 'detect',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'PokeSlide Docs',
      logo: {
        alt: 'PokeSlide',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'FAQ',
          items: [
            {
              label: 'FAQ',
              to: '/faq',
            },
          ],
        },
        {
          title: 'Task',
          items: [
            {
              label: 'Tạo task',
              to: '/',
            },
            {
              label: 'Chia task con',
              to: '/split-task',
            },
            {
              label: 'Tạo revision',
              to: '/revision',
            },
            {
              label: 'On-time rate',
              to: '/on-time',
            },
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'Mốc giao',
              to: '/milestone',
            },
          ],
        },
        {
          title: 'Nghỉ phép',
          items: [
            {
              label: 'Nghỉ phép',
              to: '/leave',
            },
          ],
        },
        {
          title: 'Overtime',
          items: [
            {
              label: 'Overtime (OT)',
              to: '/overtime',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} PokeSlide. Built with GoWare JSC.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
