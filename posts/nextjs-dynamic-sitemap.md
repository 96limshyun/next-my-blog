---
title: NextJS 동적 sitemap 생성하기
date: 2025-02-13
content: 블로그 포스트를 추가할때마다 sitemap을 수정하지 않고, 자동으로 sitemap 생성하기
category: SEO, All
---

- 현재 블로그는 NextJS로 빌드되어 Google Console에 등록되어 있습니다.
- Google Console에 sitemap을 등록하기 위해 React에서 했던 것처럼 다음과 같이 sitemap을 손쉽게 만들어주는 [xml-sitemaps](https://www.xml-sitemaps.com/)을 사용해 만들었습니다.

```
<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<!-- created with Free Online Sitemap Generator www.xml-sitemaps.com -->


<url>
  <loc>https://seunghyunlim.vercel.app/</loc>
  <lastmod>2025-01-22T00:20:55+00:00</lastmod>
  <priority>1.00</priority>
</url>
<url>
  <loc>https://seunghyunlim.vercel.app/posts</loc>
  <lastmod>2025-01-22T00:20:55+00:00</lastmod>
  <priority>0.80</priority>
</url>
…..

</urlset>

```

## 문제 상황
- 블로그 글을 추가할 때마다 직접 sitemap.xml을 수정해야 했습니다.
- 또한, 실수로 sitemap.xml에 블로그 글이 누락되거나 잘못된 url을 작성할 경우 검색엔진 크롤러가 인식하지 못할 수 있습니다.
- 유지보수가 힘들고 무엇보다 귀찮습니다..

이러한 문제를 해결하기 위해 동적으로 sitemap을 생성하는 방법을 찾아보다, Next.js에서 자체적으로 지원하는 동적 sitemap 기능을 발견해 이를 적용해 보았습니다.

## Next.js의 MetadataRoute.Sitemap으로 동적 sitemap 생성
- 동적 sitemap을 생성하기 위해 Next.js [sitemap.xml 문서](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)를 참고했습니다.
- 공식문서에 나와있는 예제는 다음과 같습니다.

```
import type { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://acme.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://acme.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://acme.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ]
}
```

- 먼저 sitemap.xml 파일을 sitemap.ts 파일로 변경 후, MetadataRoute.Sitemap이라는 타입으로 반환하면 됩니다.
- MetadataRoute.Sitemap의 소스코드는 다음과 같습니다.

```
type SitemapFile = Array<{
    url: string;
    lastModified?: string | Date;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
    alternates?: {
        languages?: Languages<string>;
    };
}>;

declare namespace MetadataRoute {
    type Robots = RobotsFile;
    type Sitemap = SitemapFile;
    type Manifest = ManifestFile;
}
```

- MetadataRoute를 보니 sitemap 말고도 Robots, Manifest도 동적으로 생성할 수 있는것 같은데 저는 sitemap만 생성할거니 다른건 다루지 않겠습니다.
- SitemapFile 타입은 위와 같은 구조를 가지고 있는데 각 필드는 다음과 같습니다.

1. url: string
   - 해당 페이지의 절대 경로 URL
2. lastModified?: string | Date
   - 페이지가 마지막으로 수정된 날짜
3. hangeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
   - 페이지가 얼마나 자주 변경되는지
   - 크롤러가 어떤 주기마다 크롤링할지 결정합니다.
4. priority?: number
   - 0.0 ~ 1.0 사이의 숫자로 페이지의 중요도를 나타냅니다.
   - 검색 엔진이 어떤 페이지를 우선적으로 크롤링할지 판단합니다.
   - 보통은 중요한 페이지는 1.0, 일반적인 글은 0.8, 중요도가 낮은 페이지는 0.3 로 설정합니다.
5. alternates?: { languages?: Languages<string> }
   - 다국어 지원하는 경우 사용
   - 특정 페이지의 다른 언어 버전을 지정할 때 활용

## sitemap 적용
- 제 블로그는 contentlayer 라이브러리를 통해 md파일을 파싱하고 있습니다.
- contentlayer로 모든 post를 가져와 위와 같은 형식으로 반환하면 됩니다.

```
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
```

- 이제 test.md 파일을 만들고 /sitemap.xml로 들어가보면 아래와 같이 sitemap이 생성된걸 확인할 수 있습니다.

![sitemap](/sitemap.png)

## 결론
- 이제 블로그 글을 추가할 때마다 sitemap을 직접 수정할 필요 없이, 자동으로 최신 상태를 유지하게 되었습니다.
- Next.js의 MetadataRoute.Sitemap를 사용하면 간편하게 동적 sitemap을 생성할 수 있고, robots.txt나 manifest.json도 동적으로 생성할 수 있습니다.
- Next.js로 블로그를 운영중인 분들은 이 방법을 적용하면 운영을 더 효율적으로 할 수 있을것 같습니다.


