"use client";

import * as React from "react";
import { AlertTriangle, ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { isValidEmail, isValidPhone } from "@/lib/quote/validation";
import { getWhatsAppLink } from "@/lib/quote/whatsapp";
import { recordEnquiry } from "@/lib/quote/actions";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const emptyValues: FormValues = { name: "", email: "", phone: "", message: "" };

const topics = ["Rent equipment", "Package quote", "Custom kit", "Something else"] as const;

type StepKey = keyof FormValues;

const steps: { key: StepKey; label: string; prompt: string; hint: string; optional?: boolean }[] = [
  { key: "name", label: "Name", prompt: "Enter your name", hint: "What should we call you?" },
  { key: "email", label: "Email", prompt: "Enter your email", hint: "Where can we reach you?" },
  { key: "phone", label: "Phone", prompt: "Enter your phone", hint: "Optional, press Next to skip.", optional: true },
  { key: "message", label: "Message", prompt: "Tell us about your shoot", hint: "Dates, location, the kit you need." },
];

type Status = "idle" | "error" | "success";

/**
 * One-question-at-a-time contact form: a big underlined input, a progress
 * line, and a round Next button. Sends the same way as before — opens
 * WhatsApp with the message filled in and records the enquiry.
 */
function ContactForm({ compact = false }: { compact?: boolean }) {
  const [values, setValues] = React.useState<FormValues>(emptyValues);
  const [step, setStep] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");
  const [topic, setTopic] = React.useState<(typeof topics)[number]>(topics[0]);
  const submittedRef = React.useRef(false);
  const fieldRef = React.useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  const current = steps[step];
  const isLast = step === steps.length - 1;

  React.useEffect(() => {
    // Skip the initial render so the page doesn't steal focus on load.
    if (step > 0) fieldRef.current?.focus();
  }, [step]);

  function validateStep(key: StepKey): string | null {
    const value = values[key].trim();
    if (key === "name" && !value) return "Name is required.";
    if (key === "email") {
      if (!value) return "Email is required.";
      if (!isValidEmail(value)) return "Enter a valid email address.";
    }
    if (key === "phone" && value && !isValidPhone(value)) return "Enter a valid phone number.";
    if (key === "message" && !value) return "Tell us a little about your shoot.";
    return null;
  }

  function submit() {
    if (submittedRef.current) return;
    const link = getWhatsAppLink({
      heading: "OUTTA RENTALS — ENQUIRY",
      customerName: values.name.trim(),
      customerPhone: values.phone.trim(),
      customerEmail: values.email.trim(),
      notes: `[${topic}] ${values.message.trim()}`,
      closingLine: "",
    });
    if (!link) {
      setStatus("error");
      return;
    }
    submittedRef.current = true;
    // Opened synchronously inside the submit handler so browsers don't block it.
    window.open(link, "_blank", "noopener,noreferrer");
    recordEnquiry({
      kind: "contact",
      name: values.name,
      email: values.email,
      phone: values.phone,
      message: `[${topic}] ${values.message}`,
    }).catch(() => {});
    setStatus("success");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validateStep(current.key);
    setError(problem);
    if (problem) return;
    if (isLast) submit();
    else setStep((s) => s + 1);
  }

  function goTo(index: number) {
    if (index < step) {
      setError(null);
      setStep(index);
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-start gap-5">
        <span className="bg-brand text-brand-foreground mt-1 flex size-12 shrink-0 items-center justify-center rounded-full">
          <Check className="size-6" />
        </span>
        <div>
          <p className="text-2xl font-medium sm:text-3xl">Almost there.</p>
          <p className="mt-2 max-w-md text-sm text-black/60">
            We opened WhatsApp with your message filled in. Hit send there to reach OUTTA directly.
          </p>
          <button
            type="button"
            onClick={() => {
              setValues(emptyValues);
              setStep(0);
              setError(null);
              submittedRef.current = false;
              setStatus("idle");
            }}
            className="mt-6 text-sm text-black/80 underline underline-offset-4 hover:text-neutral-900"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  const progress = ((step + 1) / steps.length) * 100;
  const sharedField = cn(
    "w-full border-0 bg-transparent p-0 font-medium text-neutral-900 outline-none placeholder:text-black/25",
    compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-5xl"
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex items-center gap-4">
        <span aria-hidden className="bg-brand h-4 w-[3px]" />
        <p className="text-base text-neutral-900">Get in touch</p>
        <p className="text-sm text-black/40">
          {step + 1} / {steps.length}
        </p>
      </div>

      <div className={cn("flex flex-col sm:flex-row sm:items-end", compact ? "mt-6 gap-5 sm:gap-8" : "mt-10 gap-8 sm:gap-10")}>
        <div className="min-w-0 flex-1">
          <label htmlFor="contact-field" className="sr-only">
            {current.label}
          </label>
          {current.key === "message" ? (
            <textarea
              key={current.key}
              id="contact-field"
              ref={fieldRef}
              rows={2}
              className={cn(sharedField, "resize-none leading-tight")}
              placeholder={current.prompt}
              value={values.message}
              aria-invalid={Boolean(error)}
              onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
          ) : (
            <input
              key={current.key}
              id="contact-field"
              ref={fieldRef}
              type={current.key === "email" ? "email" : current.key === "phone" ? "tel" : "text"}
              autoComplete={current.key === "email" ? "email" : current.key === "phone" ? "tel" : "name"}
              className={sharedField}
              placeholder={current.prompt}
              value={values[current.key]}
              aria-invalid={Boolean(error)}
              onChange={(e) => setValues((v) => ({ ...v, [current.key]: e.target.value }))}
            />
          )}

          <div className="relative mt-4 h-px w-full bg-black/15">
            <div
              className="bg-brand absolute inset-y-0 left-0 h-px transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 flex min-h-5 items-center justify-between gap-4">
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <p className="text-sm text-black/40">{current.hint}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="group flex shrink-0 items-center gap-4 self-start text-sm text-neutral-900 sm:self-end"
        >
          <span>{isLast ? "Send" : "Next"}</span>
          <span className={cn("relative flex size-16 items-center justify-center rounded-full border border-black/25 transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-brand-foreground sm:size-[72px]", compact && "size-14 sm:size-14")}>
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>
      </div>

      {isLast ? (
        <div className="mt-8 flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={topic === t}
              onClick={() => setTopic(t)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                topic === t
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-black/20 text-black/60 hover:border-black/50 hover:text-neutral-900"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      ) : null}

      <ol className={cn("flex flex-wrap gap-x-6 gap-y-2 text-xs", compact ? "mt-6" : "mt-10")}>
        {steps.map((s, i) => (
          <li key={s.key}>
            <button
              type="button"
              disabled={i >= step}
              onClick={() => goTo(i)}
              className={cn(
                "flex items-center gap-2 transition-colors",
                i === step ? "text-neutral-900" : i < step ? "text-black/60 hover:text-neutral-900" : "text-black/25"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  i <= step ? "bg-brand" : "bg-black/20"
                )}
              />
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      {status === "error" ? (
        <div className="mt-6 flex items-start gap-2 text-sm text-red-600">
          <AlertTriangle className="size-4 shrink-0 translate-y-0.5" />
          <span>WhatsApp isn&apos;t available right now. Please try again later.</span>
        </div>
      ) : null}
    </form>
  );
}

export { ContactForm };
