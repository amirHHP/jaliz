export type BlogCluster =
  | "species"
  | "diagnosis"
  | "season"
  | "space"
  | "tutorial"
  | "care"
  | "plants"

export interface BlogFaq {
  question: string
  answer: string
}

export interface BlogSeoMeta {
  primaryKeyword: string
  cluster: BlogCluster
  publishedAtIso: string
  alternateSlug: string
  faqs: BlogFaq[]
}

export interface BlogPost {
  slug: string
  lang: "fa" | "en"
  title: string
  description: string
  category: string
  categoryEn: string
  publishedAt: string
  readTime: string
  author: string
  content: string
  icon: string
  gradient: string
  keywords: string[]
  primaryKeyword: string
  cluster: BlogCluster
  publishedAtIso: string
  alternateSlug: string
  faqs: BlogFaq[]
}

export type BlogPostInput = Omit<
  BlogPost,
  "primaryKeyword" | "cluster" | "publishedAtIso" | "alternateSlug" | "faqs"
>

export const BLOG_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jaliz.ir"

const blogSeoBySlug: Record<string, BlogSeoMeta> = {}

function addPair(
  faSlug: string,
  enSlug: string,
  fa: Omit<BlogSeoMeta, "alternateSlug">,
  en: Omit<BlogSeoMeta, "alternateSlug">
) {
  blogSeoBySlug[faSlug] = { ...fa, alternateSlug: enSlug }
  blogSeoBySlug[enSlug] = { ...en, alternateSlug: faSlug }
}

addPair(
  "راهنمای-آبیاری-گیاهان-آپارتمانی",
  "watering-houseplants-guide",
  {
    primaryKeyword: "آبیاری گیاهان آپارتمانی",
    cluster: "care",
    publishedAtIso: "2026-06-22",
    faqs: [
      { question: "هر چند وقت یک‌بار به گیاه آپارتمانی آب بدهیم؟", answer: "تقویم ثابت وجود ندارد. وقتی ۳ تا ۵ سانتی‌متر بالای خاک خشک شد آبیاری کنید. فصل، نور، گلدان و نوع گیاه فاصله را عوض می‌کنند." },
      { question: "چطور بفهمیم آبیاری زیاد بوده است؟", answer: "برگ‌های پایینی نرم و زرد می‌شوند، خاک مدت طولانی خیس می‌ماند و گاهی بوی ماندگی یا پشه خاک ظاهر می‌شود." },
      { question: "آبیاری از ته گلدان بهتر است؟", answer: "برای گیاهانی که سطح خاک‌شان نباید خیس بماند مفید است، اما باز هم باید آب اضافه را خالی کنید تا ریشه در آب نماند." },
      { question: "آب شیر برای گیاه مناسب است؟", answer: "اگر کلر زیاد است، آب را ۲۴ ساعت در ظرف باز بگذارید. آب خیلی سرد به ریشه شوک می‌دهد." },
    ],
  },
  {
    primaryKeyword: "houseplant watering",
    cluster: "care",
    publishedAtIso: "2026-06-22",
    faqs: [
      { question: "How often should I water houseplants?", answer: "There is no fixed calendar. Water when the top 3–5 cm of mix is dry. Season, light, pot material, and species change the interval." },
      { question: "How do I know I overwatered?", answer: "Lower leaves turn yellow and soft, soil stays wet for days, and you may smell a sour mix or see fungus gnats." },
      { question: "Is bottom watering better?", answer: "It helps when you want the surface drier, but you must still dump leftover water so roots are not sitting in a saucer." },
      { question: "Can I use tap water?", answer: "If chlorine is strong, let water sit uncovered for 24 hours. Avoid ice-cold water." },
    ],
  }
)

addPair(
  "گیاهان-آپارتمانی-مقاوم-برای-تازه-کارها",
  "beginner-houseplants",
  {
    primaryKeyword: "گیاهان آپارتمانی مقاوم",
    cluster: "plants",
    publishedAtIso: "2026-06-23",
    faqs: [
      { question: "بهترین گیاه برای کسی که تازه شروع کرده چیست؟", answer: "سانسوریا، زامیفولیا، پتوس، آلوئه‌ورا و گندمی معمولاً اشتباه‌های اول را بهتر تحمل می‌کنند." },
      { question: "گیاه مقاوم یعنی نیاز به نور ندارد؟", answer: "خیر. مقاوم یعنی کم‌توقع است، اما بیشتر گونه‌ها با نور روشن غیرمستقیم شاداب‌تر می‌مانند." },
      { question: "آیا این گیاهان برای حیوان خانگی امن هستند؟", answer: "خیر. پتوس، سانسوریا و آلوئه برای گربه و سگ مناسب نیستند. برای خانه با حیوان مقاله گیاهان بی‌خطر را بخوانید." },
    ],
  },
  {
    primaryKeyword: "beginner houseplants",
    cluster: "plants",
    publishedAtIso: "2026-06-23",
    faqs: [
      { question: "What is the easiest houseplant for a beginner?", answer: "Snake plant, ZZ plant, pothos, aloe, and spider plant tolerate early mistakes better than most." },
      { question: "Does hardy mean it needs no light?", answer: "No. Hardy means low-maintenance. Most still look better in bright indirect light." },
      { question: "Are these plants pet-safe?", answer: "No. Pothos, snake plant, and aloe are not safe for cats or dogs. See the pet-safe guide." },
    ],
  }
)

