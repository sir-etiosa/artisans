import Link from "next/link";
import { Logo } from "@/components/ui";
import { PAPER, LINE, MUTED } from "@/lib/theme";

const X_URL = "https://x.com/theartisans_xyz";
const IG_URL = "https://instagram.com/theartisansxyz";

export default function Footer() {
  return (
    <footer className="mt-16 px-4 md:px-8 py-10" style={{ borderTop: `1px solid ${LINE}`, background: PAPER }}>
      <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <Logo size={26} />
            <span className="disp font-bold text-base">The Artisans</span>
          </div>
          <p className="text-[13px] mt-2" style={{ color: MUTED }}>Verified people and payments. Protected payments.</p>
        </div>

        <div>
          <p className="text-[12px] font-semibold tracking-wide" style={{ color: MUTED }}>ABOUT</p>
          <ul className="mt-2 space-y-1.5 text-[13px]">
            <li><Link href="/" className="hover:underline">Find artisans</Link></li>
            <li><Link href="/goods" className="hover:underline">Goods</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy policy</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[12px] font-semibold tracking-wide" style={{ color: MUTED }}>CONTACT US</p>
          <ul className="mt-2 space-y-1.5 text-[13px]">
            <li><a href={X_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">X · @theartisans_xyz</a></li>
            <li><a href={IG_URL} target="_blank" rel="noopener noreferrer" className="hover:underline">Instagram · @theartisansxyz</a></li>
          </ul>
        </div>
      </div>

      <p className="max-w-6xl mx-auto mt-8 text-[12px]" style={{ color: MUTED }}>© {new Date().getFullYear()} The Artisans.</p>
    </footer>
  );
}
