import { useState } from "react";
import Header from "@/components/Header";
import NavPanel from "@/components/NavPanel";
import HeroSection from "@/components/HeroSection";

const Index = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    // Navigation is handled by NavPanel links
  };

  return (
    <div className="min-h-screen">
      <Header onMenuToggle={() => setIsNavOpen(true)} />
      <NavPanel
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      <HeroSection />
    </div>
  );
};

export default Index;