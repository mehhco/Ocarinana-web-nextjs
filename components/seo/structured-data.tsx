/**
 * 结构化数据组件
 * 用于添加 JSON-LD 结构化数据，帮助搜索引擎理解网站内容
 */

interface WebSiteSchemaProps {
  url: string;
  name: string;
  description: string;
}

export function WebSiteSchema({ url, name, description }: WebSiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    description,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SoftwareApplicationSchemaProps {
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}

export function SoftwareApplicationSchema({
  name,
  description,
  url,
  applicationCategory,
  operatingSystem,
  offers,
}: SoftwareApplicationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    offers: offers
      ? {
          '@type': 'Offer',
          price: offers.price,
          priceCurrency: offers.priceCurrency,
        }
      : {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CNY',
        },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '100',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo?: string;
  description: string;
  sameAs?: string[];
}

export function OrganizationSchema({
  name,
  url,
  logo,
  description,
  sameAs,
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs: sameAs || [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

import type { Product } from '@/lib/supabase/products';

interface ProductSchemaProps {
  products: Product[];
}

export function ProductSchema({ products }: ProductSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        description: product.description || product.title,
        image: product.image_url || undefined,
        url: product.product_url,
        offers: product.price
          ? {
              '@type': 'Offer',
              price: product.price.toString(),
              priceCurrency: 'CNY',
              availability: 'https://schema.org/InStock',
              url: product.product_url,
            }
          : undefined,
        brand: {
          '@type': 'Brand',
          name: getPlatformName(product.platform),
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function getPlatformName(platform: string): string {
  const platformMap: Record<string, string> = {
    taobao: '淘宝',
    tmall: '天猫',
    jd: '京东',
    pdd: '拼多多',
  };
  return platformMap[platform] || platform;
}

