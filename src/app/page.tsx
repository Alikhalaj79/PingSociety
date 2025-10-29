import Header from "@/components/Header";
import Hero from "@/components/homePage/Hero";
import About from "@/components/homePage/About";
import Events from "@/components/homePage/Events";
import Gallery from "@/components/homePage/Gallery";
import Registration from "@/components/homePage/Registration";
import Footer from "@/components/homePage/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <Hero />
      <About />
      <Events />
      <Gallery />
      <Registration />
      <Footer />
    </div>
  );
}
