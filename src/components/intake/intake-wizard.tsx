"use client";

import { useCallback, useState } from "react";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import { useRouter } from "next/navigation";

import { submitWebsiteIntakeAction } from "@/actions/intake-submit";
import { IntakeStepFields } from "@/components/intake/intake-steps";
import {
  applyZodIssuesToForm,
  intakeFormSchemaWithHoneypot,
  intakeStepSchemas,
  intakeWizardDefaultValues,
  INTAKE_STEPS,
  sanitizeIntakeSelections,
  type IntakeFormValuesWithHoneypot,
} from "@/components/intake/intake-schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type IntakeWizardProps = {
  supabaseConfigured: boolean;
};

const STEP_COUNT = INTAKE_STEPS.length;

const checkboxKeys = [
  "services_selected",
  "features_selected",
  "integrations_selected",
  "ai_selected",
] as const satisfies ReadonlyArray<keyof IntakeFormValuesWithHoneypot>;

function applySanitizedSelections(form: UseFormReturn<IntakeFormValuesWithHoneypot>) {
  const cleaned = sanitizeIntakeSelections(form.getValues());
  for (const key of checkboxKeys) {
    form.setValue(key, cleaned[key], {
      shouldDirty: true,
      shouldTouch: false,
      shouldValidate: false,
    });
  }
}

