import type { Metadata } from "next"
import Link from "next/link"
import { Leaf } from "lucide-react"
import { getSharedProfileAction } from "@/app/actions/plant-share"
import { SharedPlantsView } from "@/components/shared-plants/SharedPlantsView"

interface Props {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const profile = await getSharedProfileAction(token)
  if (!profile) {
    return { title: "لینک در دسترس نیست", robots: { index: false } }
  }
  const name = profile.ownerName || ""
  const title = name ? `گیاه‌های ${name}` : "لیست گیاه‌ها"
  return {
    title,
    description: "وضعیت گیاه‌ها و نیاز آبیاری آن‌ها",
    robots: { index: false, follow: false },
  }
}

export default async function SharedPlantProfilePage({ params }: Props) {
  const { token } = await params
  const profile = await getSharedProfileAction(token)

  if (!profile) {
    return (
      <div className="page-shell">
        <main className="container mx-auto px-4 py-20 max-w-md text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center mb-6">
            <Leaf className="h-10 w-10 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-card-foreground mb-2">
            این لینک در دسترس نیست
          </h1>
          <p className="text-sm leading-relaxed text-muted mb-6">
            ممکن است لینک باطل شده، منقضی شده یا اشتباه وارد شده باشد. از دوستتان
            بخواهید لینک تازه‌ای برایتان بفرستد.
          </p>
          <Link
            href="/"
            className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(46,116,98,0.18)] hover:scale-[1.02] transition-transform"
          >
            جالیز
          </Link>
        </main>
      </div>
    )
  }

  return <SharedPlantsView token={token} initialProfile={profile} />
}
