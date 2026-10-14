"use client";

import * as React from "react";
import { AlertTriangle, ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
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

type Status = "idle" | "loading" | "success" | "error";

function ContactForm() {
  const [values, setValues] = React.useState<FormValues>(emptyValues);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormValues, string>>>({});
  const [status, setStatus] = React.useState<Status>("idle");
  const [topic, setTopic] = React.useState<(typeof topics)[number]>(topics[0]);
  // Guards against a double click opening WhatsApp twice before React re-renders.
  const submittedRef = React.useRef(false);

  function update(patch: Partial<FormValues>) {
    setValues((v) => ({ ...v, ...patch }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormValues, string>> = {};
    if (!values.name.trim()) next.name = "Name is required.";
    if (!values.email.trim()) {
      next.email = "Email is required.";
    } else if (!isValidEmail(values.email)) {
      next.email = "Enter a valid email address.";
    }
    if (values.phone.trim() && !isValidPhone(values.phone)) {
      next.phone = "Enter a valid phone number.";
    }
    if (!values.message.trim()) next.message = "Tell us a little about your shoot.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittedRef.current || !validate()) return;

    // Messages are delivered through WhatsApp, like kit requests. Opened
    // synchronously inside the submit handler so browsers don't block it.
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
    window.open(link, "_blank", "noopener,noreferrer");
    // Keep OUTTA's own record in case the WhatsApp chat is lost.
    recordEnquiry({
      kind: "contact",
      name: values.name,
      email: values.email,
      phone: values.phone,
      message: `[${topic}] ${values.message}`,
    }).catch(() => {});
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center sm:p-14">
        <div aria-hidden className="bg-brand-muted absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full blur-3xl" />
        <div className="relative flex flex-col items-center">
          <span className="bg-brand text-brand-foreground flex size-14 items-center justify-center rounded-full">
            <CheckCircle2 className="size-7" />
          </span>
          <p className="text-h3 mt-6">Almost there.</p>
          <p className="text-small mt-2 max-w-sm">
            We opened WhatsApp with your message filled in. Hit send there to reach OUTTA directly.
          </p>
          <Button
            variant="outline"
            className="mt-8 rounded-full"
            onClick={() => {
              setValues(emptyValues);
              setErrors({});
              submittedRef.current = false;
              setStatus("idle");
            }}
          >
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  const fieldBase =
    "peer block w-full rounded-2xl border border-border bg-background/60 px-4 pt-6 pb-2.5 text-base outline-none transition-all placeholder-transparent focus:border-brand focus:bg-background focus:ring-4 focus:ring-brand/15 aria-invalid:border-destructive aria-invalid:ring-destructive/15";
  const labelBase =
    "pointer-events-none absolute left-4 top-4 origin-left text-sm text-muted-foreground transition-all duration-200 peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-medium peer-focus:tracking-wide peer-focus:text-brand peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:font-medium peer-[:not(:placeholder-shown)]:tracking-wide";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-7 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10"
    >
      <fieldset>
        <legend className="text-label mb-3">What&rsquo;s this about?</legend>
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={topic === t}
              onClick={() => setTopic(t)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                topic === t
                  ? "border-brand bg-brand text-brand-foreground shadow-sm"
                  : "border-border text-foreground/70 hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="relative">
        <input
          id="contact-name"
          className={fieldBase}
          placeholder="Name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          value={values.name}
          onChange={(e) => update({ name: e.target.value })}
        />
        <label htmlFor="contact-name" className={labelBase}>Name</label>
        {errors.name ? <p className="mt-1.5 pl-1 text-sm text-destructive">{errors.name}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-4">
        <div className="relative">
          <input
            id="contact-email"
            type="email"
            className={fieldBase}
            placeholder="Email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            value={values.email}
            onChange={(e) => update({ email: e.target.value })}
          />
          <label htmlFor="contact-email" className={labelBase}>Email</label>
          {errors.email ? <p className="mt-1.5 pl-1 text-sm text-destructive">{errors.email}</p> : null}
        </div>
        <div className="relative">
          <input
            id="contact-phone"
            type="tel"
            className={fieldBase}
            placeholder="Phone (optional)"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            value={values.phone}
            onChange={(e) => update({ phone: e.target.value })}
          />
          <label htmlFor="contact-phone" className={labelBase}>Phone (optional)</label>
          {errors.phone ? <p className="mt-1.5 pl-1 text-sm text-destructive">{errors.phone}</p> : null}
        </div>
      </div>

      <div className="relative">
        <textarea
          id="contact-message"
          rows={5}
          className={cn(fieldBase, "resize-none")}
          placeholder="Message"
          aria-invalid={Boolean(errors.message)}
          value={values.message}
          onChange={(e) => update({ message: e.target.value })}
        />
        <label htmlFor="contact-message" className={labelBase}>
          Tell us about your shoot
        </label>
        {errors.message ? <p className="mt-1.5 pl-1 text-sm text-destructive">{errors.message}</p> : null}
      </div>

      {status === "error" ? (
        <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0 translate-y-0.5" />
          <span>WhatsApp isn&apos;t available right now. Please try again later.</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-small max-w-xs">Your message opens in WhatsApp, ready to send. We reply directly.</p>
        <Button type="submit" size="lg" disabled={status === "loading"} className="group h-12 rounded-full px-7">
          {status === "loading" ? (
            <>
              <LoaderCircle className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              Send Message
              <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export { ContactForm };
