/**
 * Header - Modern navigation component with Tailwind CSS
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/inventory", label: "Inventory", icon: "📦" },
    { href: "/requests", label: "Requests", icon: "📋" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-[#C62828] sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 text-white no-underline transform transition-transform hover:scale-105"
          >
            <div className="bg-white rounded-xl p-3 text-2xl shadow-lg flex items-center justify-center">
              🩸
            </div>
            <div>
              <h1 className="text-2xl font-bold m-0 leading-none tracking-tight">
                BloodLink
              </h1>
              <p className="text-xs m-0 opacity-90 font-medium tracking-widest">
                SAVE LIVES
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-2 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium
                  transition-all duration-200 no-underline
                  ${
                    isActive(link.href)
                      ? "bg-white/20 text-white shadow-inner"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium
                  transition-all duration-200 no-underline
                  ${
                    isActive(link.href)
                      ? "bg-white/20 text-white"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
