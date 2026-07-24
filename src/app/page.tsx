import { getSessionUserId } from "@/app/actions/auth"
import { LandingPage } from "@/components/LandingPage"
import { MyPlantsDashboard } from "@/components/MyPlantsDashboard"

export default async function HomePage() {
  const userId = await getSessionUserId()
  if (!userId) {
    return <LandingPage />
  }
  return <MyPlantsDashboard />
}
