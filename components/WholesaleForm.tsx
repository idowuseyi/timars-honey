"use client";

import { useState } from "react";
import { whatsappLink } from "@/lib/whatsapp";
import { submitDistributorApplication } from "@/app/wholesale/actions";

// Enquiries are stored in `distributor_applications` and also sent via WhatsApp so
// the owner hears immediately. WhatsApp opens synchronously in the submit handler
// (popup blockers reject window.open after an await); the DB save runs alongside.
export function WholesaleForm() {
  const [form, setForm] = useState({
    business: "",
    contact: "",
    phone: "",
    email: "",
    volume: "",
    message: "",
  });

  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg =
      `Distributor enquiry — Timars Honey\n` +
      `Business: ${form.business}\n` +
      `Contact: ${form.contact}\n` +
      `Phone: ${form.phone}\n` +
      `Email: ${form.email}\n` +
      `Monthly volume: ${form.volume}\n` +
      `Message: ${form.message}`;
    window.open(whatsappLink(msg), "_blank", "noopener");
    void submitDistributorApplication({
      businessName: form.business,
      contactName: form.contact,
      phone: form.phone,
      email: form.email,
      monthlyVolume: form.volume,
      message: form.message,
    });
    setSent(true);
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
        Email
        <input required type="email" value={form.email} onChange={set("email")} className={field} />
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
      {sent && (
        <p role="status" className="text-sm text-comb/80">
          Thanks — we&apos;ve received your enquiry and will be in touch shortly.
        </p>
      )}
    </form>
  );
}
