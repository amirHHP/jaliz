export type PlantHealth = "Excellent" | "Good" | "Needs Attention"
export type ShareLanguage = "en" | "fa"

export interface SharePlantInput {
  name: string
  health: PlantHealth
  latestStatus?: string | null
  nextWateringDate?: string | null
  image?: string | null
  language: ShareLanguage
}

const HASHTAGS = {
  fa: "#جالیز #گیاهداری #والدین_گیاه",
  en: "#jaliz #plantparent #planttok",
}

const DEFAULT_STATUS = {
  fa: "امروز هم سرحالم! 🌿",
  en: "Still thriving today! 🌿",
}

type CaptionBuilder = (name: string, status: string, care: string) => string

const CAPTION_TEMPLATES: Record<ShareLanguage, Record<PlantHealth, CaptionBuilder[]>> = {
  fa: {
    Excellent: [
      (n, s, c) => `بفرمایید ${n}! 🌟 ${s} — ${c}\n\n${HASHTAGS.fa}`,
      (n, s, c) => `این ${n}مه و امروز هم می‌درخشم ✨\n«${s}»\n${c}\n\n${HASHTAGS.fa}`,
      (n, s, c) => `گزارش روزانه ${n}: حالم عالیه! 💚\n${s} | ${c}\n\n${HASHTAGS.fa}`,
    ],
    Good: [
      (n, s, c) => `${n} سلام می‌رسونه! 🪴\n«${s}»\n${c}\n\n${HASHTAGS.fa}`,
      (n, s, c) => `از طرف ${n}: من خوبم، نگرانم نباش 🌱\n${s} — ${c}\n\n${HASHTAGS.fa}`,
      (n, s, c) => `${n} اینجاست و حالش خوبه 💚\n${s}\nمراقبت بعدی: ${c}\n\n${HASHTAGS.fa}`,
    ],
    "Needs Attention": [
      (n, s, c) => `SOS! ${n} کمک می‌خواد 😅\n«${s}»\n${c}\n\n${HASHTAGS.fa}`,
      (n, s, c) => `${n} داره ناله می‌کنه... 🆘\n${s}\nوالدین گیاه، لطفاً: ${c}\n\n${HASHTAGS.fa}`,
      (n, s, c) => `کمک! ${n} نیاز به توجه داره 🍂\n${s} — ${c}\n\n${HASHTAGS.fa}`,
    ],
  },
  en: {
    Excellent: [
      (n, s, c) => `Meet ${n}! 🌟 ${s} — ${c}\n\n${HASHTAGS.en}`,
      (n, s, c) => `${n} reporting for duty ✨\n"${s}"\n${c}\n\n${HASHTAGS.en}`,
      (n, s, c) => `Daily update from ${n}: thriving! 💚\n${s} | ${c}\n\n${HASHTAGS.en}`,
    ],
    Good: [
      (n, s, c) => `${n} says hi! 🪴\n"${s}"\n${c}\n\n${HASHTAGS.en}`,
      (n, s, c) => `From ${n}: I'm doing fine, don't worry 🌱\n${s} — ${c}\n\n${HASHTAGS.en}`,
      (n, s, c) => `${n} is vibing 💚\n${s}\nNext up: ${c}\n\n${HASHTAGS.en}`,
    ],
    "Needs Attention": [
      (n, s, c) => `SOS! ${n} needs help 😅\n"${s}"\n${c}\n\n${HASHTAGS.en}`,
      (n, s, c) => `${n} is being dramatic... 🆘\n${s}\nPlant parent, please: ${c}\n\n${HASHTAGS.en}`,
      (n, s, c) => `Help! ${n} needs some love 🍂\n${s} — ${c}\n\n${HASHTAGS.en}`,
    ],
  },
}

const HEALTH_LABELS: Record<ShareLanguage, Record<PlantHealth, string>> = {
  fa: {
    Excellent: "عالی",
    Good: "خوب",
    "Needs Attention": "نیاز به توجه",
  },
  en: {
    Excellent: "Excellent",
    Good: "Good",
    "Needs Attention": "Needs Attention",
  },
}

export function getHealthShareLabel(health: PlantHealth, language: ShareLanguage): string {
  return HEALTH_LABELS[language][health]
}