addPair(
  "راهنمای-تعویض-گلدان-و-خاک",
  "how-to-repot-plants",
  {
    primaryKeyword: "تعویض گلدان",
    cluster: "tutorial",
    publishedAtIso: "2026-06-24",
    faqs: [
      { question: "هر چند سال یک‌بار باید گلدان را عوض کرد؟", answer: "معمولاً هر ۱۲ تا ۲۴ ماه، یا وقتی ریشه از زهکش بیرون بزند و خاک خیلی سریع خشک شود." },
      { question: "گلدان جدید چقدر باید بزرگ‌تر باشد؟", answer: "فقط ۲ تا ۵ سانتی‌متر قطر بیشتر. جهش بزرگ خاک خیس می‌ماند و ریشه می‌پوسد." },
      { question: "بعد از تعویض گلدان کود بدهیم؟", answer: "تا ۴ تا ۶ هفته صبر کنید تا ریشه جدید نسوزد." },
    ],
  },
  {
    primaryKeyword: "repotting plants",
    cluster: "tutorial",
    publishedAtIso: "2026-06-24",
    faqs: [
      { question: "How often should I repot?", answer: "Every 12–24 months, or when roots escape the drainage holes and the mix dries unusually fast." },
      { question: "How much larger should the new pot be?", answer: "Only 2–5 cm wider. A huge jump holds too much wet soil and risks rot." },
      { question: "Should I fertilize after repotting?", answer: "Wait 4–6 weeks so new roots are not burned." },
    ],
  }
)

addPair(
  "راهنمای-تکثیر-گیاهان-در-آب",
  "water-propagation-guide",
  {
    primaryKeyword: "تکثیر گیاهان در آب",
    cluster: "tutorial",
    publishedAtIso: "2026-06-27",
    faqs: [
      { question: "قلمه را از کجا ببریم؟", answer: "۱ سانتی‌متر زیر گره، با زاویه حدود ۴۵ درجه و با ابزار تمیز." },
      { question: "کی قلمه را به خاک منتقل کنیم؟", answer: "وقتی ریشه‌ها حدود ۲.۵ تا ۵ سانتی‌متر شدند، نه وقتی خیلی بلند و نازک شدند." },
      { question: "چرا آب سبز می‌شود؟", answer: "نور مستقیم روی ظرف شفاف جلبک می‌سازد. ظرف تیره‌تر و تعویض آب هر ۵ تا ۷ روز کمک می‌کند." },
    ],
  },
  {
    primaryKeyword: "water propagation",
    cluster: "tutorial",
    publishedAtIso: "2026-06-27",
    faqs: [
      { question: "Where do I cut a cutting?", answer: "About 1 cm below a node, at a 45-degree angle, with clean tools." },
      { question: "When do I move it to soil?", answer: "When roots are about 2.5–5 cm long—not when they are long and stringy." },
      { question: "Why does the water turn green?", answer: "Sun on a clear jar grows algae. Use a darker bottle and change water every 5–7 days." },
    ],
  }
)

addPair(
  "راهنمای-هیدروپونیک-به-زبان-ساده",
  "simple-hydroponics-guide",
  {
    primaryKeyword: "کشت هیدروپونیک",
    cluster: "tutorial",
    publishedAtIso: "2026-06-27",
    faqs: [
      { question: "هیدروپونیک یعنی گیاه در آب خالص رشد می‌کند؟", answer: "خیر. ریشه به محلول غذایی و اکسیژن نیاز دارد، نه آب راکد بدون مواد مغذی." },
      { question: "برای شروع خانگی چه سیستمی ساده است؟", answer: "یک مخزن، پمپ هوای آکواریوم، لیکا یا پرلیت، و کود مخصوص هیدروپونیک کافی است." },
      { question: "آیا مصرف آب کمتر است؟", answer: "معمولاً بله، چون آب در چرخه بسته می‌ماند و کمتر به زمین فرو می‌رود." },
    ],
  },
  {
    primaryKeyword: "hydroponics for beginners",
    cluster: "tutorial",
    publishedAtIso: "2026-06-27",
    faqs: [
      { question: "Does hydroponics mean plain water?", answer: "No. Roots need a nutrient solution and oxygen, not stagnant tap water." },
      { question: "What is a simple home setup?", answer: "A reservoir, aquarium air pump, clay pebbles or perlite, and hydroponic fertilizer." },
      { question: "Does it save water?", answer: "Usually yes, because water recirculates instead of draining into the ground." },
    ],
  }
)

addPair(
  "علت-زرد-شدن-برگ-گیاهان",
  "why-plant-leaves-turn-yellow",
  {
    primaryKeyword: "علت زرد شدن برگ گیاهان",
    cluster: "diagnosis",
    publishedAtIso: "2026-06-26",
    faqs: [
      { question: "اولین چیزی که بعد از زرد شدن برگ چک کنیم چیست؟", answer: "رطوبت خاک و زهکش گلدان. آبیاری نامناسب شایع‌ترین علت است." },
      { question: "زردی بین رگبرگ یعنی چه؟", answer: "اغلب کمبود آهن یا منیزیم است؛ الگوی برگ جوان یا پیر را مقایسه کنید." },
      { question: "برگ زرد را جدا کنیم؟", answer: "اگر کاملاً زرد و مرده است بله، تا گیاه انرژی را صرف بافت مرده نکند." },
    ],
  },
  {
    primaryKeyword: "yellow plant leaves",
    cluster: "diagnosis",
    publishedAtIso: "2026-06-26",
    faqs: [
      { question: "What should I check first when leaves yellow?", answer: "Soil moisture and drainage. Watering mistakes are the most common cause." },
      { question: "What does yellowing between veins mean?", answer: "Often iron or magnesium deficiency. Note whether old or new leaves are affected." },
      { question: "Should I remove yellow leaves?", answer: "If they are fully yellow and dead, yes, so the plant does not keep them." },
    ],
  }
)

