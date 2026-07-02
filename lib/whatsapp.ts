// WhatsApp is a parallel order/support channel, present site-wide (brief R6).
export const WHATSAPP_NUMBER = "2347034632882"; // +234 703 463 2882

/** Build a wa.me click-to-chat link with a prefilled message. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_GENERAL = whatsappLink(
  "Hello Timars Honey! I'd like to ask about your honey.",
);

export function whatsappForProduct(name: string, sizeLabel: string): string {
  return whatsappLink(`Hello Timars Honey! I'm interested in the ${name} (${sizeLabel}).`);
}

/** International buyers pay online, then arrange shipping over WhatsApp (brief). */
export function whatsappForInternationalShipping(orderRef: string): string {
  return whatsappLink(
    `Hello Timars Honey! I've placed order ${orderRef} and would like to arrange international shipping.`,
  );
}
