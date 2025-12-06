import Image from "next/image";
import { SiGmail } from "react-icons/si";
import { FaLinkedinIn, FaTelegramPlane } from "react-icons/fa";
import { FiInstagram } from "react-icons/fi";
import Container from "../Container";

export default function Footer() {
  return (
    <footer className="bg-[#080358] py-3 sm:py-4 border-t border-white/10">
      <Container className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <div className="mb-4 md:mb-0 flex items-center gap-4">
            <div className="mb-0 mt-0">
              <Image
                src="/logo2.png"
                alt="PingSociety Logo"
                width={300}
                height={100}
                className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-30 w-auto"
              />
            </div>
            <div>
              <a
                referrerPolicy="origin"
                target="_blank"
                href="https://trustseal.enamad.ir/?id=662669&Code=Cm1S5DgXslvJgpW8e6YwJFXvK9J21gAZ"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  referrerPolicy="origin"
                  src="https://trustseal.enamad.ir/logo.aspx?id=662669&Code=Cm1S5DgXslvJgpW8e6YwJFXvK9J21gAZ"
                  alt="eNamad Trust Seal"
                  style={{ cursor: "pointer" }}
                  data-code="Cm1S5DgXslvJgpW8e6YwJFXvK9J21gAZ"
                  className="h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 w-auto"
                />
              </a>
            </div>
          </div>

          <div className="flex gap-4 sm:gap-6 text-gray-400">
            <a
              href="mailto:contact@pingsociety.ir"
              className="hover:text-white transition-colors relative group"
            >
              <SiGmail size={24} />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                contact@pingsociety.ir
              </div>
            </a>
            <a
              href="https://www.linkedin.com/company/pingsociety"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors relative group"
            >
              <FaLinkedinIn size={24} />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                linkedin.com/company/pingsociety
              </div>
            </a>
            <a
              href="https://www.instagram.com/thepingsociety"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors relative group"
            >
              <FiInstagram size={24} />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                instagram.com/thepingsociety
              </div>
            </a>
            <a
              href="https://t.me/pingsociety"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors relative group"
            >
              <FaTelegramPlane size={24} />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                t.me/pingsociety
              </div>
            </a>
          </div>
        </div>

        {/* Soft line separator */}
        <div className="border-t border-white/10 mt-4 sm:mt-6 mb-3 sm:mb-4"></div>

        {/* Copyright */}
        <div className="text-center text-gray-400 text-xs sm:text-sm" dir="rtl">
          <span>© تمامی حقوق متعلق به </span>
          <span dir="ltr" className="inline">
            PingSociety
          </span>
          <span> می‌باشد</span>
        </div>
      </Container>
    </footer>
  );
}