addPair(
  "گیاهان-آپارتمانی-نور-کم",
  "low-light-houseplants",
  {
    primaryKeyword: "گیاهان آپارتمانی نور کم",
    cluster: "space",
    publishedAtIso: "2026-06-26",
    faqs: [
      { question: "نور کم یعنی اتاق بدون پنجره؟", answer: "خیر. نور کم یعنی فاصله زیاد از پنجره یا پنجره شمالی. تاریکی مطلق رشد پایدار نمی‌دهد." },
      { question: "کدام گیاه برای راهرو اداری مناسب است؟", answer: "زامیفولیا، سانسوریا و برگ عبایی معمولاً بهتر از گیاهان ابلق دوام می‌آورند." },
      { question: "در نور کم چقدر آب بدهیم؟", answer: "کمتر از حالت پرنور. خاک دیرتر خشک می‌شود و آبیاری زیاد سریع‌تر می‌پوساند." },
    ],
  },
  {
    primaryKeyword: "low light houseplants",
    cluster: "space",
    publishedAtIso: "2026-06-26",
    faqs: [
      { question: "Does low light mean a room with no windows?", answer: "No. It means far from a window or a north window. True darkness will not sustain growth." },
      { question: "Which plants suit an office hallway?", answer: "ZZ plant, snake plant, and cast iron plant usually outlast variegated species." },
      { question: "Should I water less in low light?", answer: "Yes. Soil dries slowly, so overwatering is the main risk." },
    ],
  }
)

addPair(
  "راهنمای-رطوبت-گیاهان-آپارتمانی",
  "houseplant-humidity-guide",
  {
    primaryKeyword: "رطوبت گیاهان آپارتمانی",
    cluster: "care",
    publishedAtIso: "2026-09-02",
    faqs: [
      { question: "غبارپاشی رطوبت را بالا می‌برد؟", answer: "فقط چند دقیقه. برای کالاتیا و سرخس رطوبت‌ساز یا دسته‌جمعی کردن گلدان‌ها مؤثرتر است." },
      { question: "رطوبت مناسب بیشتر گیاهان گرمسیری چقدر است؟", answer: "حدود ۴۰ تا ۶۰ درصد. خانه‌های گرم‌شده در زمستان اغلب زیر ۳۰ درصد هستند." },
      { question: "رطوبت زیاد چه مشکلی می‌سازد؟", answer: "با تهویه ضعیف، کپک خاک و لکه قارچی برگ بیشتر می‌شود." },
    ],
  },
  {
    primaryKeyword: "houseplant humidity",
    cluster: "care",
    publishedAtIso: "2026-09-02",
    faqs: [
      { question: "Does misting raise humidity?", answer: "Only for a few minutes. A humidifier or grouping pots works better for calatheas and ferns." },
      { question: "What humidity do tropical plants want?", answer: "About 40–60%. Heated homes in winter often sit below 30%." },
      { question: "Can humidity be too high?", answer: "Yes. With poor airflow you get soil mold and fungal leaf spots." },
    ],
  }
)

addPair(
  "راهنمای-کوددهی-گیاهان-آپارتمانی",
  "houseplant-fertilizing-guide",
  {
    primaryKeyword: "کود گیاهان آپارتمانی",
    cluster: "care",
    publishedAtIso: "2026-09-03",
    faqs: [
      { question: "در زمستان کود بدهیم؟", answer: "اگر رشد متوقف است خیر. نمک در خاک جمع می‌شود و نوک برگ می‌سوزد." },
      { question: "NPK یعنی چه؟", answer: "نیتروژن برای برگ، فسفر برای ریشه و گل، پتاسیم برای استحکام کلی." },
      { question: "سوختگی کود را چطور بشوییم؟", answer: "چند بار با آب فراوان آبشویی کنید تا از زهکش خارج شود و کود را مدتی قطع کنید." },
    ],
  },
  {
    primaryKeyword: "houseplant fertilizer",
    cluster: "care",
    publishedAtIso: "2026-09-03",
    faqs: [
      { question: "Should I fertilize in winter?", answer: "Not if growth has stopped. Salts build up and burn leaf tips." },
      { question: "What does NPK mean?", answer: "Nitrogen for leaves, phosphorus for roots and flowers, potassium for toughness." },
      { question: "How do I fix fertilizer burn?", answer: "Flush the pot thoroughly and pause feeding." },
    ],
  }
)

addPair(
  "راهنمای-نور-گیاهان-آپارتمانی",
  "houseplant-light-guide",
  {
    primaryKeyword: "نور گیاهان آپارتمانی",
    cluster: "care",
    publishedAtIso: "2026-09-04",
    faqs: [
      { question: "نور غیرمستقیم روشن یعنی چه؟", answer: "گیاه سایه نرم می‌اندازد اما آفتاب تند ساعت‌ها روی برگ نمی‌ماند؛ معمولاً نزدیک پنجره جنوبی با پرده توری." },
      { question: "پنجره شمالی برای چه گیاهی کافی است؟", answer: "گونه‌های خیلی کم‌توقع مثل سانسوریا و زامیفولیا؛ گیاهان ابلق معمولاً کم‌رنگ می‌شوند." },
      { question: "لامپ معمولی اتاق جایگزین نور رشد است؟", answer: "خیر. به لامپ طیف کامل حدود ۶۵۰۰ کلوین نزدیک گیاه نیاز دارید." },
    ],
  },
  {
    primaryKeyword: "houseplant light",
    cluster: "care",
    publishedAtIso: "2026-09-04",
    faqs: [
      { question: "What is bright indirect light?", answer: "The plant casts a soft shadow but harsh sun does not sit on the leaves for hours—often a south window behind a sheer curtain." },
      { question: "Is a north window enough?", answer: "For tough plants like snake plant and ZZ. Variegated plants often fade." },
      { question: "Are room bulbs grow lights?", answer: "No. Use a full-spectrum lamp around 6500K close to the plant." },
    ],
  }
)

