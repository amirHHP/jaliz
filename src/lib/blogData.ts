import { newBlogPosts } from "./blogPostsNew"

export interface BlogPost {
  slug: string;
  lang: "fa" | "en";
  title: string;
  description: string;
  category: string;
  categoryEn: string; // Internal mapping for filters
  publishedAt: string;
  readTime: string;
  author: string;
  content: string;
  icon: string;
  gradient: string;
  keywords: string[];
}

const existingBlogPosts: BlogPost[] = [
  {
    slug: "راهنمای-آبیاری-گیاهان-آپارتمانی",
    lang: "fa",
    title: "راهنمای جامع آبیاری گیاهان آپارتمانی: چطور از آبیاری بیش از حد جلوگیری کنیم؟",
    description: "یکی از اصلی‌ترین عوامل آسیب‌دیدگی گیاهان، اشتباه در میزان و زمان آبیاری است. در این مطلب ساده یاد می‌گیرید که چطور نیاز گیاه را تشخیص دهید.",
    category: "نگهداری",
    categoryEn: "care",
    publishedAt: "۱ تیر ۱۴۰۵",
    readTime: "۵ دقیقه",
    author: "سارا گل‌پرور",
    icon: "Droplets",
    gradient: "from-sky-400 to-emerald-500",
    keywords: ["آبیاری گیاهان آپارتمانی", "نگهداری از گیاه", "علائم آبیاری زیاد", "پوسیدگی ریشه", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        شاید تعجب کنید اما بر اساس آمار، بیش از ۸۰ درصد گیاهان آپارتمانی نه از کم‌آبی، بلکه به دلیل آبیاری بیش از حد و خفگی ریشه از بین می‌روند! آبیاری گیاهان یک فرمول ثابت و هفتگی ندارد.
      </p>
      
      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">چرا قانون «یک بار در هفته» اشتباه است؟</h2>
      <p class="text-slate-600 mb-4">
        نیاز گیاه به آب به عوامل متغیری مثل فصل، میزان نور دریافتی، دمای محیط، رطوبت هوا، جنس گلدان و حتی نوع خاک بستگی دارد. به همین دلیل، برنامه‌ریزی تقویمی و سفت‌وسخت بدون چک کردن وضعیت خاک، اغلب به غرقاب شدن ریشه منجر می‌شود.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">چگونه بفهمیم زمان آبیاری فرارسیده است؟</h2>
      <p class="text-slate-600 mb-4">
        بهترین و مطمئن‌ترین روش، سنجش رطوبت خاک است. به جای نگاه کردن به سطح خاک، این سه روش را امتحان کنید:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>آزمون انگشت:</strong> انگشت اشاره خود را تا عمق ۳ تا ۵ سانتی‌متری (حدود دو بند انگشت) وارد خاک کنید. اگر خاک کاملاً خشک بود و رطوبتی حس نکردید، زمان آبیاری است.</li>
        <li><strong>روش سیخ چوبی:</strong> یک سیخ چوبی یا خلال دندان بلند را در خاک فرو کنید و بیرون بکشید. اگر ذرات خاک مرطوب به آن چسبیده بود، هنوز خاک رطوبت دارد.</li>
        <li><strong>سنجش وزن گلدان:</strong> گلدان را بلند کنید. با مرور زمان متوجه می‌شوید گلدانی که نیاز به آبیاری دارد سبک‌تر از گلدانی است که خاکش مرطوب است.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">علائم هشداردهنده آبیاری بیش از حد</h2>
      <p class="text-slate-600 mb-4">
        اگر گیاه شما یکی از نشانه‌های زیر را دارد، احتمالاً به آن آب زیادی داده‌اید:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li>زرد شدن برگ‌های پایینی به صورت ناگهانی</li>
        <li>پژمرده شدن برگ‌ها در حالی که خاک گلدان مرطوب و خیس است</li>
        <li>نرم و شل شدن ساقه یا پایه گیاه</li>
        <li>ظهور بوی کپک یا ماندگی از خاک (نشانه پوسیدگی ریشه)</li>
        <li>پیدا شدن پشه‌های ریز سیاه (پشه خاک) اطراف گلدان</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">سه راهکار طلایی برای نجات گیاه آسیب‌دیده</h2>
      <p class="text-slate-600 mb-4">
        اگر احساس کردید ریشه‌ها در حال خفه شدن هستند، بلافاصله آبیاری را متوقف کنید. گلدان را به محل پرنورتر با تهویه هوای بهتر منتقل کنید. مطمئن شوید سوراخ‌های زهکشی ته گلدان باز هستند و آب اضافی در زیرگلدانی باقی نمی‌ماند. در موارد شدیدتر، باید گیاه را از گلدان خارج کرده، ریشه‌های سیاه و پوسیده را هرس کنید و آن را در خاک جدید و گلدانی با زهکشی عالی بکارید.
      </p>
    `
  },
  {
    slug: "watering-houseplants-guide",
    lang: "en",
    title: "Houseplant Watering Guide: How to Prevent Overwatering",
    description: "Overwatering is the number one cause of houseplant death. Learn how to tell when your plants are actually thirsty in this simple guide.",
    category: "Care",
    categoryEn: "care",
    publishedAt: "June 22, 2026",
    readTime: "5 min",
    author: "Sarah Flower",
    icon: "Droplets",
    gradient: "from-sky-400 to-emerald-500",
    keywords: ["houseplant watering", "plant care tips", "overwatering signs", "root rot prevention", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        It might surprise you, but over 80% of houseplants perish not from lack of water, but due to overwatering and root suffocation! Watering plants doesn't follow a fixed weekly calendar.
      </p>
      
      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Why the 'Once a Week' Rule Fails</h2>
      <p class="text-slate-600 mb-4">
        A plant's water requirement depends on variable factors such as season, light exposure, room temperature, air humidity, pot material, and soil type. That's why a rigid calendar schedule without checking the soil often leads to soggy roots.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">How to Tell When It's Time to Water</h2>
      <p class="text-slate-600 mb-4">
        The best and most reliable method is assessing soil moisture. Instead of just looking at the soil surface, try these three techniques:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>The Finger Test:</strong> Insert your index finger about 2 inches deep into the soil. If it feels completely dry, it's time to water.</li>
        <li><strong>The Wooden Chopstick Test:</strong> Push a clean wooden chopstick deep into the soil and pull it out. If damp soil clings to it, the soil still holds moisture.</li>
        <li><strong>Lifting the Pot:</strong> Pick up the pot. Over time, you'll learn that a dry pot is significantly lighter than one with moist soil.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Warning Signs of Overwatering</h2>
      <p class="text-slate-600 mb-4">
        If your plant exhibits any of these symptoms, it might be receiving too much water:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li>Sudden yellowing of the lower leaves</li>
        <li>Wilting leaves despite the soil being damp and wet</li>
        <li>Soft, mushy stems or base</li>
        <li>A musty smell coming from the soil (a sign of root rot)</li>
        <li>Tiny black gnats hovering around the soil surface</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Three Steps to Rescue an Overwatered Plant</h2>
      <p class="text-slate-600 mb-4">
        If you suspect roots are suffocating, stop watering immediately. Move the pot to a brighter spot with better ventilation. Ensure the drainage holes are clear and that excess water is emptied from the saucer. In severe cases, gently remove the plant, prune away mushy black roots, and repot in fresh, well-draining soil.
      </p>
    `
  },
  {
    slug: "گیاهان-آپارتمانی-مقاوم-برای-تازه-کارها",
    lang: "fa",
    title: "۵ گیاه آپارتمانی مقاوم و سخت‌جان برای باغبان‌های تازه‌کار",
    description: "اگر تازه نگهداری از گیاهان را شروع کرده‌اید و نگران خشک شدن آن‌ها هستید، این گیاهان زیبا و مقاوم بهترین انتخاب برای شما هستند.",
    category: "معرفی گیاهان",
    categoryEn: "plants",
    publishedAt: "۲ تیر ۱۴۰۵",
    readTime: "۴ دقیقه",
    author: "علی سبزواری",
    icon: "Sprout",
    gradient: "from-emerald-400 to-teal-600",
    keywords: ["گیاهان آپارتمانی مقاوم", "گیاهان سخت جان", "باغبانی تازه کارها", "خرید گل آپارتمانی", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        دوست دارید خانه خود را سبز و سرزنده کنید اما نگرانید که به دلیل کمبود وقت یا نداشتن تجربه کافی، گیاهانتان خشک شوند؟ نگران نباشید! این ۵ گیاه فوق‌العاده مقاوم، به راحتی با شرایط محیطی مختلف سازگار می‌شوند و در برابر بی‌توجهی‌ها بسیار صبورند.
      </p>
      
      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۱. سانسوریا (Sansevieria) - زره‌پوش دنیای گیاهان</h2>
      <p class="text-slate-600 mb-4">
        سانسوریا یا «شمشیری» یکی از سرسخت‌ترین گیاهان آپارتمانی است. این گیاه در نور کم، سایه، و محیط‌های کم‌رطوبت رشد می‌کند و نیاز به آبیاری بسیار کمی دارد (به ویژه در زمستان تنها ماهی یک بار کافی است). علاوه بر این، سانسوریا یکی از بهترین تصفیه‌کننده‌های طبیعی هوا به شمار می‌رود.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۲. زامیفولیا (ZZ Plant) - ملکه سایه‌ها</h2>
      <p class="text-slate-600 mb-4">
        زامیفولیا با برگ‌های چرمی و براقش شبیه گیاهان مصنوعی به نظر می‌رسد، اما کاملاً زنده و شاداب است! این گیاه به شدت به کم‌آبی مقاوم است چرا که آب را در غده‌های زیرزمینی خود (ریزوم) ذخیره می‌کند. زامیفولیا در گوشه‌های کم‌نور اتاق نیز به خوبی زنده می‌ماند.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۳. پتوس (Pothos) - رونده مهربان و پرانرژی</h2>
      <p class="text-slate-600 mb-4">
        پتوس با برگ‌های قلبی شکل و رونده، یکی از محبوب‌ترین گیاهان آپارتمانی است. رشد بسیار سریع، تکثیر آسان در آب و سازگاری با طیف وسیعی از نورها، پتوس را به انتخابی عالی برای تازه‌کارها تبدیل کرده است. این گیاه زمانی که تشنه است، برگ‌هایش کمی آویزان می‌شود و به شما یادآوری می‌کند که نیاز به آب دارد.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۴. آلوئه‌ورا (Aloe Vera) - زیبا، دارویی و کم‌توقع</h2>
      <p class="text-slate-600 mb-4">
        یک گیاه آبدار (ساکولنت) که عاشق نور مستقیم خورشید است. آلوئه‌ورا نیاز به آبیاری کمی دارد و خاک آن بین دو آبیاری باید کاملاً خشک شود. ژل درون برگ‌های این گیاه خواص درمانی شگفت‌انگیزی برای تسکین سوختگی پوست دارد.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۵. گیاه گندمی (Spider Plant) - تصفیه‌کننده شاد و پویا</h2>
      <p class="text-slate-600 mb-4">
        گیاه گندمی یا سجافی با برگ‌های باریک و خطوط کرم‌رنگش، ظاهری بسیار جذاب دارد. این گیاه به سرعت بچه‌دهی می‌کند و می‌توانید فرزندان کوچک آن را جدا کرده و در خاک یا آب ریشه‌دار کنید. گندمی مقاومت خوبی در برابر نوسانات دما و کم‌آبی دارد.
      </p>
    `
  },
  {
    slug: "beginner-houseplants",
    lang: "en",
    title: "5 Hard-to-Kill Houseplants for Beginners",
    description: "Want to bring some green into your space but lack a green thumb? Start with these 5 extremely resilient and beautiful houseplants.",
    category: "Plants",
    categoryEn: "plants",
    publishedAt: "June 22, 2026",
    readTime: "4 min",
    author: "Alex Green",
    icon: "Sprout",
    gradient: "from-emerald-400 to-teal-600",
    keywords: ["beginner houseplants", "hard to kill plants", "low maintenance plants", "easy indoor plants", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        Want to green up your space but worry your lack of experience or busy schedule might lead to dried up plants? Don't worry! These 5 exceptionally tough houseplants easily adapt to various indoor conditions and tolerate occasional neglect.
      </p>
      
      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">1. Snake Plant (Sansevieria) - The Ironclad Houseplant</h2>
      <p class="text-slate-600 mb-4">
        Also known as "Mother-in-law's tongue," the Snake Plant is legendary for its durability. It thrives in low light, handles dry air, and requires very little watering (in winter, once a month is often enough). Plus, it is one of the best air-purifying plants you can grow.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">2. ZZ Plant (Zamioculcas Zamiifolia) - The Shadow Queen</h2>
      <p class="text-slate-600 mb-4">
        With its waxy, deep green leaves, the ZZ plant looks so perfect it's often mistaken for a fake plant. It stores water in its underground rhizomes, making it incredibly drought-tolerant. It also does perfectly well in low-light corners where other plants might struggle.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">3. Pothos (Epipremnum aureum) - The Energetic Trailing Vine</h2>
      <p class="text-slate-600 mb-4">
        Pothos features heart-shaped leaves and long trailing vines that add instant life to shelves. Its rapid growth, easy propagation, and tolerance of varying light levels make it an all-time beginner favorite. It visibly droops when thirsty, letting you know exactly when to water.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">4. Aloe Vera - Resilient, Useful, and Low-Maintenance</h2>
      <p class="text-slate-600 mb-4">
        This popular succulent loves bright indirect or direct sunlight. Aloe Vera requires very little water, needing the soil to dry out completely between waterings. Its soothing inner gel is highly useful for treating minor skin burns and cuts.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">5. Spider Plant (Chlorophytum comosum) - The Air-Purifier</h2>
      <p class="text-slate-600 mb-4">
        The Spider Plant features arching ribbons of green and white foliage. It grows quickly and produces offsets, or "spiderettes," which can be easily snipped and rooted in water. It tolerates light fluctuations and handles irregular watering schedules beautifully.
      </p>
    `
  },
  {
    slug: "راهنمای-تعویض-گلدان-و-خاک",
    lang: "fa",
    title: "راهنمای قدم‌به‌قدم تعویض خاک و گلدان بدون آسیب به ریشه",
    description: "گیاهان برای رشد به تعویض گلدان و خاک تازه نیاز دارند. در این آموزش یاد می‌گیرید چطور بدون آسیب زدن به ریشه، گلدان گیاهتان را تغییر دهید.",
    category: "آموزش‌ها",
    categoryEn: "tutorials",
    publishedAt: "۳ تیر ۱۴۰۵",
    readTime: "۶ دقیقه",
    author: "سارا گل‌پرور",
    icon: "BookOpen",
    gradient: "from-amber-400 to-orange-500",
    keywords: ["تعویض گلدان", "تعویض خاک گیاه", "آموزش باغبانی", "خاک مناسب آپارتمانی", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        تعویض گلدان یکی از مراحل هیجان‌انگیز اما حساس در نگهداری گیاهان است. خاک گلدان پس از حدود یک تا دو سال، مواد مغذی خود را از دست می‌دهد و متراکم می‌شود. در این مقاله، یاد می‌گیرید که چطور این جابجایی حیاتی را با کمترین میزان تنش و استرس برای ریشه‌های گیاه انجام دهید.
      </p>
      
      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">نشانه‌های نیاز گیاه به تعویض گلدان</h2>
      <p class="text-slate-600 mb-4">
        پیش از اقدام، مطمئن شوید گیاهتان واقعاً به خانه جدید نیاز دارد. این نشانه‌ها را بررسی کنید:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li>بیرون زدن ریشه‌ها از سوراخ‌های زهکشی ته گلدان یا نمایان شدن ریشه‌ها در سطح خاک</li>
        <li>کاهش سرعت رشد گیاه با وجود تغذیه و کوددهی منظم</li>
        <li>خشک شدن سریع خاک پس از آبیاری، به طوری که آب بلافاصله از گلدان خارج می‌شود</li>
        <li>تنگ شدن گلدان به طوری که تعادل گلدان به هم خورده و مدام می‌افتد</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">لوازم مورد نیاز برای شروع کار</h2>
      <p class="text-slate-600 mb-4">
        قبل از شروع، ابزارهای زیر را در دسترس قرار دهید:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li>گلدان جدید (فقط یک سایز بزرگتر از گلدان فعلی، حدود ۲ تا ۵ سانتی‌متر بزرگتر در قطر)</li>
        <li>مخلوط خاک مناسب (خاک سبک، متخلخل و دارای پرلیت کافی)</li>
        <li>لیکاپون (پوکه معدنی) برای کف گلدان جهت بهبود زهکشی</li>
        <li>یک ورق روزنامه یا سفره یکبار مصرف برای تمیز ماندن محیط</li>
        <li>یک بیلچه کوچک و آب‌پاش</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">مراحل قدم‌به‌قدم تعویض گلدان</h2>
      <ol class="list-decimal list-inside space-y-3 text-slate-600 mb-6 ps-4">
        <li><strong>آماده‌سازی گیاه:</strong> یک یا دو روز قبل از تعویض گلدان، به گیاه آب بدهید. خاک مرطوب (نه خیس و گلی) راحت‌تر از گلدان خارج می‌شود و ریشه‌ها کمتر آسیب می‌بینند.</li>
        <li><strong>خارج کردن گیاه:</strong> گلدان را به پهلو بخوابانید. بدنه گلدان را به آرامی فشار دهید تا خاک آزاد شود. پایه گیاه را با دست بگیرید و گلدان را به عقب بکشید. هرگز گیاه را با قدرت از ساقه نکشید.</li>
        <li><strong>بررسی و هرس ریشه‌ها:</strong> ریشه‌های به هم پیچیده را به آرامی با انگشتان خود باز کنید. اگر ریشه پوسیده، قهوه‌ای تیره یا نرمی دیدید، آن را با قیچی ضدعفونی‌شده هرس کنید.</li>
        <li><strong>کاشت در گلدان جدید:</strong> ابتدا چند پوکه معدنی در کف گلدان بریزید تا سوراخ زهکشی مسدود نشود. مقداری خاک جدید اضافه کنید. گیاه را در مرکز قرار دهید و دور آن را با خاک پر کنید. خاک را با انگشتان به آرامی بفشارید تا حفره‌های هوا پر شوند، اما خاک را بیش از حد متراکم نکنید.</li>
        <li><strong>آبیاری اول:</strong> به گیاه به طور کامل آب بدهید تا آب از ته گلدان خارج شود. این کار به استقرار ریشه‌ها در خاک جدید کمک می‌کند.</li>
      </ol>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">مراقبت‌های پس از تعویض گلدان</h2>
      <p class="text-slate-600 mb-4">
        گیاه را برای یک تا دو هفته در معرض نور مستقیم خورشید یا باد شدید قرار ندهید. به گیاه زمان دهید تا به خانه جدید عادت کند. همچنین تا یک ماه بعد از تعویض گلدان، به گیاه کود ندهید؛ ریشه‌های جدید حساس هستند و کود ممکن است آن‌ها را بسوزاند.
      </p>
    `
  },
  {
    slug: "how-to-repot-plants",
    lang: "en",
    title: "Step-by-Step Guide to Repotting Your Plants Without Damaging Roots",
    description: "When plants outgrow their pots, repotting is essential for fresh soil and root growth. Learn how to transition your plant safely.",
    category: "Tutorials",
    categoryEn: "tutorials",
    publishedAt: "June 23, 2026",
    readTime: "6 min",
    author: "Sarah Flower",
    icon: "BookOpen",
    gradient: "from-amber-400 to-orange-500",
    keywords: ["repotting plants", "how to repot plants", "gardening tutorial", "potting soil", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        Repotting is an exciting yet critical phase of plant parenting. Potting soil loses its nutrients and becomes compacted after one to two years. In this guide, you'll learn how to handle this essential transition with minimal stress to your plant's roots.
      </p>
      
      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Signs Your Plant Needs Repotting</h2>
      <p class="text-slate-600 mb-4">
        Before diving in, make sure your plant is ready for a new home. Check for these common indicators:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li>Roots growing out of the drainage holes or visible on the soil surface</li>
        <li>Significantly slowed growth despite regular watering and feeding</li>
        <li>Soil drying out very quickly, with water rushing straight to the bottom</li>
        <li>The plant becoming top-heavy, causing the pot to tip over easily</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Supplies You'll Need</h2>
      <p class="text-slate-600 mb-4">
        Gather these tools before you begin:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li>A new pot (only 1 to 2 inches larger in diameter than the current one)</li>
        <li>A suitable well-draining soil mix (preferably containing perlite)</li>
        <li>Pebbles or clay pellets (expanded clay) for the bottom to prevent waterlogging</li>
        <li>Newspapers or a plastic sheet to keep your working space clean</li>
        <li>A hand trowel and a watering can</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Step-by-Step Repotting Method</h2>
      <ol class="list-decimal list-inside space-y-3 text-slate-600 mb-6 ps-4">
        <li><strong>Prepare the Plant:</strong> Water your plant a day or two before repotting. Moist (but not muddy) soil slides out much cleaner and protects root structure.</li>
        <li><strong>Remove from Pot:</strong> Turn the pot sideways. Gently squeeze the sides to loosen the rootball. Support the base of the stems and gently wiggle the pot off. Never yank the plant out.</li>
        <li><strong>Loosen Roots:</strong> Gently massage the rootball with your fingers to untangle tightly bound outer roots. Snip any mushy, dark brown, or decaying roots with clean shears.</li>
        <li><strong>Place in New Pot:</strong> Put a thin layer of clay pellets over the drainage holes. Add a base layer of fresh soil. Center the plant in the pot and fill the sides with soil. Lightly press down to eliminate air pockets, but avoid packing it too tight.</li>
        <li><strong>Initial Water:</strong> Water thoroughly until water drains from the bottom. This helps settle the roots in their new environment.</li>
      </ol>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Aftercare Tips</h2>
      <p class="text-slate-600 mb-4">
        Keep your newly repotted plant out of direct hot sunlight and harsh drafts for a week or two. Give it time to adjust. Avoid fertilizing for at least 4 to 6 weeks, as sensitive young root growth can easily be burned by fertilizer salts.
      </p>
    `
  },
  {
    slug: "راهنمای-تکثیر-گیاهان-در-آب",
    lang: "fa",
    title: "راهنمای قدم‌به‌قدم تکثیر گیاهان آپارتمانی در آب: از برش تا کاشت",
    description: "تکثیر گیاهان آپارتمانی در آب یکی از لذت‌بخش‌ترین و ساده‌ترین کارهای باغبانی خانگی است. در این مقاله به زبان ساده یاد می‌گیریم چطور قلمه‌ها را ریشه‌دار کنیم و به خاک انتقال دهیم.",
    category: "آموزش‌ها",
    categoryEn: "tutorials",
    publishedAt: "۶ تیر ۱۴۰۵",
    readTime: "۶ دقیقه",
    author: "سارا گل‌پرور",
    icon: "BookOpen",
    gradient: "from-blue-400 to-indigo-600",
    keywords: ["تکثیر گیاهان در آب", "قلمه زدن گل", "ریشه دار کردن قلمه", "انتقال قلمه به خاک", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        تکثیر گیاهان آپارتمانی در آب یکی از لذت‌بخش‌ترین و ساده‌ترین کارهایی است که می‌توانید در خانه انجام دهید. تماشای رشد ریشه‌های سفید و کوچک از پشت شیشه، درست مثل یک آزمایش علمی خانگی است که علاوه بر جذابیت، به شما کمک می‌کند تا خانه‌تان را کاملاً رایگان به یک باغ کوچک تبدیل کنید.
      </p>
      
      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۱. انتخاب و برش اصولی قلمه</h2>
      <p class="text-slate-600 mb-4">
        تکثیر موفق همیشه از یک برش اصولی شروع می‌شود. اگر قلمه را از جای اشتباه ببرید، به جای ریشه زدن، ساقه سیاه شده و از بین می‌رود:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>انتخاب گیاه مادر سالم:</strong> قلمه‌ای که جدا می‌کنید باید شاداب، سفت و عاری از هرگونه لک یا آفت باشد. بهتر است گیاه مادر را روز قبل به خوبی آبیاری کنید.</li>
        <li><strong>پیدا کردن گره ساقه:</strong> گره همان برجستگی‌های قهوه‌ای یا محل اتصال برگ به ساقه است که ریشه‌ها قرار است از آنجا رشد کنند.</li>
        <li><strong>برش اریب:</strong> با یک قیچی یا چاقوی کاملاً تیز و ضدعفونی‌شده، ساقه را با زاویه ۴۵ درجه و دقیقاً در فاصله ۱ سانتی‌متری زیر گره برش دهید.</li>
        <li><strong>هرس برگ‌های اضافی:</strong> قلمه‌ای به طول ۱۰ تا ۱۵ سانتی‌متر بردارید و تمام برگ‌های نیمه پایینی آن را جدا کنید تا در آب نپوسند. فقط ۲ تا ۳ برگ در بالا باقی بگذارید.</li>
      </ul>
      <p class="text-slate-600 mb-4">
        <strong>فوت کوزه‌گری برای پپرومیا و ساکولنت‌ها:</strong> اگر گیاهانی با برگ‌های گوشتی را تکثیر می‌کنید، بلافاصله آن‌ها را در آب نگذارید. اجازه دهید قلمه ۲۴ ساعت روی میز بماند تا انتهای آن خشک شود و پینه (کالوس) ببندد تا جلوی پوسیدگی گرفته شود.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۲. انتخاب ظرف مناسب و کیفیت آب</h2>
      <p class="text-slate-600 mb-4">
        شیشه‌های شفاف برای تماشای رشد ریشه‌ها عالی هستند، اما نور خورشید باعث رشد جلبک‌های سبز و خفگی ریشه‌ها می‌شود. استفاده از ظروف با شیشه تیره (مانند شیشه‌های کهربایی یا قهوه‌ای) با شبیه‌سازی تاریکی خاک، سرعت ریشه‌زایی را افزایش داده و مانع جلبک‌زدن آب می‌شود.
      </p>
      <p class="text-slate-600 mb-4">
        برای آب مصرفی نیز هرگز از آب مستقیم لوله‌کشی استفاده نکنید. آب شیر را ۲۴ ساعت در یک ظرف دهان‌گشاد بگذارید تا کلر آن خارج شود و هم‌دمای محیط گردد. قلمه را طوری قرار دهید که فقط قسمت گره در آب باشد.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۳. پیشگیری از پوسیدگی ریشه</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>تعویض منظم آب:</strong> عامل اصلی ریشه‌زایی، میزان اکسیژن محلول در آب است. آب ظرف را هر ۵ تا ۷ روز یک‌بار تعویض کنید تا اکسیژن تازه به ریشه‌ها برسد.</li>
        <li><strong>استفاده از آب اکسیژنه:</strong> اگر نگران قارچی شدن قلمه‌ها هستید، اضافه کردن چند قطره هیدروژن پراکسید (آب اکسیژنه ۳٪) به آب، باکتری‌ها را نابود کرده و اکسیژن را افزایش می‌دهد.</li>
        <li><strong>نور غیرمستقیم:</strong> ظرف تکثیر را در مکانی روشن با نور فیلتر شده قرار دهید. نور مستقیم قلمه‌ها را می‌سوزاند.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۴. کاشتن قلمه در خاک بدون شوک انتقال</h2>
      <p class="text-slate-600 mb-4">
        ریشه‌های آب ترد هستند و برای انتقال به خاک نیاز به مراقبت دارند:
      </p>
      <ol class="list-decimal list-inside space-y-3 text-slate-600 mb-6 ps-4">
        <li><strong>قانون ۵ سانتی‌متر:</strong> بهترین زمان انتقال به خاک، وقتی است که طول ریشه‌ها بین ۲.۵ تا ۵ سانتی‌متر باشد. اگر ریشه‌ها خیلی طولانی شوند در خاک زنده نمی‌مانند.</li>
        <li><strong>خاک سبک:</strong> از گلدانی کوچک با زهکشی عالی و خاکی بسیار سبک حاوی پیت‌ماس و پرلیت استفاده کنید.</li>
        <li><strong>فاز مرطوب اولیه:</strong> برای ۷ تا ۱۰ روز اول پس از کاشت، خاک را همواره بسیار مرطوب (شبیه به گل ملایم) نگه دارید تا ریشه‌ها به محیط جدید عادت کنند. به مرور دفعات آبیاری را کاهش دهید.</li>
        <li><strong>کاور رطوبتی:</strong> کشیدن یک پلاستیک شفاف روی گلدان جدید به مدت یک هفته، رطوبت هوا را بالا نگه داشته و جلوی پژمردگی را می‌گیرد.</li>
      </ol>
    `
  },
  {
    slug: "water-propagation-guide",
    lang: "en",
    title: "Step-by-Step Guide to Houseplant Water Propagation",
    description: "Water propagation is one of the easiest and most satisfying ways to multiply your houseplants. Learn how to successfully root cuttings and transfer them to soil.",
    category: "Tutorials",
    categoryEn: "tutorials",
    publishedAt: "June 26, 2026",
    readTime: "6 min",
    author: "Sarah Flower",
    icon: "BookOpen",
    gradient: "from-blue-400 to-indigo-600",
    keywords: ["water propagation", "plant cuttings", "rooting cuttings", "transplanting to soil", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        Propagating houseplants in water is one of the most rewarding and simple activities you can do at home. Watching small white roots grow from behind the glass is like a home science experiment that helps you green up your space for free.
      </p>
      
      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">1. Choosing and Cutting Properly</h2>
      <p class="text-slate-600 mb-4">
        Successful propagation always starts with a correct cut. If you cut in the wrong place, the stem will rot instead of rooting:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>Select a Healthy Mother Plant:</strong> The cutting should be fresh, firm, and free of any spots or pests. Water the mother plant the day before.</li>
        <li><strong>Locate the Node:</strong> The node is the bump or point where leaves join the stem. This is where roots will grow from.</li>
        <li><strong>Make a Diagonal Cut:</strong> Use sharp, sterilized shears to cut at a 45-degree angle, about 1 cm below the node.</li>
        <li><strong>Prune Extra Leaves:</strong> Take a 10-15 cm cutting and remove the lower leaves so they don't rot in the water. Leave only 2-3 leaves at the top.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">2. Container and Water Choice</h2>
      <p class="text-slate-600 mb-4">
        Clear glass is great for watching roots grow, but sunlight can cause algae growth which suffocates roots. Using dark or amber bottles simulates the darkness of soil, increasing rooting speed and preventing algae.
      </p>
      <p class="text-slate-600 mb-4">
        Never use tap water directly. Let it sit for 24 hours in an open container to dechlorinate and reach room temperature. Place the cutting so only the node is submerged.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">3. Preventing Root Rot</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>Change Water Regularly:</strong> Oxygen is key. Change the water every 5-7 days to keep it fresh and oxygenated.</li>
        <li><strong>Add Hydrogen Peroxide:</strong> To prevent fungus, add a few drops of 3% hydrogen peroxide to the water to eliminate bacteria and boost oxygen levels.</li>
        <li><strong>Indirect Light:</strong> Place the container in a bright area with filtered light. Direct hot sun will damage the cuttings.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">4. Transplanting to Soil Without Shock</h2>
      <p class="text-slate-600 mb-4">
        Water roots are fragile and need a gentle transition to soil:
      </p>
      <ol class="list-decimal list-inside space-y-3 text-slate-600 mb-6 ps-4">
        <li><strong>The 5 cm Rule:</strong> The best time to transplant is when roots are 2.5 to 5 cm long. If roots get too long, they will struggle to adapt to soil.</li>
        <li><strong>Light Potting Mix:</strong> Use a small pot with excellent drainage and a light soil mix of peat moss and perlite.</li>
        <li><strong>Keep Soil Moist Initially:</strong> For the first 7-10 days, keep the soil quite damp (like soft mud) to ease the transition. Gradually reduce watering to normal levels.</li>
        <li><strong>Humidity Cover:</strong> Placing a clear plastic bag over the pot for the first week keeps humidity high and prevents wilting.</li>
      </ol>
    `
  },
  {
    slug: "راهنمای-هیدروپونیک-به-زبان-ساده",
    lang: "fa",
    title: "راهنمای هیدروپونیک به زبان ساده: کشت بدون خاک چیست؟",
    description: "پرورش گیاه بدون خاک چطور کار می‌کند؟ در این مقاله با اصول پایه کشت هیدروپونیک خانگی، مزایا و بخش‌های مختلف آن آشنا می‌شوید.",
    category: "نگهداری",
    categoryEn: "care",
    publishedAt: "۶ تیر ۱۴۰۵",
    readTime: "۵ دقیقه",
    author: "علی سبزواری",
    icon: "Droplets",
    gradient: "from-sky-400 to-blue-600",
    keywords: ["کشت هیدروپونیک", "کشاورزی بدون خاک", "سیستم هیدروپونیک خانگی", "پرورش گیاه در آب", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        وقتی به کشاورزی یا پرورش گل و گیاه فکر می‌کنیم، اولین تصویری که به ذهنمان می‌رسد خاک، بیلچه و باغچه است. اما تصور کنید بتوانید بدون استفاده از حتی یک ذره خاک، زیباترین گل‌ها یا خوشمزه‌ترین سبزیجات را در خانه پرورش دهید! این روش جادویی، کشت هیدروپونیک (Hydroponics) یا همان آب‌کشت نام دارد.
      </p>
      
      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">هیدروپونیک به زبان خیلی ساده</h2>
      <p class="text-slate-600 mb-4">
        در کشاورزی سنتی، خاک دو کار اصلی انجام می‌دهد: گیاه را محکم سر جایش نگه می‌دارد و آب و مواد مغذی را در خود ذخیره می‌کند. اما واقعیت این است که گیاه برای رشد کردن اصلاً نیازی به خودِ خاک ندارد! گیاه به آب، اکسیژن و مواد مغذی نیاز دارد. در هیدروپونیک ما خاک را کاملاً حذف می‌کنیم و این مواد را به صورت مستقیم و در قالب یک «محلول غذایی» به ریشه می‌رسانیم.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">چرا ریشه گیاه در آب نمی‌پوسد؟</h2>
      <p class="text-slate-600 mb-4">
        پاسخ در یک کلمه است: اکسیژن. وقتی خاک گلدان معمولی بیش از حد خیس بماند، ریشه‌ها به دلیل کمبود اکسیژن خفه شده و می‌پوسند. اما در سیستم‌های هیدروپونیک، آب مدام در جریان است یا با استفاده از پمپ‌های هوا به آن اکسیژن تزریق می‌شود. ریشه‌ها در این روش هم‌زمان به آب، غذا و اکسیژن فراوان دسترسی دارند.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">مزایای شگفت‌انگیز هیدروپونیک</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>رشد فوق‌العاده سریع‌تر:</strong> در هیدروپونیک، غذا مستقیماً در اختیار ریشه است. در نتیجه گیاه تمام انرژی خود را صرف رشد برگ‌ها و میوه‌ها می‌کند و تا ۵۰ درصد سریع‌تر رشد می‌کند.</li>
        <li><strong>صرفه‌جویی عالی در مصرف آب:</strong> مصرف آب در این روش تا ۹۰ درصد کمتر از کشاورزی معمولی است؛ زیرا آب در یک چرخه بسته مدام گردش می‌کند و تبخیر یا جذب زمین نمی‌شود.</li>
        <li><strong>خداحافظی با آفات خاک‌زی:</strong> بیشتر آفات و قارچ‌ها از طریق خاک آلوده منتقل می‌شوند. بدون خاک، نیاز به سم‌پاشی‌های مضر و علف‌های هرز از بین می‌رود.</li>
        <li><strong>مناسب برای آپارتمان‌ها:</strong> بدون نیاز به گلدان‌های بزرگ و سنگین، می‌توانید گیاهان را به صورت عمودی پرورش دهید و از فضاها بیشترین استفاده را ببرید.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">یک سیستم هیدروپونیک ساده از چه بخش‌هایی تشکیل شده؟</h2>
      <p class="text-slate-600 mb-4">
        هر سیستم هیدروپونیک معمولاً از این چهار بخش تشکیل می‌شود:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>مخزن آب و مواد مغذی:</strong> ظرفی که آب و کودهای مخصوص هیدروپونیک در آن مخلوط می‌شوند.</li>
        <li><strong>پمپ اکسیژن:</strong> وسیله‌ای که اکسیژن را به ریشه‌ها می‌رساند (مانند پمپ آکواریوم).</li>
        <li><strong>بستر نگهدارنده بی‌اثر:</strong> موادی مثل پوکه معدنی (لیکا)، پرلیت یا الیاف نارگیل که هیچ ماده غذایی ندارند و فقط تکیه‌گاه فیزیکی گیاه هستند تا کج نشود.</li>
        <li><strong>نور کافی:</strong> نور طبیعی پشت پنجره یا لامپ‌های مخصوص رشد گیاه (LED).</li>
      </ul>
    `
  },
  {
    slug: "simple-hydroponics-guide",
    lang: "en",
    title: "A Simple Guide to Hydroponics: What is Soil-less Growing?",
    description: "Interested in growing plants without soil? Discover how home hydroponics works, its main advantages, and the components you need to start your first system.",
    category: "Care",
    categoryEn: "care",
    publishedAt: "June 26, 2026",
    readTime: "5 min",
    author: "Alex Green",
    icon: "Droplets",
    gradient: "from-sky-400 to-blue-600",
    keywords: ["hydroponics for beginners", "soil-less growing", "home hydroponic system", "growing in water", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        When we think about gardening, the first image that comes to mind is soil, trowels, and gardens. But imagine being able to grow beautiful flowers or delicious vegetables at home without using a single speck of soil! This method is called hydroponics.
      </p>
      
      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Hydroponics in Simple Terms</h2>
      <p class="text-slate-600 mb-4">
        In traditional farming, soil serves two purposes: keeping the plant upright and holding water and nutrients. But the truth is, plants don't actually need soil itself! They need the water, oxygen, and nutrients inside it. In hydroponics, we eliminate soil and deliver these nutrients directly via a water-based nutrient solution.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Why Don't Roots Rot in Water?</h2>
      <p class="text-slate-600 mb-4">
        The answer is simple: oxygen. In regular pots, overwatering drowns the roots because air pockets in the soil close up, leading to root rot. In hydroponics, the water is kept flowing or aerated using an air pump (like in aquariums). Roots get constant water, food, and oxygen, allowing them to thrive.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Key Advantages of Hydroponics</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>Faster Growth:</strong> Because nutrients are delivered directly to the roots, plants save energy and grow up to 50% faster than in soil. For example, lettuce is ready in 30 days instead of 50.</li>
        <li><strong>Huge Water Savings:</strong> Water usage is reduced by up to 90% since water circulates in a closed loop, rather than evaporating or sinking into the ground.</li>
        <li><strong>No Soil-Borne Pests:</strong> Without soil, pests, fungi, weeds, and the need for harmful chemical pesticides are significantly reduced.</li>
        <li><strong>Great for Small Spaces:</strong> You can stack systems vertically to grow food in tiny apartments or balconies.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Basic Components of a Hydroponic System</h2>
      <p class="text-slate-600 mb-4">
        A simple home setup usually consists of:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>Nutrient Reservoir:</strong> A tank where water is mixed with special hydroponic fertilizers containing all essential minerals.</li>
        <li><strong>Aerator:</strong> An air pump and air stone to dissolve oxygen into the water.</li>
        <li><strong>Inert Growing Medium:</strong> Materials like clay pebbles (LECA), perlite, or coco coir that provide physical support for the roots but contain no nutrients.</li>
        <li><strong>Light Source:</strong> Bright windows or LED grow lights.</li>
      </ul>
    `
  },
  {
    slug: "علت-زرد-شدن-برگ-گیاهان",
    lang: "fa",
    title: "راهنمای کاربردی عیب‌یابی و درمان زرد شدن برگ گیاهان آپارتمانی",
    description: "زرد شدن برگ گیاه نشانه چیست؟ در این راهنمای کاربردی علل اصلی زردی برگ‌ها شامل آبیاری نامناسب، نور، آفات و کمبود مواد مغذی را به سرعت تشخیص داده و درمان کنید.",
    category: "نگهداری",
    categoryEn: "care",
    publishedAt: "۲۶ ژوئن ۲۰۲۶",
    readTime: "۶ دقیقه",
    author: "سارا گل‌پرور",
    icon: "Droplets",
    gradient: "from-amber-400 to-yellow-600",
    keywords: ["علت زرد شدن برگ گیاهان", "درمان زردی برگ", "آبیاری زیاد گیاه آپارتمانی", "کمبود آهن گیاه", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        زرد شدن برگ‌ها یکی از رایج‌ترین نشانه‌هایی است که نشان می‌دهد گیاه آپارتمانی شما با مشکلی در محیط نگهداری خود مواجه شده است. برگ‌های زرد در واقع مانند یک زنگ خطر عمل می‌کنند؛ اما تشخیص علت دقیق این اتفاق گاهی دشوار است.
      </p>
      
      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۱. آبیاری نامناسب: رایج‌ترین علت زردی برگ‌ها</h2>
      <p class="text-slate-600 mb-4">
        تنظیم میزان آب، مهم‌ترین بخش از نگهداری گیاهان آپارتمانی است:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>آبیاری بیش از حد (خفگی ریشه):</strong> زردی معمولاً از برگ‌های قدیمی‌تر و پایینی شروع شده و به سمت بالا می‌رود. برگ‌های زرد شده حالتی نرم، پژمرده و آبکی دارند و خاک برای مدت طولانی خیس می‌ماند.</li>
        <li><strong>کم‌آبی و خشکی کشیدن گیاه:</strong> زردی معمولاً از لبه‌ها و نوک برگ‌ها شروع می‌شود و این بخش‌ها حالتی خشک، شکننده و کاغذی پیدا می‌کنند و خاک کاملاً خشک و سبک است.</li>
      </ul>
      <p class="text-slate-600 mb-4">
        <strong>راهکار:</strong> برای آبیاری زیاد، اجازه دهید خاک کاملاً خشک شود و زهکشی گلدان را بررسی کنید. برای کم‌آبی نیز آبیاری عمیق انجام دهید تا آب از ته گلدان خارج شود.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۲. نور نامناسب محیط</h2>
      <p class="text-slate-600 mb-4">
        کمبود نور باعث زرد شدن برگ‌های پایینی و رشد ضعیف گیاه می‌شود زیرا توانایی فتوسنتز کاهش می‌یابد. از طرفی نور مستقیم آفتاب شدید باعث ایجاد سوختگی و لکه‌های زرد و قهوه‌ای خشک روی برگ‌ها می‌شود.
      </p>
      <p class="text-slate-600 mb-4">
        <strong>راهکار:</strong> اکثر گیاهان آپارتمانی نور روشن اما غیرمستقیم (مانند پشت پرده توری پنجره جنوبی یا شرقی) را ترجیح می‌دهند.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۳. کمبودهای تغذیه‌ای و نیاز به کوددهی</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>کمبود نیتروژن:</strong> ابتدا برگ‌های قدیمی و پایینی به طور یکدست رنگ‌پریده و زرد می‌شوند.</li>
        <li><strong>کمبود آهن (کلروز):</strong> برگ‌های جدید و جوان در بالای گیاه زرد می‌شوند اما رگبرگ‌های آن‌ها کاملاً سبز باقی می‌مانند.</li>
        <li><strong>کمبود منیزیم:</strong> باعث زرد شدن فضای بین رگبرگ‌های برگ‌های قدیمی می‌شود.</li>
      </ul>
      <p class="text-slate-600 mb-4">
        <strong>راهکار:</strong> در بهار و تابستان از یک کود مایع متعادل گیاهان آپارتمانی استفاده کنید.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۴. نوسانات دمایی و جریان باد سرد</h2>
      <p class="text-slate-600 mb-4">
        قرار گرفتن گلدان در معرض باد مستقیم کولر گازی، یا باد سرد پنجره در زمستان، شوک دمایی ایجاد کرده و برگ‌ها را زرد و بی‌حال می‌کند. همچنین نزدیکی به بخاری و رادیاتور لبه برگ‌ها را زرد و خشک می‌کند.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۵. آفات و بیماری‌های گیاهی</h2>
      <p class="text-slate-600 mb-4">
        حشرات مکنده مثل کنه تارعنکبوتی و شته‌ها با خوردن شیره گیاه لکه‌های زرد نقطه‌ای ایجاد می‌کنند. پشه‌های سیاه خاک نیز ریشه را جویده و باعث زردی کلی گیاه می‌شوند.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۶. پیری طبیعی برگ‌ها</h2>
      <p class="text-slate-600 mb-4">
        اگر زردی فقط به صورت تک برگ در پایین‌ترین قسمت گیاه رخ می‌دهد و برگ‌های بالای آن شاداب و در حال رشد هستند، این یک روند طبیعی پیری بیولوژیک است و جای نگرانی ندارد.
      </p>
    `
  },
  {
    slug: "why-plant-leaves-turn-yellow",
    lang: "en",
    title: "A Practical Guide to Diagnosing and Treating Yellow Houseplant Leaves",
    description: "Yellow leaves are a warning sign. Learn how to quickly diagnose the root cause—whether it is watering issues, light, nutrient deficiencies, or pests—and save your plant.",
    category: "Care",
    categoryEn: "care",
    publishedAt: "June 26, 2026",
    readTime: "6 min",
    author: "Sarah Flower",
    icon: "Droplets",
    gradient: "from-amber-400 to-yellow-600",
    keywords: ["yellow plant leaves", "how to treat yellow leaves", "overwatered houseplants", "iron deficiency in plants", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        Yellowing leaves are one of the most common signs that your houseplant is facing stress in its environment. Think of them as a distress call—but diagnosing the exact cause can be tricky because watering, lighting, pests, and nutrients can all cause a similar reaction.
      </p>
      
      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">1. Improper Watering: The Number One Culprit</h2>
      <p class="text-slate-600 mb-4">
        Watering is the most critical element of plant care. Both overwatering and underwatering cause yellowing, but their appearances differ:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>Overwatering (Root Suffocation):</strong> Yellowing starts from the lower, older leaves and moves up. Leaves feel soft, limp, and waterlogged, and the soil remains wet for a long time.</li>
        <li><strong>Underwatering (Dehydration):</strong> Leaves start yellowing at the tips and edges, becoming dry, crispy, and paper-like. The pot feels very light.</li>
      </ul>
      <p class="text-slate-600 mb-4">
        <strong>Fix:</strong> For overwatered plants, stop watering and check drainage. For dehydrated plants, give them a slow, deep soak.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">2. Poor Lighting</h2>
      <p class="text-slate-600 mb-4">
        Too little light prevents the plant from producing chlorophyll, causing lower leaves to turn pale yellow. Conversely, too much direct hot sun burns leaves, leaving yellow and brown dry scorch spots.
      </p>
      <p class="text-slate-600 mb-4">
        <strong>Fix:</strong> Move your plant to bright, indirect light (e.g. near an east or south-facing window behind a sheer curtain).
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">3. Nutrient Deficiencies</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>Nitrogen Deficiency:</strong> Older, lower leaves turn completely pale yellow first.</li>
        <li><strong>Iron Deficiency (Chlorosis):</strong> New, young leaves at the top turn yellow while the veins stay bright green.</li>
        <li><strong>Magnesium Deficiency:</strong> Causes yellowing between the veins of older leaves.</li>
      </ul>
      <p class="text-slate-600 mb-4">
        <strong>Fix:</strong> Feed your plants with a balanced liquid houseplant fertilizer during the spring and summer growing season.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">4. Temperature Fluctuations & Drafts</h2>
      <p class="text-slate-600 mb-4">
        Cold drafts from windows or air conditioners shock plants, causing sudden yellowing. Heat from radiators or heaters dries them out, causing crispy leaf edges.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">5. Pests and Diseases</h2>
      <p class="text-slate-600 mb-4">
        Sap-sucking insects like spider mites and aphids leave tiny yellow stippling spots on leaves. Fungus gnat larvae feed on roots, causing general yellowing.
      </p>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">6. Natural Aging</h2>
      <p class="text-slate-600 mb-4">
        If only one or two oldest leaves at the very bottom turn yellow and drop while new growth at the top is healthy, this is natural aging. No treatment is needed.
      </p>
    `
  },
  {
    slug: "مقاوم-ترین-گیاهان-آپارتمانی",
    lang: "fa",
    title: "معرفی مقاوم‌ترین و جان‌سخت‌ترین گیاهان آپارتمانی دنیا",
    description: "اگر نگران خراب شدن گیاهان خود هستید، با این ۵ گیاه فوق‌العاده مقاوم، براق و زیبا آشنا شوید که تقریباً در هر شرایطی زنده می‌مانند.",
    category: "معرفی گیاهان",
    categoryEn: "plants",
    publishedAt: "۲۶ ژوئن ۲۰۲۶",
    readTime: "۵ دقیقه",
    author: "علی سبزواری",
    icon: "Sprout",
    gradient: "from-emerald-400 to-green-600",
    keywords: ["مقاوم ترین گیاهان آپارتمانی", "زاموفیلیا", "سانسوریا", "گیاهان جان سخت", "جالیز"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        در این مقاله می‌خواهیم مقاوم‌ترین و بی‌دردسرترین گیاهان آپارتمانی را به شما معرفی کنیم که حتی در شرایط نور کم یا فراموشی در آبیاری، باز هم زنده و سرسبز می‌مانند.
      </p>
      
      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">راز جان‌سخت بودن این گیاهان در چیست؟</h2>
      <p class="text-slate-600 mb-4">
        طبیعت به این گیاهان ابزارهای ویژه‌ای داده است تا در سخت‌ترین شرایط اقلیمی زنده بمانند:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>ذخیره آب هوشمند:</strong> گیاهانی مثل سانسوریا منافذ برگ‌های خود را در طول روز کاملاً می‌بندند تا آب تبخیر نشود و در عوض شب‌ها که هوا خنک است نفس می‌کشند.</li>
        <li><strong>غده‌های زیرزمینی:</strong> گیاهانی مثل زاموفیلیا غده‌هایی شبیه سیب‌زمینی (ریزوم) در زیر خاک دارند که آب را ذخیره کرده و هفته‌ها بی‌نیازی از آب را تضمین می‌کنند.</li>
        <li><strong>لایه محافظ مومی:</strong> برگ‌های ضخیم و براق گیاهانی مثل برگ عبایی دارای لایه‌ای مومی هستند که جلوی هدر رفتن رطوبت را می‌گیرد.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">معرفی ۵ قهرمان جان‌سخت آپارتمانی</h2>
      <ol class="list-decimal list-inside space-y-3 text-slate-600 mb-6 ps-4">
        <li><strong>سانسوریا (Sansevieria):</strong> قهرمان شماره یک مقاومت و تصفیه هوا. این گیاه در تاریک‌ترین گوشه‌های خانه زنده می‌ماند و طبق تایید ناسا سموم هوا را فیلتر می‌کند. تنها راه کشتن آن آبیاری بیش از حد است.</li>
        <li><strong>زاموفیلیا (ZZ Plant):</strong> سنگ صبور آپارتمان‌ها. با برگ‌های براق و چرمی که شبیه گیاهان مصنوعی است. در محیط‌های اداری تاریک رشد می‌کند و به خشکی طولانی خاک مقاوم است.</li>
        <li><strong>پتوس (Pothos):</strong> رونده محبوب و بی‌ادعا. در هر نوری رشد می‌کند و ریشه‌های هوایی آن رطوبت را جذب می‌کنند.</li>
        <li><strong>برگ عبایی (Cast Iron Plant):</strong> معروف به گیاه چدنی. با خاکی ضعیف، تاریکی زیاد، گرد و غبار و نوسانات دما کنار می‌آید. رشد کندی دارد و نیاز به کود کمی دارد.</li>
        <li><strong>اسپاتی فیلوم (Peace Lily):</strong> گل صلح و شاخص زنده تشنگی. برعکس بقیه، خاک مرطوب را دوست دارد. وقتی تشنه می‌شود شل شده و می‌افتد و بلافاصله پس از آبیاری دوباره سرپا می‌شود.</li>
      </ol>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">۳ قانون طلایی برای نگهداری از گیاهان جان‌سخت</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>قانون انگشت در خاک:</strong> قبل از آبیاری انگشت خود را تا بند دوم (۵ سانتی‌متر) در خاک فرو کنید. اگر کاملاً خشک بود آب بدهید.</li>
        <li><strong>زهکشی عالی:</strong> گلدان حتماً باید سوراخ تخلیه آب داشته باشد و خاک سبک باشد تا ریشه‌ها خفه نشوند.</li>
        <li><strong>غبارزدایی برگ‌ها:</strong> هر چند هفته یک بار با دستمال مرطوب برگ‌ها را تمیز کنید تا تنفس و فتوسنتز گیاه بهتر انجام شود.</li>
      </ul>
    `
  },
  {
    slug: "most-resilient-houseplants",
    lang: "en",
    title: "The Most Resilient and Hard-to-Kill Houseplants for Beginners",
    description: "New to gardening or busy with work? Meet these 5 incredibly hardy, beautiful houseplants that survive almost any indoor environment with minimal care.",
    category: "Plants",
    categoryEn: "plants",
    publishedAt: "June 26, 2026",
    readTime: "5 min",
    author: "Alex Green",
    icon: "Sprout",
    gradient: "from-emerald-400 to-green-600",
    keywords: ["unkillable houseplants", "hard to kill plants", "snake plant care", "zz plant care", "jaliz"],
    content: `
      <p class="lead text-lg text-slate-600 mb-6 font-medium">
        In this guide, we introduce the most resilient and low-maintenance houseplants that stay green and alive even in low light or when you forget to water them.
      </p>
      
      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">What Makes These Plants So Resilient?</h2>
      <p class="text-slate-600 mb-4">
        Nature has provided these plants with specific tools to survive extreme conditions:
      </p>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>Smart Water Retention:</strong> Plants like the Snake Plant close their pores during the day to prevent evaporation, breathing only at night when it's cooler.</li>
        <li><strong>Underground Bulbs:</strong> Plants like the ZZ Plant have underground potato-like tubers (rhizomes) that store water, helping them go weeks without watering.</li>
        <li><strong>Protective Waxy Layer:</strong> Waxy, thick leaves on plants like the Cast Iron Plant protect them from drying out in dry indoor air.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">Our Top 5 Unkillable Houseplant Heroes</h2>
      <ol class="list-decimal list-inside space-y-3 text-slate-600 mb-6 ps-4">
        <li><strong>Snake Plant (Sansevieria):</strong> The ultimate survivor. Thrives in dark corners and is scientifically proven by NASA to filter indoor air toxins. Only overwatering can kill it.</li>
        <li><strong>ZZ Plant (Zamioculcas Zamiifolia):</strong> The absolute champion of dark corridors. Features shiny, waxy leaves and handles long dry periods easily.</li>
        <li><strong>Pothos:</strong> The beloved vining plant. Adapts to almost any light level, and its aerial roots absorb ambient humidity.</li>
        <li><strong>Cast Iron Plant (Aspidistra Elatior):</strong> True to its name, it handles poor soil, low light, dust, and temperature drops. Requires very little fertilizer.</li>
        <li><strong>Peace Lily (Spathiphyllum):</strong> The dramatic communicator. Unlike the others, it prefers moist soil. When thirsty, it visibly droops, bouncing back to life within hours of watering.</li>
      </ol>

      <h2 class="text-xl font-bold text-slate-800 mt-8 mb-4">3 Golden Rules for Easy Care</h2>
      <ul class="list-disc list-inside space-y-2 text-slate-600 mb-6 ps-4">
        <li><strong>The Soil Finger Test:</strong> Insert your finger 2 inches deep. Water only if the soil is completely dry.</li>
        <li><strong>Good Drainage:</strong> Always use pots with drainage holes and light, aerated soil to prevent root suffocation.</li>
        <li><strong>Dust the Leaves:</strong> Wipe the leaves with a damp cloth every few weeks so the plant can breathe and photosynthesize properly.</li>
      </ul>
    `
  }
];

export const blogPosts: BlogPost[] = [...newBlogPosts, ...existingBlogPosts]

