import Navbar from "@/components/sections/navbar";
import Hero from "@/components/sections/hero";
import FeaturesSection from "@/components/ui/ruixen-bento-cards";
import { Footer } from "@/components/ui/footer-section";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0B0C] selection:bg-brand-purple/30 selection:text-white">
      <Navbar />
      <Hero />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