addPair(
  "آفات-رایج-گیاهان-آپارتمانی",
  "common-houseplant-pests",
  {
    primaryKeyword: "آفات گیاهان آپارتمانی",
    cluster: "diagnosis",
    publishedAtIso: "2026-09-05",
    faqs: [
      { question: "گیاه جدید را قرنطینه کنیم؟", answer: "بله، حدود دو هفته جدا از بقیه تا کنه یا شپشک پخش نشود." },
      { question: "پشه خاک با کنه چه فرقی دارد؟", answer: "پشه از خاک خیس پرواز می‌کند؛ کنه تارعنکبوتی روی برگ تار و نقطه زرد می‌سازد." },
      { question: "یک‌بار سم کافی است؟", answer: "معمولاً خیر. تخم‌ها می‌مانند و باید درمان را چند نوبت تکرار کنید." },
    ],
  },
  {
    primaryKeyword: "houseplant pests",
    cluster: "diagnosis",
    publishedAtIso: "2026-09-05",
    faqs: [
      { question: "Should I quarantine new plants?", answer: "Yes—about two weeks away from the rest of the collection." },
      { question: "How are fungus gnats different from mites?", answer: "Gnats rise from wet soil. Spider mites leave stippling and fine webbing on leaves." },
      { question: "Is one spray enough?", answer: "Usually not. Eggs survive, so repeat treatments." },
    ],
  }
)

addPair(
  "گیاهان-بی-خطر-برای-حیوانات-خانگی",
  "pet-safe-houseplants",
  {
    primaryKeyword: "گیاهان سمی برای گربه",
    cluster: "plants",
    publishedAtIso: "2026-09-06",
    faqs: [
      { question: "پتوس برای گربه خطر دارد؟", answer: "بله، از خانواده شیپوری است و در صورت جویدن می‌تواند مشکل‌ساز شود." },
      { question: "اگر حیوان برگ خورد چه کنیم؟", answer: "نام گیاه را یادداشت کنید و با دامپزشک تماس بگیرید. استفراغ خودسرانه ندهید." },
      { question: "گیاه غیرسمی را می‌شود آزاد گذاشت؟", answer: "جویدن زیاد باز هم معده را ناراحت می‌کند؛ گلدان را از دسترس خارج کنید اگر عادت جویدن شدید است." },
    ],
  },
  {
    primaryKeyword: "pet safe houseplants",
    cluster: "plants",
    publishedAtIso: "2026-09-06",
    faqs: [
      { question: "Is pothos toxic to cats?", answer: "Yes. It is an aroid and can cause problems if chewed." },
      { question: "What if a pet eats a leaf?", answer: "Note the plant name and call a vet. Do not induce vomiting unless told to." },
      { question: "Can non-toxic plants stay on the floor?", answer: "Heavy chewing can still upset the stomach. Move the pot if the habit is strong." },
    ],
  }
)

addPair(
  "مراقبت-زمستانی-گیاهان-آپارتمانی",
  "winter-houseplant-care",
  {
    primaryKeyword: "مراقبت زمستانی گیاه",
    cluster: "season",
    publishedAtIso: "2026-09-07",
    faqs: [
      { question: "در زمستان آبیاری را قطع کنیم؟", answer: "خیر، فقط فاصله را بیشتر کنید و همیشه خاک را لمس کنید." },
      { question: "گلدان را به شیشه پنجره بچسبانیم تا نور بگیرد؟", answer: "برگ روی شیشه یخ‌زده می‌سوزد. چند سانتی‌متر فاصله بگذارید." },
      { question: "تعویض گلدان در دی‌ماه درست است؟", answer: "مگر بیماری یا غرقابی شدید، کار را به بهار بسپارید." },
    ],
  },
  {
    primaryKeyword: "winter houseplant care",
    cluster: "season",
    publishedAtIso: "2026-09-07",
    faqs: [
      { question: "Should I stop watering in winter?", answer: "No. Water less often and always check the soil." },
      { question: "Should I press plants against the window for light?", answer: "Leaves on icy glass can scorch. Leave a gap." },
      { question: "Is midwinter a good time to repot?", answer: "Only if the plant is waterlogged or diseased. Otherwise wait for spring." },
    ],
  }
)

addPair(
  "انتخاب-خاک-مناسب-گیاهان-آپارتمانی",
  "choosing-houseplant-soil",
  {
    primaryKeyword: "خاک گیاهان آپارتمانی",
    cluster: "tutorial",
    publishedAtIso: "2026-09-08",
    faqs: [
      { question: "خاک باغچه برای گلدان خوب است؟", answer: "خیر. فشرده می‌شود، زهکش را می‌بندد و آفت خاک‌زی می‌آورد." },
      { question: "پرلیت برای چیست؟", answer: "هوا و زهکشی. جلوی خفگی ریشه را می‌گیرد." },
      { question: "لایه سنگ کف گلدان لازم است؟", answer: "معمولاً نه؛ سوراخ زهکش باز و مخلوط سبک مهم‌تر است." },
    ],
  },
  {
    primaryKeyword: "houseplant soil mix",
    cluster: "tutorial",
    publishedAtIso: "2026-09-08",
    faqs: [
      { question: "Can I use garden soil in pots?", answer: "No. It compacts, blocks drainage, and can bring pests indoors." },
      { question: "What is perlite for?", answer: "Air and drainage so roots do not suffocate." },
      { question: "Do I need rocks in the bottom?", answer: "Usually no. Open holes and a light mix matter more." },
    ],
  }
)

