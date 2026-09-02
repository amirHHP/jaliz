"use client"

import {
  Droplets,
  Sprout,
  BookOpen,
  Sun,
  Bug,
  Heart,
  Scissors,
  Snowflake,
  Sparkles,
  Leaf,
} from "lucide-react"

export function BlogIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "Droplets":
      return <Droplets className={className} />
    case "Sprout":
      return <Sprout className={className} />
    case "BookOpen":
      return <BookOpen className={className} />
    case "Sun":
      return <Sun className={className} />
    case "Bug":
      return <Bug className={className} />
    case "Heart":
      return <Heart className={className} />
    case "Scissors":
      return <Scissors className={className} />
    case "Snowflake":
      return <Snowflake className={className} />
    case "Sparkles":
      return <Sparkles className={className} />
    case "Leaf":
      return <Leaf className={className} />
    default:
      return <BookOpen className={className} />
  }
}
