import { Resend } from "resend";

import { getPublicBrand, parseNotificationEmailDestinations } from "@/lib/sitebrief/brand";

type IntakeSubmissionMailInput = {
  intakeId: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  websiteGoal: string;
  budgetRange: string;
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

function normalizePublicOrigin(): string | undefined {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site?.startsWith("http")) {
    return site.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }
  return undefined;
}

function adminIntakeUrl(intakeId: string): string | undefined {
  const origin = normalizePublicOrigin();
  if (!origin) {
    return undefined;
  }
  return `${origin}/admin/intakes/${intakeId}`;
}

function resendFromAddress(): string | null {
  const raw = process.env.RESEND_FROM?.trim();
  return raw?.length ? raw : null;
}

function clientConfirmationEnabled(): boolean {
  const v = process.env.SITEBRIEF_SEND_CLIENT_CONFIRMATION?.trim().toLowerCase();
  if (!v) {
    return true;
  }
  if (v === "0" || v === "false" || v === "no" || v === "off") {
    return false;
  }
  return true;
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

/**
 * Sends admin alert + optional client confirmation after an intake row is persisted.
 * Never throws; logs on failure so submissions still succeed without email.
 */
export async function notifyIntakeSubmissionEmails(input: IntakeSubmissionMailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = resendFromAddress();
  const brand = getPublicBrand();

  if (!apiKey) {
    return;
  }

  if (!from) {
    console.warn(
      "[sitebrief] RESEND_FROM is unset; skipping intake emails (configure a verified sender in Resend).",
    );
    return;
  }

  const destinations = parseNotificationEmailDestinations();
  const adminRecipients = destinations;

  const adminUrl = adminIntakeUrl(input.intakeId);
  const adminLinkText = adminUrl
    ? `Open in SiteBrief:\n${adminUrl}\n`
    : "Set NEXT_PUBLIC_SITE_URL (or deploy on Vercel) to include a direct admin link in this email.\n";

  const sharedFieldsText = [
    `Business: ${input.businessName}`,
    `Contact: ${input.contactName}`,
    `Email: ${input.contactEmail}`,
    "",
    "Website goal:",
    input.websiteGoal,
    "",
    `Budget range: ${input.budgetRange}`,
  ].join("\n");

  const resend = new Resend(apiKey);

  if (adminRecipients.length === 0 && process.env.NODE_ENV !== "production") {
    console.warn(
      "[sitebrief] SITEBRIEF_NOTIFICATION_EMAIL is empty — admin new-intake alert skipped.",
    );
  }

  if (adminRecipients.length > 0) {
    try {
      const subject = `[${brand.appName}] New website brief: ${input.businessName}`;
      const text = [
        "A client submitted a new website brief.",
        "",
        sharedFieldsText,
        "",
        adminLinkText,
        `Submission id: ${input.intakeId}`,
      ].join("\n");

      const html = [
        "<p>A client submitted a new website brief.</p>",
        "<p>",
        `<strong>Business:</strong> ${escapeHtml(input.businessName)}<br/>`,
        `<strong>Contact:</strong> ${escapeHtml(input.contactName)}<br/>`,
        `<strong>Email:</strong> ${escapeHtml(input.contactEmail)}`,
        "</p>",
        "<p><strong>Website goal</strong></p>",
        `<p>${nlToBr(input.websiteGoal)}</p>`,
        `<p><strong>Budget range:</strong> ${escapeHtml(input.budgetRange)}</p>`,
        adminUrl
          ? `<p><a href="${escapeHtml(adminUrl)}">Open in SiteBrief admin</a></p>`
          : "",
        `<p style="font-size:12px;color:#666;">Submission id: ${escapeHtml(input.intakeId)}</p>`,
      ].join("");

      await sendWithResend(resend, {
        from,
        to: adminRecipients,
        subject,
        text,
        html,
      });
    } catch (err) {
      console.error("[sitebrief] admin intake notification email failed", err);
    }
  }

  if (!clientConfirmationEnabled()) {
    return;
  }

  try {
    const subject = `We received your website brief · ${brand.appName}`;
    const text = [
      `Hi ${input.contactName},`,
      "",
      `Thanks — we received the website brief for ${input.businessName} via ${brand.appName}.`,
      "Your answers are saved. We'll review them and reply to this email address with next steps.",
      "",
      `— ${brand.studioDisplayName}`,
    ].join("\n");

    const html = [
      `<p>Hi ${escapeHtml(input.contactName)},</p>`,
      `<p>Thanks — we received the website brief for <strong>${escapeHtml(input.businessName)}</strong> via ${escapeHtml(brand.appName)}.</p>`,
      "<p>Your answers are saved. We'll review them and reply to this email address with next steps.</p>",
      `<p>— ${escapeHtml(brand.studioDisplayName)}</p>`,
    ].join("");

    await sendWithResend(resend, {
      from,
      to: [input.contactEmail],
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("[sitebrief] client intake confirmation email failed", err);
  }
}