addPair(
  "گیاهان-تصفیه-کننده-هوا",
  "air-purifying-houseplants",
  {
    primaryKeyword: "گیاهان تصفیه کننده هوا",
    cluster: "plants",
    publishedAtIso: "2026-09-09",
    faqs: [
      { question: "آیا یک سانسوریا هوای کل خانه را تصفیه می‌کند؟", answer: "خیر. اثر آزمایشگاهی ناسا در اتاق بسته بود؛ تهویه و نکشیدن سیگار مهم‌تر است." },
      { question: "پس چرا گیاه بخریم؟", answer: "رطوبت جزئی، آرامش و اکسیژن روزانه؛ نه به‌عنوان تنها فیلتر هوا." },
      { question: "خاک خیس کیفیت هوا را بهتر می‌کند؟", answer: "برعکس، کپک و پشه می‌سازد. گیاه باید سالم و خاک باید با زهکش باشد." },
    ],
  },
  {
    primaryKeyword: "air purifying plants",
    cluster: "plants",
    publishedAtIso: "2026-09-09",
    faqs: [
      { question: "Will one snake plant clean a whole home?", answer: "No. NASA’s study used sealed chambers. Ventilation matters more." },
      { question: "Why keep plants at all?", answer: "A little humidity, calmer rooms, and daily oxygen—not as the only air filter." },
      { question: "Does wet soil clean the air?", answer: "It can make mold and gnats. Keep plants healthy with draining mix." },
    ],
  }
)

addPair(
  "علت-قهوه-ای-شدن-نوک-برگ",
  "brown-leaf-tips-guide",
  {
    primaryKeyword: "نوک برگ قهوه ای",
    cluster: "diagnosis",
    publishedAtIso: "2026-09-10",
    faqs: [
      { question: "نوک قهوه‌ای با زردی برگ چه فرقی دارد؟", answer: "نوک معمولاً خشک و کاغذی است؛ زردی یکدست بیشتر به آبیاری یا تغذیه برمی‌گردد." },
      { question: "قیچی کردن نوک مشکل را حل می‌کند؟", answer: "فقط ظاهر را بهتر می‌کند. علت (رطوبت، نمک، کلر، باد گرم) باید اصلاح شود." },
      { question: "آب شیر نوک برگ را می‌سوزاند؟", answer: "در بعضی گونه‌ها املاح و کلر مؤثرند. آب ایستاده یا فیلترشده کمک می‌کند." },
    ],
  },
  {
    primaryKeyword: "brown leaf tips",
    cluster: "diagnosis",
    publishedAtIso: "2026-09-10",
    faqs: [
      { question: "How are brown tips different from yellow leaves?", answer: "Tips are dry and papery. Even yellowing is more often watering or nutrients." },
      { question: "Does trimming the tip fix it?", answer: "It only improves looks. Fix humidity, salts, chlorine, or hot drafts." },
      { question: "Can tap water cause tip burn?", answer: "In some species, minerals and chlorine contribute. Use rested or filtered water." },
    ],
  }
)

addPair(
  "راهنمای-هرس-گیاهان-آپارتمانی",
  "pruning-houseplants-guide",
  {
    primaryKeyword: "هرس گیاهان آپارتمانی",
    cluster: "tutorial",
    publishedAtIso: "2026-09-11",
    faqs: [
      { question: "بهترین فصل هرس کی است؟", answer: "اوایل رشد؛ بهار و اوایل تابستان. در زمستان فقط بافت مرده را بردارید." },
      { question: "چقدر از گیاه را می‌توان برید؟", answer: "در یک نوبت بیش از حدود یک‌سوم شاخ و برگ را برندارید." },
      { question: "سانسوریا را از نوک کوتاه کنیم؟", answer: "ظاهر زشتی می‌ماند. برگ آسیب‌دیده را از قاعده جدا کنید." },
    ],
  },
  {
    primaryKeyword: "pruning houseplants",
    cluster: "tutorial",
    publishedAtIso: "2026-09-11",
    faqs: [
      { question: "When is the best time to prune?", answer: "Early in the growing season. In winter, only remove dead tissue." },
      { question: "How much can I cut?", answer: "Do not remove more than about one-third of the foliage at once." },
      { question: "Can I snip the tip of a snake plant leaf?", answer: "It looks ugly. Remove damaged leaves at the base instead." },
    ],
  }
)

addPair(
  "نگهداری-سانسوریا",
  "snake-plant-care",
  {
    primaryKeyword: "نگهداری سانسوریا",
    cluster: "species",
    publishedAtIso: "2026-09-12",
    faqs: [
      { question: "سانسوریا را هر چند وقت آب بدهیم؟", answer: "وقتی خاک تا عمق چند سانتی‌متر خشک شد. در زمستان گاهی هر سه تا چهار هفته کافی است." },
      { question: "برگ سانسوریا چرا نرم و خم می‌شود؟", answer: "اغلب آبیاری زیاد و پوسیدگی ریزوم است، نه تشنگی." },
      { question: "سانسوریا در اتاق بدون پنجره زنده می‌ماند؟", answer: "مدتی دوام می‌آورد اما رشد می‌ایستد. نور کم غیرمستقیم بهتر از تاریکی است." },
      { question: "چطور سانسوریا را تکثیر کنیم؟", answer: "جدا کردن پاجوش با بخشی از ریزوم مطمئن‌تر از قلمه برگ در آب است." },
      { question: "برای گربه خطر دارد؟", answer: "بله. اگر حیوان کنجکاو دارید آن را بالا بگذارید یا گونه امن انتخاب کنید." },
    ],
  },
  {
    primaryKeyword: "snake plant care",
    cluster: "species",
    publishedAtIso: "2026-09-12",
    faqs: [
      { question: "How often do I water a snake plant?", answer: "When several centimeters of mix are dry. In winter that can mean every 3–4 weeks." },
      { question: "Why are the leaves mushy and folding?", answer: "Usually overwatering and rhizome rot, not thirst." },
      { question: "Can it live in a windowless room?", answer: "It may persist, but growth stalls. Dim indirect light is better than darkness." },
      { question: "How do I propagate it?", answer: "Dividing pups with a piece of rhizome is more reliable than leaf cuttings in water." },
      { question: "Is it pet-safe?", answer: "No. Keep it out of reach or choose a safer species." },
    ],
  }
)

