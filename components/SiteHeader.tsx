import Link from "next/link";
import { WHATSAPP_GENERAL } from "@/lib/whatsapp";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/benefits", label: "Honey Benefits" },
  { href: "/wholesale", label: "Wholesale" },
];

export function SiteHeader() {
  return (
    <header className="bg-comb text-wax">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-display text-2xl font-semibold text-honey">
          Timars<span className="text-wax"> Honey</span>
        </Link>
        <nav aria-label="Primary" className="hidden gap-6 sm:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-wax/80 transition-colors hover:text-honey"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href={WHATSAPP_GENERAL}
          className="rounded-full bg-honey px-4 py-2 text-sm font-semibold text-comb transition-colors hover:bg-pollen"
        >
          WhatsApp
        </a>
      </div>
    </header>
  );
}
