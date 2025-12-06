import { SmallContainer } from "../Container";

export default function About() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <SmallContainer>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-center">
          <span className="text-[#080358]">درباره</span>{" "}
          <span className="text-[#f84920]">ایونت</span>
        </h2>
        <p
          className="text-lg sm:text-xl md:text-2xl text-[#080358] font-bold leading-relaxed"
          style={{ textAlign: "justify", direction: "rtl" }}
        >
          ما هر سری یه موضوع برای ایونت در نظر می‌ گیریم و حول محور اون موضوع
          صحبت می‌ کنیم. تسهیل‌ گرامون بحث رو شروع می کنن و همه‌ی ما داخل اون
          بحث شرکت می‌ کنیم. موضوع‌ ها می‌ تونه درباره‌ی{" "}
          <span className="text-[#f84920]">دغدغه‌ ها</span>،{" "}
          <span className="text-[#f84920]">ایده‌ ها</span>،
          <span className="text-[#f84920]"> مشکلاتی</span> که باهاش دست و پنجه
          نرم می‌ کنیم، فرصت‌ ها یا تجربه‌ هامون باشه. توی این دورهمی سعی می‌
          کنیم <span className="text-[#f84920]">فضایی تعاملی</span> داشته باشیم
          و با هم <span className="text-[#f84920]">گپ و گفت</span> داشته باشیم.
          می‌ تو نیم با افرادی مثل خودمون که تو حوزه‌ی تک فعالیت می‌ کنن{" "}
          <span className="text-[#f84920]">آشنا بشیم و شبکه‌سازی</span> کنیم.
          همچنین سعی می‌ کنیم{" "}
          <span className="text-[#f84920]">فضایی خودمونی</span> و راحت ایجاد
          کنیم تا چند ساعتی که با هم هستیم، هم{" "}
          <span className="text-[#f84920]">خوش بگذره</span> و هم برامون مفید
          باشه
        </p>
      </SmallContainer>
    </section>
  );
}
