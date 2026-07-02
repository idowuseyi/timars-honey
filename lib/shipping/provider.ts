// Shipping abstraction (design "ShippingProvider"). v1 adapter is Terminal Africa
// (TShip): live NG rates + tracking. International orders pay online and arrange
// shipping over WhatsApp, so getRates may return an empty list for non-NG.

export interface Parcel {
  weightKg: number;
  items: number;
}

export interface Address {
  country: string; // ISO code
  state: string;
  city: string;
}

export interface Rate {
  id: string;
  carrier: string;
  service: string;
  amountKobo: number;
  etaDays: number;
}

export interface Checkpoint {
  status: string;
  at: string;
}

export interface ShippingProvider {
  id: string;
  getRates(input: { to: Address; parcels: Parcel[] }): Promise<Rate[]>;
  createShipment(orderRef: string, rateId: string): Promise<{ trackingRef: string }>;
  track(trackingRef: string): Promise<{ status: string; checkpoints: Checkpoint[] }>;
}
