export const siteConfig = {
  name: 'BigBlog',
  description: 'A premium developer publishing platform',
  url: 'https://bigblog.dev',
  author: 'BigBlog Team',
  locale: 'en-US',
} as const;

export const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/contact' },
] as const;

export const socials = {
  github: 'https://github.com/BigBlog',
  twitter: 'https://twitter.com/bigblog',
  linkedin: 'https://linkedin.com/company/bigblog',
} as const;

export const seo = {
  defaultTitle: 'BigBlog — Developer Publishing Platform',
  defaultDescription:
    'A premium developer publishing platform for building world-class documentation and blogs.',
  defaultImage: '/og.png',
  defaultType: 'website',
} as const;
