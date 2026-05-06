"use server";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { notifyContactFormEmails } from "@/lib/email/contact-form-mail";
import { getSupabasePublicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

const CONTACT_SUBJECTS = [
  "General Inquiry",
  "Project Question",
  "Support",
  "Partnership",
  "Other",
] as const;

const contactPayloadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Enter a valid email").max(254),
  phone: z.string().trim().max(160).optional().default(""),
  subject: z.enum(CONTACT_SUBJECTS),
  message: z.string().trim().min(1, "Message is required").max(12_000),
});

export type ContactSubmitState = { ok: true } | { ok: false; error: string };

export async function submitContactFormAction(formData: FormData): Promise<ContactSubmitState> {
  const parsed = contactPayloadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      first.name?.[0] ??
      first.email?.[0] ??
      first.subject?.[0] ??
      first.message?.[0] ??
      "Please check the form and try again.";
    return { ok: false, error: msg };
  }

  const { url, anonKey } = getSupabasePublicEnv();
  const supabase = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone.trim().length ? parsed.data.phone.trim() : null,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  if (error) {
    console.error("[sitebrief] contact_messages insert:", error);
    return { ok: false, error: "We could not save your message. Please try again shortly." };
  }

  await notifyContactFormEmails({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    subject: parsed.data.subject,
    message: parsed.data.message,
  });

  return { ok: true };
}
