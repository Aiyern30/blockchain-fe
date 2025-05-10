import { Button } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import { Menu, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import WalletConnectDropdown from "./wallet-dropdown/WalletConnectDropdown";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import WishlistSheet from "./Wishlist";
import { CartSheet } from "./Cart";
import { useDeviceType } from "@/utils/useDeviceType";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { isMobile, isTablet, isDesktop } = useDeviceType();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/10 relative z-50"
    >
      <Link href="/" className="flex items-center space-x-2">
        <div className="relative w-8 h-8">
          <Image
            src="/favicon.png"
            alt="404 Construction Barrier"
            fill
            className="object-contain"
            priority
          />
        </div>
        <span className="text-white font-medium text-xl hidden lg:inline">
          GamerTokenHub
        </span>
      </Link>

      {/* Centered Navigation Links (Hidden on Mobile) */}
      <div className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
        <NavLink href="/Explore">Explore</NavLink>
        <NavLink href="/Create">Create</NavLink>
        <NavLink href="/Mint">Mint</NavLink>
        <NavLink href="/Contact">Contact</NavLink>
      </div>

      <div className="flex items-center space-x-4 ml-auto md:space-x-3">
        {isDesktop && <WalletConnectDropdown />}

        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/Profile")}
        >
          <User className="w-6 h-6" />
        </Button>
        <WishlistSheet />
        <CartSheet />
        <ThemeToggle />

        {(isMobile || isTablet) && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        )}
      </div>

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
            <NavLink href="/Mint">Mint</NavLink>
            <NavLink href="/Contact">Contact</NavLink>
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
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className="text-gray-300 hover:text-white transition-colors relative group"
    >
      {children}
      <span
        className={`absolute -bottom-1 left-0 h-0.5 bg-purple-500 dark:bg-[#007bff] transition-all ${
          isActive ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );
}
