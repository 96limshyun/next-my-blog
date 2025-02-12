import type { MetadataRoute } from 'next'
import { allPosts } from '@/.contentlayer/generated'

export default function sitemap(): MetadataRoute.Sitemap {
  return allPosts.map(post => ({
    url: post.url,
    lastModified: post.date,
    changeFrequency: "weekly",
    priority: 0.8,
  })); 
}