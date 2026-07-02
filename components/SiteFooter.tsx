import Link from "next/link";
import { TrustSeal } from "@/components/TrustSeal";
import { WHATSAPP_GENERAL } from "@/lib/whatsapp";

export function SiteFooter() {
  return (
    <footer className="bg-comb text-wax">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-xl text-honey">Timars Honey</p>
          <p className="mt-2 max-w-xs text-sm text-wax/70">
            Pure, farm-sourced honey — a decade of trusted supply.
          </p>
          <TrustSeal className="mt-4" />
        </div>
        <nav aria-label="Footer" className="text-sm">
          <p className="font-mono text-xs uppercase tracking-widest text-wax/50">
            Explore
          </p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/shop" className="hover:text-honey">Shop</Link></li>
            <li><Link href="/benefits" className="hover:text-honey">Honey Benefits A–Z</Link></li>
            <li><Link href="/wholesale" className="hover:text-honey">Become a distributor</Link></li>
          </ul>
        </nav>
        <div className="text-sm">
          <p className="font-mono text-xs uppercase tracking-widest text-wax/50">
            Contact
          </p>
          <ul className="mt-3 space-y-2 text-wax/80">
            <li>
              <a href={WHATSAPP_GENERAL} className="hover:text-honey">
                WhatsApp: +234 703 463 2882
              </a>
            </li>
            <li>
              <a href="mailto:timarshoney@gmail.com" className="hover:text-honey">
                timarshoney@gmail.com
              </a>
            </li>
            <li>Nigeria · ships nationwide</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
