/**
 * Topic & Species Matcher for Dynamic Blog-to-Marketplace Cross-Linking
 * Maps article titles, slugs, keywords, and botanical content to commercial marketplace search queries.
 */

export interface MarketplaceMatchResult {
  query: string
  titleFa: string
  descriptionFa: string
  speciesMatch?: string
  careTopicMatch?: string
}

/**
 * Normalizes Persian and Arabic text:
 * - Unifies Arabic Kaf and Yeh to Persian ک and ی
 * - Strips diacritics / vowels (tashdid, tanwin, etc.)
 * - Normalizes zero-width non-joiners (\u200c) and whitespace
 * - Converts dashes/underscores to spaces
 */
export function normalizePersianText(text: string): string {
  if (!text) return ""
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "") // remove arabic diacritics
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ة/g, "ه")
    .replace(/[أإآ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ی")
    .replace(/[\u200c\u200d\u200e\u200f\u00a0]/g, " ") // convert half-space to space
    .replace(/[_\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

interface SpeciesDefinition {
  id: string
  nameFa: string
  query: string
  patterns: string[]
  titleFa: string
  descriptionFa: string
  combinedTitleFa?: (topic: string) => string
}

interface CareTopicDefinition {
  id: string
  nameFa: string
  query: string
  patterns: string[]
  titleFa: string
  descriptionFa: string
}

const SPECIES_DEFINITIONS: SpeciesDefinition[] = [
  {
    id: "sansevieria",
    nameFa: "سانسوریا",
    query: "سانسوریا",
    patterns: ["سانسوریا", "شمشیری", "sansevieria", "snake plant", "پاجوش سانسوریا"],
    titleFa: "خرید گیاه، پاجوش و گلدان سانسوریا در بازارچه",
    descriptionFa: "مشاهده آگهی‌های فروش سانسوریا شمشیری، ابلق، لوله‌ای و پاکوتاه از فروشندگان سراسر کشور",
    combinedTitleFa: (topic) => `خرید ${topic} و گیاه سانسوریا در بازارچه جالیز`,
  },
  {
    id: "pothos",
    nameFa: "پتوس",
    query: "پتوس",
    patterns: ["پتوس", "پوتوس", "pothos", "epipremnum", "پتوس حصیری", "پتوس ابلق"],
    titleFa: "خرید انواع پتوس، قلمه و آویز در بازارچه",
    descriptionFa: "مشاهده انواع پتوس طلایی، حصیری، ارتشی، ببری و ملکه مرمری با قیمت مناسب در بازارچه جالیز",
    combinedTitleFa: (topic) => `خرید ${topic} و قلمه پتوس در بازارچه جالیز`,
  },
  {
    id: "zz-plant",
    nameFa: "زامیفولیا",
    query: "زامیفولیا",
    patterns: ["زامیفولیا", "زاموفیلیا", "zz plant", "zamioculcas", "زامیفولیا بلک"],
    titleFa: "خرید زامیفولیا سبز، بلک و سوپر مینی در بازارچه",
    descriptionFa: "خرید مستقیم بوته و پاجوش زامیفولیا با ریزوم ریشه‌دار و تضمین سلامت",
    combinedTitleFa: (topic) => `خرید ${topic} و بوته زامیفولیا در بازارچه جالیز`,
  },
  {
    id: "monstera",
    nameFa: "برگ انجیری",
    query: "برگ انجیری",
    patterns: ["برگ انجیری", "برگانجیری", "مونسترا", "مانسترا", "monstera"],
    titleFa: "خرید برگ انجیری، مونسترا و قلمه ریشه‌دار",
    descriptionFa: "انواع برگ انجیری دلیچیوسا، مانسترا و فرم‌های ابلق در بازارچه جالیز",
    combinedTitleFa: (topic) => `خرید ${topic} و گیاه برگ انجیری در بازارچه`,
  },
  {
    id: "ficus-lyrata",
    nameFa: "فیکوس لیراتا",
    query: "فیکوس لیراتا",
    patterns: ["فیکوس لیراتا", "لیراتا", "ficus lyrata", "fiddle leaf", "برگ ویلونی"],
    titleFa: "خرید فیکوس لیراتا (برگ ویلونی) در بازارچه",
    descriptionFa: "انواع گلدان‌های آپارتمانی لیراتا با برگ‌های درشت و تنه قوی در بازارچه جالیز",
  },
  {
    id: "ficus-elastica",
    nameFa: "فیکوس الاستیکا",
    query: "فیکوس",
    patterns: ["فیکوس الاستیکا", "الاستیکا", "rubber plant", "فیکوس شرابی", "فیکوس بلک", "فیکوس یاقوتی"],
    titleFa: "خرید انواع فیکوس الاستیکا، شرابی و بلک پرنس",
    descriptionFa: "درختچه‌های شاداب فیکوس شرابی، یاقوتی و بلک پرنس مستقیم از پرورش‌دهندگان",
  },
  {
    id: "ficus-general",
    nameFa: "فیکوس",
    query: "فیکوس",
    patterns: ["فیکوس", "بنجامین", "ficus"],
    titleFa: "خرید انواع فیکوس، بنجامین و الاستیکا در بازارچه",
    descriptionFa: "مشاهده درختچه‌های آپارتمانی فیکوس با شاخ و برگ متراکم و سلامت ریشه",
  },
  {
    id: "aglaonema",
    nameFa: "آگلونما",
    query: "آگلونما",
    patterns: ["آگلونما", "aglaonema", "chinese evergreen", "آگلونما برفی", "آگلونما قرمز"],
    titleFa: "خرید آگلونما برفی، قرمز، صورتی و سفید در بازارچه",
    descriptionFa: "گیاهان آپارتمانی مقاوم آگلونما با ماندگاری بالا و پاجوش‌های زیبا در بازارچه جالیز",
  },
  {
    id: "yucca",
    nameFa: "یوکا",
    query: "یوکا",
    patterns: ["یوکا", "yucca", "خنجری"],
    titleFa: "خرید یوکا آپارتمانی و تنومند در بازارچه",
    descriptionFa: "خرید گیاه یوکا با تنه مقاوم و چندسر مناسب سالن‌های پرنور و دفاتر اداری",
  },
  {
    id: "dieffenbachia",
    nameFa: "دیفن باخیا",
    query: "دیفن باخیا",
    patterns: ["دیفن باخیا", "دیفن", "dieffenbachia"],
    titleFa: "خرید دیفن باخیا برگ‌پهن و دکوراتیو در بازارچه",
    descriptionFa: "بوته‌های شاداب دیفن باخیا با پاجوش‌های ریشه‌دار و برگ‌های منقوش",
  },
  {
    id: "schefflera",
    nameFa: "شفلرا",
    query: "شفلرا",
    patterns: ["شفلرا", "schefflera", "umbrella tree"],
    titleFa: "خرید شفلرا سبز و ابلق در بازارچه جالیز",
    descriptionFa: "درختچه‌های شفلرا چتری با شاخه‌های متراکم و ریشه‌دار آماده ارسال",
  },
  {
    id: "kalanchoe",
    nameFa: "کالانکوئه",
    query: "کالانکوئه",
    patterns: ["کالانکوئه", "kalanchoe"],
    titleFa: "خرید کالانکوئه گلدار رنگارنگ در بازارچه",
    descriptionFa: "انواع کالانکوئه پرگل در رنگ‌های قرمز، صورتی، زرد و نارنجی با ماندگاری بالا",
  },
  {
    id: "peperomia",
    nameFa: "قاشقی",
    query: "قاشقی",
    patterns: ["قاشقی", "پپرومیا", "peperomia"],
    titleFa: "خرید پپرومیا قاشقی سبز و ابلق در بازارچه",
    descriptionFa: "انواع پپرومیا قاشقی رومیزی با برگ‌های گوشتی شاداب و امن برای حیوانات خانگی",
  },
  {
    id: "spathiphyllum",
    nameFa: "اسپاتی فیلوم",
    query: "اسپاتی فیلوم",
    patterns: ["اسپاتی فیلوم", "اسپاتیفیلوم", "اسپاتی", "peace lily", "spathiphyllum", "گل صلح"],
    titleFa: "خرید اسپاتی فیلوم گلدار (گل صلح) در بازارچه",
    descriptionFa: "بوته‌های تصفیه‌کننده اسپاتی فیلوم با برگ‌های پهن و گل‌های سفید مخملی",
  },
  {
    id: "spider-plant",
    nameFa: "گندمی",
    query: "گندمی",
    // Note: Use full multi-word phrases for "عنکبوتی" to avoid colliding with "کنه تار عنکبوتی" (pest)
    patterns: ["گندمی", "گیاه عنکبوتی", "گل عنکبوتی", "spider plant", "chlorophytum"],
    titleFa: "خرید گیاه گندمی ابلق و سبز در بازارچه",
    descriptionFa: "گلدان‌های آویز گندمی تصفیه‌کننده هوا و کاملاً ایمن برای حیوانات خانگی",
  },
  {
    id: "cast-iron-plant",
    nameFa: "برگ عبایی",
    query: "برگ عبایی",
    patterns: ["برگ عبایی", "برگعبایی", "aspidistra", "cast iron"],
    titleFa: "خرید برگ عبایی فوق‌العاده مقاوم در بازارچه",
    descriptionFa: "گیاه آپارتمانی برگ عبایی مقاوم به نور کم و سرما با ریشه‌های قوی",
  },
  {
    id: "cactus-succulent",
    nameFa: "کاکتوس و ساکولنت",
    query: "کاکتوس",
    patterns: ["کاکتوس", "ساکولنت", "cactus", "succulent", "هاوورتیا", "اچوریا", "آلوئه"],
    titleFa: "خرید انواع کاکتوس و ساکولنت در بازارچه",
    descriptionFa: "کلکسیون متنوعی از کاکتوس‌های پیوندی، گوشتی و ساکولنت‌های مقاوم و کم‌آب",
  },
  {
    id: "orchid",
    nameFa: "ارکیده",
    query: "ارکیده",
    patterns: ["ارکیده", "فالانوپسیس", "orchid"],
    titleFa: "خرید گل ارکیده فالانوپسیس در بازارچه",
    descriptionFa: "گلدان‌های لوکس ارکیده چندگل با غلاف‌های باز و ماندگاری طولانی",
  },
  {
    id: "bonsai",
    nameFa: "بونسای",
    query: "بونسای",
    patterns: ["بونسای", "بنسای", "bonsai"],
    titleFa: "خرید انواع درختچه و بونسای در بازارچه",
    descriptionFa: "بونسای جینسینگ، نارون و شفلرا فرم‌گرفته با کیفیت عالی",
  },
]

// Specific topics ordered before generic items like bare "گلدان"
const CARE_TOPIC_DEFINITIONS: CareTopicDefinition[] = [
  {
    id: "pesticide",
    nameFa: "سم و آفت‌کش",
    query: "سم و آفت کش",
    patterns: [
      "سمپاشی",
      "سم پاشی",
      "قارچ کش",
      "قارچکش",
      "آفت کش",
      "آفتکش",
      "حشره کش",
      "حشرهکش",
      "شپشک",
      "کنه تار عنکبوتی",
      "کنه تارعنکبوتی",
      "کنه عنکبوتی",
      "کنه",
      "پشه گلدان",
      "پشه",
      "شته",
      "کنفیدور",
      "پوسیدگی ریشه",
      "کپک",
      "سم",
      "fungicide",
      "pesticide",
      "pest",
    ],
    titleFa: "خرید سموم خانگی، قارچ‌کش و آفت‌کش در بازارچه",
    descriptionFa: "قارچ‌کش مانکوزب، کاربندازیم، روغن ولک، صابون حشره‌کش و افت‌کش‌های بدون بو",
  },
  {
    id: "soil",
    nameFa: "خاک و بستر کشت",
    query: "خاک",
    patterns: [
      "ترکیب خاک",
      "خاک برگ",
      "خاک مناسب",
      "پیت ماس",
      "پیتماس",
      "پرلیت",
      "کوکوپیت",
      "لیکا",
      "پوکه معدنی",
      "پوکه",
      "لیکاپون",
      "ورمی کمپوست",
      "ورمیکمپوست",
      "خاک",
      "soil",
      "peat",
      "perlite",
    ],
    titleFa: "خرید انواع خاک، پرلیت، پیت‌ماس و لیکا در بازارچه",
    descriptionFa: "خاک سبک گلدانی، خاک مخصوص کاکتوس، پیت‌ماس ارگانیک و پرلیت دانه‌درشت بدون واسطه",
  },
  {
    id: "fertilizer",
    nameFa: "کود و تغذیه",
    query: "کود",
    patterns: [
      "کود",
      "کوددهی",
      "تغذیه",
      "npk",
      "هیومیک",
      "فسفر",
      "پتاسیم",
      "آهن",
      "محرک ریشه",
      "جلبک دریایی",
      "fertilizer",
      "fertiliser",
    ],
    titleFa: "خرید انواع کود تقویتی، NPK و محرک رشد در بازارچه",
    descriptionFa: "کودهای تخصصی گیاهان آپارتمانی، هیومیک اسید، کلات آهن و محرک‌های ریشه‌زایی",
  },
  {
    id: "moss-pole",
    nameFa: "قیم خزه",
    query: "قیم",
    patterns: ["قیم خزه ای", "قیم خزه‌ای", "قیم خزه", "قیم", "موس پل", "خزه اسفاگنوم", "moss pole"],
    titleFa: "خرید انواع قیم خزه‌ای و نگهدارنده گیاه در بازارچه",
    descriptionFa: "قیم‌های خزه طبیعی، اسفاگنوم و قیم‌های شبکه‌ای برای هدایت گیاهان بالارونده",
  },
  {
    id: "propagation",
    nameFa: "قلمه و تکثیر",
    query: "قلمه",
    patterns: [
      "قلمه زدن",
      "قلمه",
      "تکثیر",
      "ریشه دار کردن",
      "پاجوش",
      "هورمون ریشه زایی",
      "هورمون ریشه‌زایی",
      "propagation",
      "cutting",
    ],
    titleFa: "خرید قلمه ریشه‌دار، بذر و هورمون ریشه‌زایی در بازارچه",
    descriptionFa: "مشاهده انواع قلمه تازه و ریشه‌دار و ملزومات تکثیر آسان در آب و بستر سبک",
  },
  {
    id: "tools",
    nameFa: "ابزار باغبانی",
    query: "ابزار باغبانی",
    patterns: [
      "قیچی باغبانی",
      "قیچی هرس",
      "قیچی",
      "هرس",
      "بیلچه",
      "آبپاش",
      "آب پاش",
      "دستکش باغبانی",
      "ابزار باغبانی",
      "tools",
    ],
    titleFa: "خرید ابزار باغبانی، قیچی هرس و آب‌پاش در بازارچه",
    descriptionFa: "تجهیزات مراقبت خانگی شامل قیچی هرس استیل، بیلچه سبک، آب‌پاش و رطوبت‌سنج",
  },
  {
    id: "pot",
    nameFa: "گلدان",
    query: "گلدان",
    patterns: [
      "تعویض گلدان",
      "انتخاب گلدان",
      "گلدان سفالی",
      "گلدان پلاستیکی",
      "گلدان سرامیکی",
      "گلدان مناسب",
      "خرید گلدان",
      "سایز گلدان",
      "زهکش گلدان",
      "گلدان جدید",
      "گلدان",
      "pot",
      "planter",
    ],
    titleFa: "خرید انواع گلدان سفالی، سرامیکی و پلاستیکی در بازارچه",
    descriptionFa: "انواع گلدان‌های دارای زهکشی استاندارد، سفال متخلخل و زیرگلدانی با ابعاد گوناگون برای جابجایی گیاه",
  },
]

/**
 * Resolves the best matching commercial search query and copywriting for a given article or topic.
 */
export function resolveMarketplaceTopic(input: {
  title?: string
  slug?: string
  keywords?: string[]
  category?: string
  content?: string
}): MarketplaceMatchResult {
  const title = input.title || ""
  const slug = input.slug || ""
  const keywords = input.keywords || []
  const category = input.category || ""
  const content = input.content ? input.content.slice(0, 1000) : ""

  // Aggregate and normalize all search fields into a unified token stream
  const rawHaystack = `${title} ${slug} ${keywords.join(" ")} ${category} ${content}`
  const normalizedHaystack = normalizePersianText(rawHaystack)

  // 1. Match Plant Species
  let matchedSpecies: SpeciesDefinition | undefined
  for (const sp of SPECIES_DEFINITIONS) {
    for (const pattern of sp.patterns) {
      const normPattern = normalizePersianText(pattern)
      if (normalizedHaystack.includes(normPattern)) {
        matchedSpecies = sp
        break
      }
    }
    if (matchedSpecies) break
  }

  // 2. Match Gardening / Care Topic
  let matchedTopic: CareTopicDefinition | undefined
  for (const tp of CARE_TOPIC_DEFINITIONS) {
    for (const pattern of tp.patterns) {
      const normPattern = normalizePersianText(pattern)
      if (normalizedHaystack.includes(normPattern)) {
        matchedTopic = tp
        break
      }
    }
    if (matchedTopic) break
  }

  // 3. Synthesize commercial query and Persian copy
  if (matchedSpecies && matchedTopic) {
    const combinedTitle = matchedSpecies.combinedTitleFa
      ? matchedSpecies.combinedTitleFa(matchedTopic.nameFa)
      : `خرید ${matchedTopic.nameFa} و گیاه ${matchedSpecies.nameFa} در بازارچه`

    return {
      query: matchedSpecies.query,
      titleFa: combinedTitle,
      descriptionFa: matchedSpecies.descriptionFa,
      speciesMatch: matchedSpecies.nameFa,
      careTopicMatch: matchedTopic.nameFa,
    }
  }

  if (matchedSpecies) {
    return {
      query: matchedSpecies.query,
      titleFa: matchedSpecies.titleFa,
      descriptionFa: matchedSpecies.descriptionFa,
      speciesMatch: matchedSpecies.nameFa,
    }
  }

  if (matchedTopic) {
    return {
      query: matchedTopic.query,
      titleFa: matchedTopic.titleFa,
      descriptionFa: matchedTopic.descriptionFa,
      careTopicMatch: matchedTopic.nameFa,
    }
  }

  // Fallback: General Houseplant Marketplace
  return {
    query: "گیاهان آپارتمانی",
    titleFa: "بازارچه گل و گیاه جالیز",
    descriptionFa:
      "خرید و فروش بی‌واسطه انواع گل، گیاه آپارتمانی، قلمه و ملزومات باغبانی در سراسر کشور",
  }
}
