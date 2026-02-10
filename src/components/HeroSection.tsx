import { useRef, useState, useEffect } from "react";
import {
  ChevronDown,
  Check,
  Sparkles,
  BarChart3,
  Globe,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import bg from "../assets/bg-image.png";

const advertisers = [
  { name: "AARP - US", icon: Globe },
  { name: "Abbott Laboratories - US", icon: Globe },
  { name: "Abbott Lingo - US", icon: Globe },
  { name: "Airbnb - US", icon: Globe },
  { name: "Allianz - US", icon: Globe },
  { name: "American Airlines - US", icon: Globe },
  { name: "Amtrak - US", icon: Globe },
  { name: "Anker Innovations Technology - US", icon: Globe },
  { name: "Athletic Greens - US", icon: Globe },
  { name: "Audemars Piguet - US", icon: Globe },
  { name: "Audible.com", icon: Globe },
  { name: "Avis Budget Group - US", icon: Globe },
  { name: "BP - US", icon: Globe },
  { name: "Bausch Health - US", icon: Globe },
  { name: "BlackRock - US", icon: Globe },
  { name: "Boots - US", icon: Globe },
  { name: "Caterpillar - US", icon: Globe },
  { name: "Chevron - US", icon: Globe },
  { name: "Church & Dwight - US", icon: Globe },
  { name: "Church's Texas Chicken - US", icon: Globe },
  { name: "Circle K - US", icon: Globe },
  { name: "Citizens Bank - US", icon: Globe },
  { name: "Coinbase - US", icon: Globe },
  { name: "Deloitte - US", icon: Globe },
  { name: "Denny's - US", icon: Globe },
  { name: "Deutsche Lufthansa - US", icon: Globe },
  { name: "Discover", icon: Globe },
  { name: "EA Games - US", icon: Globe },
  { name: "Ecolab - US", icon: Globe },
  { name: "Ernst & Young - US", icon: Globe },
  { name: "Essilor - US", icon: Globe },
  { name: "Financial Times - US", icon: Globe },
  { name: "Ford - US", icon: Globe },
  { name: "Foundation to Combat Anti-Semitism - US", icon: Globe },
  { name: "Genentech - US", icon: Globe },
  { name: "Google - US", icon: Globe },
  { name: "Goosehead - US", icon: Globe },
  { name: "Harley-Davidson - US", icon: Globe },
  { name: "IBM - US", icon: Globe },
  { name: "INEOS Grenadier - US", icon: Globe },
  { name: "John Deere - US", icon: Globe },
  { name: "Johnson & Johnson - US", icon: Globe },
  { name: "Lotus Bakeries - US", icon: Globe },
  { name: "Lucchese Boot Company - US", icon: Globe },
  { name: "Lufthansa - US", icon: Globe },
  { name: "Marlette Funding - Best Egg", icon: Globe },
  { name: "Mars - US", icon: Globe },
  { name: "Mas+ - US", icon: Globe },
  { name: "Merlin - US", icon: Globe },
  { name: "Mizkan - US", icon: Globe },
  { name: "NBC Universal - US", icon: Globe },
  { name: "Nationwide Mutual Insurance - US", icon: Globe },
  { name: "Nestle - US", icon: Globe },
  { name: "Neurocrine - US", icon: Globe },
  { name: "New York Stock Exchange - US", icon: Globe },
  { name: "Nickelodeon - US", icon: Globe },
  { name: "Norwegian Cruise Line - US", icon: Globe },
  { name: "Otsuka Lundbeck - US", icon: Globe },
  { name: "Otsuka Pharmaceutical - US", icon: Globe },
  { name: "PVH - US", icon: Globe },
  { name: "Pella - US", icon: Globe },
  { name: "PricewaterhouseCoopers (PwC) - US", icon: Globe },
  { name: "Qualcomm - UK", icon: Globe },
  { name: "Richemont - US", icon: Globe },
  { name: "Scana - US", icon: Globe },
  { name: "SeatGeek - US", icon: Globe },
  { name: "Test - AU", icon: Globe },
  { name: "Test ADvertiser", icon: Globe },
  { name: "The Cheesecake Factory - US", icon: Globe },
  { name: "The TJX Companies - US", icon: Globe },
  { name: "Tootsie Roll Industries - US", icon: Globe },
  { name: "TruGreen - US", icon: Globe },
  { name: "Tyson Foods - US", icon: Globe },
  { name: "Unilock - US", icon: Globe },
  { name: "United Parcel Service (UPS) - US", icon: Globe },
  { name: "VSP Vision Care - US", icon: Globe },
  { name: "Volvo - US", icon: Globe },
  { name: "Whyte & MacKay - US", icon: Globe },
  { name: "Zespri - US", icon: Globe },
  { name: "eHarmony - US", icon: Globe },
];


const HeroSection = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Correct side-effect handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGo = () => {
    if (selected) {
      // Pass the selected advertiser as state in navigation
      navigate("/table", { 
        state: { 
          selectedAdvertiser: selected 
        } 
      });
    }
  };

  return (
    <div className="min-h-screen overflow-visible">
      <section className="relative min-h-screen flex items-center px-6 lg:px-16">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-300/30 via-purple-500/30 to-purple-800/80" />
        </div>

        {/* Content */}
        <div className="container mx-auto w-full relative z-10">
          <div className="flex justify-end mb-40">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full max-w-md lg:max-w-lg -translate-y-16"
            >
              <p className="text-purple-200 font-semibold tracking-wide text-lg mb-1">
                Welcome To 
              </p>

              <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-6 text-white leading-none">
                SSOT
              </h1>

              <p className="text-white font-medium text-2xl mb-4">
                Select your Advertiser
              </p>

              {/* Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-gray-900/90 backdrop-blur-sm border border-purple-400/40 text-white hover:bg-gray-800/90 hover:border-purple-400/60 transition-all"
                    >
                      <span
                        className={
                          selected ? "font-medium" : "text-purple-200/80"
                        }
                      >
                        {selected || "Choose advertiser..."}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-purple-300 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full translate-y-[-6px] w-full rounded-xl bg-gray-900 border border-purple-500/40 shadow-2xl z-[999] overflow-hidden"
                        >
                          <div className="max-h-[35vh] overflow-y-auto">
                            {advertisers.map(({ name }) => (
                              <button
                                key={name}
                                onClick={() => {
                                  setSelected(name);
                                  setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3.5 text-white hover:bg-purple-500/20 transition border-b border-purple-500/20 last:border-none"
                              >
                                <span className="flex-1 text-left text-sm">
                                  {name}
                                </span>
                                {selected === name && (
                                  <Check className="w-4 h-4 text-purple-300" />
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button
                    onClick={handleGo}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!selected}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Go
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;