export function getNextCareText(
  nextWateringDate: string | undefined | null,
  language: ShareLanguage,
  now = Date.now()
): string {
  if (!nextWateringDate) {
    return language === "fa"
      ? "مراقبت بعدی: هر وقت یاد والدینم بیفته 😅"
      : "Next care: whenever my plant parent remembers 😅"
  }

  const diffDays = Math.ceil(
    (new Date(nextWateringDate).getTime() - now) / (1000 * 3600 * 24)
  )

  if (language === "fa") {
    if (diffDays < 0) return `آبیاری ${Math.abs(diffDays)} روز عقب افتاده! 💧`
    if (diffDays === 0) return "امروز وقت آبیاریمه! 💧"
    if (diffDays === 1) return "فردا آبیاری دارم 💧"
    return `${diffDays} روز دیگه آبیاری 💧`
  }

  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue for water! 💧`
  if (diffDays === 0) return "Watering day is today! 💧"
  if (diffDays === 1) return "Watering tomorrow! 💧"
  return `Watering in ${diffDays} days 💧`
}

export function pickCaptionTemplateIndex(health: PlantHealth, language: ShareLanguage, seed = 0): number {
  const templates = CAPTION_TEMPLATES[language][health]
  return Math.abs(seed) % templates.length
}

export function buildShareCaption(
  input: SharePlantInput,
  options?: { templateIndex?: number; now?: number }
): string {
  const { name, health, latestStatus, nextWateringDate, language } = input
  const status = (latestStatus?.trim() || DEFAULT_STATUS[language]).replace(/\n/g, " ")
  const care = getNextCareText(nextWateringDate, language, options?.now)
  const templates = CAPTION_TEMPLATES[language][health]
  const index =
    options?.templateIndex !== undefined
      ? options.templateIndex % templates.length
      : Math.floor(Math.random() * templates.length)
  return templates[index](name.trim() || (language === "fa" ? "گیاه من" : "My plant"), status, care)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load plant image"))
    img.src = src
  })
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 4
): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
      if (lines.length >= maxLines) break
    } else {
      current = test
    }
  }

  if (current && lines.length < maxLines) lines.push(current)

  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    const last = lines[maxLines - 1]
    lines[maxLines - 1] = last.length > 3 ? `${last.slice(0, -3)}…` : `${last}…`
  }

  return lines
}

async function ensureFonts(language: ShareLanguage) {
  const family = language === "fa" ? "Vazirmatn" : "Geist"
  await Promise.all([
    document.fonts.load(`bold 52px ${family}`),
    document.fonts.load(`600 36px ${family}`),
    document.fonts.load(`500 32px ${family}`),
    document.fonts.load(`400 28px ${family}`),
  ])
  await document.fonts.ready
}

export async function generatePlantShareCard(input: SharePlantInput): Promise<Blob> {
  const W = 1080
  const H = 1350
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported")

  const isRtl = input.language === "fa"
  const fontFamily = isRtl ? "Vazirmatn, Tahoma, sans-serif" : "Geist, system-ui, sans-serif"
  await ensureFonts(input.language)

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, "#0c2a22")
  bg.addColorStop(0.5, "#12382e")
  bg.addColorStop(1, "#2e7462")
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Decorative circles
  ctx.globalAlpha = 0.08
  ctx.fillStyle = "#ffffff"
  ctx.beginPath()
  ctx.arc(W * 0.85, H * 0.12, 180, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(W * 0.1, H * 0.88, 140, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // White card
  const cardX = 56
  const cardY = 72
  const cardW = W - 112
  const cardH = H - 144
  ctx.shadowColor = "rgba(0,0,0,0.35)"
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 12
  ctx.fillStyle = "#fcfaf8"
  roundRect(ctx, cardX, cardY, cardW, cardH, 40)
  ctx.fill()
  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // Photo area
  const photoX = cardX + 40
  const photoY = cardY + 40
  const photoW = cardW - 80
  const photoH = 620
  ctx.save()
  roundRect(ctx, photoX, photoY, photoW, photoH, 28)
  ctx.clip()

  if (input.image) {
    try {
      const img = await loadImage(input.image)
      const scale = Math.max(photoW / img.width, photoH / img.height)
      const sw = img.width * scale
      const sh = img.height * scale
      const sx = photoX + (photoW - sw) / 2
      const sy = photoY + (photoH - sh) / 2
      ctx.drawImage(img, sx, sy, sw, sh)
    } catch {
      ctx.fillStyle = "#d2e4df"
      ctx.fillRect(photoX, photoY, photoW, photoH)
      ctx.font = `120px ${fontFamily}`
      ctx.textAlign = "center"
      ctx.fillStyle = "#2e7462"
      ctx.fillText("🪴", photoX + photoW / 2, photoY + photoH / 2 + 40)
    }
  } else {
    const ph = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH)
    ph.addColorStop(0, "#d2e4df")
    ph.addColorStop(1, "#a7cabb")
    ctx.fillStyle = ph
    ctx.fillRect(photoX, photoY, photoW, photoH)
    ctx.font = `120px ${fontFamily}`
    ctx.textAlign = "center"
    ctx.fillStyle = "#12382e"
    ctx.fillText("🪴", photoX + photoW / 2, photoY + photoH / 2 + 40)
  }
  ctx.restore()

  // Health badge on photo
  const healthLabel = getHealthShareLabel(input.health, input.language)
  const badgeColors =
    input.health === "Excellent"
      ? { bg: "#d2e4df", fg: "#12382e" }
      : input.health === "Good"
        ? { bg: "#fef3c7", fg: "#92400e" }
        : { bg: "#fee2e2", fg: "#b91c1c" }

  ctx.font = `600 28px ${fontFamily}`
  const badgePadX = 24
  const badgeW = ctx.measureText(healthLabel).width + badgePadX * 2
  const badgeH = 52
  const badgeX = isRtl ? photoX + 16 : photoX + photoW - badgeW - 16
  const badgeY = photoY + 16
  ctx.fillStyle = badgeColors.bg
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 26)
  ctx.fill()
  ctx.fillStyle = badgeColors.fg
  ctx.textAlign = isRtl ? "right" : "left"
  ctx.textBaseline = "middle"
  ctx.fillText(healthLabel, isRtl ? badgeX + badgeW - badgePadX : badgeX + badgePadX, badgeY + badgeH / 2)

  // Plant name
  const nameY = photoY + photoH + 72
  ctx.font = `bold 52px ${fontFamily}`
  ctx.fillStyle = "#12382e"
  ctx.textAlign = isRtl ? "right" : "left"
  ctx.textBaseline = "alphabetic"
  ctx.direction = isRtl ? "rtl" : "ltr"
  const nameX = isRtl ? cardX + cardW - 48 : cardX + 48
  const displayName = input.name.trim() || (isRtl ? "گیاه من" : "My Plant")
  ctx.fillText(displayName, nameX, nameY)

  // Status quote bubble
  const status = (input.latestStatus?.trim() || DEFAULT_STATUS[input.language]).replace(/\n/g, " ")
  const bubbleX = cardX + 48
  const bubbleW = cardW - 96
  const bubbleY = nameY + 36
  ctx.font = `500 32px ${fontFamily}`
  const statusLines = wrapText(ctx, `«${status}»`, bubbleW - 48, 3)
  const bubbleH = statusLines.length * 44 + 40

  ctx.fillStyle = "#edf3f1"
  roundRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 20)
  ctx.fill()
  ctx.strokeStyle = "#a7cabb"
  ctx.lineWidth = 2
  roundRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 20)
  ctx.stroke()

  ctx.font = `italic 500 32px ${fontFamily}`
  ctx.fillStyle = "#2d3748"
  ctx.textAlign = isRtl ? "right" : "left"
  const textX = isRtl ? bubbleX + bubbleW - 24 : bubbleX + 24
  statusLines.forEach((line, i) => {
    ctx.fillText(line, textX, bubbleY + 48 + i * 44)
  })

  // Next care
  const care = getNextCareText(input.nextWateringDate, input.language)
  const careY = bubbleY + bubbleH + 56
  ctx.font = `600 36px ${fontFamily}`
  ctx.fillStyle = "#2e7462"
  ctx.textAlign = "center"
  ctx.direction = isRtl ? "rtl" : "ltr"
  const careLines = wrapText(ctx, care, bubbleW, 2)
  careLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, careY + i * 46)
  })

  // Branding footer
  const brandY = cardY + cardH - 56
  ctx.font = `500 28px ${fontFamily}`
  ctx.fillStyle = "#74ad99"
  ctx.textAlign = "center"
  ctx.fillText(isRtl ? "🪴 جالیز · jaliz.ir" : "🪴 Jaliz · jaliz.ir", W / 2, brandY)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create image"))),
      "image/jpeg",
      0.92
    )
  })
}

export interface SharePlantResult {
  shared: boolean
  caption: string
  fallback?: "clipboard" | "download"
}

export async function sharePlant(input: SharePlantInput): Promise<SharePlantResult> {
  const caption = buildShareCaption(input)
  const blob = await generatePlantShareCard(input)
  const fileName = `jaliz-${input.name.replace(/\s+/g, "-").slice(0, 24) || "plant"}.jpg`
  const file = new File([blob], fileName, { type: "image/jpeg" })

  const shareData: ShareData = {
    title: input.name,
    text: caption,
    files: [file],
  }

  if (typeof navigator !== "undefined" && navigator.share) {
    const canShareFiles =
      !navigator.canShare || navigator.canShare({ files: [file] })

    if (canShareFiles) {
      try {
        await navigator.share(shareData)
        return { shared: true, caption }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return { shared: false, caption }
        }
      }
    }

    try {
      await navigator.share({ title: input.name, text: caption })
      return { shared: true, caption, fallback: "download" }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { shared: false, caption }
      }
    }
  }

  try {
    await navigator.clipboard.writeText(caption)
  } catch {
    /* clipboard may be unavailable */
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)

  return { shared: true, caption, fallback: "download" }
}
