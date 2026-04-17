import Footer from "@/components/Footer";
import HeroSection from "@/components/landingpage/HeroSection";
import HowItWorksSection from "@/components/landingpage/HowItWorksSection";
import StudentStoriesSection from "@/components/landingpage/StudentStoriesSection";
import FinalCtaSection from "@/components/landingpage/FinalCtaSection";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[90vh]">
        <HeroSection />
        <HowItWorksSection />
        <StudentStoriesSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
