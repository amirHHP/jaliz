import type { BlogPost } from "./blogData"

export const newBlogPosts: BlogPost[] = [
  {
    slug: "راهنمای-رطوبت-گیاهان-آپارتمانی",
    lang: "fa",
    title: "رطوبت هوا برای گیاهان آپارتمانی: چطور جنگل گرمسیری را در خانه بسازیم؟",
    description: "بیشتر گیاهان آپارتمانی اهل مناطق گرمسیری هستند و هوای خشک خانه آن‌ها را آزار می‌دهد. در این راهنما یاد می‌گیرید رطوبت را بدون خیس کردن برگ‌ها بالا ببرید.",
    category: "نگهداری",
    categoryEn: "care",
    publishedAt: "۱۱ شهریور ۱۴۰۵",
    readTime: "۶ دقیقه",
    author: "سارا گل‌پرور",
    icon: "Droplets",
    gradient: "from-cyan-400 to-sky-600",
    keywords: ["رطوبت گیاهان آپارتمانی", "غبارپاشی گیاه", "سینی سنگریزه", "رطوبت‌ساز گیاه", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        سیستم گرمایش و سرمایش خانه‌ها هوا را خشک می‌کند، در حالی که بسیاری از گیاهان محبوب آپارتمانی از جنگل‌های گرمسیری آمده‌اند. نوک قهوه‌ای برگ، رشد کند و ریزش غنچه اغلب نشانه کمبود رطوبت است، نه کمبود آب در خاک.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">رطوبت مناسب برای گیاهان خانگی چقدر است؟</h2>
      <p class="text-slate-600 mb-4">
        بیشتر خانه‌ها در زمستان رطوبتی بین ۲۰ تا ۳۰ درصد دارند. گیاهان گرمسیری مثل فیلودندرون، کالاتیا و سرخس معمولاً رطوبت ۴۰ تا ۶۰ درصد را ترجیح می‌دهند. ساکولنت‌ها و کاکتوس‌ها برعکس، هوای خشک را دوست دارند و رطوبت بالا آن‌ها را مستعد پوسیدگی می‌کند.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">روش‌هایی که واقعاً کار می‌کنند</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>دسته‌جمعی کردن گلدان‌ها:</strong> گیاهان با تعرق، اطراف خود را مرطوب می‌کنند. چند گلدان را نزدیک هم بگذارید تا یک میکروکلیمای مرطوب بسازند.</li>
        <li><strong>سینی سنگریزه:</strong> زیرگلدانی را با سنگریزه و کمی آب پر کنید، طوری که ته گلدان داخل آب نباشد. تبخیر آرام، رطوبت موضعی ایجاد می‌کند.</li>
        <li><strong>رطوبت‌ساز سرد:</strong> مؤثرترین راه برای اتاق‌های خشک. دستگاه را نزدیک گیاهان بگذارید، نه روی برگ‌ها، و هر چند روز مخزن را بشویید تا باکتری جمع نشود.</li>
        <li><strong>حمام و آشپزخانه:</strong> گیاهانی که عاشق رطوبت هستند، کنار پنجره این فضاها اغلب شاداب‌تر می‌مانند.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">غبارپاشی کافی است؟</h2>
      <p class="text-slate-600 mb-4">
        اسپری کردن برگ‌ها رطوبت هوا را فقط چند دقیقه بالا می‌برد و بعد تبخیر می‌شود. برای گیاهانی با برگ مخملی یا شیاردار (مثل بنفشه آفریقایی) غبارپاشی حتی می‌تواند لکه و قارچ ایجاد کند. اگر غبارپاشی می‌کنید، صبح و با آب بدون املاح این کار را انجام دهید.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">نشانه‌های رطوبت بیش از حد</h2>
      <p class="text-slate-600 mb-4">
        هوای خیلی مرطوب همراه با تهویه ضعیف، زمینه رشد کپک روی خاک و بیماری‌های قارچی برگ را فراهم می‌کند. اگر روی خاک کپک سفید دیدید یا برگ‌ها لکه‌های نرم قهوه‌ای گرفتند، فاصله گلدان‌ها را بیشتر کنید و جریان هوا را بهبود دهید.
      </p>
    `
  },
  {
    slug: "houseplant-humidity-guide",
    lang: "en",
    title: "Houseplant Humidity: How to Recreate a Tropical Climate Indoors",
    description: "Most houseplants come from humid forests, but indoor air is dry. Learn practical ways to raise humidity without soaking the leaves.",
    category: "Care",
    categoryEn: "care",
    publishedAt: "September 2, 2026",
    readTime: "6 min",
    author: "Sarah Flower",
    icon: "Droplets",
    gradient: "from-cyan-400 to-sky-600",
    keywords: ["houseplant humidity", "plant humidifier", "pebble tray", "misting plants", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        Heating and air conditioning dry out indoor air, while many popular houseplants evolved in tropical forests. Brown leaf tips, stalled growth, and dropped buds are often a humidity problem—not a watering one.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">How Much Humidity Do Houseplants Need?</h2>
      <p class="text-slate-600 mb-4">
        Most homes sit at 20–30% humidity in winter. Tropical plants such as philodendrons, calatheas, and ferns prefer 40–60%. Succulents and cacti prefer dry air; extra humidity can encourage rot.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Methods That Actually Work</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>Group plants together:</strong> Transpiration creates a humid microclimate. Cluster pots so they share moisture.</li>
        <li><strong>Pebble trays:</strong> Fill a saucer with pebbles and a little water, keeping the pot above the waterline. Slow evaporation raises local humidity.</li>
        <li><strong>Cool-mist humidifier:</strong> The most reliable option for dry rooms. Place it near plants, not blasting the foliage, and rinse the tank regularly.</li>
        <li><strong>Bathrooms and kitchens:</strong> Humidity-loving plants often thrive near bright windows in these rooms.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Is Misting Enough?</h2>
      <p class="text-slate-600 mb-4">
        Spraying leaves raises humidity for only a few minutes. On fuzzy or grooved leaves (like African violets), misting can leave spots or invite fungus. If you mist, do it in the morning with mineral-free water.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Signs of Too Much Humidity</h2>
      <p class="text-slate-600 mb-4">
        Very humid air plus poor airflow encourages mold on soil and fungal leaf spots. If you see white mold or soft brown patches, space plants farther apart and improve ventilation.
      </p>
    `
  },
  {
    slug: "راهنمای-کوددهی-گیاهان-آپارتمانی",
    lang: "fa",
    title: "راهنمای کوددهی گیاهان آپارتمانی: کی، چقدر و چه نوع کودی بدهیم؟",
    description: "خاک گلدان مواد مغذی محدودی دارد. در این مطلب یاد می‌گیرید فصل رشد را بشناسید، کود را رقیق کنید و از سوختگی ریشه جلوگیری کنید.",
    category: "نگهداری",
    categoryEn: "care",
    publishedAt: "۱۲ شهریور ۱۴۰۵",
    readTime: "۶ دقیقه",
    author: "علی سبزواری",
    icon: "Sparkles",
    gradient: "from-lime-400 to-emerald-600",
    keywords: ["کود گیاهان آپارتمانی", "کوددهی گلدان", "سوختگی کود", "NPK گیاه", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        گیاه در طبیعت ریشه می‌دواند و مواد غذایی تازه پیدا می‌کند؛ در گلدان این چرخه قطع می‌شود. کود جایگزین خاک جنگل نیست، اما در فصل رشد تفاوت چشمگیری در برگ‌های جدید، رنگ و استحکام ساقه ایجاد می‌کند.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">فصل رشد را با تقویم اشتباه نگیرید</h2>
      <p class="text-slate-600 mb-4">
        بیشتر گیاهان آپارتمانی از اوایل بهار تا اواخر تابستان فعال‌اند. نشانه آماده بودن برای کود، برگ یا ساقه جدید است نه تاریخ روی تقویم. در پاییز و زمستان، وقتی رشد متوقف شده، کود دادن نمک در خاک جمع می‌کند و ریشه را می‌سوزاند.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">NPK به زبان ساده</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>نیتروژن (N):</strong> رشد برگ و رنگ سبز. کود متعادل یا کمی نیتروژن‌دار برای گیاهان برگ‌دار مناسب است.</li>
        <li><strong>فسفر (P):</strong> ریشه و گل. برای گیاهان گل‌دهنده در دوره غنچه‌دهی مفید است.</li>
        <li><strong>پتاسیم (K):</strong> مقاومت کلی و سلامت بافت‌ها.</li>
      </ul>
      <p class="text-slate-600 mb-4">
        برای بیشتر آپارتمانی‌ها یک کود مایع متعادل (مثلاً ۱۰-۱۰-۱۰ یا ۲۰-۲۰-۲۰ رقیق‌شده) کافی است. ساکولنت‌ها کود خیلی رقیق و کم‌تعداد می‌خواهند.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">قانون نصف دوز</h2>
      <p class="text-slate-600 mb-4">
        دستور روی بسته معمولاً برای گیاهان فضای باز نوشته شده است. برای گلدان، نصف غلظت پیشنهادی را هر دو تا چهار هفته در فصل رشد استفاده کنید. کود را هرگز روی خاک خشک نریزید؛ اول کمی آب بدهید تا ریشه نسوزد.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">علائم زیاده‌روی در کود</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li>نوک و لبه برگ سوخته و قهوه‌ای، در حالی که خاک مرطوب است</li>
        <li>پوسته سفید روی سطح خاک یا لبه گلدان</li>
        <li>رشد سریع اما ضعیف و دراز</li>
      </ul>
      <p class="text-slate-600 mb-4">
        اگر این نشانه‌ها را دیدید، کود را قطع کنید و خاک را چند بار با آب فراوان آبشویی کنید تا نمک‌ها از زهکش خارج شوند.
      </p>
    `
  },
  {
    slug: "houseplant-fertilizing-guide",
    lang: "en",
    title: "Houseplant Fertilizing Guide: When, How Much, and Which Type",
    description: "Potting mix only holds so many nutrients. Learn how to spot the growing season, dilute fertilizer, and avoid burning roots.",
    category: "Care",
    categoryEn: "care",
    publishedAt: "September 3, 2026",
    readTime: "6 min",
    author: "Alex Green",
    icon: "Sparkles",
    gradient: "from-lime-400 to-emerald-600",
    keywords: ["houseplant fertilizer", "when to fertilize plants", "fertilizer burn", "NPK plants", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        In nature, roots keep finding fresh nutrients. In a pot, that cycle stops. Fertilizer is not a substitute for good soil, but during active growth it makes a clear difference in new leaves, color, and stem strength.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Don't Confuse the Calendar With Growth</h2>
      <p class="text-slate-600 mb-4">
        Most houseplants grow from early spring through late summer. New leaves or stems are the real signal to feed—not the date. In fall and winter, unused fertilizer salts build up and burn roots.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">NPK in Plain Language</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>Nitrogen (N):</strong> Leaf growth and green color. A balanced or slightly nitrogen-forward feed suits foliage plants.</li>
        <li><strong>Phosphorus (P):</strong> Roots and flowers. Helpful for bloomers as buds form.</li>
        <li><strong>Potassium (K):</strong> Overall toughness and tissue health.</li>
      </ul>
      <p class="text-slate-600 mb-4">
        For most houseplants, a balanced liquid fertilizer (such as 10-10-10 or a diluted 20-20-20) is enough. Succulents want a very weak dose, used sparingly.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">The Half-Strength Rule</h2>
      <p class="text-slate-600 mb-4">
        Package rates are often written for outdoor plants. In pots, use half the recommended strength every two to four weeks in the growing season. Never fertilize bone-dry soil; water lightly first so roots don't burn.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Signs You Overdid It</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li>Crispy brown tips and edges even though the soil is moist</li>
        <li>A white crust on the soil surface or pot rim</li>
        <li>Fast, weak, leggy growth</li>
      </ul>
      <p class="text-slate-600 mb-4">
        Stop feeding and flush the pot thoroughly so excess salts drain out.
      </p>
    `
  },
  {
    slug: "راهنمای-نور-گیاهان-آپارتمانی",
    lang: "fa",
    title: "نور گیاهان آپارتمانی را اشتباه نخوانید: راهنمای پنجره، فاصله و سایه",
    description: "نور کم پشت پرده با نور زیاد غیرمستقیم فرق دارد. در این مقاله جهت پنجره، فاصله گلدان و نشانه‌های نور زیاد یا کم را ساده توضیح می‌دهیم.",
    category: "نگهداری",
    categoryEn: "care",
    publishedAt: "۱۳ شهریور ۱۴۰۵",
    readTime: "۷ دقیقه",
    author: "سارا گل‌پرور",
    icon: "Sun",
    gradient: "from-yellow-400 to-orange-500",
    keywords: ["نور گیاهان آپارتمانی", "پنجره جنوبی", "نور غیرمستقیم", "رشد دراز گیاه", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        گیاه می‌تواند کم‌آبی را چند روز تحمل کند، اما بدون نور مناسب فتوسنتز متوقف می‌شود. بیشتر مشکلات «بی‌حال بودن» گیاه در خانه‌های ایرانی به فاصله زیاد از پنجره یا پرده ضخیم برمی‌گردد، نه به کود.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">جهت پنجره در نیمکره شمالی</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>جنوبی:</strong> پرنورترین حالت. پشت پرده توری برای اکثر گیاهان برگ‌دار ایده‌آل است. کاکتوس و ساکولنت می‌توانند نور مستقیم صبح تا ظهر را تحمل کنند.</li>
        <li><strong>شرقی:</strong> نور ملایم صبح. برای پتوس، فیلودندرون و بیشتر گیاهان سایه‌دوست عالی است.</li>
        <li><strong>غربی:</strong> آفتاب داغ بعدازظهر. فاصله را بیشتر کنید یا پرده بکشید تا برگ نسوزد.</li>
        <li><strong>شمالی:</strong> کم‌نورترین. فقط گیاهان بسیار مقاوم مثل سانسوریا، زامیفولیا و برگ عبایی اینجا دوام می‌آورند.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">نور غیرمستقیم یعنی چه؟</h2>
      <p class="text-slate-600 mb-4">
        نور روشن غیرمستقیم یعنی گیاه سایه خودش را روی زمین می‌اندازد، اما پرتو مستقیم خورشید ساعت‌ها روی برگ نمی‌ماند. یک یا دو متر فاصله از پنجره جنوبی، یا پنجره شرقی بدون مانع، معمولاً این شرایط را می‌سازد. گوشه اتاق که فقط روشن به نظر می‌رسد، برای گیاه نور کم محسوب می‌شود.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">نشانه‌های نور کم و نور زیاد</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>نور کم:</strong> فاصله زیاد میان برگ‌ها، ساقه نازک و متمایل به پنجره، برگ‌های جدید کوچک‌تر و رنگ‌پریده.</li>
        <li><strong>نور زیاد:</strong> لکه‌های خشک زرد یا سفید روی برگ، جمع شدن حاشیه برگ، خاکی که خیلی سریع خشک می‌شود.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">اگر پنجره کم دارید</h2>
      <p class="text-slate-600 mb-4">
        لامپ رشد با نور سفید کامل (حدود ۶۵۰۰ کلوین) را ۱۵ تا ۳۰ سانتی‌متر بالای گیاه، روزانه ۱۰ تا ۱۲ ساعت روشن کنید. لامپ معمولی اتاق جایگزین نور رشد نیست. گیاه را هر چند هفته کمی بچرخانید تا یک‌طرفه رشد نکند.
      </p>
    `
  },
  {
    slug: "houseplant-light-guide",
    lang: "en",
    title: "Stop Misreading Houseplant Light: Windows, Distance, and Shade",
    description: "Dim light behind a curtain is not the same as bright indirect light. Learn window direction, pot distance, and the signs of too much or too little sun.",
    category: "Care",
    categoryEn: "care",
    publishedAt: "September 4, 2026",
    readTime: "7 min",
    author: "Sarah Flower",
    icon: "Sun",
    gradient: "from-yellow-400 to-orange-500",
    keywords: ["houseplant light", "south window plants", "bright indirect light", "leggy plant growth", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        A plant can wait a few days for water, but without enough light photosynthesis stalls. Many “tired” houseplants are simply too far from a window or hidden behind heavy curtains—not underfed.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Window Direction in the Northern Hemisphere</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>South:</strong> Brightest. Sheer-curtained south light suits most foliage plants. Cacti and succulents can take direct morning-to-midday sun.</li>
        <li><strong>East:</strong> Gentle morning light. Ideal for pothos, philodendron, and many shade-tolerant plants.</li>
        <li><strong>West:</strong> Hot afternoon sun. Increase distance or use a curtain to prevent scorch.</li>
        <li><strong>North:</strong> Lowest light. Only tough plants like snake plant, ZZ plant, and cast iron plant usually last here.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">What “Bright Indirect” Actually Means</h2>
      <p class="text-slate-600 mb-4">
        Bright indirect light means the plant casts a soft shadow, but harsh sun does not sit on the leaves for hours. One to two meters from a south window, or an unobstructed east window, often fits. A “bright-looking” room corner is still low light for most plants.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Signs of Too Little or Too Much Light</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>Too little:</strong> Long gaps between leaves, thin stems leaning toward the window, smaller paler new growth.</li>
        <li><strong>Too much:</strong> Dry yellow or white patches, curled edges, soil that dries unusually fast.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">If You Have Few Windows</h2>
      <p class="text-slate-600 mb-4">
        Use a full-spectrum grow light (around 6500K) 15–30 cm above the plant for 10–12 hours a day. Regular room bulbs are not a substitute. Rotate the pot every few weeks so it does not grow lopsided.
      </p>
    `
  },
  {
    slug: "آفات-رایج-گیاهان-آپارتمانی",
    lang: "fa",
    title: "آفات رایج گیاهان آپارتمانی: شناسایی و درمان کنه، شپشک و پشه خاک",
    description: "لکه‌های چسبناک، تارهای ریز یا پشه‌های سیاه اطراف گلدان را جدی بگیرید. این راهنما کمک می‌کند آفت را تشخیص دهید و بدون سم قوی کنترل کنید.",
    category: "نگهداری",
    categoryEn: "care",
    publishedAt: "۱۴ شهریور ۱۴۰۵",
    readTime: "۷ دقیقه",
    author: "علی سبزواری",
    icon: "Bug",
    gradient: "from-rose-400 to-red-600",
    keywords: ["آفات گیاهان آپارتمانی", "کنه تارعنکبوتی", "شپشک آردآلود", "پشه خاک گلدان", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        آفات آپارتمانی معمولاً با گیاه جدید، خاک آلوده یا پنجره باز وارد خانه می‌شوند. هرچه زودتر جداسازی و درمان را شروع کنید، نجات گیاه ساده‌تر است. هفته‌ای یک‌بار پشت برگ‌ها را با نور کافی نگاه کنید.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">کنه تارعنکبوتی</h2>
      <p class="text-slate-600 mb-4">
        نقاط ریز زرد روی برگ، تارهای ظریف بین دمبرگ و خشکی هوا سه نشانه کلاسیک هستند. کنه در محیط خشک سریع تکثیر می‌شود. برگ‌ها را با پارچه مرطوب پاک کنید، رطوبت را بالا ببرید و در صورت شدت گرفتن، از صابون حشره‌کش یا روغن نیم طبق دستور استفاده کنید. درمان را چند نوبت تکرار کنید چون تخم‌ها باقی می‌مانند.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">شپشک آردآلود و شپشک سپردار</h2>
      <p class="text-slate-600 mb-4">
        توده‌های سفید پنبه‌ای در محل اتصال برگ، شپشک آردآلود است. برآمدگی‌های قهوه‌ای سخت روی ساقه معمولاً شپشک سپردار هستند. با گوش‌پاک‌کن آغشته به الکل محل را پاک کنید، سپس کل گیاه را با آب و صابون ملایم بشویید. گیاه را از بقیه جدا نگه دارید تا گسترش پیدا نکند.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">پشه خاک (Fungus gnat)</h2>
      <p class="text-slate-600 mb-4">
        پشه‌های ریز سیاه که هنگام آبیاری از سطح خاک پرواز می‌کنند، عاشق خاک دائماً خیس هستند. لایه رویی خاک را خشک نگه دارید، زهکشی را اصلاح کنید و در صورت نیاز یک لایه ماسه یا پرلیت روی سطح بریزید. کارت زرد چسبناک حشرات بالغ را کم می‌کند، اما خشک‌تر کردن خاک لاروها را از بین می‌برد.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">قوانین قرنطینه</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li>گیاه تازه خریده‌شده را دو هفته جدا از بقیه نگه دارید.</li>
        <li>قیچی و دست‌ها را بین گلدان‌ها بشویید.</li>
        <li>برگ‌های به‌شدت آلوده را حذف کنید؛ کمپوست خانگی جای مناسبی برای آن‌ها نیست.</li>
      </ul>
    `
  },
  {
    slug: "common-houseplant-pests",
    lang: "en",
    title: "Common Houseplant Pests: How to Spot and Treat Mites, Mealybugs, and Fungus Gnats",
    description: "Sticky spots, fine webbing, or tiny black flies around the pot are warning signs. Learn to identify pests and control them without harsh chemicals.",
    category: "Care",
    categoryEn: "care",
    publishedAt: "September 5, 2026",
    readTime: "7 min",
    author: "Alex Green",
    icon: "Bug",
    gradient: "from-rose-400 to-red-600",
    keywords: ["houseplant pests", "spider mites", "mealybugs", "fungus gnats", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        Indoor pests usually arrive on a new plant, in infested soil, or through an open window. The sooner you isolate and treat, the easier the rescue. Check the undersides of leaves weekly in good light.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Spider Mites</h2>
      <p class="text-slate-600 mb-4">
        Fine yellow stippling, tiny webbing between stems, and dry air are classic clues. Mites explode in dry rooms. Wipe leaves with a damp cloth, raise humidity, and if needed use insecticidal soap or neem oil as directed. Repeat treatments because eggs survive the first pass.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Mealybugs and Scale</h2>
      <p class="text-slate-600 mb-4">
        White cottony clumps at leaf joints are mealybugs. Hard brown bumps on stems are usually scale. Dab with a cotton swab dipped in rubbing alcohol, then wash the plant with mild soapy water. Keep it quarantined until the infestation is gone.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Fungus Gnats</h2>
      <p class="text-slate-600 mb-4">
        Tiny black flies that rise from the soil when you water love constantly wet mix. Let the top layer dry, fix drainage, and optionally top-dress with sand or perlite. Yellow sticky cards catch adults, but drier soil is what kills larvae.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Quarantine Rules</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li>Keep new plants away from the rest of the collection for two weeks.</li>
        <li>Wash tools and hands between pots.</li>
        <li>Remove heavily infested leaves; don’t toss them into a home compost pile.</li>
      </ul>
    `
  },
  {
    slug: "گیاهان-بی-خطر-برای-حیوانات-خانگی",
    lang: "fa",
    title: "گیاهان آپارتمانی بی‌خطر برای گربه و سگ: انتخاب سبز بدون نگرانی",
    description: "خیلی از گیاهان محبوب برای حیوان خانگی سمی هستند. این فهرست گیاهانی را معرفی می‌کند که نگهداری‌شان در خانهٔ پر از پنجه و پوزه امن‌تر است.",
    category: "معرفی گیاهان",
    categoryEn: "plants",
    publishedAt: "۱۵ شهریور ۱۴۰۵",
    readTime: "۵ دقیقه",
    author: "سارا گل‌پرور",
    icon: "Heart",
    gradient: "from-pink-400 to-rose-500",
    keywords: ["گیاهان سمی برای گربه", "گیاهان امن سگ", "پت سیف هاوس پلنت", "کالاتیا", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        گربه و سگ برگ را می‌جوند؛ بعضی گیاهان فقط معده را ناراحت می‌کنند و بعضی مثل سانسوریا، پتوس، فیلودندرون و آلوئه‌ورا برایشان سمی محسوب می‌شوند. اگر حیوان کنجکاو دارید، بهتر است از ابتدا گیاه امن بخرید تا اینکه گلدان را روی کمد پنهان کنید.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">پنج انتخاب امن و زیبا</h2>
      <ol class="list-decimal list-inside space-y-3 text-slate-600 mb-6 ps-4">
        <li><strong>گندمی (Spider plant):</strong> غیرسمی، مقاوم و سریع‌الرشد. گربه‌ها گاهی برگ‌های باریکش را دوست دارند؛ جویدن زیاد یعنی گلدان را بالاتر بگذارید.</li>
        <li><strong>کالاتیا و مارانتا:</strong> برگ‌های نقش‌دار، غیرسمی. رطوبت و نور غیرمستقیم می‌خواهند.</li>
        <li><strong>نخل اریکا و نخل شامادورا:</strong> ظاهر گرمسیری بدون سمیت شناخته‌شده برای سگ و گربه. نور متوسط تا زیاد غیرمستقیم مناسب است.</li>
        <li><strong>سرخس لانه پرنده و سرخس بوستون:</strong> غیرسمی. خاک را نسبتاً مرطوب نگه دارید و از نور مستقیم داغ دور کنید.</li>
        <li><strong>پیله‌آ و برخی پپرومیاها:</strong> گزینه‌های جمع‌وجور برای میز و طاقچه. گونه را هنگام خرید با نام علمی چک کنید.</li>
      </ol>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">گیاهانی که بهتر است کنار نگذارید</h2>
      <p class="text-slate-600 mb-4">
        سانسوریا، زامیفولیا، پتوس، فیلودندرون، دیفن باخیا، لیلی صلح، آلوئه‌ورا و بیشتر گیاهان خانواده شیپوری برای گربه یا سگ مشکل‌سازند. اگر همین‌ها را دارید، روی شلف بلند، در اتاق بسته یا داخل تراریوم غیرقابل دسترس بگذارید.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">اگر حیوان برگ خورد چه کنید؟</h2>
      <p class="text-slate-600 mb-4">
        نام دقیق گیاه را یادداشت کنید و با دامپزشک تماس بگیرید. استفراغ خودسرانه توصیه نمی‌شود. حتی گیاه «غیرسمی» اگر به مقدار زیاد خورده شود می‌تواند ناراحتی گوارشی بدهد.
      </p>
    `
  },
  {
    slug: "pet-safe-houseplants",
    lang: "en",
    title: "Pet-Safe Houseplants for Cats and Dogs: Green Without the Worry",
    description: "Many popular houseplants are toxic to pets. This guide highlights safer choices for homes full of paws and curious noses.",
    category: "Plants",
    categoryEn: "plants",
    publishedAt: "September 6, 2026",
    readTime: "5 min",
    author: "Sarah Flower",
    icon: "Heart",
    gradient: "from-pink-400 to-rose-500",
    keywords: ["pet safe houseplants", "plants toxic to cats", "dog friendly plants", "calathea", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        Cats and dogs chew leaves. Some plants only upset the stomach; others—including snake plant, pothos, philodendron, and aloe—are considered toxic. If you have a curious pet, it is easier to start with safer species than to hide every pot on a high shelf.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Five Attractive, Safer Choices</h2>
      <ol class="list-decimal list-inside space-y-3 text-slate-600 mb-6 ps-4">
        <li><strong>Spider plant:</strong> Non-toxic, tough, and fast-growing. Cats often love the grassy leaves; move it higher if chewing is constant.</li>
        <li><strong>Calathea and prayer plant (Maranta):</strong> Patterned foliage and generally non-toxic. They want humidity and indirect light.</li>
        <li><strong>Areca and parlor palms:</strong> A tropical look without known toxicity to cats and dogs. Give them medium to bright indirect light.</li>
        <li><strong>Bird’s nest and Boston ferns:</strong> Non-toxic. Keep the mix evenly moist and out of hot direct sun.</li>
        <li><strong>Pilea and many peperomias:</strong> Compact options for desks and sills. Confirm the species by scientific name when you buy.</li>
      </ol>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Popular Plants to Keep Out of Reach</h2>
      <p class="text-slate-600 mb-4">
        Snake plant, ZZ plant, pothos, philodendron, dieffenbachia, peace lily, aloe, and most aroids can cause problems for cats or dogs. If you already own them, use high shelves, a closed room, or an inaccessible cabinet greenhouse.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">If a Pet Eats a Leaf</h2>
      <p class="text-slate-600 mb-4">
        Write down the exact plant name and call your veterinarian. Do not induce vomiting unless a professional tells you to. Even “non-toxic” plants can cause stomach upset if a lot is eaten.
      </p>
    `
  },
  {
    slug: "مراقبت-زمستانی-گیاهان-آپارتمانی",
    lang: "fa",
    title: "مراقبت زمستانی از گیاهان آپارتمانی: آبیاری، نور و شوک سرما",
    description: "در زمستان رشد کند می‌شود، خاک دیرتر خشک می‌شود و پنجره‌های سرد برگ را می‌سوزانند. این چک‌لیست کمک می‌کند گیاهانتان سالم از فصل سرد عبور کنند.",
    category: "نگهداری",
    categoryEn: "care",
    publishedAt: "۱۶ شهریور ۱۴۰۵",
    readTime: "۶ دقیقه",
    author: "علی سبزواری",
    icon: "Snowflake",
    gradient: "from-slate-400 to-indigo-500",
    keywords: ["مراقبت زمستانی گیاه", "آبیاری زمستان", "شوک سرما گلدان", "رطوبت بخاری", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        زمستان برای گیاهان آپارتمانی فصل استراحت است، نه فصل رشد. روزها کوتاه‌تر است، تبخیر کمتر می‌شود و بخاری هوا را خشک می‌کند. اگر همان برنامه تابستانی آبیاری را ادامه دهید، ریشه به‌راحتی می‌پوسد.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">آبیاری را کم کنید، حذف نکنید</h2>
      <p class="text-slate-600 mb-4">
        فاصله آبیاری را بیشتر کنید و همیشه خاک را لمس کنید. بسیاری از گیاهان در زمستان به نصف دفعات تابستان نیاز دارند. آب باید ولرم باشد؛ آب یخ‌زده شوک می‌دهد. زیرگلدانی را خالی نگه دارید، چون تبخیر کند است و آب راکد می‌ماند.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">گلدان را از شیشه سرد و بخاری دور کنید</h2>
      <p class="text-slate-600 mb-4">
        برگ چسبیده به شیشه پنجره در شب‌های یخبندان می‌سوزد. چند سانتی‌متر فاصله بگذارید. جریان مستقیم شوفاژ، بخاری و کولر گازی برگ را خشک و لبه آن را قهوه‌ای می‌کند. گیاه را بین منبع گرما و پنجره سرد قرار ندهید.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">نور زمستان را جدی بگیرید</h2>
      <p class="text-slate-600 mb-4">
        خورشید پایین‌تر است و پرده‌ها اغلب کشیده می‌مانند. گلدان‌ها را نزدیک‌ترین نقطه امن به پنجره ببرید. گرد و غبار برگ را پاک کنید تا نور بهتری جذب شود. کود را تا دیدن رشد بهاری قطع کنید.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">تعویض گلدان را به بهار بسپارید</h2>
      <p class="text-slate-600 mb-4">
        ریشه‌ها در سرما کند ترمیم می‌شوند. مگر اینکه گیاه کاملاً غرقاب یا بیمار باشد، تعویض خاک و گلدان را برای اوایل بهار نگه دارید. اگر مجبور شدید، بعد از جابجایی گیاه را از نور مستقیم و باد دور نگه دارید.
      </p>
    `
  },
  {
    slug: "winter-houseplant-care",
    lang: "en",
    title: "Winter Houseplant Care: Watering, Light, and Cold Drafts",
    description: "Growth slows in winter, soil stays wet longer, and cold glass can scorch leaves. Use this checklist to carry your plants through the cold season.",
    category: "Care",
    categoryEn: "care",
    publishedAt: "September 7, 2026",
    readTime: "6 min",
    author: "Alex Green",
    icon: "Snowflake",
    gradient: "from-slate-400 to-indigo-500",
    keywords: ["winter houseplant care", "winter watering plants", "cold draft plants", "heater humidity", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        Winter is a rest season for houseplants, not a growth season. Days are shorter, evaporation slows, and heaters dry the air. Keep the summer watering schedule and roots rot easily.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Water Less, Don’t Stop Entirely</h2>
      <p class="text-slate-600 mb-4">
        Stretch the time between waterings and always check the soil. Many plants need about half as many drinks as in summer. Use lukewarm water; icy water shocks roots. Empty saucers—water sits longer in winter.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Keep Pots Off Cold Glass and Away From Heaters</h2>
      <p class="text-slate-600 mb-4">
        Leaves pressed against a freezing windowpane can scorch overnight. Leave a few centimeters of space. Direct heat from radiators and vents browns leaf edges. Don’t sandwich a plant between a heater and a cold window.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Take Winter Light Seriously</h2>
      <p class="text-slate-600 mb-4">
        The sun sits lower and curtains often stay closed. Move pots to the safest closest spot by a window. Dust the leaves so they can catch more light. Pause fertilizer until you see spring growth.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Save Repotting for Spring</h2>
      <p class="text-slate-600 mb-4">
        Roots repair slowly in the cold. Unless the plant is waterlogged or diseased, wait until early spring to change soil or pots. If you must repot, keep the plant out of harsh light and drafts afterward.
      </p>
    `
  },
  {
    slug: "انتخاب-خاک-مناسب-گیاهان-آپارتمانی",
    lang: "fa",
    title: "خاک مناسب گیاهان آپارتمانی: ترکیب سبک، زهکش و اشتباه خاک باغچه",
    description: "خاک سنگین باغچه ریشه را خفه می‌کند. یاد می‌گیرید برای گیاهان برگ‌دار، ساکولنت و گیاهان رطوبت‌دوست چه مخلوطی بسازید.",
    category: "آموزش‌ها",
    categoryEn: "tutorials",
    publishedAt: "۱۷ شهریور ۱۴۰۵",
    readTime: "۶ دقیقه",
    author: "سارا گل‌پرور",
    icon: "BookOpen",
    gradient: "from-amber-500 to-stone-600",
    keywords: ["خاک گیاهان آپارتمانی", "مخلوط خاک گلدان", "پرلیت", "کوکوپیت", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        ریشه به هوا به اندازه آب نیاز دارد. خاک باغچه در گلدان فشرده می‌شود، زهکشی را می‌بندد و آفات خاک‌زی را وارد خانه می‌کند. یک مخلوط سبک و متخلخل، بیشتر از کود گران‌قیمت به گیاه کمک می‌کند.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">سه جزء اصلی یک خاک خوب</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>ماده نگهدارنده رطوبت:</strong> پیت‌ماس یا کوکوپیت آب را نگه می‌دارد. کوکوپیت پایدارتر است و کمتر اسیدی می‌شود.</li>
        <li><strong>ماده هواده:</strong> پرلیت، پوکه یا پوست درخت کاج جلوی فشرده شدن را می‌گیرد و اکسیژن به ریشه می‌رساند.</li>
        <li><strong>ماده مغذی ملایم:</strong> مقدار کمی کمپوست الک‌شده یا ورمی‌کمپوست، نه کود تازه دامی.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">دستورهای ساده خانگی</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>گیاهان برگ‌دار معمولی:</strong> دو پیمانه خاک آماده گلدان + یک پیمانه پرلیت + یک پیمانه کوکوپیت.</li>
        <li><strong>ساکولنت و کاکتوس:</strong> یک پیمانه خاک گلدان + یک پیمانه پرلیت یا شن درشت + کمی پوکه. باید خیلی سریع خشک شود.</li>
        <li><strong>آرویدها (پتوس، مونسترا، فیلودندرون):</strong> خاک گلدان + پرلیت + پوست درخت یا کوکو چیپس به نسبت تقریباً مساوی تا ریشه هوایی راحت باشد.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">چه خاکی را نخرید</h2>
      <p class="text-slate-600 mb-4">
        خاکی که بعد از فشردن مثل گل رس در دست می‌ماند، بیش از حد سنگین است. خاک باغچه، خاک رس خالص و خاکی که بوی ترشیدگی می‌دهد مناسب گلدان نیست. اگر آب روی سطح می‌ماند و دیر پایین می‌رود، مخلوط را سبک‌تر کنید.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">لایه پوکه در کف گلدان لازم است؟</h2>
      <p class="text-slate-600 mb-4">
        یک لایه سنگ در کف، سطح ایستابی می‌سازد و گاهی زهکشی را بدتر می‌کند. مهم‌تر از سنگ کف، سوراخ زهکش باز و خودِ مخلوط خاک سبک است. اگر نگران خروج خاک هستید، یک تکه توری روی سوراخ بگذارید.
      </p>
    `
  },
  {
    slug: "choosing-houseplant-soil",
    lang: "en",
    title: "The Right Soil for Houseplants: Light Mixes, Drainage, and Why Garden Dirt Fails",
    description: "Heavy garden soil suffocates roots in pots. Learn simple mixes for leafy plants, succulents, and humidity lovers.",
    category: "Tutorials",
    categoryEn: "tutorials",
    publishedAt: "September 8, 2026",
    readTime: "6 min",
    author: "Sarah Flower",
    icon: "BookOpen",
    gradient: "from-amber-500 to-stone-600",
    keywords: ["houseplant soil mix", "potting mix", "perlite", "coco coir", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        Roots need air as much as water. Garden soil compacts in a pot, blocks drainage, and can bring in outdoor pests. A light, chunky mix helps more than an expensive fertilizer.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Three Building Blocks of a Good Mix</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>Moisture holder:</strong> Peat moss or coco coir retains water. Coir is more stable and less acidic over time.</li>
        <li><strong>Aerator:</strong> Perlite, pumice, or bark keeps the mix from compacting and feeds oxygen to roots.</li>
        <li><strong>Gentle nutrition:</strong> A small amount of sifted compost or worm castings—not fresh manure.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Simple Home Recipes</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>Typical foliage plants:</strong> Two parts all-purpose potting mix + one part perlite + one part coco coir.</li>
        <li><strong>Succulents and cacti:</strong> One part potting mix + one part perlite or coarse sand + a little pumice. It should dry quickly.</li>
        <li><strong>Aroids (pothos, monstera, philodendron):</strong> Roughly equal parts potting mix, perlite, and bark or coco chips so aerial roots can breathe.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">What Not to Buy</h2>
      <p class="text-slate-600 mb-4">
        If a handful stays as a clay ball after you squeeze it, it is too heavy. Garden dirt, pure clay, and sour-smelling mix do not belong in indoor pots. If water sits on the surface, lighten the blend.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Do You Need Rocks in the Bottom?</h2>
      <p class="text-slate-600 mb-4">
        A rock layer can create a perched water table and worsen drainage. Open drainage holes and a light mix matter more. If soil is escaping, cover the hole with a scrap of mesh instead.
      </p>
    `
  },
  {
    slug: "گیاهان-تصفیه-کننده-هوا",
    lang: "fa",
    title: "گیاهان تصفیه‌کننده هوا: واقعیت علمی و بهترین انتخاب برای خانه",
    description: "گیاهان آپارتمانی هوا را کمی تازه می‌کنند، اما معجزه نیستند. در این مطلب می‌فهمید ناسا چه گفت، محدودیت‌ها چیست و کدام گیاهان برای خانه منطقی‌ترند.",
    category: "معرفی گیاهان",
    categoryEn: "plants",
    publishedAt: "۱۸ شهریور ۱۴۰۵",
    readTime: "۵ دقیقه",
    author: "علی سبزواری",
    icon: "Leaf",
    gradient: "from-teal-400 to-cyan-600",
    keywords: ["گیاهان تصفیه کننده هوا", "تحقیق ناسا گیاه", "سانسوریا هوا", "گندمی", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        مطالعه معروف ناسا در اتاق‌های بسته آزمایشگاهی نشان داد بعضی گیاهان می‌توانند ترکیبات فرار را جذب کنند. در خانه واقعی با در و پنجره و تهویه، تأثیر یک گلدان روی کیفیت هوا محدود است. با این حال، گیاه همچنان رطوبت جزئی، آرامش روانی و اکسیژن روزانه می‌سازد.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">انتظار واقع‌بینانه داشته باشید</h2>
      <p class="text-slate-600 mb-4">
        برای اثر قابل اندازه‌گیری روی بنزن یا فرمالدئید، به تعداد بسیار زیادی گیاه در هر مترمربع نیاز است؛ چیزی که در آپارتمان معمولی عملی نیست. تهویه، پرهیز از سیگار و انتخاب مصالح کم‌بو مهم‌تر از «گیاه تصفیه‌کننده» به‌عنوان تنها راه‌حل است.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">گیاهانی که نگهداری‌شان آسان است و در فهرست کلاسیک هستند</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>سانسوریا:</strong> کم‌توقع، مناسب نور کم. شب‌ها هم روزنه‌ها را به شیوه CAM باز می‌کند.</li>
        <li><strong>گندمی:</strong> رشد سریع، تکثیر آسان، مناسب تازه‌کارها.</li>
        <li><strong>پتوس:</strong> رونده و سازگار؛ اگر گربه یا سگ دارید آن را دور از دسترس بگذارید چون سمی است.</li>
        <li><strong>اسپاتی فیلوم:</strong> در نور متوسط گل می‌دهد و خاک نسبتاً مرطوب را دوست دارد.</li>
        <li><strong>آره‌کا:</strong> ظاهر نخل‌مانند و تبخیر برگ که رطوبت اتاق را کمی بالا می‌برد.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">چطور بیشترین فایده را ببرید</h2>
      <p class="text-slate-600 mb-4">
        برگ‌ها را تمیز نگه دارید، گیاه را زنده و در حال رشد نگه دارید و چند گونه را در اتاق‌های مختلف پخش کنید. گیاه بیمار یا خاک همیشه خیس، خودش منبع کپک و پشه می‌شود و کیفیت هوا را بدتر می‌کند.
      </p>
    `
  },
  {
    slug: "air-purifying-houseplants",
    lang: "en",
    title: "Air-Purifying Houseplants: The Science and the Best Realistic Picks",
    description: "Houseplants freshen a room a little, but they are not miracle filters. Learn what the NASA study actually showed and which plants still make sense at home.",
    category: "Plants",
    categoryEn: "plants",
    publishedAt: "September 9, 2026",
    readTime: "5 min",
    author: "Alex Green",
    icon: "Leaf",
    gradient: "from-teal-400 to-cyan-600",
    keywords: ["air purifying plants", "NASA plant study", "snake plant air", "spider plant", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        NASA’s famous sealed-chamber study showed that some plants can take up volatile compounds. In a real home with doors, windows, and HVAC, one pot’s effect on air quality is limited. Plants still add a bit of humidity, daily oxygen, and a calmer room.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Keep Expectations Honest</h2>
      <p class="text-slate-600 mb-4">
        A measurable drop in benzene or formaldehyde would take far more plants per square meter than a typical apartment can hold. Ventilation, no indoor smoking, and low-odor materials matter more than treating a plant as the only air filter.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Easy Plants From the Classic Lists</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>Snake plant:</strong> Low-maintenance and tolerant of lower light. It uses CAM and opens stomata at night.</li>
        <li><strong>Spider plant:</strong> Fast-growing and easy to propagate—great for beginners.</li>
        <li><strong>Pothos:</strong> A flexible trailer; keep it away from pets because it is toxic if chewed.</li>
        <li><strong>Peace lily:</strong> Blooms in medium light and prefers evenly moist soil.</li>
        <li><strong>Areca palm:</strong> A leafy silhouette whose transpiration slightly raises room humidity.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">How to Get the Most From Them</h2>
      <p class="text-slate-600 mb-4">
        Keep leaves clean, keep plants actively growing, and spread several species around the home. A sick plant or constantly wet soil becomes a source of mold and gnats and can worsen indoor air.
      </p>
    `
  },
  {
    slug: "علت-قهوه-ای-شدن-نوک-برگ",
    lang: "fa",
    title: "نوک برگ قهوه‌ای شده؟ علت‌ها و درمان سوختگی نوک گیاهان آپارتمانی",
    description: "نوک خشک و قهوه‌ای برگ معمولاً از رطوبت کم، نمک کود، آب کلردار یا جریان باد گرم می‌آید. این راهنما کمک می‌کند علت را جدا کنید و برگ‌های جدید سالم بمانند.",
    category: "نگهداری",
    categoryEn: "care",
    publishedAt: "۱۹ شهریور ۱۴۰۵",
    readTime: "۵ دقیقه",
    author: "سارا گل‌پرور",
    icon: "Droplets",
    gradient: "from-orange-400 to-amber-600",
    keywords: ["نوک برگ قهوه ای", "سوختگی نوک برگ", "رطوبت کم گیاه", "کلر آب گیاه", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        نوک قهوه‌ای با زرد شدن یکدست برگ فرق دارد. بافت نوک معمولاً خشک، کاغذی و مشخص است. برگ آسیب‌دیده سبز نمی‌شود، اما با اصلاح علت، رشد جدید تمیز درمی‌آید.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">چهار علت پرتکرار</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>هوای خشک:</strong> به‌ویژه در نخل، دراسنا، کالاتیا و سرخس. نوک از انتها قهوه‌ای می‌شود و به سمت داخل پیش می‌رود.</li>
        <li><strong>تجمع نمک کود یا املاح آب:</strong> پوسته سفید روی خاک و سوختگی نوک با هم دیده می‌شوند. خاک را آبشویی کنید و کود را رقیق‌تر کنید.</li>
        <li><strong>آب کلردار یا خیلی سرد:</strong> آب شیر را ۲۴ ساعت در ظرف باز بگذارید یا از آب فیلترشده استفاده کنید.</li>
        <li><strong>جریان هوا و گرما:</strong> کولر، بخاری و پنکه نزدیک برگ لبه را می‌سوزاند.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">آیا باید نوک را قیچی کرد؟</h2>
      <p class="text-slate-600 mb-4">
        اگر ظاهر گیاه برایتان مهم است، فقط بافت خشک را با قیچی تمیز، کمی بیرون از بخش سبز، به شکل طبیعی نوک برگ ببرید. وارد بافت سالم نشوید. قیچی کردن علت را درمان نمی‌کند.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">کم‌آبی یا آبیاری زیاد؟</h2>
      <p class="text-slate-600 mb-4">
        کم‌آبی نوک و حاشیه را خشک و شکننده می‌کند و خاک سبک است. آبیاری زیاد بیشتر برگ‌های پایینی را نرم و زرد می‌کند. اول خاک را لمس کنید، بعد برنامه را عوض کنید. تعویض ناگهانی هر دو حالت را بدتر می‌کند.
      </p>
    `
  },
  {
    slug: "brown-leaf-tips-guide",
    lang: "en",
    title: "Brown Leaf Tips? Causes and Fixes for Crispy Houseplant Edges",
    description: "Dry brown tips usually come from low humidity, fertilizer salts, chlorinated water, or hot drafts. Learn how to tell the causes apart so new growth stays clean.",
    category: "Care",
    categoryEn: "care",
    publishedAt: "September 10, 2026",
    readTime: "5 min",
    author: "Sarah Flower",
    icon: "Droplets",
    gradient: "from-orange-400 to-amber-600",
    keywords: ["brown leaf tips", "crispy plant leaves", "low humidity plants", "chlorine tap water plants", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        Brown tips are not the same as evenly yellow leaves. The damaged tissue is usually dry, papery, and sharply defined. It will not turn green again, but new growth can come in clean once you fix the cause.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Four Frequent Causes</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>Dry air:</strong> Especially on palms, dracaena, calathea, and ferns. Browning starts at the tip and creeps inward.</li>
        <li><strong>Fertilizer or mineral salts:</strong> A white crust on the soil often appears with tip burn. Flush the pot and dilute future feeds.</li>
        <li><strong>Chlorinated or icy water:</strong> Let tap water sit uncovered for 24 hours, or use filtered water.</li>
        <li><strong>Heat and airflow:</strong> Vents, heaters, and fans close to foliage scorch the edges.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Should You Trim the Tips?</h2>
      <p class="text-slate-600 mb-4">
        If the look bothers you, snip only the dead tissue with clean shears, following the natural leaf shape and staying just outside the green. Don’t cut into healthy tissue. Trimming does not fix the cause.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Underwatering vs Overwatering</h2>
      <p class="text-slate-600 mb-4">
        Underwatering makes tips and margins dry and brittle, and the pot feels light. Overwatering more often yellows lower leaves and makes them soft. Check the soil before you change the schedule. Sudden swings make both problems worse.
      </p>
    `
  },
  {
    slug: "راهنمای-هرس-گیاهان-آپارتمانی",
    lang: "fa",
    title: "هرس گیاهان آپارتمانی: کی ببریم تا پرپشت شود و کی دست نزنیم",
    description: "هرس درست ساقه دراز را جمع می‌کند، هوا را بین برگ‌ها جریان می‌دهد و قلمه رایگان می‌دهد. در این آموزش نقطه برش، ابزار و زمان مناسب را می‌آموزید.",
    category: "آموزش‌ها",
    categoryEn: "tutorials",
    publishedAt: "۲۰ شهریور ۱۴۰۵",
    readTime: "۶ دقیقه",
    author: "علی سبزواری",
    icon: "Scissors",
    gradient: "from-violet-400 to-purple-600",
    keywords: ["هرس گیاهان آپارتمانی", "پرپشت شدن پتوس", "قطع ساقه دراز", "قلمه بعد هرس", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        هرس ترسناک نیست؛ بیشتر گیاهان برگ‌دار بعد از یک برش تمیز جوانه جانبی می‌زنند و پرپشت می‌شوند. هدف، تنبیه گیاه نیست: نور را به داخل تاج برسانید، ساقه‌های ضعیف را حذف کنید و شکل را متعادل کنید.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">بهترین زمان</h2>
      <p class="text-slate-600 mb-4">
        اوایل فصل رشد (بهار و اوایل تابستان) زخم سریع‌تر بسته می‌شود. در زمستان فقط برگ‌های خشک و آسیب‌دیده را بردارید. گیاه تازه تعویض‌گلدان‌شده یا بیمار را هرس سنگین نکنید.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">نقطه برش کجاست؟</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li>قیچی را تیز و با الکل ضدعفونی کنید.</li>
        <li>برش را کمی بالاتر از یک گره (محل برگ) و با زاویه ملایم بزنید تا آب روی زخم نماند.</li>
        <li>در گیاهان رونده مثل پتوس، بریدن بالای گره باعث جوانه زدن همان نقطه و شاخه جدید می‌شود.</li>
        <li>بیش از یک‌سوم شاخ و برگ را در یک نوبت برندارید.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">گیاهانی که هرس را دوست دارند و گیاهانی که نه</h2>
      <p class="text-slate-600 mb-4">
        پتوس، فیلودندرون، فیکوس بنجامین و بسیاری از گیاهان بوته‌ای بعد از هرس پر می‌شوند. سانسوریا و زامیفولیا را معمولاً فقط برای حذف برگ آسیب‌دیده از قاعده می‌برند؛ کوتاه کردن نوک برگ شمشیری ظاهر زشتی می‌گذارد. کاکتوس و ساکولنت گوشتی را فقط با ابزار استریل و پس از خشک شدن زخم جابجا کنید.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">بعد از هرس</h2>
      <p class="text-slate-600 mb-4">
        گیاه را چند روز از آفتاب تند دور نگه دارید. قلمه‌های سالم را می‌توانید در آب ریشه‌دار کنید. برگ‌های بیمار را در سطل زباله بیندازید، نه کنار سایر گلدان‌ها.
      </p>
    `
  },
  {
    slug: "pruning-houseplants-guide",
    lang: "en",
    title: "Pruning Houseplants: When to Cut for Bushier Growth—and When to Leave Them Alone",
    description: "The right cut tames leggy stems, improves airflow, and gives you free cuttings. Learn where to snip, which tools to use, and the best timing.",
    category: "Tutorials",
    categoryEn: "tutorials",
    publishedAt: "September 11, 2026",
    readTime: "6 min",
    author: "Alex Green",
    icon: "Scissors",
    gradient: "from-violet-400 to-purple-600",
    keywords: ["pruning houseplants", "bushier pothos", "leggy plant prune", "cuttings after prune", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        Pruning is not punishment. Most leafy houseplants respond to a clean cut by pushing side shoots and growing denser. The goal is to let light into the canopy, remove weak stems, and balance the shape.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Best Timing</h2>
      <p class="text-slate-600 mb-4">
        Early in the growing season (spring and early summer) wounds close faster. In winter, only remove dead or damaged leaves. Don’t hard-prune a plant that was just repotted or is already sick.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Where to Cut</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li>Use sharp shears wiped with alcohol.</li>
        <li>Cut just above a node (where a leaf joins the stem), at a slight angle so water doesn’t sit on the wound.</li>
        <li>On trailers like pothos, cutting above a node encourages a new branch from that point.</li>
        <li>Never remove more than about one-third of the foliage at once.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Plants That Like a Haircut—and Plants That Don’t</h2>
      <p class="text-slate-600 mb-4">
        Pothos, philodendron, weeping fig, and many bushy plants fill out after pruning. Snake plants and ZZ plants are usually cut only to remove damaged leaves at the base; snipping the tip of a sword leaf looks ugly. Cacti and fleshy succulents need sterile tools and time for the wound to callus.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Aftercare</h2>
      <p class="text-slate-600 mb-4">
        Keep the plant out of harsh sun for a few days. Healthy cuttings can be rooted in water. Bag diseased leaves in the trash instead of leaving them beside other pots.
      </p>
    `
  },
]
