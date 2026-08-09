"use client";

import type * as React from "react";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getWhatsAppLink, type WhatsAppMessageInput } from "@/lib/quote/whatsapp";

export interface WhatsAppButtonProps extends WhatsAppMessageInput {
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
}

function WhatsAppButton({
  className,
  variant = "outline",
  size = "lg",
  ...message
}: WhatsAppButtonProps) {
  const link = getWhatsAppLink(message);

  if (!link) {
    return (
      <Button variant={variant} size={size} className={className} disabled title="WhatsApp isn't configured yet">
        <MessageCircle /> Send Kit to WhatsApp
      </Button>
    );
  }

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={link} target="_blank" rel="noopener noreferrer">
        <MessageCircle /> Send Kit to WhatsApp
      </a>
    </Button>
  );
}

export { WhatsAppButton };
