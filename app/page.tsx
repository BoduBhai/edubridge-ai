import Footer from "@/app/components/Footer";
import HeroSection from "@/app/components/HeroSection";
import HowItWorksSection from "@/app/components/HowItWorksSection";
import StudentStoriesSection from "@/app/components/StudentStoriesSection";
import FinalCtaSection from "@/app/components/FinalCtaSection";
import Navbar from "@/app/components/Navbar";

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
