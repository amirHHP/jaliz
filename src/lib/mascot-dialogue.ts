export type MascotState = "thriving" | "thirsty" | "celebrating" | "resting"

export interface MascotContext {
  totalPlants: number
  plantsToWaterCount: number
  isDoneToday: boolean
  streakDays: number
  userName?: string
  firstThirstyPlantName?: string
  currentHour?: number
}

export function resolveMascotState(ctx: MascotContext): MascotState {
  const hour = ctx.currentHour !== undefined ? ctx.currentHour : new Date().getHours()

  if (ctx.totalPlants === 0) {
    return "resting"
  }

  if (hour >= 20 || hour < 5) {
    return "resting"
  }

  if (ctx.isDoneToday) {
    return "celebrating"
  }

  if (ctx.plantsToWaterCount > 0) {
    return "thirsty"
  }

  return "thriving"
}

export function getMascotDialogue(ctx: MascotContext, language: "fa" | "en" = "fa"): string {
  const cleanName = ctx.userName && typeof ctx.userName === "string" ? ctx.userName.trim() : ""
  const cleanPlantName =
    ctx.firstThirstyPlantName && typeof ctx.firstThirstyPlantName === "string"
      ? ctx.firstThirstyPlantName.trim()
      : ""

  const state = resolveMascotState(ctx)

  if (language === "en") {
    const namePart = cleanName ? ` ${cleanName}` : ""
    if (ctx.totalPlants === 0) {
      return `Welcome${namePart}! Let's add your first plant to start your green garden!`
    }
    if (state === "resting") {
      return `Shh... The plants and I are resting for the night${namePart}. Sleep well! 🌙`
    }
    if (ctx.isDoneToday) {
      return `Awesome job${namePart}! All your daily plant tasks are done and celebrating! 🎉`
    }
    if (ctx.plantsToWaterCount > 0) {
      if (cleanPlantName) {
        return `Hey${namePart}! ${cleanPlantName} is thirsty and needs water today! 💧`
      }
      return `Hey${namePart}! You have ${ctx.plantsToWaterCount} plants waiting for water today! 💧`
    }
    return `Looking great${namePart}! All your plants are thriving and happily hydrated! 🌿`
  }

  // Persian (fa)
  const nameSuffix = cleanName ? ` ${cleanName}` : ""
  const nameHonorific = cleanName ? ` ${cleanName} جان` : ""

  if (ctx.totalPlants === 0) {
    return `سلام${nameHonorific}! باغچه تو هنوز خالیه. بیا اولین گیاهت رو اضافه کنیم تا با هم رشد کنیم! 🌱`
  }

  if (state === "resting") {
    return `هیسس! گیاهان باغچه خوابیدند${nameSuffix}. شب خوش و فردا پرانرژی می‌بینمت! 🌙💤`
  }

  if (ctx.isDoneToday) {
    return `آفرین${nameSuffix}! تمام کارهای امروز با موفقیت انجام شد و گیاهان کاملاً شاداب و سرحال هستند! تبریک می‌گم! 🎉💧`
  }

  if (ctx.plantsToWaterCount > 0) {
    if (cleanPlantName) {
      return `سلام${nameSuffix}! گیاه «${cleanPlantName}» امروز تشنه است و نیاز به آب دارد! 💧🌿`
    }
    return `سلام${nameSuffix}! امروز ${ctx.plantsToWaterCount} گیاه در انتظار آبیاری هستند و به آب نیاز دارند! 💧`
  }

  return `به‌به${nameSuffix}! همه گیاهانت امروز کاملاً شاداب، خوشحال و در نهایت طراوت هستند! عالی هستی! 🌿✨`
}