addPair(
  "نگهداری-پتوس",
  "pothos-care",
  {
    primaryKeyword: "نگهداری پتوس",
    cluster: "species",
    publishedAtIso: "2026-09-13",
    faqs: [
      { question: "پتوس ابلق چرا سبز یکدست می‌شود؟", answer: "نور کم کلروفیل را زیاد می‌کند تا نور را جبران کند. به نور روشن غیرمستقیم نزدیک‌ترش کنید." },
      { question: "پتوس را در آب نگه داریم یا خاک؟", answer: "هر دو ممکن است. در خاک رشد قوی‌تر است؛ آب برای تکثیر و دکوراسیون مناسب است." },
      { question: "برگ‌های پایین چرا زرد می‌شوند؟", answer: "اغلب آبیاری نامنظم یا نور خیلی کم. الگوی خاک خیس یا خشک را چک کنید." },
      { question: "چطور پتوس پرپشت شود؟", answer: "بالای گره هرس کنید تا جوانه جانبی بزند و چند قلمه را در یک گلدان بگذارید." },
    ],
  },
  {
    primaryKeyword: "pothos care",
    cluster: "species",
    publishedAtIso: "2026-09-13",
    faqs: [
      { question: "Why did my variegated pothos turn solid green?", answer: "Low light makes it produce more chlorophyll. Move it into brighter indirect light." },
      { question: "Water or soil?", answer: "Both work. Soil usually grows a stronger plant; water is fine for propagation and display." },
      { question: "Why are lower leaves yellowing?", answer: "Often irregular watering or very low light. Check whether the mix stays wet or bone-dry." },
      { question: "How do I make pothos bushier?", answer: "Prune above a node and plant several cuttings in one pot." },
    ],
  }
)

addPair(
  "نگهداری-زامیفولیا",
  "zz-plant-care",
  {
    primaryKeyword: "نگهداری زامیفولیا",
    cluster: "species",
    publishedAtIso: "2026-09-14",
    faqs: [
      { question: "زامیفولیا زرد شد؛ کم‌آب است؟", answer: "اغلب برعکس است: ریزوم در خاک خیس می‌پوسد. اول زهکش و رطوبت خاک را ببینید." },
      { question: "چند وقت یک‌بار آب بدهیم؟", answer: "وقتی خاک تقریباً کامل خشک شد. در نور کم فاصله طولانی‌تر است." },
      { question: "برگ براق یعنی گیاه مصنوعی است؟", answer: "خیر. لایه مومی طبیعی است و گرد و غبار را باید گاهی پاک کرد." },
      { question: "برای حیوان خانگی امن است؟", answer: "خیر. شیره آن تحریک‌کننده است." },
    ],
  },
  {
    primaryKeyword: "zz plant care",
    cluster: "species",
    publishedAtIso: "2026-09-14",
    faqs: [
      { question: "Yellow ZZ stems mean it is thirsty?", answer: "Usually the opposite: rhizomes rot in wet soil. Check drainage first." },
      { question: "How often should I water?", answer: "When the mix is nearly dry. Intervals are longer in low light." },
      { question: "Are the shiny leaves fake?", answer: "No. The waxy coat is natural. Wipe dust off occasionally." },
      { question: "Is it pet-safe?", answer: "No. The sap is irritating." },
    ],
  }
)

addPair(
  "نگهداری-برگ-انجیری",
  "monstera-care",
  {
    primaryKeyword: "نگهداری برگ انجیری",
    cluster: "species",
    publishedAtIso: "2026-09-15",
    faqs: [
      { question: "چرا برگ انجیری سوراخ نمی‌شود؟", answer: "معمولاً نور کم یا سن کم گیاه. برگ‌های بالغ در نور کافی بریدگی می‌گیرند." },
      { question: "قیم لازم است؟", answer: "بله اگر می‌خواهید برگ‌های بزرگ و ریشه‌های هوایی بالا بروند. خزه یا چوب قیم کمک می‌کند." },
      { question: "ریشه هوایی را ببریم؟", answer: "نبرید مگر مزاحم باشد. آن‌ها رطوبت و تکیه‌گاه می‌گیرند." },
      { question: "زرد شدن برگ بزرگ یعنی چیست؟", answer: "یک برگ پیر پایین طبیعی است؛ زردی ناگهانی چند برگ را با آبیاری و نور چک کنید." },
    ],
  },
  {
    primaryKeyword: "monstera care",
    cluster: "species",
    publishedAtIso: "2026-09-15",
    faqs: [
      { question: "Why doesn’t my monstera split?", answer: "Usually low light or a young plant. Mature leaves fenestrate in brighter light." },
      { question: "Does it need a pole?", answer: "Yes if you want large climbing leaves. A moss or wood pole helps aerial roots." },
      { question: "Should I cut aerial roots?", answer: "Only if they are in the way. They take up moisture and support." },
      { question: "What if a huge leaf yellows?", answer: "One old lower leaf can be normal. Sudden yellowing of several leaves points to watering or light." },
    ],
  }
)

