import { siteConfig, socials } from '@config/site';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ArticleProps {
  title: string;
  description: string;
  canonical: string;
  cover?: string;
  coverAlt?: string;
  publishedAt: Date;
  updatedAt?: Date;
  author: string;
  tags?: string[];
  category?: string;
  readingTime?: string;
}

interface PersonProps {
  name: string;
  url?: string;
  image?: string;
  description?: string;
  sameAs?: string[];
}

interface CollectionPageProps {
  title: string;
  description: string;
  canonical: string;
  itemCount: number;
}

interface VideoProps {
  name: string;
  description: string;
  thumbnailUrl?: string;
  uploadDate: string;
  duration?: string;
  embedUrl?: string;
}

interface ImageProps {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}

export function websiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    inLanguage: siteConfig.locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [socials.github, socials.twitter, socials.linkedin],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
    },
  };
}

export function personSchema(person: PersonProps): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
  };

  if (person.url) schema.url = person.url;
  if (person.image) schema.image = person.image;
  if (person.description) schema.description = person.description;
  if (person.sameAs && person.sameAs.length > 0) schema.sameAs = person.sameAs;

  return schema;
}

export function articleSchema(article: ArticleProps): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt.toISOString(),
    dateModified: (article.updatedAt ?? article.publishedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: article.author,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.canonical,
    },
  };

  if (article.cover) {
    schema.image = {
      '@type': 'ImageObject',
      url: article.cover,
      alt: article.coverAlt ?? article.title,
    };
  }

  if (article.tags && article.tags.length > 0) {
    schema.keywords = article.tags.join(', ');
  }

  if (article.category) {
    schema.articleSection = article.category;
  }

  if (article.readingTime) {
    schema.timeRequired = article.readingTime;
  }

  schema.publisher = {
    '@type': 'Organization',
    name: siteConfig.name,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}/logo.png`,
    },
  };

  return schema;
}

export function breadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: item.href } : {}),
    })),
  };
}

export function collectionPageSchema(props: CollectionPageProps): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: props.title,
    description: props.description,
    url: props.canonical,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: props.itemCount,
    },
  };
}

export function faqSchema(
  faqs: Array<{ question: string; answer: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function videoObjectSchema(video: VideoProps): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    uploadDate: video.uploadDate,
  };

  if (video.thumbnailUrl) schema.thumbnailUrl = video.thumbnailUrl;
  if (video.duration) schema.duration = video.duration;
  if (video.embedUrl) schema.embedUrl = video.embedUrl;

  return schema;
}

export function imageObjectSchema(image: ImageProps): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    url: image.url,
    alt: image.alt,
  };

  if (image.width) schema.width = image.width;
  if (image.height) schema.height = image.height;
  if (image.caption) schema.caption = image.caption;

  return schema;
}

export function blogPostSchemas(
  article: ArticleProps,
  breadcrumbs: BreadcrumbItem[]
): Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = [articleSchema(article)];

  if (breadcrumbs.length > 0) {
    schemas.push(breadcrumbSchema(breadcrumbs));
  }

  return schemas;
}

export function authorPageSchemas(
  person: PersonProps,
  breadcrumbs: BreadcrumbItem[]
): Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = [personSchema(person)];

  if (breadcrumbs.length > 0) {
    schemas.push(breadcrumbSchema(breadcrumbs));
  }

  return schemas;
}

export function categoryPageSchemas(
  props: CollectionPageProps,
  breadcrumbs: BreadcrumbItem[]
): Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = [collectionPageSchema(props)];

  if (breadcrumbs.length > 0) {
    schemas.push(breadcrumbSchema(breadcrumbs));
  }

  return schemas;
}

export function homepageSchemas(): Record<string, unknown>[] {
  return [websiteSchema(), organizationSchema()];
}
