import Navbar from "@/components/Navbar";
import HeroCarousel from "@/components/HeroCarousel";
import MosaiquePhotosEleves from "@/components/MosaiquePhotosEleves";
import ClassesBand from "@/components/ClassesBand";
import Features from "@/components/Features";
import StatsStrip from "@/components/StatsStrip";
import CtaBlock from "@/components/CtaBlock";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroCarousel mosaique={<MosaiquePhotosEleves />} />
        <ClassesBand />
        <Features />
        <StatsStrip />
        <CtaBlock />
      </main>
      <Footer />
    </>
  );
}
