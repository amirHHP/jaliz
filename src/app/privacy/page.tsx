"use client"

import Link from "next/link"
import { useLanguage } from "@/components/LanguageProvider"
import { Header } from "@/components/Header"
import { Shield, ChevronLeft, ChevronRight, CheckCircle2, Lock, Eye, FileText } from "lucide-react"

export default function PrivacyPage() {
  const { language } = useLanguage()
  const isRtl = language === "fa"

  return (
    <div className="min-h-screen bg-[#fcfaf8] selection:bg-emerald-200 selection:text-emerald-900" dir={isRtl ? "rtl" : "ltr"}>
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            {isRtl ? "خانه" : "Home"}
          </Link>
          {isRtl ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          <span className="text-slate-600">{isRtl ? "سیاست حفظ حریم خصوصی" : "Privacy Policy"}</span>
        </nav>

        {/* Title Card */}
        <div className="relative overflow-hidden rounded-3xl shadow-md bg-white border border-slate-200/60 p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6">
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-50/50 blur-2xl" />
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 shadow-inner">
            <Shield className="h-8 w-8 text-emerald-600" />
          </div>
          <div className="space-y-2 text-center md:text-start grow">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {isRtl ? "سیاست حفظ حریم خصوصی کاربران جالیز" : "Jaliz Privacy Policy"}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {isRtl ? "آخرین به‌روزرسانی: ۲ تیر ۱۴۰۵" : "Last updated: June 22, 2026"}
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-10 shadow-sm space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
          {isRtl ? (
            <>
              <p className="lead text-base font-semibold text-slate-900">
                اپلیکیشن «جالیز» متعهد به حفظ حریم خصوصی و امنیت اطلاعات کاربران خود است. در این سند، نحوه جمع‌آوری، استفاده و حفاظت از اطلاعات شما شرح داده می‌شود.
              </p>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  ۱. اطلاعاتی که جمع‌آوری می‌کنیم
                </h2>
                <p>برای ارائه خدمات مطلوب، جالیز اطلاعات زیر را از شما دریافت می‌کند:</p>
                <ul className="list-disc list-inside space-y-2 ps-4">
                  <li><strong>اطلاعات حساب کاربری:</strong> شامل نام و نام خانوادگی، شماره تلفن همراه، آدرس ایمیل و تصویر پروفایل که هنگام ثبت‌نام یا ویرایش پروفایل ارائه می‌دهید.</li>
                  <li><strong>اطلاعات گیاهان:</strong> نام، نوع، نیازهای نوری، خاک، تصاویر بارگذاری شده از گیاهان و گزارش‌های آبیاری جهت ایجاد شناسنامه گیاه.</li>
                  <li><strong>اطلاعات موقعیت مکانی:</strong> شهر یا منطقه جغرافیایی شما (که به صورت اختیاری در تنظیمات وارد می‌کنید) جهت ارائه توصیه‌های هواشناسی اختصاصی کشاورزی.</li>
                  <li><strong>اطلاعات بازارچه:</strong> اطلاعات آگهی‌ها (عنوان، توضیحات، قیمت، تصاویر و شماره تماس آگهی) و پیام‌های ردوبدل شده بین خریدار و فروشنده در چت داخلی برنامه.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Eye className="h-5 w-5 text-emerald-600" />
                  ۲. علت استفاده از اطلاعات
                </h2>
                <p>ما از اطلاعات شما برای اهداف زیر استفاده می‌کنیم:</p>
                <ul className="list-disc list-inside space-y-2 ps-4">
                  <li>ایجاد و مدیریت حساب کاربری شما و احراز هویت.</li>
                  <li>ارسال یادآوری‌های هوشمند آبیاری و نگهداری شخصی‌سازی شده.</li>
                  <li>پردازش تصاویر گیاهان به وسیله هوش مصنوعی جهت تشخیص بیماری‌ها.</li>
                  <li>امکان برقراری ارتباط میان خریداران و فروشندگان در بازارچه جالیز.</li>
                  <li>بهبود مستمر عملکرد اپلیکیشن و رفع باگ‌های فنی.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Lock className="h-5 w-5 text-emerald-600" />
                  ۳. نحوه محافظت و امنیت اطلاعات
                </h2>
                <p>
                  امنیت داده‌های شما اولویت ماست. ما از پروتکل‌های انتقال داده امن (HTTPS)، تکنیک‌های رمزنگاری پیشرفته برای رمزهای عبور و پایگاه داده‌های محافظت‌شده استفاده می‌کنیم تا مانع از دسترسی‌های غیرمجاز شویم.
                </p>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    جالیز تعهد تام می‌دهد که اطلاعات شخصی شما نزد ما محفوظ است، به هیچ عنوان مورد سوءاستفاده قرار نخواهد گرفت و تحت هیچ شرایطی در اختیار شخص حقیقی، حقوقی یا سازمان‌های ثالث قرار داده نخواهد شد.
                  </span>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  ۴. حقوق شما
                </h2>
                <p>
                  شما در هر زمان می‌توانید با مراجعه به بخش تنظیمات برنامه، اطلاعات حساب کاربری و موقعیت خود را ویرایش یا اصلاح نمایید. همچنین در صورت نیاز به حذف کامل حساب کاربری و تمامی داده‌های مرتبط، می‌توانید با پشتیبانی جالیز مکاتبه کنید.
                </p>
              </section>
            </>
          ) : (
            <>
              <p className="lead text-base font-semibold text-slate-900">
                The "Jaliz" application is committed to protecting the privacy and security of its users. This policy outlines how we collect, use, and safeguard your personal data.
              </p>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  1. Information We Collect
                </h2>
                <p>To provide high-quality services, Jaliz collects the following information:</p>
                <ul className="list-disc list-inside space-y-2 ps-4">
                  <li><strong>Account Information:</strong> Full name, phone number, email address, and profile picture (avatar) provided during registration or profile updates.</li>
                  <li><strong>Plant Information:</strong> Name, type, lighting/soil preferences, watering logs, and uploaded plant photos.</li>
                  <li><strong>Location Data:</strong> Your city or geographic region (optional) to deliver localized agricultural weather warnings.</li>
                  <li><strong>Marketplace Data:</strong> Ad listings (title, descriptions, prices, photos, and contact phone numbers) and chat history between buyers and sellers.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Eye className="h-5 w-5 text-emerald-600" />
                  2. How We Use Your Information
                </h2>
                <p>We process your data for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ps-4">
                  <li>To authenticate your identity and manage your account.</li>
                  <li>To generate smart, personalized watering and care schedules.</li>
                  <li>To analyze plant images via AI for health diagnostics.</li>
                  <li>To enable in-app secure communication between P2P buyers and sellers.</li>
                  <li>To monitor app performance and solve technical bugs.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Lock className="h-5 w-5 text-emerald-600" />
                  3. Data Security and Sharing
                </h2>
                <p>
                  We utilize secure communication channels (HTTPS), advanced password hashing, and encrypted databases to prevent unauthorized data access.
                </p>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Jaliz guarantees that your personal data is protected, will never be misused, and will under no circumstances be shared with third parties or advertising organizations.
                  </span>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
