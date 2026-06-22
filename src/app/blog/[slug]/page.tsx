import { Metadata } from "next"
import { notFound } from "next/navigation"
import { blogPosts, BlogPost } from "@/lib/blogData"
import { BlogPostClient } from "./BlogPostClient"

interface Props {
  params: Promise<{ slug: string }>
}

// Generate Dynamic SEO Metadata for search engines
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const post = blogPosts.find((p) => p.slug === decodedSlug)
  
  if (!post) {
    return { title: "مطلب یافت نشد | جالیز" }
  }

  const title = `${post.title} | وبلاگ جالیز`
  const description = post.description.slice(0, 160)

  return {
    title,
    description,
    keywords: post.keywords,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      locale: post.lang === "fa" ? "fa_IR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const post = blogPosts.find((p) => p.slug === decodedSlug)

  if (!post) {
    notFound()
  }

  // Get other posts of the same language as related links (max 2)
  const relatedPosts = blogPosts.filter(
    (p) => p.lang === post.lang && p.slug !== post.slug
  ).slice(0, 2)

  // Structured Data (JSON-LD) for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description,
    "author": {
      "@type": "Person",
      "name": post.author,
    },
    "publisher": {
      "@type": "Organization",
      "name": "جالیز | Jaliz",
      "logo": {
        "@type": "ImageObject",
        "url": "https://jaliz.ir/icons/icon-192x192.png", // fallback logo url
      },
    },
    "datePublished": post.lang === "fa" ? "2026-06-21" : "2026-06-22", // standardized dates for search crawlers
    "inLanguage": post.lang,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostClient post={post} relatedPosts={relatedPosts} />
    </>
  )
}
