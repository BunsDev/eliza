import dotenv from 'dotenv';
import * as Plugin from '@docusaurus/types/src/plugin';
import type * as OpenApiPlugin from 'docusaurus-plugin-openapi-docs';

dotenv.config();

const config = {
  title: 'eliza',
  tagline: 'Flexible, scalable AI agents for everyone',
  favicon: 'img/favicon.ico',
  url: 'https://eliza.how',
  baseUrl: '/',
  organizationName: 'elizaos',
  projectName: 'eliza',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',

  // Temporarily disabled until @docusaurus/faster is installed
  // future: {
  //   experimental_faster: {
  //     swcJsLoader: true,
  //     swcJsMinimizer: true,
  //     swcHtmlMinimizer: true,
  //     rspackBundler: true,
  //   },
  // },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  customFields: {
    // AI Configuration
    aiEnabled: process.env.REACT_APP_AI_ENABLED !== 'false',
    aiProvider: process.env.REACT_APP_OPENAI_API_KEY
      ? 'openai'
      : process.env.REACT_APP_ANTHROPIC_API_KEY
        ? 'anthropic'
        : process.env.REACT_APP_GROQ_API_KEY
          ? 'groq'
          : process.env.REACT_APP_OLLAMA_BASE_URL
            ? 'ollama'
            : null,
    // Pass API key based on provider (only in production with proper security)
    aiApiKey: process.env.REACT_APP_OPENAI_API_KEY ||
              process.env.REACT_APP_ANTHROPIC_API_KEY ||
              process.env.REACT_APP_GROQ_API_KEY ||
              undefined,
    ollamaBaseUrl: process.env.REACT_APP_OLLAMA_BASE_URL,
    GITHUB_ACCESS_TOKEN: process.env.GITHUB_ACCESS_TOKEN,
  },
  markdown: {
    mermaid: true,
    mdx1Compat: {
      comments: false,
      admonitions: false,
      headingIds: false,
    },
  },
  themes: ['@docusaurus/theme-mermaid', 'docusaurus-theme-openapi-docs'],
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'partners',
        path: './partners',
        routeBasePath: 'partners',
        sidebarItemsGenerator: async ({ defaultSidebarItemsGenerator, ...args }) => {
          const sidebarItems = await defaultSidebarItemsGenerator(args);
          return sidebarItems
            .map((item) => {
              if (item.type === 'category') {
                item.label = '🤝 ' + item.label;
              }
              return item;
            })
            .sort((a, b) => {
              const labelA = a.label || '';
              const labelB = b.label || '';
              return labelA.localeCompare(labelB, undefined, {
                numeric: true,
              });
            });
        },
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'community',
        path: 'community',
        routeBasePath: 'community',
        sidebarItemsGenerator: async ({ defaultSidebarItemsGenerator, ...args }) => {
          const sidebarItems = await defaultSidebarItemsGenerator(args);
          return sidebarItems
            .map((item) => {
              if (item.type === 'category') {
                switch (item.label.toLowerCase()) {
                  case 'streams':
                    item.label = '📺 ' + item.label;
                    break;
                  case 'development':
                    item.label = '💻 ' + item.label;
                    break;
                  case 'the_arena':
                    item.label = '🏟️ ' + item.label;
                    break;
                  default:
                    item.label = '📄 ' + item.label;
                }
              }
              return item;
            })
            .sort((a, b) => {
              const labelA = a.label || '';
              const labelB = b.label || '';
              return labelA.localeCompare(labelB, undefined, {
                numeric: true,
              });
            });
        },
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'packages',
        path: 'packages',
        routeBasePath: 'packages',
        includeCurrentVersion: true,
        sidebarItemsGenerator: async ({ defaultSidebarItemsGenerator, ...args }) => {
          const sidebarItems = await defaultSidebarItemsGenerator(args);
          // Add icons to categories
          return sidebarItems
            .map((item) => {
              if (item.type === 'category') {
                switch (item.label.toLowerCase()) {
                  case 'adapters':
                    item.label = '🔌 ' + item.label;
                    break;
                  case 'clients':
                    item.label = '🔗 ' + item.label;
                    break;
                  case 'plugins':
                    item.label = '🧩 ' + item.label;
                    break;
                  default:
                    item.label = '📦 ' + item.label;
                }
              }
              return item;
            })
            .sort((a, b) => {
              const labelA = a.label || '';
              const labelB = b.label || '';
              return labelA.localeCompare(labelB, undefined, {
                numeric: true,
              });
            });
        },
      },
    ],
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../core/src/index.ts'],
        tsconfig: '../core/tsconfig.json',
        out: './api',
        skipErrorChecking: true,
        excludeExternals: false,
        excludePrivate: true,
        excludeProtected: false,
        excludeInternal: false,
        excludeNotDocumented: true,
        plugin: ['typedoc-plugin-markdown'],
        blockTags: [
          '@param',
          '@returns',
          '@throws',
          '@example',
          '@implements',
          '@template',
          '@property',
          '@typedef'
        ],
        hideGenerator: true,
        cleanOutputDir: true,
        categorizeByGroup: true,
        pretty: true,
        includeVersion: true,
        sort: ['source-order', 'required-first', 'visibility'],
        gitRevision: 'main',
        readme: 'none',
        commentStyle: 'block',
        preserveAnchorCasing: true,
        hideBreadcrumbs: false,
        preserveWatchOutput: true,
        disableSources: false,
        validation: {
          notExported: true,
          invalidLink: true,
          notDocumented: false,
        },
        exclude: [
          '**/_media/**',
          '**/node_modules/**',
          '**/dist/**',
          '**/*.test.ts',
          '**/*.spec.ts',
        ],
        watch: false,
        treatWarningsAsErrors: true,
        treatValidationWarningsAsErrors: true,
        searchInComments: true,
        navigationLinks: {
          GitHub: 'https://github.com/elizaos/eliza',
          Documentation: '/docs/intro',
        },
      },
    ],
    [
      require.resolve('docusaurus-lunr-search'),
      {
        // Include docs, blog, and news in search index
        excludeRoutes: [],
        // Index blog content
        indexBlog: true,
        // Index docs content
        indexDocs: true,
        // Index pages
        indexPages: true,
        // Languages to support
        languages: ['en'],
        // Custom fields to index
        fields: {
          title: { boost: 5 },
          content: { boost: 1 },
          tags: { boost: 3 },
        },
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'api',
        path: 'api',
        routeBasePath: 'api',
      },
    ],
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'rest-api',
        docsPluginId: 'api',
        config: {
          eliza_api: {
            specPath: './src/openapi/eliza-v1.yaml',
            outputDir: 'api/rest',
            sidebarOptions: {
              groupPathsBy: 'tag',
            },
          },
        },
      },
    ],
    [
      '@docusaurus/plugin-content-blog',
      {
        showReadingTime: true,
        onUntruncatedBlogPosts: 'ignore',
        editUrl: 'https://github.com/elizaos/eliza/tree/develop/docs',
        blogSidebarTitle: 'Recent posts',
        blogSidebarCount: 'ALL',
        showLastUpdateAuthor: true,
        feedOptions: {
          type: 'all',
          title: 'ElizaOS Updates',
          description: 'Stay up to date with the latest from ElizaOS',
        },
        path: 'blog',
        routeBasePath: 'blog',
      },
    ],
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        blog: {
          id: 'News',
          routeBasePath: 'news',
          onUntruncatedBlogPosts: 'ignore',
          blogTitle: 'AI News',
          blogDescription: 'Automated aggregating and summarization of elizaOS ecosystem updates',
          showReadingTime: true,
          editUrl: 'https://github.com/elizaos/eliza/tree/develop/packages/docs',
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
          showLastUpdateAuthor: true,
          feedOptions: {
            type: 'all',
            title: 'ElizaOS Updates',
            description: 'Stay up to date with the latest from ElizaOS',
          },
          path: 'news',
        },
        docs: {
          routeBasePath: 'docs',
          path: 'docs',
          docItemComponent: '@theme/ApiItem',
          sidebarPath: require.resolve('./sidebars.ts'),
          editUrl: 'https://github.com/elizaos/eliza/tree/develop/packages/docs/',
          exclude: ['**/_media/**'],
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          lastVersion: 'current',
          versions: {
            current: {
              label: '1.0.17',
              path: '',
              banner: 'none',
            },
            '0.25.9': {
              label: '0.25.9',
              path: '0.25.9',
            },
          },
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
          createSitemapItems: async (params) => {
            const { defaultCreateSitemapItems, ...rest } = params;
            const items = await defaultCreateSitemapItems(rest);

            return items
              .filter((item) => !item.url.includes('/page/'))
              .map((item) => {
                let priority = 0.5;

                if (item.url === '/') {
                  priority = 1.0; // homepage
                } else if (item.url.startsWith('/docs') || item.url.startsWith('/packages')) {
                  priority = 0.8; // important docs
                } else if (item.url.startsWith('/api') || item.url.startsWith('/rest')) {
                  priority = 0.7; // API reference
                } else if (item.url.startsWith('/blog')) {
                  priority = 0.6; // blog updates
                } else if (item.url.startsWith('/news')) {
                  priority = 0.6; // news posts
                } else if (item.url.startsWith('/community')) {
                  priority = 0.4; // community contributions
                }

                return {
                  ...item,
                  priority,
                };
              });
          },
        },
      },
    ],
  ],
  themeConfig: {
    announcementBar: {
      id: 'llms_full_feature',
      content:
        '🔥 Interact with our full documentation using your favorite LLM! <a href="/llms-full.txt" target="_blank" rel="noopener noreferrer">Copy <code>llms-full.txt</code></a> to get started. ✨',
      backgroundColor: 'var(--ifm-color-primary-light)',
      textColor: '#1f1f1f',
      isCloseable: true,
    },
    prism: {
      theme: require('prism-react-renderer').themes.github,
      darkTheme: require('prism-react-renderer').themes.dracula,
      additionalLanguages: ['bash', 'shell-session', 'typescript', 'markdown'],
    },
    mermaid: {
      theme: {
        light: 'default',
        dark: 'dark',
      },
      options: {
        fontSize: 16,
        flowchart: {
          htmlLabels: true,
          padding: 20,
          nodeSpacing: 50,
          rankSpacing: 50,
          curve: 'cardinal',
        },
      },
    },
    colorMode: {
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      title: 'elizaOS',
      logo: {
        alt: 'Eliza Logo',
        src: 'img/icon.png',
        srcDark: 'img/icon.png',
      },
      items: [
        // Left side - main navigation links
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'dropdown',
          label: 'Learn',
          position: 'left',
          items: [
            {
              label: '🎯 Simple Track (Non-Technical)',
              to: '/docs/simple/getting-started/quick-start',
            },
            {
              label: '🔧 Technical Track (Developers)',
              to: '/docs/technical/architecture/overview',
            },
          ],
        },
        {
          type: 'doc',
          docsPluginId: 'api',
          position: 'left',
          label: 'API',
          docId: 'index',
        },
        {
          type: 'dropdown',
          label: 'Packages',
          position: 'left',
          to: '/packages',
          items: [
            {
              label: 'Adapters',
              to: '/packages?tags=adapter',
            },
            {
              label: 'Clients',
              to: '/packages?tags=client',
            },
            {
              label: 'Plugins',
              to: '/packages?tags=plugin',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Community',
          position: 'left',
          to: '/community',
          items: [
            {
              label: 'Partners',
              to: '/partners',
            },
            {
              label: 'Calendar',
              to: 'https://calendar.google.com/calendar/embed?src=c_ed31cea342d3e2236f549161e6446c3e407e5625ee7a355c0153befc7a602e7f%40group.calendar.google.com&ctz=America%2FToronto',
              target: '_blank',
            },
            {
              label: 'Video Gallery',
              to: '/community/videos',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Blog',
          position: 'left',
          items: [
            {
              label: 'Main Blog',
              to: '/blog',
            },
            {
              label: 'GitHub Activity',
              href: 'https://elizaos.github.io/',
              target: '_blank',
              rel: 'noopener noreferrer',
            },
          ],
        },
        // Right side - version, social, etc.
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          type: 'dropdown',
          position: 'right',
          className: 'header-rss-link',
          'aria-label': 'RSS Feed',
          items: [
            { label: 'RSS (XML)', href: '/blog/rss.xml', target: '_blank' },
            { label: 'Atom', href: '/blog/atom.xml', target: '_blank' },
            { label: 'JSON Feed', href: '/blog/feed.json', target: '_blank' },
          ],
        },
        {
          href: 'https://github.com/elizaos/eliza',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'General',
              href: './',
            },
            {
              label: 'llms.txt',
              href: 'https://eliza.how/llms.txt',
            },
            {
              label: 'llms-full.txt',
              href: 'https://eliza.how/llms-full.txt',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Website',
              href: 'https://www.elizaos.ai/',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/elizaos',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/elizaos',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              href: '/blog',
            },
            {
              label: 'RSS',
              href: '/news/rss.xml',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/elizaos/eliza',
            },
          ],
        },
      ],
    },
  },
};

export default config;
