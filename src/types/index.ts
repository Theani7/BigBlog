export interface Author {
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  description?: string;
  pubDate: Date;
  updatedDate?: Date;
  category?: string;
  author?: string;
  tags: string[];
  heroImage?: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  image: string;
  type: string;
  robots: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}
