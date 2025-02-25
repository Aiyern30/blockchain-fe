import { Button } from "@/components/ui";
import Link from "next/link";
import { Bot, Menu, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Cart } from "./Cart";
import WalletConnectDropdown from "./wallet-dropdown/WalletConnectDropdown";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/10 relative z-50"
    >
      <Link href="/" className="flex items-center space-x-2">
        <Bot className="w-8 h-8 text-purple-400 dark:text-[#007bff]" />
        <span className="text-white font-medium text-xl">GamerTokenHub</span>
      </Link>

      <div className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
        <NavLink href="/Explore">Explore</NavLink>
        <NavLink href="/Create">Create</NavLink>
      </div>

      <div className="hidden md:flex items-center space-x-4 ml-auto">
        <WalletConnectDropdown />
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/Profile")}
        >
          <User className="w-6 h-6" />
        </Button>
        <Cart />
        <ThemeToggle />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-white"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full 
        bg-blue-900/95 dark:bg-black/95  
        backdrop-blur-lg border-b border-white/10 
        p-6 flex flex-col items-center space-y-4 md:hidden z-50 pointer-events-auto"
          >
            <NavLink href="/Explore">Explore</NavLink>
            <NavLink href="/Create">Create</NavLink>

            <div className="flex flex-row justify-center space-x-2 w-full">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push("/Profile")}
              >
                <User className="w-6 h-6" />
              </Button>
              <Cart />
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-gray-300 hover:text-white transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 dark:bg-[#007bff] transition-all group-hover:w-full" />
    </Link>
  );
}
