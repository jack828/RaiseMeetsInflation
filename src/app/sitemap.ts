import type { MetadataRoute } from 'next'
import * as datasets from '@/datasets'
import { SITE_URL } from '@/lib'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(
        Math.max(
          new Date(datasets.metadata.inflation.lastUpdated).getTime(),
          new Date(datasets.metadata.payGrowth.lastUpdated).getTime()
        )
      ),
      changeFrequency: 'monthly',
      priority: 1
    },
    {
      url: `${SITE_URL}/legal/cookie-policy`,
      changeFrequency: 'yearly',
      priority: 0.5
    }
  ]
}
