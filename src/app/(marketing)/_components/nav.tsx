"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "For Suppliers", href: "#suppliers" },
  { label: "For Agents", href: "#agents" },
  { label: "How It Works", href: "#how-it-works" },
];

export default function Nav({ onDemoClick }: { onDemoClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function scrollTo(href: string) {
    setOpen(false);
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={scrolled
        ? { backgroundColor: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)", boxShadow: "0 1px 0 rgba(0,0,0,0.08)" }
        : { backgroundColor: "transparent" }
      }
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="ProcureX" width={32} height={32} />
          <span
            className="font-bold text-lg tracking-tight transition-colors"
            style={{ color: scrolled ? "#0d2144" : "#fff" }}
          >
            ProcureX
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {LINKS.map(l => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: scrolled ? "#374151" : "rgba(255,255,255,0.85)" }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/dev"
            className="text-sm font-medium transition-colors"
            style={{ color: scrolled ? "#6b7280" : "rgba(255,255,255,0.6)" }}
          >
            Sign in
          </Link>
          <button
            onClick={onDemoClick}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md"
            style={{ backgroundColor: "#1e4db7" }}
          >
            Request Demo
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden p-2 rounded-lg"
          style={{ color: scrolled ? "#374151" : "#fff" }}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-5 py-4 space-y-1 shadow-lg">
          {LINKS.map(l => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {l.label}
            </button>
          ))}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <Link href="/dev" className="px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
              Sign in
            </Link>
            <button
              onClick={() => { setOpen(false); onDemoClick(); }}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white text-center"
              style={{ backgroundColor: "#1e4db7" }}
            >
              Request Demo
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
