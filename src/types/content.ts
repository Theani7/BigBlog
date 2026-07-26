export interface Author {
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

export interface Series {
  title: string;
  slug: string;
  description?: string;
  cover?: string;
  author: string;
  category: string;
  tags?: string[];
  publishedAt: Date;
  order?: number;
}

export interface Category {
  title: string;
  slug: string;
  description?: string;
  parent?: string;
}

export interface PostFrontmatter {
  title: string;
  description: string;
  excerpt?: string;
  slug?: string;
  publishedAt: Date;
  updatedAt?: Date;
  draft: boolean;
  featured: boolean;
  cover?: string;
  coverAlt?: string;
  coverWidth?: number;
  coverHeight?: number;
  coverCredit?: string;
  author: string;
  category: string;
  tags: string[];
  series?: string;
  seriesOrder?: number;
  canonical?: string;
  ogImage?: string;
  readingTime?: string;
  toc: boolean;
  keywords?: string[];
  language: string;
  featuredOrder?: number;
}

export interface Post {
  id: string;
  slug: string;
  data: PostFrontmatter;
  body: string;
  collection: 'blog';
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextPage?: number;
  previousPage?: number;
}

export interface RelatedArticle {
  post: Post;
  score: number;
  reason: 'tag' | 'category' | 'series' | 'date';
}

export interface SeriesNavigation {
  previous?: Post;
  next?: Post;
  series: Series;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
}

export interface ReadingTimeResult {
  minutes: number;
  words: number;
  characters: number;
}

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export interface ValidationError {
  file: string;
  field: string;
  message: string;
}

export interface RssItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  categories: string[];
  cover?: string;
  author: string;
}

export interface MediaAsset {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  alt: string;
  caption?: string;
  credit?: string;
}

export interface ResponsiveImageResult {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  width?: number;
  height?: number;
}

export interface VideoEmbed {
  platform: 'youtube' | 'vimeo';
  videoId: string;
  title: string;
  poster?: string;
  startTime?: number;
}
