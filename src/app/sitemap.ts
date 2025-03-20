import type { MetadataRoute } from 'next'
import { allPosts } from '@/.contentlayer/generated'

const BASE_URL = "https://seunghyunlim.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return allPosts.map(post => ({
    url: `${BASE_URL}${post.url}`,
    lastModified: post.date,
    changeFrequency: "weekly",
    priority: 0.8,
  })); 
}