addPair(
  "گیاهان-مناسب-بالکن",
  "balcony-plants-iran",
  {
    primaryKeyword: "گیاه مناسب بالکن",
    cluster: "space",
    publishedAtIso: "2026-09-16",
    faqs: [
      { question: "بالکن غربی در تابستان ایران چه گیاهی می‌خواهد؟", answer: "گونه‌های مقاوم به گرما مثل شمعدانی، رزماری، کاکتوس و بعضی ساکولنت‌ها؛ نه کالاتیا." },
      { question: "گیاه آپارتمانی را یک‌باره بیرون بگذاریم؟", answer: "خیر. چند روز سایه و بعد آفتاب تدریجی، وگرنه برگ می‌سوزد." },
      { question: "باد شدید بالکن را چه کنیم؟", answer: "گلدان سنگین‌تر، قیم، و دوری از لبه بدون حفاظ." },
      { question: "آبیاری بالکن با داخل خانه فرق دارد؟", answer: "بله؛ باد و آفتاب خاک را سریع‌تر خشک می‌کنند. هر روز در گرما چک کنید نه اینکه کورکورانه هر روز آب بدهید." },
    ],
  },
  {
    primaryKeyword: "balcony plants",
    cluster: "space",
    publishedAtIso: "2026-09-16",
    faqs: [
      { question: "What survives a west-facing balcony in a hot climate?", answer: "Heat-tolerant plants such as geranium, rosemary, cactus, and some succulents—not calathea." },
      { question: "Can I move a houseplant outside overnight?", answer: "Harden off over several days or leaves will scorch." },
      { question: "How do I handle strong wind?", answer: "Heavier pots, stakes, and keep plants back from an unsheltered edge." },
      { question: "Is balcony watering the same as indoors?", answer: "No. Wind and sun dry mix faster. Check daily in heat, but do not water on a blind schedule." },
    ],
  }
)

addPair(
  "کاشت-ریحان-و-سبزی-در-گلدان",
  "growing-herbs-indoors",
  {
    primaryKeyword: "کاشت ریحان در گلدان",
    cluster: "tutorial",
    publishedAtIso: "2026-09-17",
    faqs: [
      { question: "ریحان پشت پنجره شمالی رشد می‌کند؟", answer: "ضعیف و دراز می‌شود. پنجره جنوبی یا شرقی پرنور، یا لامپ رشد لازم است." },
      { question: "نعنا را با ریحان در یک گلدان بکاریم؟", answer: "نعنا تهاجمی است و ریحان را خفه می‌کند. گلدان جدا بهتر است." },
      { question: "برگ را از کجا بچینیم؟", answer: "از بالای ساقه بالای گره، تا بوته پرپشت شود نه اینکه از پایین لخت شود." },
      { question: "این همان هیدروپونیک است؟", answer: "خیر. اینجا خاک گلدان و پنجره است؛ کشت بدون خاک مقاله جدا دارد." },
    ],
  },
  {
    primaryKeyword: "growing basil indoors",
    cluster: "tutorial",
    publishedAtIso: "2026-09-17",
    faqs: [
      { question: "Will basil grow in a north window?", answer: "It gets leggy. Use a bright south or east window, or a grow light." },
      { question: "Can mint share a pot with basil?", answer: "Mint takes over. Use separate pots." },
      { question: "Where do I harvest leaves?", answer: "Pinch above a node near the top so the plant branches." },
      { question: "Is this hydroponics?", answer: "No. This is potting mix on a windowsill. Soil-less growing is a separate guide." },
    ],
  }
)

addPair(
  "قارچ-سفید-روی-خاک-گلدان",
  "white-mold-on-potting-soil",
  {
    primaryKeyword: "قارچ سفید روی خاک گلدان",
    cluster: "diagnosis",
    publishedAtIso: "2026-09-18",
    faqs: [
      { question: "کپک سفید روی خاک خطرناک است؟", answer: "برای انسان معمولاً خفیف است اما نشانه خاک خیلی خیس و هوای راکد است و ریشه را تهدید می‌کند." },
      { question: "با پشه خاک یکی است؟", answer: "خیر. پشه حشره است؛ کپک قارچ روی سطح خاک. هر دو عاشق رطوبت ماندگارند." },
      { question: "خاک را عوض کنیم؟", answer: "اگر فقط سطح سفید است، لایه را بردارید و خشک‌تر آبیاری کنید. اگر ریشه پوسیده است تعویض کامل لازم است." },
      { question: "دارچین روی خاک مؤثر است؟", answer: "اثر محدود دارد. اصل کار کم کردن آب و بهتر کردن تهویه است." },
    ],
  },
  {
    primaryKeyword: "white mold on potting soil",
    cluster: "diagnosis",
    publishedAtIso: "2026-09-18",
    faqs: [
      { question: "Is white soil mold dangerous?", answer: "It is usually mild for people but signals chronically wet mix and still air, which can rot roots." },
      { question: "Is it the same as fungus gnats?", answer: "No. Gnats are insects. Mold is a fungus on the surface. Both love lasting moisture." },
      { question: "Should I replace all the soil?", answer: "If only the surface is white, scrape it and water less. If roots are rotting, repot fully." },
      { question: "Does cinnamon help?", answer: "Only a little. The real fix is less water and more airflow." },
    ],
  }
)

addPair(
  "انتخاب-گلدان-سفالی-یا-پلاستیکی",
  "terracotta-vs-plastic-pots",
  {
    primaryKeyword: "گلدان سفالی یا پلاستیکی",
    cluster: "tutorial",
    publishedAtIso: "2026-09-19",
    faqs: [
      { question: "برای سانسوریا سفال بهتر است؟", answer: "اغلب بله چون زودتر خشک می‌شود و ریشه گوشتی کمتر می‌پوسد." },
      { question: "کالاتیا در سفال تشنه نمی‌ماند؟", answer: "سفال رطوبت را می‌کشد. برای گیاهان رطوبت‌دوست پلاستیک یا سرامیک لعاب‌دار مناسب‌تر است." },
      { question: "گلدان بدون زهکش بخریم؟", answer: "فقط به‌عنوان کاور. گیاه باید در گلدان سوراخ‌دار داخل آن بنشیند." },
      { question: "سایز را چطور انتخاب کنیم؟", answer: "کمی بزرگ‌تر از توپ ریشه، نه دو برابر. گلدان خیلی بزرگ خاک خیس نگه می‌دارد." },
    ],
  },
  {
    primaryKeyword: "terracotta vs plastic pots",
    cluster: "tutorial",
    publishedAtIso: "2026-09-19",
    faqs: [
      { question: "Is terracotta better for snake plants?", answer: "Often yes, because it dries faster and fleshy roots rot less." },
      { question: "Will a calathea dry out in terracotta?", answer: "It can. Humidity lovers often prefer plastic or glazed ceramic." },
      { question: "Can I use a pot with no holes?", answer: "Only as a cachepot. The plant should sit in a nursery pot with drainage." },
      { question: "How do I choose size?", answer: "Slightly larger than the rootball, not twice as wide. Oversized pots stay wet." },
    ],
  }
)

