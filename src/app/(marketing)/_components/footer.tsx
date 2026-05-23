import Image from "next/image";
import Link from "next/link";

const LINKS = {
  Product: ["Quotation Engine", "Supplier Privacy", "Order Tracking", "Commission Management"],
  Platform: ["For Agents", "For Suppliers", "For Buyers", "Pricing"],
  Company: ["About", "Contact", "Privacy Policy", "Terms of Service"],
};

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ backgroundColor: "#0a1a33" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.svg" alt="ProcureX" width={28} height={28} />
              <span className="font-bold text-white text-lg">ProcureX</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              End-to-end procurement management for modern trade agents, suppliers, and buyers.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">{heading}</p>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-white/50 hover:text-white/80 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">
            © {year} ProcureX. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "Cookies"].map(l => (
              <Link key={l} href="#" className="text-xs text-white/25 hover:text-white/50 transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
