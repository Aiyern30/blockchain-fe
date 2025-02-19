"use client";

import { useState } from "react";
import { Button } from "@/components/ui/";
import { Bot, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/10 relative"
    >
      <Link href="/" className="flex items-center space-x-2">
        <Bot
          className={cn(
            "w-8 h-8 transition-colors",
            "text-purple-400 dark:text-[#007bff]"
          )}
        />
        <span className="text-white font-medium text-xl">BlockChain</span>
      </Link>

      <div className="hidden md:flex items-center space-x-8">
        <NavLink href="/A">A</NavLink>
        <NavLink href="/B">B</NavLink>
        <NavLink href="/C">C</NavLink>
        <NavLink href="/D">D</NavLink>
      </div>

      <div className="hidden md:flex items-center space-x-4">
        <ConnectButton
          accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
          chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
        />
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

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 w-full 
            backdrop-blur-lg border-b border-white/10 
            p-6 flex flex-col items-center space-y-4 md:hidden"
          >
            <NavLink href="/A">A</NavLink>
            <NavLink href="/B">B</NavLink>
            <NavLink href="/C">C</NavLink>
            <NavLink href="/D">D</NavLink>

            <div className="flex flex-col items-center space-y-2 w-full">
              <ConnectButton
                accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
                chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
              />
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
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
    </Link>
  );
}
