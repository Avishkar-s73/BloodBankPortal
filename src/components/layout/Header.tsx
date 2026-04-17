/**
 * Header - Modern navigation component with Tailwind CSS
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Droplet,
  Building2,
  Package,
  BarChart3,
  ClipboardList,
  ChevronDown,
  LogOut,
  X,
  Menu,
  Lock,
  Sparkles,
} from "lucide-react";
import NotificationBell from "@/components/features/NotificationBell";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Logout failed", error);
    }
  };

  const baseLinks = [{ href: "/", label: "Home", icon: Home }];

  const roleLinks =
    user?.role === "DONOR"
      ? [
        { href: "/donor-dashboard", label: "Donor Dashboard", icon: Droplet },
        { href: "/requests", label: "My Requests", icon: ClipboardList }
      ]
      : user?.role === "HOSPITAL"
        ? [
          {
            href: "/hospital-dashboard",
            label: "Hospital Dashboard",
            icon: Building2,
          },
          { href: "/requests", label: "My Requests", icon: ClipboardList },
        ]
        : user?.role === "BLOOD_BANK"
          ? [
            {
              href: "/blood-bank-dashboard",
              label: "Blood Bank Dashboard",
              icon: Building2,
            },
            { href: "/inventory", label: "Inventory", icon: Package },
          ]
          : [
            { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
            { href: "/inventory", label: "Inventory", icon: Package },
            { href: "/requests", label: "Requests", icon: ClipboardList },
          ];

  const navLinks = [
    ...baseLinks,
    ...roleLinks,
    // Show Blood Banks link to everyone except blood bank users (they don't need it in their navbar)
    ...(user?.role === "BLOOD_BANK"
      ? []
      : [{ href: "/blood-banks", label: "Blood Banks", icon: Building2 }]),
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
              <Droplet className="w-6 h-6 text-red-600" />
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
          {!loading && (
            <nav className="hidden md:flex gap-2 items-center">
              {user ? (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium
                        transition-all duration-200 no-underline
                        ${isActive(link.href)
                          ? "bg-white/20 text-white shadow-inner"
                          : "text-white/90 hover:bg-white/10 hover:text-white"
                        }
                      `}
                    >
                      {link.icon && <link.icon className="w-4 h-4" />}
                      <span>{link.label}</span>
                    </Link>
                  ))}

                  <NotificationBell />

                  {/* User Menu */}
                  <div className="relative ml-2">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">
                        {user.name.split(" ")[0]}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            {user.role}
                          </span>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-6 py-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all no-underline"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 bg-white text-red-600 hover:bg-gray-100 rounded-lg font-medium transition-all no-underline shadow-lg"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && !loading && (
          <nav className="md:hidden pb-4 flex flex-col gap-2">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg font-medium
                      transition-all duration-200 no-underline
                      ${isActive(link.href)
                        ? "bg-white/20 text-white"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    {link.icon && <link.icon className="w-5 h-5" />}
                    <span>{link.label}</span>
                  </Link>
                ))}

                {/* User Info in Mobile */}
                <div className="border-t border-white/20 mt-2 pt-2 px-4 py-3">
                  <p className="text-white font-medium text-sm">{user.name}</p>
                  <p className="text-white/70 text-xs">{user.email}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
                    {user.role}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-white/90 hover:bg-white/10 hover:text-white transition-all no-underline"
                >
                  <Lock className="w-5 h-5" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium bg-white text-red-600 hover:bg-gray-100 transition-all no-underline"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
