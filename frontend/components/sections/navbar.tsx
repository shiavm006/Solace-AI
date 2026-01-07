"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled ? "glass-nav py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-8 max-w-[1280px]">
        <div className="flex items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              <span className="font-noe-display text-white text-[22px] tracking-[0.08em]">
                Solace AI
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-12" />

          <div className="flex items-center space-x-8">
            <Link
              href="/login"
              className="hidden lg:inline-flex items-center justify-center h-[40px] px-6 rounded-full bg-white text-black text-[13px] font-medium tracking-[0.08em] uppercase hover:scale-[1.02] transition-transform duration-200"
            >
              Log In
            </Link>

            <button
              className="lg:hidden text-white p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-[#0b0b0c] border-b border-white/10 px-6 py-8 flex flex-col space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="pt-2 flex flex-col space-y-4">
              <Link
                href="/login"
                className="text-center py-3 text-[14px] font-medium uppercase tracking-[0.05em] bg-white text-black rounded-full"
              >
                Log In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


