"use server";

import { isDbConfigured, withDb } from "@/db/client";
import { saveDistributorApplication, type DistributorApplication } from "@/lib/repo";

/** Store a distributor enquiry. The form also opens WhatsApp, so the owner hears
 *  about it immediately even when the DB is not configured or the write fails. */
export async function submitDistributorApplication(
  app: DistributorApplication,
): Promise<{ saved: boolean }> {
  if (!app.businessName?.trim() || !app.contactName?.trim() || !app.phone?.trim()) {
    return { saved: false };
  }
  if (!isDbConfigured()) return { saved: false };
  try {
    await withDb((db) => saveDistributorApplication(db, app));
    return { saved: true };
  } catch (e) {
    console.error("distributor application not saved", e);
    return { saved: false };
  }
}
