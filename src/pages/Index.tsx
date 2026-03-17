import MatrixRain from "@/components/MatrixRain";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedGames from "@/components/FeaturedGames";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen matrix-grid">
      <MatrixRain />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedGames />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
