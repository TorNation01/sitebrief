"use client";

import { useFormContext } from "react-hook-form";

import {
  checklistDisplayLabel,
  getBrandingStatusOptions,
  getBudgetOptions,
  getContentStatusOptions,
  getDomainOptions,
  getHostingOptions,
  getIntakeStepHeader,
  getPlatformOptions,
  getPriorityOptions,
} from "@/components/intake/intake-ux-copy";
import { useIntakeUxMode, type IntakeUxMode } from "@/components/intake/intake-ux-mode";
import {
  BRANDING_OPTIONS,
  BUDGET_OPTIONS,
  CONTENT_STATUS_OPTIONS,
  DOMAIN_OPTIONS,
  HOSTING_OPTIONS,
  PLATFORM_OPTIONS,
  PRIORITY_OPTIONS,
  type IntakeSelectChoice,
} from "@/components/intake/intake-steps";
import {
  INTAKE_STEPS,
  type IntakeFormValues,
  type IntakeFormValuesWithHoneypot,
} from "@/components/intake/intake-schema";
import { Button } from "@/components/ui/button";

function selectOptionsFor(mode: IntakeUxMode, key: keyof IntakeFormValues) {
  switch (key) {
    case "content_status":
      return getContentStatusOptions(mode, CONTENT_STATUS_OPTIONS);
    case "branding_status":
      return getBrandingStatusOptions(mode, BRANDING_OPTIONS);
    case "domain_status":
      return getDomainOptions(mode, DOMAIN_OPTIONS);
    case "hosting_status":
      return getHostingOptions(mode, HOSTING_OPTIONS);
    case "platform_preference":
      return getPlatformOptions(mode, PLATFORM_OPTIONS);
    case "budget_range":
      return getBudgetOptions(mode, BUDGET_OPTIONS);
    case "priority_level":
      return getPriorityOptions(mode, PRIORITY_OPTIONS);
    default:
      return undefined;
  }
}

function labelFromOptions(options: readonly IntakeSelectChoice[], value: string): string | null {
  const entry = options.find((item) => item.value === value);
  return entry && entry.value.trim() ? entry.label : null;
}

function humanize(key: keyof IntakeFormValues): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatScalar(key: keyof IntakeFormValues, value: string, mode: IntakeUxMode): string | null {
  const trimmed = value.trim();
  if (!trimmed.length) {
    return null;
  }
  const options = selectOptionsFor(mode, key);
  if (options) {
    return labelFromOptions(options, trimmed) ?? trimmed;
  }
  return trimmed;
}

function formatList(values: readonly string[], mode: IntakeUxMode): string | null {
  const cleaned = values.map((entry) => entry.trim()).filter(Boolean);
  if (!cleaned.length) {
    return null;
  }
  return cleaned.map((entry) => checklistDisplayLabel(mode, entry)).join(", ");
}

export function IntakeReviewSummary(props: { onEditStep: (stepIndex: number) => void }) {
  const { onEditStep } = props;
  const { watch } = useFormContext<IntakeFormValuesWithHoneypot>();
  const { mode } = useIntakeUxMode();

  const values = watch();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">Review your answers</h2>
        <p className="mt-2 text-base leading-relaxed text-zinc-600">
          Take a minute to skim each section. You can jump back to any step to tweak details before submitting.
        </p>
      </div>

      <div className="space-y-8">
        {INTAKE_STEPS.map((definition, stepIndex) => {
          const fields = definition.fields;
          const sectionTitle = getIntakeStepHeader(mode, stepIndex).title;

          const rows = fields
            .map((fieldKey) => {
              const raw = values[fieldKey];
              if (Array.isArray(raw)) {
                const text = formatList(raw as string[], mode);
                if (!text) {
                  return null;
                }
                return { key: fieldKey, text };
              }
              if (typeof raw === "string") {
                const text = formatScalar(fieldKey, raw, mode);
                if (!text) {
                  return null;
                }
                return { key: fieldKey, text };
              }
              return null;
            })
            .filter(Boolean) as Array<{ key: keyof IntakeFormValues; text: string }>;

          if (!rows.length) {
            return null;
          }

          return (
            <div
              key={definition.id}
              className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div>
                  <p className="text-lg font-semibold text-zinc-900">{sectionTitle}</p>
                  <div className="mt-4 space-y-3 text-base leading-relaxed text-zinc-700">
                    {rows.map((row) => (
                      <div key={row.key} className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {humanize(row.key)}
                        </p>
                        <p className="whitespace-pre-wrap text-zinc-800">{row.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="shrink-0 border border-zinc-200 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-800 hover:bg-zinc-50"
                  onClick={() => onEditStep(stepIndex)}
                >
                  Edit
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
