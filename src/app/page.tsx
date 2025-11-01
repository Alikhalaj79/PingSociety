import Header from "@/components/Header";
import Hero from "@/components/homePage/Hero";
import Subtitle from "@/components/ui/Subtitle";
import About from "@/components/homePage/About";
import Events from "@/components/homePage/Events";
import Gallery from "@/components/homePage/Gallery";
import Registration from "@/components/homePage/Registration";
import Footer from "@/components/homePage/Footer";

export default function Home() {
  return (
    <div className="min-h-screen text-white">
      <Header />
      <Hero />
      <Subtitle />
      <About />
      <Gallery />
      <Events />
      {/* <Registration /> */}
      <Footer />
    </div>
  );
}
