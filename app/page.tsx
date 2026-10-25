import Navbar from "@/components/Navbar";
import HeroAccueil from "@/components/accueil/HeroAccueil";
import LaboratoireMaths from "@/components/accueil/LaboratoireMaths";
import SectionIAMaths from "@/components/accueil/SectionIAMaths";
import AvantagesFahimta from "@/components/accueil/AvantagesFahimta";
import MosaiquePhotosEleves from "@/components/MosaiquePhotosEleves";
import ClassesBand from "@/components/ClassesBand";
import Features from "@/components/Features";
import StatsStrip from "@/components/StatsStrip";
import CtaBlock from "@/components/CtaBlock";
import Footer from "@/components/Footer";
import InstallationPwaBanniere from "@/components/InstallationPwaBanniere";

export default function Home() {
  return (
    <>
      <InstallationPwaBanniere />
      <Navbar />
      <main className="flex-1">
        <HeroAccueil mosaique={<MosaiquePhotosEleves />} />
        <LaboratoireMaths />
        <SectionIAMaths />
        <ClassesBand />
        <Features />
        <AvantagesFahimta />
        <StatsStrip />
        <CtaBlock />
      </main>
      <Footer />
    </>
  );
}
