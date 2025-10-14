import { SmallContainer } from "../Container";

export default function About() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#0c0c22]">
      <SmallContainer className="text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8">
          درباره ایونت
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-white leading-relaxed">
          ما هر سری یه موضوع برای ایونت در نظر می‌ گیریم و حول محور اون موضوع
          صحبت می‌ کنیم. تسهیل‌ گرامون بحث رو شروع می کنن و همه‌ی ما داخل اون
          بحث شرکت می‌ کنیم. موضوع‌ ها می‌ تونه درباره‌ی دغدغه‌ ها، ایده‌ ها،
          مشکلاتی که باهاش دست و پنجه نرم می‌ کنیم، فرصت‌ ها یا تجربه‌ هامون
          باشه. توی این دورهمی سعی می‌ کنیم فضایی تعاملی داشته باشیم و با هم گپ
          و گفت داشته باشیم. می‌ تو نیم با افرادی مثل خودمون که تو حوزه‌ی تک
          فعالیت می‌ کنن آشنا بشیم و شبکه‌سازی کنیم. همچنین سعی می‌ کنیم فضایی
          خودمونی و راحت ایجاد کنیم تا چند ساعتی که با هم هستیم، هم خوش بگذره و
          هم برامون مفید باشه
        </p>
      </SmallContainer>
    </section>
  );
}
