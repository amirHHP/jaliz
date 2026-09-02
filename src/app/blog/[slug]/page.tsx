import { Metadata } from "next"
import { notFound } from "next/navigation"
import { blogPosts } from "@/lib/blogData"
import { BlogPostClient } from "./BlogPostClient"
import {
  BLOG_SITE_URL,
  blogCanonicalUrl,
  getAlternatePost,
  getRelatedPosts,
} from "@/lib/blogTopics"

interface Props {
  params: Promise<{ slug: string }>
}

function findPost(slug: string) {
  const decodedSlug = decodeURIComponent(slug)
  return blogPosts.find((p) => p.slug === decodedSlug)
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = findPost(slug)

  if (!post) {
    return { title: "مطلب یافت نشد" }
  }

  const description = post.description.slice(0, 160)
  const canonical = blogCanonicalUrl(post.slug)
  const alternate = getAlternatePost(post, blogPosts)
  const faUrl = post.lang === "fa" ? canonical : alternate ? blogCanonicalUrl(alternate.slug) : canonical
  const enUrl = post.lang === "en" ? canonical : alternate ? blogCanonicalUrl(alternate.slug) : canonical

  return {
    title: post.title,
    description,
    keywords: post.keywords,
    alternates: {
      canonical,
      languages: {
        "fa-IR": faUrl,
        "en-US": enUrl,
        "x-default": faUrl,
      },
    },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.publishedAtIso,
      authors: [post.author],
      locale: post.lang === "fa" ? "fa_IR" : "en_US",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = findPost(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = getRelatedPosts(post, blogPosts, 2)
  const canonical = blogCanonicalUrl(post.slug)
  const inLanguage = post.lang === "fa" ? "fa-IR" : "en-US"

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAtIso,
        inLanguage,
        mainEntityOfPage: canonical,
        author: {
          "@type": "Person",
          name: post.author,
        },
        publisher: {
          "@type": "Organization",
          name: "جالیز | Jaliz",
          logo: {
            "@type": "ImageObject",
            url: `${BLOG_SITE_URL}/icons/icon-192x192.png`,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: post.lang === "fa" ? "خانه" : "Home",
            item: BLOG_SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: post.lang === "fa" ? "وبلاگ" : "Blog",
            item: `${BLOG_SITE_URL}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: canonical,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: post.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
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
