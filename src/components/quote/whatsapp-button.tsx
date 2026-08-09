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
}

function WhatsAppButton({
  label = "Send Kit to WhatsApp",
  className,
  variant = "outline",
  size = "lg",
  ...message
}: WhatsAppButtonProps) {
  const link = getWhatsAppLink(message);

  if (!link) {
    return (
      <Button variant={variant} size={size} className={className} disabled title="WhatsApp isn't configured yet">
        <MessageCircle /> {label}
      </Button>
    );
  }

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={link} target="_blank" rel="noopener noreferrer">
        <MessageCircle /> {label}
      </a>
    </Button>
  );
}

export { WhatsAppButton };
