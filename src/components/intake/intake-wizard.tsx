"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import { useRouter } from "next/navigation";

import { submitWebsiteIntakeAction } from "@/actions/intake-submit";
import { SITE_VERCEL_EVENTS, trackSiteVercelEvent } from "@/components/analytics/vercel-tracking";
import { IntakeReviewSummary } from "@/components/intake/intake-review-summary";
import { IntakeStepFields } from "@/components/intake/intake-steps";
import { IntakeWalkthroughIntro } from "@/components/intake/intake-walkthrough-intro";
import { getIntakeStepHeader } from "@/components/intake/intake-ux-copy";
import { IntakeUxModeProvider, useIntakeUxMode } from "@/components/intake/intake-ux-mode";
import { IntakeUxModeToggle } from "@/components/intake/intake-ux-mode-toggle";
import {
  applyZodIssuesToForm,
  intakeFormHoneypotWasTriggered,
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

type IntakePhase = "intro" | "steps" | "review";

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

function IntakeWizardInner({ supabaseConfigured }: IntakeWizardProps) {
  const router = useRouter();
  const { mode } = useIntakeUxMode();
  const [phase, setPhase] = useState<IntakePhase>("intro");
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const methods = useForm<IntakeFormValuesWithHoneypot>({
    defaultValues: intakeWizardDefaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const intakeStartedSent = useRef(false);

  useEffect(() => {
    if (phase === "steps" && !intakeStartedSent.current) {
      intakeStartedSent.current = true;
      trackSiteVercelEvent(SITE_VERCEL_EVENTS.intakeStarted);
    }
  }, [phase]);

  const canPersistServer = Boolean(supabaseConfigured);

  const blockingMessage = !supabaseConfigured
    ? "Submissions require NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the deployment environment (.env.local locally, project env on hosting)."
    : null;

  const stepProgressPct =
    phase === "review" ? 100 : Math.round(((step + 1) / STEP_COUNT) * 100);
  const stepHeaderForSticky = getIntakeStepHeader(mode, step);
  const stickyStepTitle =
    phase === "review" ? "Review answers" : stepHeaderForSticky.title;
  const showStickyNav = phase === "steps" || phase === "review";

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
      setPhase("steps");
      setStep(index);
    }
  }, []);

  const handleGoToReview = useCallback(async () => {
    setSubmitError(null);
    const ok = await validateCurrentStep();
    if (!ok) {
      return;
    }
    setPhase("review");
    scrollToTopSmooth();
  }, [validateCurrentStep]);

  const handleFinalSubmit = useCallback(async () => {
    setSubmitError(null);
    applySanitizedSelections(methods);

    const parsed = intakeFormSchemaWithHoneypot.safeParse(methods.getValues());
    if (!parsed.success) {
      const suspicious = intakeFormHoneypotWasTriggered(parsed.error.issues);
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
        setPhase("steps");
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

      trackSiteVercelEvent(SITE_VERCEL_EVENTS.intakeCompleted);
      router.push(`/intake/success?ref=${encodeURIComponent(outcome.intakeId)}`);
    } catch (error) {
      setSubmitError(formatUnknownActionError(error));
      scrollToTopSmooth();
    } finally {
      setSubmitting(false);
    }
  }, [jumpToIssueStep, methods, router, supabaseConfigured]);

  const handleStickyPrimary = useCallback(async () => {
    if (phase === "review") {
      await handleFinalSubmit();
      return;
    }
    if (step < STEP_COUNT - 1) {
      await handleNext();
      return;
    }
    await handleGoToReview();
  }, [handleFinalSubmit, handleGoToReview, handleNext, phase, step]);

  const handleStickyBack = useCallback(() => {
    setSubmitError(null);
    if (phase === "review") {
      setPhase("steps");
      setStep(STEP_COUNT - 1);
      scrollToTopSmooth();
      return;
    }
    handleBack();
  }, [handleBack, phase]);

  const handleEditFromReview = useCallback((targetStep: number) => {
    setSubmitError(null);
    setPhase("steps");
    setStep(targetStep);
    scrollToTopSmooth();
  }, []);

  const stickyBackDisabled =
    isSubmitting || (phase === "steps" && step === 0);

  const stickyPrimaryLabel =
    phase === "review"
      ? isSubmitting
        ? "Submitting…"
        : "Submit Website Brief"
      : step < STEP_COUNT - 1
        ? "Continue"
        : "Review answers";

  const stickyPrimaryDisabled = isSubmitting || (phase === "review" && !canPersistServer);

  return (
    <FormProvider {...methods}>
      <form
        noValidate
        className={`relative space-y-10 ${showStickyNav ? "pb-32 sm:pb-28" : ""}`}
        aria-busy={isSubmitting}
        onSubmit={(evt) => {
          evt.preventDefault();
        }}
      >
        {/* Honeypot: must stay empty; hidden from view and pointer events */}
        <div className="pointer-events-none absolute left-[-9000px] top-0 h-px w-px overflow-hidden" aria-hidden>
          <label htmlFor="sitebrief_hp_company_url">Company website</label>
          <input id="sitebrief_hp_company_url" tabIndex={-1} autoComplete="off" {...methods.register("hp_company_url")} />
          <label htmlFor="sitebrief_hp_department_role">Department / role</label>
          <input
            id="sitebrief_hp_department_role"
            tabIndex={-1}
            autoComplete="organization-title"
            {...methods.register("hp_department_role")}
          />
        </div>

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

        {phase === "intro" ? (
          <IntakeWalkthroughIntro
            onStart={() => {
              setPhase("steps");
              scrollToTopSmooth();
            }}
          />
        ) : null}

        {phase === "steps" ? (
          <>
            <section className="space-y-4" aria-labelledby="intake-step-heading">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div id="intake-step-heading">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
                    Step {step + 1} of {STEP_COUNT}
                  </p>
                  <h2 className="mt-4 text-balance text-3xl font-semibold text-white sm:text-4xl">
                    {stepHeader.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/72 sm:text-lg">
                    {stepHeader.description}
                  </p>
                </div>
              </div>

              <div
                className="h-2 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/[0.04]"
                aria-hidden
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] via-[color-mix(in_srgb,var(--color-accent-hover)_94%,transparent)] to-[color-mix(in_srgb,var(--color-accent-hover)_74%,transparent)] transition-[width] duration-500 ease-out"
                  style={{ width: `${stepProgressPct}%` }}
                />
              </div>
            </section>

            <Card tone="light" className="space-y-8">
              <IntakeStepFields stepIndex={step} />
            </Card>
          </>
        ) : null}

        {phase === "review" ? (
          <Card tone="light" className="space-y-8">
            <IntakeReviewSummary onEditStep={handleEditFromReview} />
          </Card>
        ) : null}

        {showStickyNav ? (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.12] bg-[#0f0f12]/92 px-4 py-4 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 shrink-0 lg:max-w-[220px]">
                <IntakeUxModeToggle variant="compact" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="truncate text-base font-semibold text-white">{stickyStepTitle}</p>
                  <p className="text-sm font-semibold tabular-nums text-white/80">
                    {stepProgressPct}% complete
                  </p>
                </div>
                <div
                  className="h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                  aria-valuenow={stepProgressPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progress ${stepProgressPct}%`}
                >
                  <div
                    className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-300 ease-out"
                    style={{ width: `${stepProgressPct}%` }}
                  />
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="order-2 w-full justify-center border border-white/14 bg-transparent text-white hover:bg-white/10 hover:text-white sm:order-1 sm:w-auto"
                  disabled={stickyBackDisabled}
                  onClick={() => handleStickyBack()}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  className="order-1 w-full justify-center px-8 sm:order-2 sm:w-auto"
                  disabled={stickyPrimaryDisabled}
                  onClick={() => void handleStickyPrimary()}
                >
                  {stickyPrimaryLabel}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </form>
    </FormProvider>
  );
}

export function IntakeWizard(props: IntakeWizardProps) {
  return (
    <IntakeUxModeProvider>
      <IntakeWizardInner {...props} />
    </IntakeUxModeProvider>
  );
}
