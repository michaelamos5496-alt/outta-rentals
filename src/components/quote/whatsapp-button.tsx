"use client";

import type * as React from "react";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getWhatsAppLink, type WhatsAppMessageInput } from "@/lib/quote/whatsapp";

export interface WhatsAppButtonProps extends WhatsAppMessageInput {
  label?: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  /** Recipient number; defaults to OUTTA's configured WhatsApp number. */
  to?: string;
  /** Called when the link is opened — e.g. to record the request. */
  onSend?: () => void;
}

function WhatsAppButton({
  label = "Send Kit",
  className,
  variant = "outline",
  size = "lg",
  to,
  onSend,
  ...message
}: WhatsAppButtonProps) {
  const link = getWhatsAppLink(message, to);

  if (!link) {
    return (
      <Button variant={variant} size={size} className={className} disabled title="WhatsApp isn't configured yet">
        <MessageCircle /> {label}
      </Button>
    );
  }

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={link} target="_blank" rel="noopener noreferrer" onClick={onSend}>
        <MessageCircle /> {label}
      </a>
    </Button>
  );
}

export { WhatsAppButton };
