import Image from "next/image";
import Container from "../Container";

export default function Hero() {
  return (
    <section className="min-h-[80vh] flex items-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-4 sm:pt-6 md:pt-8">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Soft gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>

        {/* Enhanced background blobs */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 bg-gradient-to-r from-purple-500/15 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <Container className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center z-10">
        {/* Text Content - Mobile: Top, Desktop: Right */}
        <div className="text-center lg:text-right order-1 lg:order-2">
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 lg:mb-8 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent font-poppins relative z-20 leading-tight">
            PingSociety
          </h1>

          <div className="mb-6 sm:mb-8 lg:mb-12">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto lg:ml-auto leading-relaxed">
              Tech دور همی بچه ها
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-end mb-6 sm:mb-8 lg:mb-12">
            <button className="bg-white text-black px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg text-sm sm:text-base md:text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              ثبت‌نام کنید
            </button>
            <button className="border border-white/30 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg text-sm sm:text-base md:text-lg font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
              بیشتر بدانید
            </button>
          </div>
        </div>

        {/* Images - Mobile: Bottom Center, Desktop: Left */}
        <div className="relative order-2 lg:order-1 flex justify-center lg:justify-start">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
            <div
              className="w-32 h-32 xs:w-36 xs:h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-lg overflow-hidden transform transition-all duration-700 ease-out hover:scale-105 hover:rotate-1 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <Image
                src="/heroSectionImages/img-1.JPG"
                alt="Hero Image 1"
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="w-32 h-32 xs:w-36 xs:h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-lg overflow-hidden mt-3 sm:mt-4 md:mt-5 lg:mt-6 xl:mt-8 transform transition-all duration-700 ease-out hover:scale-105 hover:-rotate-1 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Image
                src="/heroSectionImages/img-2.jpg"
                alt="Hero Image 2"
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="w-32 h-32 xs:w-36 xs:h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-lg overflow-hidden -mt-3 sm:-mt-4 md:-mt-5 lg:-mt-6 xl:-mt-8 transform transition-all duration-700 ease-out hover:scale-105 hover:rotate-1 animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <Image
                src="/heroSectionImages/img-3.jpg"
                alt="Hero Image 3"
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="w-32 h-32 xs:w-36 xs:h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-lg overflow-hidden transform transition-all duration-700 ease-out hover:scale-105 hover:-rotate-1 animate-fade-in-up"
              style={{ animationDelay: "0.7s" }}
            >
              <Image
                src="/heroSectionImages/img-4.jpg"
                alt="Hero Image 4"
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
