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

export const blogPosts: BlogPost[] = [
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
  }
];