function scrollToTopSmooth() {
  if (typeof window === "undefined") {
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatUnknownActionError(payload: unknown) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const message = (payload as { error?: unknown }).error;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return "Something went wrong while saving—please retry in a minute.";
}

export function IntakeWizard({ supabaseConfigured }: IntakeWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const methods = useForm<IntakeFormValuesWithHoneypot>({
    defaultValues: intakeWizardDefaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const canPersistServer = Boolean(supabaseConfigured);

  const blockingMessage = !supabaseConfigured
    ? "Submissions require NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the deployment environment (.env.local locally, project env on hosting)."
    : null;

  const completion = Math.round(((step + 1) / STEP_COUNT) * 100);

  const validateCurrentStep = useCallback(async () => {
    applySanitizedSelections(methods);
    const parsed = intakeStepSchemas[step].safeParse(methods.getValues());

    if (!parsed.success) {
      applyZodIssuesToForm(methods, parsed.error);
      scrollToTopSmooth();
      return false;
    }

    const fieldsForStep = INTAKE_STEPS[step].fields;
    for (const fieldName of fieldsForStep) {
      methods.clearErrors(fieldName);
    }
    return true;
  }, [methods, step]);

  const handleNext = useCallback(async () => {
    setSubmitError(null);
    const ok = await validateCurrentStep();
    if (!ok) {
      return;
    }
    setStep((value) => Math.min(value + 1, STEP_COUNT - 1));
    scrollToTopSmooth();
  }, [validateCurrentStep]);

  const handleBack = useCallback(() => {
    setSubmitError(null);
    setStep((value) => Math.max(value - 1, 0));
    scrollToTopSmooth();
  }, []);

  const jumpToIssueStep = useCallback((field: keyof IntakeFormValuesWithHoneypot) => {
    const index = INTAKE_STEPS.findIndex((definition) =>
      (definition.fields as readonly string[]).includes(field),
    );

    if (index >= 0) {
      setStep(index);
    }
  }, []);

  const handleFinalSubmit = useCallback(async () => {
    setSubmitError(null);
    applySanitizedSelections(methods);

    const parsed = intakeFormSchemaWithHoneypot.safeParse(methods.getValues());
    if (!parsed.success) {
      const suspicious = parsed.error.issues.some((issue) => issue.path[0] === "hp_company_url");
      if (suspicious) {
        setSubmitError(
          "Automatic form fillers blocked this submission. Disable extensions for this site or clear optional hidden fields.",
        );
      } else {
        applyZodIssuesToForm(methods, parsed.error);
        const firstIssue = parsed.error.issues[0]?.path?.[0];
        if (typeof firstIssue === "string") {
          jumpToIssueStep(firstIssue as keyof IntakeFormValuesWithHoneypot);
        }
      }
      scrollToTopSmooth();
      return;
    }

    if (!supabaseConfigured) {
      setSubmitError(
        "This deployment is missing Supabase configuration, so submissions cannot reach the database.",
      );
      scrollToTopSmooth();
      return;
    }

    setSubmitting(true);
    try {
      const outcome = await submitWebsiteIntakeAction(parsed.data);
      if (!outcome.ok) {
        setSubmitError(outcome.error);
        scrollToTopSmooth();
        return;
      }

      router.push(`/intake/success?ref=${encodeURIComponent(outcome.intakeId)}`);
    } catch (error) {
      setSubmitError(formatUnknownActionError(error));
      scrollToTopSmooth();
    } finally {
      setSubmitting(false);
    }
  }, [jumpToIssueStep, methods, router, supabaseConfigured]);

  const meta = INTAKE_STEPS[step];

  return (
    <FormProvider {...methods}>
      <form
        noValidate
        className="relative space-y-10"
        aria-busy={isSubmitting}
        onSubmit={(evt) => {
          evt.preventDefault();
        }}
      >
        {(blockingMessage || submitError) && (
          <div className="space-y-4">
            {blockingMessage ? (
              <Card
                tone="dark"
                title="Configuration required"
                description={blockingMessage}
              />
            ) : null}
            {submitError ? (
              <div
                className="rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-4 text-sm text-white"
                role="alert"
                aria-live="assertive"
              >
                <p className="font-semibold tracking-tight">We could not complete that action.</p>
                <p className="mt-2 text-white/85">{submitError}</p>
              </div>
            ) : null}
          </div>
        )}

        <section className="space-y-4" aria-labelledby="intake-progress-label">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div id="intake-progress-label">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
                Step {step + 1} of {STEP_COUNT}
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold text-white sm:text-4xl">
                {meta.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/68 sm:text-base">
                {meta.description}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/58">
                Progress
              </p>
              <p className="mt-4 text-2xl font-semibold text-white">{completion}%</p>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/[0.04]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] via-[color-mix(in_srgb,var(--color-accent-hover)_94%,transparent)] to-[color-mix(in_srgb,var(--color-accent-hover)_74%,transparent)] transition-[width] duration-500 ease-out"
              style={{ width: `${completion}%` }}
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
              aria-labelledby="intake-progress-label"
            />
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap">
            {INTAKE_STEPS.map((item, index) => {
              const reached = index === step;
              const finished = index < step;
              return (
                <span
                  key={item.id}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] sm:text-xs ${
                    reached
                      ? "bg-[var(--color-accent)] text-[#0f0f12]"
                      : finished
                        ? "border border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                        : "border border-white/[0.12] bg-white/[0.02] text-white/52"
                  }`}
                  aria-current={reached ? "step" : undefined}
                >
                  <span aria-hidden>{index + 1} · </span>
                  {item.title}
                </span>
              );
            })}
          </div>
        </section>

        <Card tone="light" className="space-y-8">
          <IntakeStepFields stepIndex={step} />

          {/* Honeypot: must stay empty; hidden from view and pointer events */}
          <div className="pointer-events-none absolute left-[-9000px] top-0 h-px w-px overflow-hidden" aria-hidden>
            <label htmlFor="sitebrief_hp_company_url">Company website</label>
            <input
              id="sitebrief_hp_company_url"
              tabIndex={-1}
              autoComplete="off"
              {...methods.register("hp_company_url")}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-center border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 hover:text-black sm:w-auto"
              disabled={step === 0 || isSubmitting}
              onClick={handleBack}
            >
              Back
            </Button>

            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
              {step < STEP_COUNT - 1 ? (
                <Button
                  type="button"
                  variant="primary"
                  className="w-full justify-center px-10 sm:w-auto"
                  disabled={isSubmitting}
                  onClick={() => void handleNext()}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  className="w-full justify-center px-10 sm:w-auto"
                  disabled={!canPersistServer || isSubmitting}
                  onClick={() => void handleFinalSubmit()}
                >
                  {isSubmitting ? "Transmitting brief…" : "Submit studio brief"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </form>
    </FormProvider>
  );
}
