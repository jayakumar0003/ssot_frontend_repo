import { Home, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import wppLogo from "@/assets/WPP_1-removebg-preview.png";
import { useNavigate } from "react-router-dom";

interface NavPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: "radia-plan", label: "Radia Plan" },
  { id: "media-plan", label: "Media Plan" },
  { id: "campaign-overview", label: "Campaign Overview" },
  { id: "targeting-analytics", label: "Targeting & Analytics" },
];

const NavPanel = ({
  isOpen,
  onClose,
  currentPage,
  onNavigate,
}: NavPanelProps) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 left-0 z-50 h-full w-72 
              bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950
              border-r border-purple-500/20 shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={wppLogo}
                    alt="WPP Media"
                    className="h-7 object-contain"
                  />

                  <button
                    onClick={() => {
                      navigate("/");
                      onClose();
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg 
                      bg-purple-500/10 hover:bg-purple-500/20 
                      transition-colors"
                    aria-label="Go to Home"
                  >
                    <Home className="w-4 h-4 text-purple-300" />
                    <span className="text-sm font-medium text-purple-200">
                      Home
                    </span>
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-purple-500/20 transition-colors"
                  aria-label="Close navigation"
                >
                  <X className="w-4 h-4 text-purple-300" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="p-4">
              

              <ul className="space-y-1">
                {navItems.map((item, index) => {
                  const isActive = currentPage === item.id;
                  const isHome = item.id === "home";

                  return (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <button
                        onClick={() => {
                          if (isHome) {
                            navigate("/");
                          } else {
                            navigate("/table", {
                              state: { activeTab: item.id },
                            });
                          }
                          onClose();
                        }}
                        className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium
                          transition-all duration-200 group
                          ${
                            isActive
                              ? "bg-gradient-to-r from-purple-600/20 to-pink-600/10 text-white border border-purple-500/30"
                              : "text-purple-200/70 hover:bg-purple-500/10 hover:text-white"
                          }`}
                      >
                        

                        <span className="flex-1 text-left">{item.label}</span>
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
};

export default NavPanel;
