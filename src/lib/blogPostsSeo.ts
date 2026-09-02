import type { BlogPostInput } from "./blogTopics"

const h2 = "text-xl font-bold text-slate-800 mt-8 mb-4"
const p = "text-slate-600 mb-4"
const ul = "list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4"
const lead = "lead text-lg text-slate-600 mb-6 font-medium"

export const seoBlogPosts: BlogPostInput[] = [
  {
    slug: "نگهداری-سانسوریا",
    lang: "fa",
    title: "نگهداری سانسوریا در خانه",
    description: "نگهداری سانسوریا یعنی خاک خشک، زهکش باز و نور غیرمستقیم. بفهمید چرا برگ شمشیری نرم می‌شود، کی آب بدهید و چطور پاجوش را جدا کنید بدون پوسیدگی ریزوم.",
    category: "معرفی گیاهان",
    categoryEn: "plants",
    publishedAt: "۲۱ شهریور ۱۴۰۵",
    readTime: "۱۲ دقیقه",
    author: "سارا گل‌پرور",
    icon: "Sprout",
    gradient: "from-emerald-500 to-lime-600",
    keywords: ["نگهداری سانسوریا", "سانسوریا شمشیری", "آبیاری سانسوریا", "تکثیر سانسوریا", "جالیز"],
    content: `
      <p class="${lead}">
        نگهداری سانسوریا ساده‌تر از بیشتر آپارتمانی‌هاست، به شرطی که آن را مثل گیاه تشنهٔ گرمسیری غرقاب نکنید. این گیاه شمشیری آب را در برگ و ریزوم ذخیره می‌کند؛ دشمن اصلی‌اش خاک دائماً خیس است نه فراموشی یک هفته‌ای آبیاری.
      </p>
      <h2 class="${h2}">سانسوریا چه نوری می‌خواهد؟</h2>
      <p class="${p}">
        سانسوریا در نور روشن غیرمستقیم بهترین رنگ و رشد را دارد، اما برخلاف مونسترا می‌تواند در فاصله دورتر از پنجره هم شکل خود را حفظ کند. پنجره جنوبی با پرده توری ایده‌آل است. نور مستقیم ظهر تابستان لبه برگ را سفید و سوخته می‌کند.
      </p>
      <p class="${p}">
        در راهرو یا اداره رشد کند می‌شود اما گیاه معمولاً نمی‌میرد. این یعنی «تحمل سایه» نه «عشق تاریکی». اگر فقط سایه دارید، آن را در فهرست <a href="/blog/گیاهان-آپارتمانی-نور-کم">گیاهان آپارتمانی نور کم</a> بگذارید و انتظار پاجوش سریع نداشته باشید. تفاوت جهت پنجره در <a href="/blog/راهنمای-نور-گیاهان-آپارتمانی">راهنمای نور</a> آمده است.
      </p>
      <h2 class="${h2}">آبیاری سانسوریا: کمتر، عمیق‌تر</h2>
      <p class="${p}">
        وقتی چند سانتی‌متر بالای خاک و حتی لایه میانی خشک شد آب بدهید تا از زهکش خارج شود، بعد زیرگلدانی را خالی کنید. در بهار و تابستان کنار پنجره پرنور ممکن است هر ده تا چهارده روز باشد؛ در زمستان گاهی سه تا چهار هفته. تقویم هفتگی ثابت برای سانسوریا خطرناک است.
      </p>
      <p class="${p}">
        برگ نرم، خم‌شده و لکه‌دار با خاک خیس یعنی ریزوم در حال پوسیدن است. آبیاری را قطع کنید، گیاه را از گلدان درآورید و بافت سیاه بدبو را ببرید. روش تشخیص تشنگی واقعی را با <a href="/blog/راهنمای-آبیاری-گیاهان-آپارتمانی">آبیاری گیاهان آپارتمانی</a> چک کنید، نه با ظاهر چروک برگ تنها.
      </p>
      <h2 class="${h2}">خاک و گلدان مناسب شمشیری</h2>
      <p class="${p}">
        مخلوط کاکتوس یا خاک گلدان به‌اضافه پرلیت زیاد لازم است. خاک باغچه و کوکوپیت خیلی نگهدارنده، سانسوریا را در آپارتمان‌های کم‌نور می‌کشد. دستور بافت را در <a href="/blog/انتخاب-خاک-مناسب-گیاهان-آپارتمانی">خاک مناسب</a> ببینید.
      </p>
      <p class="${p}">
        گلدان سفالی برای سانسوریا معمولاً بهتر از پلاستیک است چون زودتر خشک می‌شود. سایز را فقط کمی بزرگ‌تر از توپ ریشه بگیرید. جزئیات ظرف در <a href="/blog/انتخاب-گلدان-سفالی-یا-پلاستیکی">گلدان سفالی یا پلاستیکی</a> و زمان جابجایی در <a href="/blog/راهنمای-تعویض-گلدان-و-خاک">تعویض گلدان</a> است.
      </p>
      <h2 class="${h2}">چرا برگ سانسوریا زرد یا چروک می‌شود؟</h2>
      <p class="${p}">
        زردی از قاعده با بافت نرم تقریباً همیشه آب زیاد است. چروک شدن در خاک خشک می‌تواند کم‌آبی واقعی باشد؛ یک آبیاری عمیق بدهید و چند روز صبر کنید. نوک خشک را با <a href="/blog/علت-قهوه-ای-شدن-نوک-برگ">نوک قهوه‌ای</a> و زردی گسترده را با <a href="/blog/علت-زرد-شدن-برگ-گیاهان">زرد شدن برگ</a> جدا کنید.
      </p>
      <h2 class="${h2}">تکثیر از پاجوش، نه فقط قلمه برگ</h2>
      <p class="${p}">
        مطمئن‌ترین راه جدا کردن پاگیاه با بخشی از ریزوم در فصل رشد است. قلمه برگ در آب ممکن است ریشه بدهد اما گاهی گیاه جدید ابلق را از دست می‌دهد یا می‌پوسد. ابزار را تمیز کنید و زخم ریزوم را چند ساعت خشک کنید و بعد در خاک کمی مرطوب بکارید.
      </p>
      <h2 class="${h2}">سانسوریا و حیوان خانگی</h2>
      <p class="${p}">
        در صورت جویدن برای گربه و سگ مناسب نیست. اگر حیوان کنجکاو دارید گلدان را بالا بگذارید یا از فهرست <a href="/blog/گیاهان-بی-خطر-برای-حیوانات-خانگی">گیاهان بی‌خطر</a> انتخاب کنید. این گیاه «تازه‌کار آسان» است اما «پت‌سیف» نیست؛ لیست شروع را در <a href="/blog/گیاهان-آپارتمانی-مقاوم-برای-تازه-کارها">گیاهان مقاوم برای تازه‌کارها</a> ببینید.
      </p>
      <h2 class="${h2}">کود و زمستان</h2>
      <p class="${p}">
        در فصل رشد ماهی یک‌بار کود خیلی رقیق کافی است. زمستان تغذیه را قطع کنید. برنامه کلی در <a href="/blog/راهنمای-کوددهی-گیاهان-آپارتمانی">کوددهی</a> و <a href="/blog/مراقبت-زمستانی-گیاهان-آپارتمانی">مراقبت زمستانی</a> است. در جالیز سانسوریا را با نور و نوع گلدان ثبت کنید تا فاصله آبیاری حدسی نباشد.
      </p>
      <h2 class="${h2}">سانسوریا ابلق و پاکوتاه</h2>
      <p class="${p}">
        رقم‌های ابلق طلایی و نقره‌ای برای حفظ نوار روشن به نور بیشتری از نوع سبز تیره نیاز دارند. اگر نوارها محو شدند گیاه را به پنجره نزدیک‌تر کنید، نه اینکه کود ابلق بدهید. انواع پاکوتاه برای طاقچه مناسب‌اند اما همان قانون خاک خشک را دارند؛ گلدان کوچک‌تر زودتر خشک می‌شود و باید بیشتر چک شود نه اینکه کورکورانه آب بیشتری بگیرید.
      </p>
      <h2 class="${h2}">جابجایی و شوک</h2>
      <p class="${p}">
        بعد از خرید یا تعویض گلدان یک تا دو هفته کود ندهید و گیاه را از باد کولر دور کنید. برگ جدید از وسط رزت می‌آید؛ کند بودن رشد در پاییز طبیعی است. اگر چند برگ یک‌باره خم شد اول زهکش را ببینید، بعد نور. ثبت یادآور در جالیز کمک می‌کند الگوی شخصی خانه خودتان را بعد از سه چهار آبیاری پیدا کنید.
      </p>
    `
  },
  {
    slug: "snake-plant-care",
    lang: "en",
    title: "Snake Plant Care at Home",
    description: "Snake plant care means dry mix, open drainage, and indirect light. Learn why leaves go mushy, when to water, and how to divide pups without rotting the rhizome.",
    category: "Plants",
    categoryEn: "plants",
    publishedAt: "September 12, 2026",
    readTime: "12 min",
    author: "Sarah Flower",
    icon: "Sprout",
    gradient: "from-emerald-500 to-lime-600",
    keywords: ["snake plant care", "sansevieria watering", "snake plant propagation", "mother in law tongue", "jaliz"],
    content: `
      <p class="${lead}">
        Snake plant care is easier than most houseplants if you do not treat it like a thirsty tropical. It stores water in leaves and rhizomes. Chronically wet soil kills it faster than a missed watering.
      </p>
      <h2 class="${h2}">How Much Light Does a Snake Plant Need?</h2>
      <p class="${p}">
        Bright indirect light gives the best color and growth. Unlike monstera, it can keep its shape farther from a window. A south window behind a sheer curtain is ideal. Hot midday sun can bleach leaf edges.
      </p>
      <p class="${p}">
        In a hallway it grows slowly but usually lives. That is shade tolerance, not a love of darkness. If shade is all you have, park it with <a href="/blog/low-light-houseplants">low light houseplants</a> and do not expect fast pups. Window direction is in the <a href="/blog/houseplant-light-guide">light guide</a>.
      </p>
      <h2 class="${h2}">Water Less, Then Water Deeply</h2>
      <p class="${p}">
        Water when several centimeters of mix are dry, until it drains, then empty the saucer. Near a bright window in summer that may be every 10–14 days; in winter every 3–4 weeks. A rigid weekly calendar is risky.
      </p>
      <p class="${p}">
        Mushy, folding, spotted leaves on wet soil mean the rhizome is rotting. Stop watering, unpot, and cut away black smelly tissue. Confirm real thirst with the <a href="/blog/watering-houseplants-guide">watering guide</a>, not wrinkles alone.
      </p>
      <h2 class="${h2}">Soil and Pot</h2>
      <p class="${p}">
        Use a cactus mix or potting mix with plenty of perlite. Garden soil and very water-holding coir kill snake plants in dim apartments. See <a href="/blog/choosing-houseplant-soil">houseplant soil</a>.
      </p>
      <p class="${p}">
        Terracotta usually dries faster than plastic. Size up only slightly. Details in <a href="/blog/terracotta-vs-plastic-pots">terracotta vs plastic</a> and <a href="/blog/how-to-repot-plants">repotting</a>.
      </p>
      <h2 class="${h2}">Yellow or Wrinkled Leaves</h2>
      <p class="${p}">
        Yellowing from the base with soft tissue is almost always overwatering. Wrinkles on dry mix can be true drought—water deeply and wait. Split symptoms with <a href="/blog/brown-leaf-tips-guide">brown tips</a> and <a href="/blog/why-plant-leaves-turn-yellow">yellow leaves</a>.
      </p>
      <h2 class="${h2}">Propagate From Pups</h2>
      <p class="${p}">
        Dividing a pup with rhizome in the growing season is the reliable method. Leaf cuttings in water may root but can lose variegation or rot. Let the rhizome wound dry for a few hours, then pot in barely moist mix.
      </p>
      <h2 class="${h2}">Pets and Fertilizer</h2>
      <p class="${p}">
        Not pet-safe if chewed. Use <a href="/blog/pet-safe-houseplants">pet-safe plants</a> or a high shelf. It is beginner-friendly but not pet-friendly; the starter list is <a href="/blog/beginner-houseplants">beginner houseplants</a>. Feed very dilute once a month in growth season only—see <a href="/blog/houseplant-fertilizing-guide">fertilizing</a> and <a href="/blog/winter-houseplant-care">winter care</a>. Log light and pot type in Jaliz so watering intervals are not guesses.
      </p>
    `
  },
  {
    slug: "نگهداری-پتوس",
    lang: "fa",
    title: "نگهداری پتوس در گلدان و آب",
    description: "نگهداری پتوس یعنی نور غیرمستقیم، خاک مرطوب نه خیس، و هرس بالای گره. بفهمید چرا ابلق سبز می‌شود، کی قلمه بزنید و چطور بوته را پرپشت کنید.",
    category: "معرفی گیاهان",
    categoryEn: "plants",
    publishedAt: "۲۲ شهریور ۱۴۰۵",
    readTime: "۱۲ دقیقه",
    author: "علی سبزواری",
    icon: "Leaf",
    gradient: "from-green-400 to-teal-600",
    keywords: ["نگهداری پتوس", "پتوس ابلق", "تکثیر پتوس", "برگ قلبی", "جالیز"],
    content: `
      <p class="${lead}">
        نگهداری پتوس برای کسی که می‌خواهد رونده سریع و بخشنده داشته باشد عالی است، به شرطی که گره را بشناسد و گیاه را در تاریکی مطلق یا باتلاق نگذارد. برگ قلبی تشنگی را با آویزان شدن نشان می‌دهد؛ بعد از آب معمولاً ظرف چند ساعت برمی‌گردد.
      </p>
      <h2 class="${h2}">نور و حفظ ابلق بودن</h2>
      <p class="${p}">
        پتوس سبز تیره سایه را بهتر از ابلق نئون تحمل می‌کند. اگر برگ‌های طلایی یکدست سبز شدند، گیاه کلروفیل ساخته تا نور کم را جبران کند. آن را به نور روشن غیرمستقیم نزدیک کنید؛ جزئیات در <a href="/blog/راهنمای-نور-گیاهان-آپارتمانی">نور گیاهان</a>. برای راهرو خیلی تاریک، گونه‌های فهرست <a href="/blog/گیاهان-آپارتمانی-نور-کم">نور کم</a> پایدارترند.
      </p>
      <h2 class="${h2}">آبیاری و زهکش</h2>
      <p class="${p}">
        سطح خاک که خشک شد آب بدهید. پتوس برخلاف سانسوریا خشکی طولانی را بدتر تحمل می‌کند اما باز هم از خیس ماندن می‌پوسد. اگر برگ پایین زرد و نرم است خاک را چک کنید. راهنمای عمومی: <a href="/blog/راهنمای-آبیاری-گیاهان-آپارتمانی">آبیاری</a>.
      </p>
      <h2 class="${h2}">خاک، قیم یا آویز</h2>
      <p class="${p}">
        مخلوط سبک با پرلیت برای ریشه هوایی پتوس بهتر از خاک سنگین است. می‌توانید آن را آویزان کنید یا روی قیم خزه ببندید تا برگ‌ها بزرگ‌تر شوند. تعویض گلدان وقتی ریشه از زهکش بیرون زد: <a href="/blog/راهنمای-تعویض-گلدان-و-خاک">تعویض گلدان</a>.
      </p>
      <h2 class="${h2}">تکثیر از گره</h2>
      <p class="${p}">
        هر قلمه باید حداقل یک گره داشته باشد؛ ریشه از گره می‌زند نه از میانگره خالی. آب شفاف را عوض کنید و وقتی ریشه کوتاه شد به خاک بروید. آموزش کامل در <a href="/blog/راهنمای-تکثیر-گیاهان-در-آب">تکثیر در آب</a>. چند قلمه در یک گلدان بوته را پر می‌کند؛ هرس بالای گره را در <a href="/blog/راهنمای-هرس-گیاهان-آپارتمانی">هرس</a> ببینید.
      </p>
      <h2 class="${h2}">آفات و سمیت</h2>
      <p class="${p}">
        شپشک آردآلود عاشق پتوس متراکم است. پشت برگ را هفته‌ای یک‌بار ببینید: <a href="/blog/آفات-رایج-گیاهان-آپارتمانی">آفات</a>. برای گربه و سگ سمی است؛ جایگزین‌ها در <a href="/blog/گیاهان-بی-خطر-برای-حیوانات-خانگی">گیاهان بی‌خطر</a>. در جالیز پتوس را ثبت کنید تا فاصله آبیاری با فصل عوض شود.
      </p>
      <h2 class="${h2}">پتوس در آب برای همیشه؟</h2>
      <p class="${p}">
        می‌توانید قلمه را ماه‌ها در آب نگه دارید اما رشد کندتر و برگ‌ها معمولاً کوچک‌تر می‌مانند. اگر هدف گیاه پرپشت روی قفسه است، بعد از ریشه کوتاه به خاک سبک منتقل کنید و یک هفته خاک را مرطوب‌تر از معمول نگه دارید تا شوک کم شود. آب راکد و نور مستقیم روی شیشه جلبک می‌سازد.
      </p>
      <h2 class="${h2}">گونه‌های رایج</h2>
      <p class="${p}">
        گلدن، نئون، مرمر و ن‌جوی هر کدام به نور متفاوتی برای حفظ رنگ نیاز دارند. ن‌جوی ابلق سفید خیلی زود در سایه سبز می‌شود. اگر فقط یک نقطه کم‌نور دارید همان پتوس سبز ساده را بخرید و ابلق را برای پنجره شرقی نگه دارید. روی داربست خزه برگ‌ها درشت‌تر می‌شوند چون گیاه فکر می‌کند از درخت بالا می‌رود.
      </p>
    `
  },
  {
    slug: "pothos-care",
    lang: "en",
    title: "Pothos Care in Soil and Water",
    description: "Pothos care is bright indirect light, evenly moist mix, and cuts above a node. Learn why variegation fades, when to take cuttings, and how to grow a bushier vine.",
    category: "Plants",
    categoryEn: "plants",
    publishedAt: "September 13, 2026",
    readTime: "12 min",
    author: "Alex Green",
    icon: "Leaf",
    gradient: "from-green-400 to-teal-600",
    keywords: ["pothos care", "golden pothos", "pothos propagation", "devil's ivy", "jaliz"],
    content: `
      <p class="${lead}">
        Pothos care suits anyone who wants a fast, forgiving vine—if you know the node and avoid a swamp or a closet. Heart-shaped leaves droop when thirsty and usually perk up within hours of a drink.
      </p>
      <h2 class="${h2}">Light and Variegation</h2>
      <p class="${p}">
        Dark-green pothos handles shade better than neon variegation. If gold leaves turn solid green, the plant is making extra chlorophyll. Move it into brighter indirect light; see the <a href="/blog/houseplant-light-guide">light guide</a>. For a very dark hallway, <a href="/blog/low-light-houseplants">low light houseplants</a> are steadier.
      </p>
      <h2 class="${h2}">Watering</h2>
      <p class="${p}">
        Water when the surface is dry. Pothos likes more moisture than a snake plant but still rots if left soggy. Soft yellow lower leaves mean check the mix. General method: <a href="/blog/watering-houseplants-guide">watering</a>.
      </p>
      <h2 class="${h2}">Soil, Pole, or Hang</h2>
      <p class="${p}">
        A light perlite mix suits aerial roots. Hang it or train it on a moss pole for larger leaves. Repot when roots exit the holes: <a href="/blog/how-to-repot-plants">repotting</a>.
      </p>
      <h2 class="${h2}">Propagate at the Node</h2>
      <p class="${p}">
        Every cutting needs at least one node. Change the water and move to soil when roots are still short. Full steps: <a href="/blog/water-propagation-guide">water propagation</a>. Several cuttings in one pot plus pruning above a node (see <a href="/blog/pruning-houseplants-guide">pruning</a>) make a bushier plant.
      </p>
      <h2 class="${h2}">Pests and Pets</h2>
      <p class="${p}">
        Mealybugs love dense pothos. Check undersides weekly: <a href="/blog/common-houseplant-pests">pests</a>. Toxic to cats and dogs; see <a href="/blog/pet-safe-houseplants">pet-safe plants</a>. Log pothos in Jaliz so watering tracks the season.
      </p>
    `
  },
  {
    slug: "نگهداری-زامیفولیا",
    lang: "fa",
    title: "نگهداری زامیفولیا در آپارتمان",
    description: "نگهداری زامیفولیا یعنی صبر در آبیاری و زهکش عالی. ریزوم مثل سیب‌زمینی آب ذخیره می‌کند؛ زردی ساقه اغلب پوسیدگی است نه تشنگی. راهنمای نور اداره و خاک سبک.",
    category: "معرفی گیاهان",
    categoryEn: "plants",
    publishedAt: "۲۳ شهریور ۱۴۰۵",
    readTime: "۱۲ دقیقه",
    author: "سارا گل‌پرور",
    icon: "Sprout",
    gradient: "from-teal-400 to-emerald-700",
    keywords: ["نگهداری زامیفولیا", "زاموفیلیا", "آبیاری زامیفولیا", "زامیفولیا زرد", "جالیز"],
    content: `
      <p class="${lead}">
        نگهداری زامیفولیا برای دفتر و خانه کم‌نور محبوب است چون ریزوم زیرخاکی آب ذخیره می‌کند. ظاهر براق برگ یعنی گیاه مصنوعی نیست؛ لایه مومی است و باید گاهی گرد و غبارش را گرفت تا نور بخورد.
      </p>
      <h2 class="${h2}">نور اداره و پنجره شمالی</h2>
      <p class="${p}">
        زامیفولیا مهتابی ملایم و پنجره شمالی را تحمل می‌کند بهتر از بیشتر گونه‌ها. با این حال رشد در سایه خیلی کند است. آن را قهرمان <a href="/blog/گیاهان-آپارتمانی-نور-کم">نور کم</a> بدانید، نه گیاهی که در کمد رشد می‌کند. اگر پنجره جنوبی دارید، فاصله یک تا دو متری با پرده کافی است؛ آفتاب داغ برگ را می‌سوزاند.
      </p>
      <h2 class="${h2}">آبیاری: صبر کنید تا خاک خشک شود</h2>
      <p class="${p}">
        تقریباً کل حجم خاک باید خشک شود. در نور کم این یعنی فاصله‌های طولانی. ساقه زرد و نرم با خاک خیس پوسیدگی ریزوم است؛ گیاه را از گلدان خارج کنید. برعکس سانسوریا هم همین منطق را دارد اما زامیفولیا حتی کمتر آب می‌خواهد. مبنای لمس خاک: <a href="/blog/راهنمای-آبیاری-گیاهان-آپارتمانی">آبیاری</a>.
      </p>
      <h2 class="${h2}">خاک خیلی سبک</h2>
      <p class="${p}">
        پرلیت و پوکه را دریغ نکنید. مخلوط برگ‌دار سنگین در گلدان پلاستیک بزرگ، زامیفولیا را در زمستان می‌کشد. <a href="/blog/انتخاب-خاک-مناسب-گیاهان-آپارتمانی">خاک</a> و <a href="/blog/انتخاب-گلدان-سفالی-یا-پلاستیکی">گلدان</a> را با هم انتخاب کنید.
      </p>
      <h2 class="${h2}">تکثیر و ایمنی</h2>
      <p class="${p}">
        تقسیم ریزوم در بهار ممکن است اما کند است. شیره گیاه تحریک‌کننده پوست و برای حیوان خانگی نامناسب است: <a href="/blog/گیاهان-بی-خطر-برای-حیوانات-خانگی">پت‌سیف</a>. کود خیلی رقیق فقط در رشد فعال؛ <a href="/blog/راهنمای-کوددهی-گیاهان-آپارتمانی">کوددهی</a>. در جالیز «نور کم» و گلدان سفال را ثبت کنید تا یادآور دیرتر بیاید.
      </p>
      <h2 class="${h2}">زامیفولیا ابلق و رشد ناگهانی</h2>
      <p class="${p}">
        رقم ابلق Raven یا ابلق طلایی نور بیشتری می‌خواهد وگرنه الگو محو می‌شود. گاهی بعد از ماه‌ها سکوت یک ساقه جدید با قدرت از خاک بیرون می‌زند؛ این طبیعی است چون ریزوم زیر خاک کار می‌کرده. ساقه جدید را با آب اضافه تشویق نکنید.
      </p>
      <h2 class="${h2}">گرد و غبار و برگ براق</h2>
      <p class="${p}">
        لایه گرد و غبار فتوسنتز را در نور کم اداری تقریباً صفر می‌کند. ماهانه با دستمال مرطوب پاک کنید. براق‌کننده‌های شیمیایی روزنه را می‌بندند. اگر نوک برگ قهوه‌ای شد اول آبیاری و املاح را چک کنید نه اینکه هر روز غبارپاشی کنید.
      </p>
    `
  },
  {
    slug: "zz-plant-care",
    lang: "en",
    title: "ZZ Plant Care Indoors",
    description: "ZZ plant care is patient watering and sharp drainage. Potato-like rhizomes store water, so yellow stems are usually rot, not thirst. Light for offices and a gritty mix explained.",
    category: "Plants",
    categoryEn: "plants",
    publishedAt: "September 14, 2026",
    readTime: "12 min",
    author: "Sarah Flower",
    icon: "Sprout",
    gradient: "from-teal-400 to-emerald-700",
    keywords: ["zz plant care", "zamioculcas", "zz plant watering", "zz plant yellow stems", "jaliz"],
    content: `
      <p class="${lead}">
        ZZ plant care fits dim offices because underground rhizomes store water. Shiny leaves are a natural wax, not plastic—wipe dust so light can reach them.
      </p>
      <h2 class="${h2}">Office Light and North Windows</h2>
      <p class="${p}">
        ZZ plants tolerate mild fluorescents and north windows better than most species. Growth in shade is still slow. Treat it as a <a href="/blog/low-light-houseplants">low light</a> champion, not a closet plant. A south window at one to two meters behind a curtain is plenty; hot sun scorches.
      </p>
      <h2 class="${h2}">Wait Until the Mix Is Dry</h2>
      <p class="${p}">
        Almost the whole rootball should dry. In low light that means long gaps. Soft yellow stems on wet soil are rhizome rot—unpot and inspect. It wants even less water than a snake plant. Soil-check method: <a href="/blog/watering-houseplants-guide">watering</a>.
      </p>
      <h2 class="${h2}">Gritty Mix</h2>
      <p class="${p}">
        Do not skimp on perlite or pumice. Heavy foliage mix in a large plastic pot kills ZZ plants in winter. Pair <a href="/blog/choosing-houseplant-soil">soil</a> with <a href="/blog/terracotta-vs-plastic-pots">pot choice</a>.
      </p>
      <h2 class="${h2}">Propagation and Safety</h2>
      <p class="${p}">
        Rhizome division in spring is possible but slow. Sap irritates skin and is not pet-safe: <a href="/blog/pet-safe-houseplants">pet-safe plants</a>. Very dilute feed only in active growth: <a href="/blog/houseplant-fertilizing-guide">fertilizing</a>. In Jaliz, mark low light and terracotta so reminders come later.
      </p>
    `
  },
  {
    slug: "نگهداری-برگ-انجیری",
    lang: "fa",
    title: "نگهداری برگ انجیری (مونسترا)",
    description: "نگهداری برگ انجیری یعنی نور روشن، قیم برای ریشه هوایی و خاک قطعه‌قطعه. بفهمید چرا برگ سوراخ نمی‌شود، کی زرد می‌شود و چطور گیاه را بالا بفرستید.",
    category: "معرفی گیاهان",
    categoryEn: "plants",
    publishedAt: "۲۴ شهریور ۱۴۰۵",
    readTime: "۱۲ دقیقه",
    author: "علی سبزواری",
    icon: "Leaf",
    gradient: "from-lime-400 to-green-700",
    keywords: ["نگهداری برگ انجیری", "مونسترا", "برگ انجیری سوراخ", "قیم مونسترا", "جالیز"],
    content: `
      <p class="${lead}">
        نگهداری برگ انجیری یا مونسترا دلیچوسا برای کسی است که نور واقعی دارد. سوراخ و بریدگی برگ نشانه بلوغ در نور کافی است، نه کود جادویی. در راهرو تاریک فقط ساقه دراز و برگ کامل کوچک می‌گیرید.
      </p>
      <h2 class="${h2}">نور برای فنستره شدن</h2>
      <p class="${p}">
        نور روشن غیرمستقیم نزدیک پنجره شرقی یا جنوبی با پرده. اگر گیاه سایه نمی‌اندازد، برای سوراخ شدن برگ کم است. آن را با فهرست <a href="/blog/گیاهان-آپارتمانی-نور-کم">نور کم</a> قاطی نکنید. راهنمای تشخیص نور: <a href="/blog/راهنمای-نور-گیاهان-آپارتمانی">نور</a>.
      </p>
      <h2 class="${h2}">آبیاری برگ‌های بزرگ</h2>
      <p class="${p}">
        سطح خاک خشک شود، سپس آبیاری عمیق. برگ پهن تبخیر دارد اما ریشه در گلدان بی‌زهکش می‌پوسد. یک برگ پیر پایین زرد شود طبیعی است؛ چند برگ یک‌باره را در <a href="/blog/علت-زرد-شدن-برگ-گیاهان">زرد شدن برگ</a> و <a href="/blog/راهنمای-آبیاری-گیاهان-آپارتمانی">آبیاری</a> بررسی کنید.
      </p>
      <h2 class="${h2}">قیم، ریشه هوایی و خاک تکه‌تکه</h2>
      <p class="${p}">
        مونسترا بالارونده است. قیم خزه یا چوب به ریشه‌های هوایی تکیه‌گاه می‌دهد و برگ‌ها را بزرگ‌تر می‌کند. ریشه هوایی را بی‌دلیل نبرید. مخلوط پوست درخت و پرلیت مثل آرویدها؛ <a href="/blog/انتخاب-خاک-مناسب-گیاهان-آپارتمانی">خاک</a>. تعویض وقتی گلدان سبک و پر ریشه شد: <a href="/blog/راهنمای-تعویض-گلدان-و-خاک">تعویض گلدان</a>.
      </p>
      <h2 class="${h2}">رطوبت، هرس و حیوان</h2>
      <p class="${p}">
        نوک قهوه‌ای در هوای خشک بخاری رایج است: <a href="/blog/راهنمای-رطوبت-گیاهان-آپارتمانی">رطوبت</a> و <a href="/blog/علت-قهوه-ای-شدن-نوک-برگ">نوک قهوه‌ای</a>. ساقه دراز را بالای گره ببرید: <a href="/blog/راهنمای-هرس-گیاهان-آپارتمانی">هرس</a>. شیره تحریک‌کننده و برای حیوان نامناسب است. در جالیز نور «روشن غیرمستقیم» را ثبت کنید تا یادآور با تبخیر برگ‌های بزرگ هماهنگ شود.
      </p>
      <h2 class="${h2}">مونسترا کوچک و گیاه نابالغ</h2>
      <p class="${p}">
        گیاه جوان برگ کامل بدون سوراخ می‌دهد. این بیماری نیست. با نور کافی و زمان، برگ‌های بعدی بریدگی می‌گیرند. کود بیشتر این فرایند را جلو نمی‌اندازد و ممکن است ریشه را بسوزاند. اگر بعد از یک سال در نور خوب هنوز برگ‌ها کوچک ماندند، گلدان خیلی تنگ یا خیلی بزرگ را بررسی کنید.
      </p>
      <h2 class="${h2}">گردش هوا و لکه قارچی</h2>
      <p class="${p}">
        برگ‌های روی هم چسبیده در گوشه بی‌تهویه لکه‌های قهوه‌ای نرم می‌گیرند. فاصله بین گیاهان و یک فن ملایم بهتر از سم مداوم است. آب را روی تاج نریزید. اگر کپک روی خاک دیدید سطح را خشک کنید؛ مقاله جدا: <a href="/blog/قارچ-سفید-روی-خاک-گلدان">قارچ سفید روی خاک</a>.
      </p>
    `
  },
  {
    slug: "monstera-care",
    lang: "en",
    title: "Monstera Deliciosa Care",
    description: "Monstera care needs bright light, a pole for aerial roots, and a chunky mix. Learn why leaves will not split, when yellowing is normal, and how to train the plant upward.",
    category: "Plants",
    categoryEn: "plants",
    publishedAt: "September 15, 2026",
    readTime: "12 min",
    author: "Alex Green",
    icon: "Leaf",
    gradient: "from-lime-400 to-green-700",
    keywords: ["monstera care", "swiss cheese plant", "monstera fenestration", "monstera moss pole", "jaliz"],
    content: `
      <p class="${lead}">
        Monstera deliciosa care is for people with real light. Holes and splits are maturity in enough brightness, not a magic fertilizer. In a dark hall you get long stems and small unsplit leaves.
      </p>
      <h2 class="${h2}">Light for Fenestration</h2>
      <p class="${p}">
        Bright indirect light near an east or south window with a sheer curtain. If the plant casts no shadow, it will not split well. Do not file it under <a href="/blog/low-light-houseplants">low light houseplants</a>. How to judge light: <a href="/blog/houseplant-light-guide">light guide</a>.
      </p>
      <h2 class="${h2}">Watering Large Leaves</h2>
      <p class="${p}">
        Let the surface dry, then water deeply. Broad leaves transpire, but roots still rot without drainage. One old lower leaf yellowing can be normal; several at once belong in <a href="/blog/why-plant-leaves-turn-yellow">yellow leaves</a> and <a href="/blog/watering-houseplants-guide">watering</a>.
      </p>
      <h2 class="${h2}">Pole, Aerial Roots, Chunky Mix</h2>
      <p class="${p}">
        Monstera wants to climb. A moss or wood pole gives aerial roots a grip and larger leaves. Do not cut aerial roots without reason. Bark and perlite like other aroids: <a href="/blog/choosing-houseplant-soil">soil</a>. Repot when the pot is rootbound: <a href="/blog/how-to-repot-plants">repotting</a>.
      </p>
      <h2 class="${h2}">Humidity, Pruning, Pets</h2>
      <p class="${p}">
        Brown tips near heaters are common: <a href="/blog/houseplant-humidity-guide">humidity</a> and <a href="/blog/brown-leaf-tips-guide">brown tips</a>. Cut leggy stems above a node: <a href="/blog/pruning-houseplants-guide">pruning</a>. Sap is irritating and not pet-safe. In Jaliz set bright indirect light so reminders match the big leaves’ thirst.
      </p>
    `
  },
  {
    slug: "گیاهان-مناسب-بالکن",
    lang: "fa",
    title: "گیاه مناسب بالکن در گرمای ایران",
    description: "گیاه مناسب بالکن در ایران باید گرما، آفتاب غرب و باد را تحمل کند. بفهمید کدام گونه برای بالکن جنوبی یا سایه مناسب است و چطور گیاه آپارتمانی را تدریجی بیرون ببرید.",
    category: "معرفی گیاهان",
    categoryEn: "plants",
    publishedAt: "۲۵ شهریور ۱۴۰۵",
    readTime: "۱۲ دقیقه",
    author: "سارا گل‌پرور",
    icon: "Sun",
    gradient: "from-orange-400 to-amber-600",
    keywords: ["گیاه مناسب بالکن", "گل بالکن جنوبی", "گیاه مقاوم به گرما", "بالکن آپارتمان", "جالیز"],
    content: `
      <p class="${lead}">
        گیاه مناسب بالکن در شهرهای گرم ایران با گیاه راهرو فرق دارد. آفتاب بعدازظهر، باد کانالی و دمای سطح سنگ، خاک را خیلی سریع‌تر از داخل خانه خشک می‌کند. اینجا جای کالاتیا و برگ نازک رطوبت‌دوست نیست.
      </p>
      <h2 class="${h2}">جهت بالکن را جدی بگیرید</h2>
      <p class="${p}">
        بالکن جنوبی و غربی در تابستان سوزان است: شمعدانی، رزماری، لاواند در گلدان بزرگ، کاکتوس و ساکولنت‌های سخت‌جان، و بعضی فلفل زینتی. بالکن شرقی ملایم‌تر است و می‌تواند ریحان را در بهار تحمل کند. بالکن شمالی بیشتر سایه است؛ آنجا به منطق <a href="/blog/گیاهان-آپارتمانی-نور-کم">نور کم</a> نزدیک می‌شوید نه آفتاب‌پرست.
      </p>
      <p class="${p}">
        مونسترا و پتوس ابلق را یک‌شبه از اتاق به آفتاب ظهر نبرید. چند روز سایه و بعد نیم‌ساعت آفتاب صبح، وگرنه برگ می‌سوزد. نور داخل را با <a href="/blog/راهنمای-نور-گیاهان-آپارتمانی">راهنمای نور</a> مقایسه کنید تا انتظار غیرواقعی نداشته باشید.
      </p>
      <h2 class="${h2}">آبیاری و گلدان در باد</h2>
      <p class="${p}">
        هر روز خاک را چک کنید، اما هر روز آب ندهید مگر واقعاً خشک شده باشد. گلدان سفال در باد ممکن است ظهر تشنه و شب خیس بماند. گلدان سنگین‌تر و زیرگلدانی پایدار جلوی واژگونی را می‌گیرد. انتخاب ظرف: <a href="/blog/انتخاب-گلدان-سفالی-یا-پلاستیکی">گلدان</a>. اگر چند روز سفر می‌روید بالکن از اتاق خطرناک‌تر است؛ <a href="/blog/نگهداری-گیاه-در-مسافرت">مسافرت</a>.
      </p>
      <h2 class="${h2}">خاک، گرما و زمستان</h2>
      <p class="${p}">
        زهکش عالی واجب است چون رگبار ناگهانی گلدان را پر می‌کند. مخلوط سبک: <a href="/blog/انتخاب-خاک-مناسب-گیاهان-آپارتمانی">خاک</a>. در زمستان سرد، گیاهان حساس را داخل بیاورید؛ برنامه داخل در <a href="/blog/مراقبت-زمستانی-گیاهان-آپارتمانی">زمستان</a>. سبزی خوردن اگر فقط پنجره دارید مقاله <a href="/blog/کاشت-ریحان-و-سبزی-در-گلدان">ریحان در گلدان</a> است نه این فهرست آفتاب‌سوز.
      </p>
      <h2 class="${h2}">ثبت در جالیز</h2>
      <p class="${p}">
        موقعیت را «فضای باز» و نور را «آفتاب مستقیم» بگذارید تا یادآور آبیاری کوتاه‌تر از آپارتمان باشد. آفت بالکن (شته، کنه) را جدا از پشه خاک داخل ببینید: <a href="/blog/آفات-رایج-گیاهان-آپارتمانی">آفات</a>.
      </p>
      <h2 class="${h2}">سایه اضطراری در ظهر تیر</h2>
      <p class="${p}">
        حتی گیاهان مقاوم به گرما در موج گرما ممکن است ظهر پژمرده شوند در حالی که خاک مرطوب است؛ این کم‌آبی نیست، تنش گرماست. یک سایه‌بان موقت یا بردن گلدان به شرق بالکن برای چند ساعت برگ را نجات می‌دهد. آبیاری ظهر روی برگ داغ لکه می‌سازد؛ صبح زود یا غروب آب بدهید.
      </p>
      <h2 class="${h2}">خاک بالکن زودتر فقیر می‌شود</h2>
      <p class="${p}">
        باران و آبیاری مکرر مواد مغذی را می‌شوید. در فصل رشد کود رقیق ماهی یک‌بار کافی است؛ در اوج گرما کود را کم کنید چون ریشه ضعیف است. اگر بعد از رگبار آب روی سطح می‌ماند مخلوط را با پرلیت سبک کنید نه اینکه زهکش را با سنگ ببندید.
      </p>
    `
  },
  {
    slug: "balcony-plants-iran",
    lang: "en",
    title: "Balcony Plants for Hot, Windy Apartments",
    description: "Balcony plants in hot climates must handle west sun and wind. Learn which species fit south versus shaded balconies and how to harden off indoor plants without scorching leaves.",
    category: "Plants",
    categoryEn: "plants",
    publishedAt: "September 16, 2026",
    readTime: "12 min",
    author: "Sarah Flower",
    icon: "Sun",
    gradient: "from-orange-400 to-amber-600",
    keywords: ["balcony plants", "hot balcony plants", "south facing balcony", "windproof pots", "jaliz"],
    content: `
      <p class="${lead}">
        Balcony plants in hot cities are not hallway plants. Afternoon sun, wind tunnels, and hot stone dry mix far faster than a living room. Calathea and thin humidity lovers do not belong here.
      </p>
      <h2 class="${h2}">Face the Exposure Honestly</h2>
      <p class="${p}">
        South and west balconies in summer are brutal: geraniums, rosemary, lavender in large pots, cactus and tough succulents, some ornamental peppers. East is gentler and can hold basil in spring. A north balcony is closer to <a href="/blog/low-light-houseplants">low light</a> than to a sun terrace.
      </p>
      <p class="${p}">
        Do not move monstera or variegated pothos from a room into midday sun overnight. Harden off in shade, then brief morning sun. Compare indoor light with the <a href="/blog/houseplant-light-guide">light guide</a>.
      </p>
      <h2 class="${h2}">Water and Wind</h2>
      <p class="${p}">
        Check soil daily, but do not water daily unless it is actually dry. Terracotta in wind can be thirsty at noon and still wet at night. Heavy pots and stable saucers prevent tip-overs. See <a href="/blog/terracotta-vs-plastic-pots">pots</a>. Travel is riskier on a balcony: <a href="/blog/watering-plants-while-away">while away</a>.
      </p>
      <h2 class="${h2}">Soil, Heat, Winter</h2>
      <p class="${p}">
        Drainage is mandatory because sudden rain fills pots. Light mix: <a href="/blog/choosing-houseplant-soil">soil</a>. In a cold winter, move tender plants inside; indoor winter notes: <a href="/blog/winter-houseplant-care">winter care</a>. Windowsill herbs are <a href="/blog/growing-herbs-indoors">growing herbs indoors</a>, not this sun-baked list.
      </p>
      <h2 class="${h2}">Log It in Jaliz</h2>
      <p class="${p}">
        Mark location outdoor and light full sun so reminders are shorter than indoor ones. Balcony pests (aphids, mites) are not the same as indoor fungus gnats: <a href="/blog/common-houseplant-pests">pests</a>.
      </p>
      <h2 class="${h2}">Emergency Shade at Midday</h2>
      <p class="${p}">
        Even heat-proof plants can wilt at noon with moist soil; that is heat stress, not drought. Temporary shade or moving the pot east for a few hours saves leaves. Watering hot foliage at noon spots the leaf; water early morning or evening.
      </p>
      <h2 class="${h2}">Balcony Mix Goes Hungry Faster</h2>
      <p class="${p}">
        Rain and frequent watering leach nutrients. A dilute monthly feed in the growing season is enough; ease off in a heatwave when roots are stressed. If water sits after a downpour, lighten the mix with perlite instead of blocking the hole with rocks.
      </p>
    `
  },
  {
    slug: "کاشت-ریحان-و-سبزی-در-گلدان",
    lang: "fa",
    title: "کاشت ریحان در گلدان پشت پنجره",
    description: "کاشت ریحان در گلدان به نور زیاد، چیدن از بالای ساقه و خاک زهکش‌دار نیاز دارد. نعنا را جدا بکارید، پنجره شمالی را با لامپ جبران کنید و با هیدروپونیک اشتباه نگیرید.",
    category: "آموزش‌ها",
    categoryEn: "tutorials",
    publishedAt: "۲۶ شهریور ۱۴۰۵",
    readTime: "۱۲ دقیقه",
    author: "علی سبزواری",
    icon: "Leaf",
    gradient: "from-lime-400 to-emerald-500",
    keywords: ["کاشت ریحان در گلدان", "سبزی در آپارتمان", "نعنا در گلدان", "پنجره آشپزخانه", "جالیز"],
    content: `
      <p class="${lead}">
        کاشت ریحان در گلدان پشت پنجره آشپزخانه شدنی است اگر نور کافی باشد. ریحان گیاه روزبلند و گرمادوست است؛ در سایه شمالی دراز، کم‌عطر و مستعد قارچ می‌شود. این آموزش خاک و پنجره است، نه <a href="/blog/راهنمای-هیدروپونیک-به-زبان-ساده">هیدروپونیک</a>.
      </p>
      <h2 class="${h2}">نور: جنوبی یا شرقی، یا لامپ</h2>
      <p class="${p}">
        حداقل چند ساعت نور مستقیم ملایم یا نور خیلی روشن. پنجره شمالی معمولاً کافی نیست مگر با لامپ رشد. تفاوت را در <a href="/blog/راهنمای-نور-گیاهان-آپارتمانی">نور</a> بخوانید. بالکن داغ تابستان ریحان را می‌سوزاند؛ آن سناریو <a href="/blog/گیاهان-مناسب-بالکن">بالکن</a> است.
      </p>
      <h2 class="${h2}">گلدان، خاک و آبیاری سبزی</h2>
      <p class="${p}">
        عمق گلدان برای ریحان حدود ۱۵ تا ۲۰ سانتی‌متر با زهکش. خاک سبک با کمی کمپوست الک‌شده. سطح که خشک شد آب بدهید؛ خاک خیس مداوم ساقه سیاه می‌کند. <a href="/blog/انتخاب-خاک-مناسب-گیاهان-آپارتمانی">خاک</a> و <a href="/blog/راهنمای-آبیاری-گیاهان-آپارتمانی">آبیاری</a>.
      </p>
      <h2 class="${h2}">نعنا و جعفری را قاطی نکنید</h2>
      <p class="${p}">
        نعنا ریشه تهاجمی دارد و ریحان را خفه می‌کند؛ گلدان جدا. جعفری به سرما کمی مقاوم‌تر است و نور کمی کمتر را تحمل می‌کند اما باز هم تاریکی را نه. چیدن برگ از پایین بوته را لخت می‌کند؛ از بالای ساقه بالای گره بزنید تا شاخه شود. منطق هرس شبیه <a href="/blog/راهنمای-هرس-گیاهان-آپارتمانی">هرس</a> است.
      </p>
      <h2 class="${h2}">آفت، کود، سفر</h2>
      <p class="${p}">
        شته عاشق ریحان نرم است: <a href="/blog/آفات-رایج-گیاهان-آپارتمانی">آفات</a>. کود خیلی ضعیف هر دو هفته در رشد. قبل از مسافرت سبزی زود خشک می‌شود؛ <a href="/blog/نگهداری-گیاه-در-مسافرت">مسافرت</a>. در جالیز «سبزی خوراکی» و پنجره را ثبت کنید تا یادآور کوتاه‌تر از سانسوریا باشد.
      </p>
      <h2 class="${h2}">از بذر یا نشا؟</h2>
      <p class="${p}">
        بذر ریحان روی سطح خاک خیلی نازک پوشیده می‌شود و تا جوانه زدن باید مرطوب بماند نه غرقاب. اگر عجله دارید نشای آماده بخرید اما آن را یک‌باره به آفتاب ظهر ندهید. گلدان خیلی بزرگ برای یک بوته جوان خاک خیس اضافه می‌سازد؛ با رشد، یک سایز بزرگ کنید.
      </p>
      <h2 class="${h2}">گل دادن ریحان</h2>
      <p class="${p}">
        وقتی ساقه گل داد برگ تلخ‌تر می‌شود. نوک گل را بچینید تا بوته به برگ برگردد. این کار را در فصل گرم هر هفته تکرار کنید. اگر گیاه چوبی و لخت شد قلمه نرم را در آب ریشه‌دار کنید و بوته پیر را کنار بگذارید.
      </p>
    `
  },
  {
    slug: "growing-herbs-indoors",
    lang: "en",
    title: "Growing Basil in a Windowsill Pot",
    description: "Growing basil indoors needs strong light, pinching above a node, and draining mix. Keep mint in its own pot, boost north windows with a lamp, and do not confuse this with hydroponics.",
    category: "Tutorials",
    categoryEn: "tutorials",
    publishedAt: "September 17, 2026",
    readTime: "12 min",
    author: "Alex Green",
    icon: "Leaf",
    gradient: "from-lime-400 to-emerald-500",
    keywords: ["growing basil indoors", "indoor herbs", "mint in pots", "kitchen window garden", "jaliz"],
    content: `
      <p class="${lead}">
        Growing basil in a kitchen window works if the light is strong. Basil wants warmth and long days; on a north sill it gets leggy, weak-scented, and prone to fungus. This is potting mix on a sill, not <a href="/blog/simple-hydroponics-guide">hydroponics</a>.
      </p>
      <h2 class="${h2}">South or East Light, or a Lamp</h2>
      <p class="${p}">
        Several hours of gentle direct sun or very bright light. North windows rarely suffice without a grow lamp. See the <a href="/blog/houseplant-light-guide">light guide</a>. A scorching summer balcony is the <a href="/blog/balcony-plants-iran">balcony</a> article, not this one.
      </p>
      <h2 class="${h2}">Pot, Mix, Water</h2>
      <p class="${p}">
        About 15–20 cm depth with drainage. Light mix with a little sifted compost. Water when the surface dries; constant wetness blackens stems. <a href="/blog/choosing-houseplant-soil">soil</a> and <a href="/blog/watering-houseplants-guide">watering</a>.
      </p>
      <h2 class="${h2}">Do Not Combine Mint and Basil</h2>
      <p class="${p}">
        Mint is aggressive. Parsley is a bit tougher in cool rooms but still hates darkness. Harvest from the top above a node so the plant branches; the logic matches <a href="/blog/pruning-houseplants-guide">pruning</a>.
      </p>
      <h2 class="${h2}">Pests, Feed, Travel</h2>
      <p class="${p}">
        Aphids love soft basil: <a href="/blog/common-houseplant-pests">pests</a>. Very weak fertilizer every two weeks in growth. Herbs dry fast while you travel: <a href="/blog/watering-plants-while-away">while away</a>. In Jaliz log an edible herb and a bright window so reminders are shorter than for snake plant.
      </p>
      <h2 class="${h2}">Seed or Nursery Start?</h2>
      <p class="${p}">
        Basil seed wants a barely covered surface kept moist, not flooded, until it sprouts. If you are in a hurry, buy a start but do not throw it into midday sun. An oversized pot on a tiny seedling stays wet; size up as it grows.
      </p>
      <h2 class="${h2}">When Basil Flowers</h2>
      <p class="${p}">
        Flowering makes leaves more bitter. Pinch the bloom spike so the plant returns to leaf. Repeat weekly in warm months. If the plant is woody and bare, root a soft cutting in water and retire the old shrub.
      </p>
    `
  },
  {
    slug: "قارچ-سفید-روی-خاک-گلدان",
    lang: "fa",
    title: "قارچ سفید روی خاک گلدان",
    description: "قارچ سفید روی خاک گلدان نشانه رطوبت ماندگار و هوای راکد است، نه لزوماً پشه خاک. لایه سطح را بردارید، آبیاری را کم کنید و بفهمید کی باید کل خاک را عوض کنید.",
    category: "نگهداری",
    categoryEn: "care",
    publishedAt: "۲۷ شهریور ۱۴۰۵",
    readTime: "۱۲ دقیقه",
    author: "سارا گل‌پرور",
    icon: "Bug",
    gradient: "from-stone-400 to-amber-700",
    keywords: ["قارچ سفید روی خاک گلدان", "کپک خاک گلدان", "خاک سفیدک", "پوسیدگی ریشه", "جالیز"],
    content: `
      <p class="${lead}">
        قارچ سفید روی خاک گلدان اغلب کپک ساپروفیت بی‌آزار برای انسان است، اما پیام روشنی دارد: سطح خاک خیلی طول می‌کشد تا خشک شود و تهویه ضعیف است. نادیده گرفتن آن یعنی ریشه در معرض پوسیدگی است.
      </p>
      <h2 class="${h2}">کپک، کود سفید و پشه را جدا کنید</h2>
      <p class="${p}">
        پوسته نمک کود معمولاً سخت و کریستالی است، کپک پنبه‌ای و نرم. پشه خاک حشره پرنده است نه قارچ؛ هر دو عاشق خاک خیس‌اند اما درمان فرق دارد. آفات پرنده در <a href="/blog/آفات-رایج-گیاهان-آپارتمانی">آفات</a>، نمک کود در <a href="/blog/راهنمای-کوددهی-گیاهان-آپارتمانی">کوددهی</a>.
      </p>
      <h2 class="${h2}">چرا ظاهر می‌شود؟</h2>
      <p class="${p}">
        آبیاری زیاد، زیرگلدانی پر آب، گلدان بدون سوراخ، خاک سنگین باغچه، غبارپاشی مداوم و چسباندن گلدان‌ها بدون جریان هوا. رطوبت برگ را با رطوبت خاک قاطی نکنید؛ هوا را از <a href="/blog/راهنمای-رطوبت-گیاهان-آپارتمانی">رطوبت</a> بالا ببرید نه با خیس نگه داشتن سطح.
      </p>
      <h2 class="${h2}">درمان عملی</h2>
      <ul class="${ul}">
        <li>لایه یک سانتی‌متری سطح را دور بریزید (نه در کمپوست خانگی اگر کپک زیاد است).</li>
        <li>آبیاری را کم کنید و از ته گلدان آب اضافه را خالی کنید؛ <a href="/blog/راهنمای-آبیاری-گیاهان-آپارتمانی">آبیاری</a>.</li>
        <li>اگر ریشه سیاه و بو است کل خاک را با مخلوط تازه عوض کنید: <a href="/blog/انتخاب-خاک-مناسب-گیاهان-آپارتمانی">خاک</a> و <a href="/blog/راهنمای-تعویض-گلدان-و-خاک">تعویض گلدان</a>.</li>
        <li>دارچین اثر محدود دارد؛ اصل کار خشکی سطح و جریان هواست.</li>
      </ul>
      <h2 class="${h2}">پیشگیری با گلدان درست</h2>
      <p class="${p}">
        سفال در خانه مرطوب کمک می‌کند سطح زودتر خشک شود: <a href="/blog/انتخاب-گلدان-سفالی-یا-پلاستیکی">گلدان</a>. در جالیز اگر چند بار پشت هم خاک را خیس ثبت کردید، فاصله یادآور را زیاد کنید.
      </p>
      <h2 class="${h2}">آیا کپک به انسان آسیب می‌زند؟</h2>
      <p class="${p}">
        برای بیشتر افراد تماس کوتاه خطر جدی ندارد اما افراد حساس نباید خاک کپک‌زده را بدون ماسک به هم بزنند. گیاه خوراکی مثل ریحان را از سطح کپک‌زده برداشت نکنید تا لایه عوض شود. اگر بوی ماندگی شدید است ریشه را ببینید؛ بوی گندیدگی یعنی پوسیدگی نه فقط کپک سطحی.
      </p>
      <h2 class="${h2}">بعد از درمان چند وقت صبر کنیم؟</h2>
      <p class="${p}">
        یک تا دو هفته سطح را خشک‌تر نگه دارید و فقط وقتی لایه میانی خشک شد آب بدهید. اگر کپک برگشت زهکش مسدود یا عادت غبارپاشی شبانه را چک کنید. شب غبارپاشی رطوبت را تا صبح روی خاک نگه می‌دارد.
      </p>
    `
  },
  {
    slug: "white-mold-on-potting-soil",
    lang: "en",
    title: "White Mold on Potting Soil",
    description: "White mold on potting soil means lasting moisture and still air—not necessarily fungus gnats. Scrape the surface, water less, and learn when the whole mix must be replaced.",
    category: "Care",
    categoryEn: "care",
    publishedAt: "September 18, 2026",
    readTime: "12 min",
    author: "Sarah Flower",
    icon: "Bug",
    gradient: "from-stone-400 to-amber-700",
    keywords: ["white mold on potting soil", "moldy houseplant soil", "soil fungus indoor plants", "root rot mold", "jaliz"],
    content: `
      <p class="${lead}">
        White mold on potting soil is often a harmless saprophyte for people, but it is a clear signal: the surface stays wet too long and air is stagnant. Ignore it and roots are next.
      </p>
      <h2 class="${h2}">Mold vs Salt Crust vs Gnats</h2>
      <p class="${p}">
        Fertilizer crust is hard and crystalline; mold is cottony. Fungus gnats are flying insects, not fungi. Both love wet mix, but treatment differs. Flying pests: <a href="/blog/common-houseplant-pests">pests</a>. Salt crust: <a href="/blog/houseplant-fertilizing-guide">fertilizing</a>.
      </p>
      <h2 class="${h2}">Why It Appears</h2>
      <p class="${p}">
        Overwatering, a full saucer, no drainage holes, heavy garden soil, constant misting, and packed pots with no airflow. Do not confuse leaf humidity with wet soil; raise air humidity via the <a href="/blog/houseplant-humidity-guide">humidity guide</a>, not by keeping the surface soaked.
      </p>
      <h2 class="${h2}">What To Do</h2>
      <ul class="${ul}">
        <li>Scrape off the top centimeter (do not home-compost a heavy bloom).</li>
        <li>Water less and empty saucers: <a href="/blog/watering-houseplants-guide">watering</a>.</li>
        <li>If roots are black and smelly, replace the mix: <a href="/blog/choosing-houseplant-soil">soil</a> and <a href="/blog/how-to-repot-plants">repotting</a>.</li>
        <li>Cinnamon is a weak helper. Dry surface and airflow do the real work.</li>
      </ul>
      <h2 class="${h2}">Prevent With the Right Pot</h2>
      <p class="${p}">
        Terracotta helps the surface dry in a humid room: <a href="/blog/terracotta-vs-plastic-pots">pots</a>. If Jaliz keeps logging wet soil, stretch the reminder interval.
      </p>
      <h2 class="${h2}">Is the Mold a Health Risk?</h2>
      <p class="${p}">
        Brief contact is mild for most people, but sensitive folks should not stir a heavy bloom without a mask. Do not harvest edible herbs from a moldy surface until you replace the top layer. A strong rotten smell is root rot, not just surface mold.
      </p>
      <h2 class="${h2}">How Long Until It Stops Returning?</h2>
      <p class="${p}">
        Keep the surface drier for one to two weeks and water only when the mid-layer is dry. If mold returns, check a blocked hole or nighttime misting that holds moisture until morning.
      </p>
    `
  },
  {
    slug: "انتخاب-گلدان-سفالی-یا-پلاستیکی",
    lang: "fa",
    title: "گلدان سفالی یا پلاستیکی؟",
    description: "گلدان سفالی یا پلاستیکی را بر اساس سرعت خشک شدن خاک انتخاب کنید. سانسوریا سفال می‌خواهد؛ کالاتیا اغلب پلاستیک. سایز، زهکش و کاور بدون سوراخ را اشتباه نگیرید.",
    category: "آموزش‌ها",
    categoryEn: "tutorials",
    publishedAt: "۲۸ شهریور ۱۴۰۵",
    readTime: "۱۲ دقیقه",
    author: "علی سبزواری",
    icon: "BookOpen",
    gradient: "from-amber-500 to-orange-700",
    keywords: ["گلدان سفالی یا پلاستیکی", "انتخاب گلدان گیاه", "گلدان بدون زهکش", "سایز گلدان", "جالیز"],
    content: `
      <p class="${lead}">
        گلدان سفالی یا پلاستیکی را مثل مد روز انتخاب نکنید؛ سرعت خشک شدن خاک را عوض می‌کنند. سفال متخلخل است و آب را از دیواره پس می‌دهد. پلاستیک و سرامیک لعاب‌دار رطوبت را نگه می‌دارند. این مقاله تعویض خاک نیست؛ زمان جابجایی در <a href="/blog/راهنمای-تعویض-گلدان-و-خاک">تعویض گلدان</a> است.
      </p>
      <h2 class="${h2}">کی سفال بخریم؟</h2>
      <p class="${p}">
        سانسوریا، زامیفولیا، کاکتوس و کسانی که همیشه زیاد آب می‌دهند از سفال سود می‌برند. در خانه خیلی خشک یا برای کالاتیا و سرخس، سفال ممکن است هر دو روز تشنه شود. نگهداری گونه را جدا بخوانید: <a href="/blog/نگهداری-سانسوریا">سانسوریا</a>، <a href="/blog/نگهداری-زامیفولیا">زامیفولیا</a>.
      </p>
      <h2 class="${h2}">کی پلاستیک یا لعاب؟</h2>
      <p class="${p}">
        گیاهان رطوبت‌دوست، بالکن بادخیز که سفال در آن ظهر می‌ترکد، و کسانی که سفر می‌روند و نمی‌خواهند خاک در دو روز استخوانی شود. برای سفر باز هم برنامه جدا دارید: <a href="/blog/نگهداری-گیاه-در-مسافرت">مسافرت</a>.
      </p>
      <h2 class="${h2}">زهکش و کاور</h2>
      <p class="${p}">
        گلدان تزئینی بدون سوراخ فقط کاور است. گیاه باید در گلدان سوراخ‌دار داخل آن باشد و آب اضافه خالی شود. سنگ کف به‌جای سوراخ کار نمی‌کند؛ توضیح در <a href="/blog/انتخاب-خاک-مناسب-گیاهان-آپارتمانی">خاک</a>.
      </p>
      <h2 class="${h2}">سایز</h2>
      <p class="${p}">
        دو تا پنج سانتی‌متر قطر بیشتر، نه دو برابر. گلدان خیلی بزرگ یعنی توده خاک خیس و ریشه کم. در جالیز نوع گلدان را ثبت کنید چون روی فاصله آبیاری اثر می‌گذارد؛ منطق آب در <a href="/blog/راهنمای-آبیاری-گیاهان-آپارتمانی">آبیاری</a>.
      </p>
      <h2 class="${h2}">گلدان پارچه‌ای و فلزی</h2>
      <p class="${p}">
        گلدان پارچه‌ای خیلی سریع خشک می‌شود و برای بالکن بادخیز ممکن است هر روز تشنه باشد. فلز تیره در آفتاب خاک را می‌پزد؛ اگر استفاده می‌کنید آن را داخل کاور روشن‌تر بگذارید یا در سایه ببرید. وزن سفال برای حیوان خانگی که گلدان را هل می‌دهد مزیت ایمنی دارد.
      </p>
      <h2 class="${h2}">تعویض فقط به‌خاطر زیبایی</h2>
      <p class="${p}">
        اگر فقط ظاهر کاور را می‌خواهید گیاه را از گلدان پرورشی درنیاورید. درآوردن بی‌دلیل ریشه را پاره می‌کند. وقتی واقعاً ریشه پر شد، همان موقع خاک را هم تازه کنید نه اینکه فقط ظرف بزرگ‌تر با همان خاک مرده پر کنید.
      </p>
    `
  },
  {
    slug: "terracotta-vs-plastic-pots",
    lang: "en",
    title: "Terracotta vs Plastic Pots",
    description: "Choose terracotta vs plastic by how fast you want the mix to dry. Snake plants often like clay; calatheas often like plastic. Do not confuse cachepots, size, and drainage with a soil change.",
    category: "Tutorials",
    categoryEn: "tutorials",
    publishedAt: "September 19, 2026",
    readTime: "12 min",
    author: "Alex Green",
    icon: "BookOpen",
    gradient: "from-amber-500 to-orange-700",
    keywords: ["terracotta vs plastic pots", "best pot for houseplants", "pots without drainage", "pot size plants", "jaliz"],
    content: `
      <p class="${lead}">
        Terracotta versus plastic is about drying speed, not fashion. Clay is porous and loses water through the walls. Plastic and glazed ceramic hold moisture. This is not a repotting calendar; timing lives in <a href="/blog/how-to-repot-plants">repotting</a>.
      </p>
      <h2 class="${h2}">When Terracotta Wins</h2>
      <p class="${p}">
        Snake plant, ZZ, cactus, and chronic overwaterers benefit. In a very dry home, or for calathea and ferns, clay may thirst every other day. Species notes: <a href="/blog/snake-plant-care">snake plant</a>, <a href="/blog/zz-plant-care">ZZ plant</a>.
      </p>
      <h2 class="${h2}">When Plastic or Glaze Wins</h2>
      <p class="${p}">
        Humidity lovers, windy balconies that crack dry clay at noon, and travelers who cannot let mix bone-dry in two days. Travel still needs its own plan: <a href="/blog/watering-plants-while-away">while away</a>.
      </p>
      <h2 class="${h2}">Drainage and Cachepots</h2>
      <p class="${p}">
        A hole-less decorative pot is only a cover. The plant sits in a nursery pot inside it, and extra water must be dumped. Rocks are not a substitute for holes; see <a href="/blog/choosing-houseplant-soil">soil</a>.
      </p>
      <h2 class="${h2}">Size</h2>
      <p class="${p}">
        Two to five centimeters wider, not twice as wide. An oversized pot is a wet soil mass with few roots. Log pot type in Jaliz because it changes watering gaps; water logic is in the <a href="/blog/watering-houseplants-guide">watering guide</a>.
      </p>
      <h2 class="${h2}">Fabric and Metal Pots</h2>
      <p class="${p}">
        Fabric pots dry very fast and may thirst daily on a windy balcony. Dark metal cooks the mix in sun; slip it inside a lighter cachepot or move it to shade. Heavy terracotta is harder for a pet to knock over.
      </p>
      <h2 class="${h2}">Do Not Repot Only for Looks</h2>
      <p class="${p}">
        If you only want a prettier cover, leave the plant in its nursery pot. Yanking it out tears roots. When it is truly rootbound, refresh the mix at the same time—do not drop the old spent soil into a bigger empty pot.
      </p>
    `
  },
  {
    slug: "نگهداری-گیاه-در-مسافرت",
    lang: "fa",
    title: "آبیاری گیاه در مسافرت",
    description: "آبیاری گیاه در مسافرت یعنی برنامه برای سه روز، یک هفته یا بیشتر. قبل از رفتن عمیق آب بدهید، نور تند را کم کنید و از بطری وارونه که گلدان را غرقاب می‌کند بپرهیزید.",
    category: "نگهداری",
    categoryEn: "care",
    publishedAt: "۲۹ شهریور ۱۴۰۵",
    readTime: "۱۲ دقیقه",
    author: "سارا گل‌پرور",
    icon: "Droplets",
    gradient: "from-sky-400 to-indigo-600",
    keywords: ["آبیاری گیاه در مسافرت", "نگهداری گل در سفر", "گلدان خودآبیار", "گیاه هفته تنها", "جالیز"],
    content: `
      <p class="${lead}">
        آبیاری گیاه در مسافرت با کم کردن آب زمستان فرق دارد. زمستان فصل رشد کند است؛ سفر یک وقفه کوتاه در هر فصل است. هدف این است که گلدان نه خشک استخوانی شود نه یک هفته در باتلاق بماند.
      </p>
      <h2 class="${h2}">سفر کوتاه تا یک هفته</h2>
      <p class="${p}">
        یک یا دو روز قبل آبیاری عمیق کنید تا خاک یکنواخت مرطوب شود، نه اینکه صبح حرکت غرقاب کنید. پرده را کمی بکشید تا تبخیر کم شود اما گیاه را در حمام تاریک زندانی نکنید. پتوس و بیشتر برگ‌دارها معمولاً یک هفته را با این روش می‌گذرانند. سانسوریا حتی به آب اضافه قبل از سفر نیاز ندارد اگر خاک هنوز مرطوب است.
      </p>
      <h2 class="${h2}">سفر طولانی‌تر</h2>
      <p class="${p}">
        فتیله پنبه‌ای از ظرف آب به خاک، گلدان خودآبیار با مخزن محدود، یا سپردن کلید به دوست بهتر از بطری وارونه است که گاهی تمام مخزن را یک‌جا خالی می‌کند. بالکن در گرما مخزن را یک روزه تمام می‌کند؛ <a href="/blog/گیاهان-مناسب-بالکن">بالکن</a>. سبزی ریحان زود پژمرده می‌شود؛ <a href="/blog/کاشت-ریحان-و-سبزی-در-گلدان">ریحان</a>.
      </p>
      <h2 class="${h2}">کارهایی که نکنید</h2>
      <ul class="${ul}">
        <li>گذاشتن همه گلدان‌ها در وان پر آب؛ ریشه خفه می‌شود.</li>
        <li>کود دادن «برای ذخیره سفر»؛ نمک می‌ماند و می‌سوزاند: <a href="/blog/راهنمای-کوددهی-گیاهان-آپارتمانی">کود</a>.</li>
        <li>جابجایی ناگهانی به آفتاب برای «جبران نبودن شما».</li>
      </ul>
      <p class="${p}">
        منطق روزمره آب در <a href="/blog/راهنمای-آبیاری-گیاهان-آپارتمانی">آبیاری</a> و فصل سرد در <a href="/blog/مراقبت-زمستانی-گیاهان-آپارتمانی">زمستان</a> است. در جالیز تاریخ برگشت را روی یادآور بگذارید تا روز اول ورود دوباره غرقاب نکنید.
      </p>
      <h2 class="${h2}">سه روز در برابر سه هفته</h2>
      <p class="${p}">
        برای آخر هفته معمولاً فقط پرده و یک آبیاری عمیق کافی است. برای سه هفته بدون کمک انسان، سیستم فتیله را قبل از سفر دو روز آزمایش کنید تا ببینید خاک باتلاقی نشده. اگر فتیله خیلی ضخیم باشد همان مشکل بطری وارونه را می‌سازید.
      </p>
      <h2 class="${h2}">بعد از برگشت</h2>
      <p class="${p}">
        گیاه پژمرده را یک‌باره در آفتاب نگذارید. اول سایه و آبیاری ملایم، بعد از یک روز به جای همیشگی برگردد. برگ‌های زرد سفر را جدا کنید اما اگر همه نرم و بدبو هستند ریشه را بررسی کنید. یادآور جالیز را از روی تقویم سفر عقب نیندازید و به برنامه خاک‌محور برگردید.
      </p>
    `
  },
  {
    slug: "watering-plants-while-away",
    lang: "en",
    title: "Watering Plants While You Travel",
    description: "Watering plants while away means a plan for three days, a week, or longer. Water deeply before you leave, ease harsh light, and skip inverted bottles that dump a flood into the pot.",
    category: "Care",
    categoryEn: "care",
    publishedAt: "September 20, 2026",
    readTime: "12 min",
    author: "Sarah Flower",
    icon: "Droplets",
    gradient: "from-sky-400 to-indigo-600",
    keywords: ["watering plants while away", "vacation plant care", "self watering while traveling", "plants one week alone", "jaliz"],
    content: `
      <p class="${lead}">
        Watering plants while you travel is not the same as winter cutbacks. Winter is a slow season; travel is a short pause any time of year. The pot should not bone-dry or sit in a swamp for a week.
      </p>
      <h2 class="${h2}">Up to One Week</h2>
      <p class="${p}">
        Water deeply a day or two before you leave so moisture is even—not a flood on the morning you go. Draw the curtain to cut evaporation, but do not jail plants in a dark bathroom. Pothos and most foliage plants usually last a week this way. A snake plant may not need extra water if the mix is still moist.
      </p>
      <h2 class="${h2}">Longer Trips</h2>
      <p class="${p}">
        A cotton wick from a reservoir, a limited self-watering insert, or a trusted neighbor beats an inverted bottle that dumps the whole tank at once. A hot balcony empties a reservoir in a day: <a href="/blog/balcony-plants-iran">balcony plants</a>. Basil wilts fast: <a href="/blog/growing-herbs-indoors">herbs</a>.
      </p>
      <h2 class="${h2}">What Not To Do</h2>
      <ul class="${ul}">
        <li>Standing every pot in a bathtub of water—roots suffocate.</li>
        <li>Fertilizing “for the trip”; salts sit and burn: <a href="/blog/houseplant-fertilizing-guide">fertilizing</a>.</li>
        <li>Moving plants into hot sun to “make up for your absence.”</li>
      </ul>
      <p class="${p}">
        Everyday water logic is in the <a href="/blog/watering-houseplants-guide">watering guide</a>; the slow season is <a href="/blog/winter-houseplant-care">winter care</a>. Set your return date on the Jaliz reminder so you do not flood plants the hour you walk in.
      </p>
      <h2 class="${h2}">Three Days Versus Three Weeks</h2>
      <p class="${p}">
        A weekend usually needs only a curtain and one deep watering. For three weeks without a human, test a wick two days before you leave so the mix is not a swamp. A wick that is too thick recreates the inverted-bottle flood.
      </p>
      <h2 class="${h2}">When You Get Back</h2>
      <p class="${p}">
        Do not throw a wilted plant into hot sun. Shade and a gentle drink first, then back to its usual spot after a day. Remove travel-yellowed leaves, but if everything is soft and smelly, check roots. Reset Jaliz to soil-based reminders instead of keeping the vacation pause forever.
      </p>
    `
  },
  {
    slug: "گیاهان-گلدار-آپارتمانی",
    lang: "fa",
    title: "گل آپارتمانی گلدار برای خانه",
    description: "گل آپارتمانی گلدار مثل اسپاتی‌فیلوم، بنفشه آفریقایی و آنتوریوم نور و رطوبت دقیق‌تری از سانسوریا می‌خواهند. بفهمید چرا گل نمی‌دهند و چطور آبیاری تاج را خراب نکنید.",
    category: "معرفی گیاهان",
    categoryEn: "plants",
    publishedAt: "۳۰ شهریور ۱۴۰۵",
    readTime: "۱۲ دقیقه",
    author: "علی سبزواری",
    icon: "Heart",
    gradient: "from-pink-400 to-fuchsia-600",
    keywords: ["گل آپارتمانی گلدار", "اسپاتی فیلوم گل نمی دهد", "بنفشه آفریقایی", "آنتوریوم", "جالیز"],
    content: `
      <p class="${lead}">
        گل آپارتمانی گلدار برای کسی است که نور متوسط روشن و برنامه آبیاری منظم دارد. این‌ها جان‌سخت تازه‌کار مثل فهرست <a href="/blog/گیاهان-آپارتمانی-مقاوم-برای-تازه-کارها">تازه‌کارها</a> نیستند و برای سایه اداره هم جایگزین <a href="/blog/گیاهان-آپارتمانی-نور-کم">نور کم</a> نمی‌شوند.
      </p>
      <h2 class="${h2}">اسپاتی‌فیلوم</h2>
      <p class="${p}">
        خاک را نسبتاً مرطوب نگه دارید نه باتلاق. گل ندادن اغلب نور کم یا کود نیتروژن زیاد است. برگ‌های آویزان بعد از تشنگی با آب برمی‌گردند؛ این را با پوسیدگی قاطی نکنید. سمیت برای حیوان: <a href="/blog/گیاهان-بی-خطر-برای-حیوانات-خانگی">پت‌سیف</a> را بخوانید چون اسپاتی مناسب جویدن نیست.
      </p>
      <h2 class="${h2}">بنفشه آفریقایی</h2>
      <p class="${p}">
        نور روشن غیرمستقیم، آبیاری از ته گلدان تا تاج نپوسد، و پرهیز از غبارپاشی روی برگ مخملی. رطوبت هوا را از <a href="/blog/راهنمای-رطوبت-گیاهان-آپارتمانی">رطوبت</a> تأمین کنید نه از خیس کردن برگ. کپک سطح خاک را جدا درمان کنید: <a href="/blog/قارچ-سفید-روی-خاک-گلدان">کپک خاک</a>.
      </p>
      <h2 class="${h2}">آنتوریوم</h2>
      <p class="${p}">
        نور زیاد فیلترشده و خاک قطعه‌قطعه شبیه آروید. گل‌دهی با نور و تغذیه متعادل می‌آید نه با کود گل‌دهی روی ریشه خفه. اگر برگ زرد شد اول <a href="/blog/علت-زرد-شدن-برگ-گیاهان">زردی</a> و <a href="/blog/راهنمای-آبیاری-گیاهان-آپارتمانی">آبیاری</a>.
      </p>
      <h2 class="${h2}">کود و انتظار واقع‌بینانه</h2>
      <p class="${p}">
        در فصل رشد کود متعادل رقیق؛ نیتروژن زیاد برگ می‌سازد و گل را عقب می‌اندازد. <a href="/blog/راهنمای-کوددهی-گیاهان-آپارتمانی">کوددهی</a>. در جالیز این گیاهان را جدا از سانسوریا با فاصله آبیاری کوتاه‌تر ثبت کنید.
      </p>
      <h2 class="${h2}">گل را بعد از پژمردگی ببریم؟</h2>
      <p class="${p}">
        اسپات قهوه‌ای اسپاتی را از قاعده ساقه گل جدا کنید تا انرژی به برگ برگردد. گل خشک بنفشه را با دست از دمگل بپیچید نه اینکه برگ سالم را بکشید. آنتوریوم اسپات رنگ‌پریده را همین‌طور حذف کنید؛ اسپات سبز لزوماً بیماری نیست و گاهی نور کم است.
      </p>
      <h2 class="${h2}">چرا غنچه می‌ریزد؟</h2>
      <p class="${p}">
        جابجایی ناگهانی، باد کولر و خشکی هوا غنچه را می‌ریزد. بعد از خرید یک هفته گیاه را جابه‌جا نکنید. اگر غنچه می‌آید و قبل از باز شدن می‌افتد رطوبت و ثبات دما را اول چک کنید نه اینکه کود گل‌دهی اضافه کنید.
      </p>
    `
  },
  {
    slug: "flowering-houseplants",
    lang: "en",
    title: "Flowering Houseplants for Indoors",
    description: "Flowering houseplants such as peace lily, African violet, and anthurium need more precise light and moisture than a snake plant. Learn why they will not bloom and how not to rot the crown.",
    category: "Plants",
    categoryEn: "plants",
    publishedAt: "September 21, 2026",
    readTime: "12 min",
    author: "Alex Green",
    icon: "Heart",
    gradient: "from-pink-400 to-fuchsia-600",
    keywords: ["flowering houseplants", "peace lily not blooming", "african violet care", "anthurium indoor", "jaliz"],
    content: `
      <p class="${lead}">
        Flowering houseplants are for people with bright medium light and a steady watering rhythm. They are not the same as <a href="/blog/beginner-houseplants">beginner hardies</a> and they do not replace <a href="/blog/low-light-houseplants">low light office plants</a>.
      </p>
      <h2 class="${h2}">Peace Lily</h2>
      <p class="${p}">
        Keep the mix evenly moist, not swampy. No blooms usually means weak light or too much nitrogen. Dramatic droop from thirst recovers after water; do not confuse it with rot. It is not for chewing pets: <a href="/blog/pet-safe-houseplants">pet-safe plants</a>.
      </p>
      <h2 class="${h2}">African Violet</h2>
      <p class="${p}">
        Bright indirect light, bottom watering so the crown stays dry, and no mist on fuzzy leaves. Raise air humidity with the <a href="/blog/houseplant-humidity-guide">humidity guide</a>, not wet foliage. Treat surface mold separately: <a href="/blog/white-mold-on-potting-soil">white mold</a>.
      </p>
      <h2 class="${h2}">Anthurium</h2>
      <p class="${p}">
        Filtered bright light and a chunky aroid mix. Blooms follow light and balanced feed, not bloom fertilizer on suffocating roots. If leaves yellow, start with <a href="/blog/why-plant-leaves-turn-yellow">yellow leaves</a> and <a href="/blog/watering-houseplants-guide">watering</a>.
      </p>
      <h2 class="${h2}">Feed and Expectations</h2>
      <p class="${p}">
        Dilute balanced fertilizer in the growing season; excess nitrogen makes leaves and delays flowers. See <a href="/blog/houseplant-fertilizing-guide">fertilizing</a>. In Jaliz log these on a shorter watering gap than snake plant.
      </p>
      <h2 class="${h2}">Should You Cut Spent Blooms?</h2>
      <p class="${p}">
        Cut a brown peace-lily spathe at the base of the flower stalk. Twist spent African violet blooms off the pedicel without tearing healthy leaves. Remove a faded anthurium spathe the same way; a green spathe is not always disease—it can be low light.
      </p>
      <h2 class="${h2}">Why Buds Drop</h2>
      <p class="${p}">
        Sudden moves, AC drafts, and dry air drop buds. After you bring a plant home, leave it in one spot for a week. If buds form and fall before opening, fix humidity and temperature before adding bloom fertilizer.
      </p>
    `
  },
]
