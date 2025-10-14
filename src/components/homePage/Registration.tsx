import { SmallContainer } from "../Container";

export default function Registration() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#0C0C22]">
      <SmallContainer>
        <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20 text-center shadow-2xl transition-all duration-300 ease-out hover:border-white/60 hover:shadow-4xl hover:shadow-white/20">
          <h4 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6">
            ایونت بعدی رو از دست نده
          </h4>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
            ثبت نام
          </p>
          <button className="bg-white text-black px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base md:text-lg font-semibold hover:bg-gray-100 hover:scale-105 hover:shadow-lg transition-all duration-300 transform cursor-pointer">
            ثبت‌ نام کنید
          </button>
        </div>
      </SmallContainer>
    </section>
  );
}
