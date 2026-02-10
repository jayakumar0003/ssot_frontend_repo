import { Menu, Zap, Activity } from "lucide-react";
import logo from "../assets/logo-wpp-media.png";
import { motion } from "framer-motion";

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-24 px-5 sm:px-8 ">
    
    {/* Left side - Logo and Menu */}
    <div className="flex items-center gap-8">
      <motion.button
        onClick={onMenuToggle}
        className="p-3 rounded-xl bg-white/10 border border-purple-500/40 
          hover:bg-purple-500/20 hover:border-purple-400
          transition-all duration-200 group shadow-lg"
        aria-label="Toggle navigation"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="w-6 h-6 text-white group-hover:text-purple-300" />
      </motion.button>
  
      <div className="flex items-center gap-5">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer"
        >
          {/* ⬆ Increased logo size */}
          <img
            src={logo}
            alt="WPP Media"
            className="h-10 sm:h-20 object-contain"
          />
        </motion.div>
      </div>
    </div>
  
    {/* Right side */}
    <div className="flex items-center gap-6">
      <motion.div
        className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-lg 
          bg-white/5 border border-purple-500/20"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-sm text-white/80 font-medium tracking-wide">
          User Guide
        </span>
      </motion.div>
    </div>
  </header>
  
  );
};

export default Header;