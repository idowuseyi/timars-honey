"use client";

import { useState } from "react";
import { whatsappLink } from "@/lib/whatsapp";

// Until the DB-backed distributor capture lands, the form composes a WhatsApp
// message so wholesale enquiries reach the owner immediately and nothing is lost.
export function WholesaleForm() {
  const [form, setForm] = useState({
    business: "",
    contact: "",
    phone: "",
    volume: "",
    message: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg =
      `Distributor enquiry — Timars Honey\n` +
      `Business: ${form.business}\n` +
      `Contact: ${form.contact}\n` +
      `Phone: ${form.phone}\n` +
      `Monthly volume: ${form.volume}\n` +
      `Message: ${form.message}`;
    window.open(whatsappLink(msg), "_blank", "noopener");
  };

  const field =
    "mt-1 w-full rounded-lg border border-comb/20 bg-white px-3 py-2 text-comb outline-none focus:border-honey";

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-lg space-y-4">
      <label className="block text-sm">
        Business name
        <input required value={form.business} onChange={set("business")} className={field} />
      </label>
      <label className="block text-sm">
        Contact name
        <input required value={form.contact} onChange={set("contact")} className={field} />
      </label>
      <label className="block text-sm">
        Phone
        <input required value={form.phone} onChange={set("phone")} className={field} />
      </label>
      <label className="block text-sm">
        Expected monthly volume
        <input value={form.volume} onChange={set("volume")} placeholder="e.g. 10 × 25L kegs" className={field} />
      </label>
      <label className="block text-sm">
        Message
        <textarea value={form.message} onChange={set("message")} rows={4} className={field} />
      </label>
      <button
        type="submit"
        className="rounded-full bg-honey px-6 py-3 font-semibold text-comb transition-colors hover:bg-pollen"
      >
        Send enquiry
      </button>
    </form>
  );
}