addPair(
  "نگهداری-گیاه-در-مسافرت",
  "watering-plants-while-away",
  {
    primaryKeyword: "آبیاری گیاه در مسافرت",
    cluster: "care",
    publishedAtIso: "2026-09-20",
    faqs: [
      { question: "یک هفته سفر برای پتوس خطرناک است؟", answer: "اگر قبل از رفتن آبیاری عمیق کنید و نور مستقیم را کم کنید معمولاً مشکلی نیست." },
      { question: "بطری وارونه روی خاک کار می‌کند؟", answer: "گاهی بیش از حد آب می‌دهد. فتیله یا گلدان خودآبیار کنترل‌شده‌تر است." },
      { question: "گیاه را در حمام بدون نور بگذاریم؟", answer: "برای چند روز رطوبت خوب است اما تاریکی طولانی رشد را می‌خواباند. نور غیرمستقیم حفظ شود." },
      { question: "این همان برنامه زمستانی است؟", answer: "خیر. زمستان فصل رشد کم است؛ سفر یک وقفه کوتاه در هر فصل است." },
    ],
  },
  {
    primaryKeyword: "watering plants while away",
    cluster: "care",
    publishedAtIso: "2026-09-20",
    faqs: [
      { question: "Is one week away dangerous for pothos?", answer: "Usually not if you water deeply before you leave and reduce harsh sun." },
      { question: "Do inverted bottles work?", answer: "They can overwater. Wicks or a controlled self-watering insert are steadier." },
      { question: "Should I leave plants in a dark bathroom?", answer: "Humidity helps for a few days, but long darkness stalls growth. Keep some indirect light." },
      { question: "Is this the same as winter care?", answer: "No. Winter is a slow season. Travel is a short pause in any season." },
    ],
  }
)

addPair(
  "گیاهان-گلدار-آپارتمانی",
  "flowering-houseplants",
  {
    primaryKeyword: "گل آپارتمانی گلدار",
    cluster: "plants",
    publishedAtIso: "2026-09-21",
    faqs: [
      { question: "چرا اسپاتی فیلوم گل نمی‌دهد؟", answer: "اغلب نور کم یا کود نیتروژن زیاد. نور متوسط روشن و تغذیه متعادل کمک می‌کند." },
      { question: "بنفشه آفریقایی را از بالا آب بدهیم؟", answer: "آب روی تاج پوسیدگی می‌آورد. آبیاری از ته گلدان بهتر است." },
      { question: "گل دادن یعنی گیاه سالم است؟", answer: "نشانه خوبی است اما باز هم زهکش و آفت را چک کنید." },
      { question: "این گیاهان سخت‌جان تازه‌کار هستند؟", answer: "نه لزوماً. گل‌دارها معمولاً نور و رطوبت دقیق‌تری می‌خواهند تا سانسوریا." },
    ],
  },
  {
    primaryKeyword: "flowering houseplants",
    cluster: "plants",
    publishedAtIso: "2026-09-21",
    faqs: [
      { question: "Why won’t my peace lily bloom?", answer: "Often too little light or too much nitrogen. Bright medium light and balanced feed help." },
      { question: "Should I water African violets from above?", answer: "Water on the crown causes rot. Bottom watering is safer." },
      { question: "Does flowering mean the plant is healthy?", answer: "It is a good sign, but still check drainage and pests." },
      { question: "Are bloomers as easy as snake plants?", answer: "Not usually. Flowering plants want more precise light and moisture." },
    ],
  }
)

export function applyBlogSeo(post: BlogPostInput): BlogPost {
  const seo = blogSeoBySlug[post.slug]
  if (!seo) {
    throw new Error(`Missing blog SEO meta for slug: ${post.slug}`)
  }
  return { ...post, ...seo }
}

export function getRelatedPosts(
  post: BlogPost,
  all: BlogPost[],
  limit = 2
): BlogPost[] {
  const sameLang = all.filter(
    (candidate) => candidate.lang === post.lang && candidate.slug !== post.slug
  )
  const sameCluster = sameLang.filter(
    (candidate) => candidate.cluster === post.cluster
  )
  const sameCategory = sameLang.filter(
    (candidate) =>
      candidate.categoryEn === post.categoryEn &&
      candidate.cluster !== post.cluster
  )
  const ranked = [...sameCluster, ...sameCategory]
  const unique: BlogPost[] = []
  for (const candidate of ranked) {
    if (!unique.some((item) => item.slug === candidate.slug)) {
      unique.push(candidate)
    }
    if (unique.length === limit) return unique
  }
  for (const candidate of sameLang) {
    if (!unique.some((item) => item.slug === candidate.slug)) {
      unique.push(candidate)
    }
    if (unique.length === limit) return unique
  }
  return unique
}

export function getAlternatePost(
  post: BlogPost,
  all: BlogPost[]
): BlogPost | undefined {
  return all.find((candidate) => candidate.slug === post.alternateSlug)
}

export function blogCanonicalUrl(slug: string): string {
  return `${BLOG_SITE_URL}/blog/${encodeURIComponent(slug)}`
}

export function listPrimaryKeywords(
  posts: Pick<BlogPost, "lang" | "primaryKeyword">[],
  lang: "fa" | "en"
): string[] {
  return posts
    .filter((post) => post.lang === lang)
    .map((post) => post.primaryKeyword)
}
