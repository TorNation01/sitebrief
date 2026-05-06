import { Resend } from "resend";

import { getPublicBrand, parseNotificationEmailDestinations } from "@/lib/sitebrief/brand";

export type ContactFormMailInput = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nlToBr(text: string): string {
  return escapeHtml(text).replace(/\r?\n/g, "<br/>");
}

function resendFromAddress(): string | null {
  const raw = process.env.RESEND_FROM?.trim();
  return raw?.length ? raw : null;
}

async function sendWithResend(
  resend: Resend,
  params: {
    from: string;
    to: string[];
    subject: string;
    text: string;
    html: string;
  },
): Promise<void> {
  const { error } = await resend.emails.send({
    from: params.from,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });

  if (error) {
    throw new Error(error.message ?? "Resend rejected the send");
  }
}

/** Notifies studio inboxes after a contact_messages row is stored. Never throws. */
export async function notifyContactFormEmails(input: ContactFormMailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = resendFromAddress();
  const brand = getPublicBrand();

  if (!apiKey) {
    return;
  }

  if (!from) {
    console.warn("[sitebrief] RESEND_FROM is unset; skipping contact form emails.");
    return;
  }

  const destinations = parseNotificationEmailDestinations();
  if (!destinations.length) {
    console.warn("[sitebrief] SITEBRIEF_NOTIFICATION_EMAIL is empty — contact form alert skipped.");
    return;
  }

  const subjectLine = `[${brand.appName}] Contact: ${input.subject}`;
  const text = [
    `New contact form message on ${brand.appName}`,
    "",
    `Subject: ${input.subject}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone.trim() || "—"}`,
    "",
    "Message:",
    input.message,
  ].join("\n");

  const html = [
    `<p><strong>New contact form message</strong> (${escapeHtml(brand.appName)})</p>`,
    `<p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>`,
    `<p><strong>Name:</strong> ${escapeHtml(input.name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(input.email)}</p>`,
    `<p><strong>Phone:</strong> ${escapeHtml(input.phone.trim() || "—")}</p>`,
    `<p><strong>Message:</strong></p><p>${nlToBr(input.message)}</p>`,
  ].join("");

  try {
    const resend = new Resend(apiKey);
    await sendWithResend(resend, {
      from,
      to: destinations,
      subject: subjectLine,
      text,
      html,
    });
  } catch (err) {
    console.error("[sitebrief] Contact form Resend failure:", err);
  }
}
