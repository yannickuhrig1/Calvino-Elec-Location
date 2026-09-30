import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calvino-location.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/compte/', '/api/', '/suivi'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
