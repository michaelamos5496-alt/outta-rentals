"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, LoaderCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { isValidEmail, isValidPhone } from "@/lib/quote/validation";
import { getWhatsAppLink } from "@/lib/quote/whatsapp";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const emptyValues: FormValues = { name: "", email: "", phone: "", message: "" };

type Status = "idle" | "loading" | "success" | "error";

function ContactForm() {
  const [values, setValues] = React.useState<FormValues>(emptyValues);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormValues, string>>>({});
  const [status, setStatus] = React.useState<Status>("idle");
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
      notes: values.message.trim(),
      closingLine: "",
    });
    if (!link) {
      setStatus("error");
      return;
    }
    submittedRef.current = true;
    window.open(link, "_blank", "noopener,noreferrer");
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center rounded-xl border border-border p-8 text-center">
        <CheckCircle2 className="size-8 text-brand" />
        <p className="text-h3 mt-4">Message ready in WhatsApp</p>
        <p className="text-small mt-2 max-w-sm">
          We opened WhatsApp with your message filled in — hit send there to reach OUTTA directly.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setValues(emptyValues);
            submittedRef.current = false;
            setStatus("idle");
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          className="mt-1.5"
          placeholder="Ama Owusu"
          value={values.name}
          onChange={(e) => update({ name: e.target.value })}
        />
        {errors.name ? <p className="mt-1 text-sm text-destructive">{errors.name}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            className="mt-1.5"
            placeholder="ama@studio.com"
            value={values.email}
            onChange={(e) => update({ email: e.target.value })}
          />
          {errors.email ? <p className="mt-1 text-sm text-destructive">{errors.email}</p> : null}
        </div>
        <div>
          <Label htmlFor="contact-phone">Phone</Label>
          <Input
            id="contact-phone"
            type="tel"
            className="mt-1.5"
            placeholder="Optional"
            value={values.phone}
            onChange={(e) => update({ phone: e.target.value })}
          />
          {errors.phone ? <p className="mt-1 text-sm text-destructive">{errors.phone}</p> : null}
        </div>
      </div>

      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          className="mt-1.5"
          rows={5}
          placeholder="Tell us about the shoot — dates, location, what you're looking for…"
          value={values.message}
          onChange={(e) => update({ message: e.target.value })}
        />
        {errors.message ? <p className="mt-1 text-sm text-destructive">{errors.message}</p> : null}
      </div>

      {status === "error" ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0 translate-y-0.5" />
          <span>WhatsApp isn&apos;t available right now. Please try again later.</span>
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <LoaderCircle className="animate-spin" /> Sending…
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
}

export { ContactForm };
