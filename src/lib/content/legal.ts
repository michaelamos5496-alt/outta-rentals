export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDocument {
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
}

/**
 * Standard-form legal content for a production-equipment rental business.
 * Structurally complete, but written as a starting template — OUTTA should
 * have it reviewed by a lawyer familiar with Ghanaian law before treating
 * it as binding, and fill in the placeholders (registered entity name,
 * address, dispute jurisdiction) marked below.
 */

export const termsOfService: LegalDocument = {
  eyebrow: "Legal",
  title: "Terms of Service",
  lastUpdated: "10 August 2026",
  intro:
    "These Terms govern your use of the OUTTA RENTALS website and the services described on it. By browsing this site, submitting a quote request, or entering into a rental agreement with OUTTA, you agree to these Terms.",
  sections: [
    {
      heading: "1. Who we are",
      body: [
        "OUTTA RENTALS (\"OUTTA\", \"we\", \"us\") is a production-equipment rental business [registered entity name and address to be added] operating in Ghana.",
        "References to \"you\" mean the individual or organization requesting or renting equipment from OUTTA.",
      ],
    },
    {
      heading: "2. The website is not a booking system",
      body: [
        "Browsing the catalogue, adding items to a kit, and submitting a quote request through this website does not create a rental agreement or reserve equipment. Every request is reviewed by OUTTA and confirmed separately — availability, pricing and dates shown on the site are estimates until confirmed in writing.",
        "A binding rental agreement is formed only once OUTTA confirms a quote and both parties agree on the rental terms for that booking (see our Rental Terms).",
      ],
    },
    {
      heading: "3. Accounts and information you provide",
      body: [
        "When you submit a quote request or contact form, you agree to provide accurate, current information. You're responsible for the accuracy of the project details, dates and contact information you submit.",
        "We may decline any request at our discretion, including where equipment is unavailable, where information provided is incomplete, or where a prior rental with you was not honored.",
      ],
    },
    {
      heading: "4. Pricing",
      body: [
        "Prices on this website are shown in Ghana Cedis (₵) and are indicative daily/weekly rates for demonstration purposes. Final pricing — including any delivery, insurance, or damage-deposit charges — is confirmed at the quote stage and set out in your rental agreement.",
      ],
    },
    {
      heading: "5. Intellectual property",
      body: [
        "The OUTTA RENTALS name, logo, and the content of this website (except third-party photography credited elsewhere) belong to OUTTA. You may not reproduce, redistribute or use them commercially without our written permission.",
      ],
    },
    {
      heading: "6. Limitation of liability",
      body: [
        "This website and its content are provided \"as is\". OUTTA is not liable for indirect or consequential loss arising from your use of the site, including reliance on demo pricing or availability shown before a quote is confirmed.",
        "Nothing in these Terms limits liability that cannot be limited under Ghanaian law.",
      ],
    },
    {
      heading: "7. Changes to these Terms",
      body: [
        "We may update these Terms from time to time. Continuing to use the site after an update means you accept the revised Terms.",
      ],
    },
    {
      heading: "8. Governing law",
      body: [
        "These Terms are governed by the laws of Ghana. Disputes arising from your use of this website are subject to the exclusive jurisdiction of the courts of Ghana, [specific venue to be confirmed].",
      ],
    },
    {
      heading: "9. Contact",
      body: [
        "Questions about these Terms can be sent to OUTTA through the contact form or WhatsApp number listed on this site.",
      ],
    },
  ],
};

export const privacyPolicy: LegalDocument = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  lastUpdated: "10 August 2026",
  intro:
    "This policy explains what information OUTTA RENTALS collects when you use this website or request a quote, and how that information is used, stored and protected.",
  sections: [
    {
      heading: "1. Information we collect",
      body: [
        "Contact and project details you submit — name, email, phone number, company, project type, shoot dates and location — when you request a quote or use the contact form.",
        "Kit information — the equipment and dates you select while browsing, stored locally in your browser (localStorage) so your kit persists between visits. This is not sent to us until you submit a quote request.",
        "Technical information — standard web request data (such as IP address and browser type) collected automatically by our hosting provider for security and performance purposes.",
      ],
    },
    {
      heading: "2. How we use it",
      body: [
        "To respond to quote requests and contact-form submissions, and to prepare and manage rental agreements.",
        "To communicate with you about a booking, including by WhatsApp or email if you've provided those details.",
        "To improve this website's reliability and content — we do not sell your information or use it for third-party advertising.",
      ],
    },
    {
      heading: "3. Where information is stored",
      body: [
        "Quote requests and customer records are stored in our database, hosted with our infrastructure provider. Kit selections made before you submit a request stay in your browser's local storage and are never transmitted to us until you actively submit them.",
      ],
    },
    {
      heading: "4. Who we share it with",
      body: [
        "We don't sell or rent your personal information. It may be shared with service providers who help us operate the website and process bookings (such as our hosting and database providers), under obligations to keep it confidential, or where required by law.",
      ],
    },
    {
      heading: "5. Your rights",
      body: [
        "You can ask us what information we hold about you, request corrections, or ask us to delete records that aren't required for an active or completed rental agreement. Contact us using the details on the Contact page to make a request.",
      ],
    },
    {
      heading: "6. Cookies and local storage",
      body: [
        "This site uses browser local storage to remember your kit selection between visits. We don't currently use third-party advertising or tracking cookies.",
      ],
    },
    {
      heading: "7. Changes to this policy",
      body: [
        "We may update this policy as our practices evolve. The date at the top of this page reflects the most recent revision.",
      ],
    },
  ],
};

export const rentalTerms: LegalDocument = {
  eyebrow: "Legal",
  title: "Rental Terms",
  lastUpdated: "10 August 2026",
  intro:
    "These terms apply to every equipment rental confirmed with OUTTA RENTALS, in addition to our general Terms of Service. They're summarized here for transparency — your signed rental agreement is the binding document for a specific booking.",
  sections: [
    {
      heading: "1. Booking and confirmation",
      body: [
        "A rental is confirmed once OUTTA reviews your quote request, confirms equipment availability for your dates, and both parties agree on final pricing. Submitting a quote request does not itself reserve equipment.",
        "Rental periods are calculated in full days from pickup/delivery to return, inclusive of the start date.",
      ],
    },
    {
      heading: "2. Deposits and payment",
      body: [
        "A refundable security deposit is required for most equipment, sized to the replacement value of the kit. The deposit amount is confirmed with your quote and is separate from the rental fee.",
        "Full payment of the rental fee is due before equipment leaves OUTTA's premises, unless otherwise agreed in writing.",
      ],
    },
    {
      heading: "3. Equipment condition and use",
      body: [
        "Equipment is inspected and tested before every rental. You're responsible for checking equipment on collection and reporting any issue immediately — equipment is considered to be in good working order once accepted.",
        "Equipment must be used only for its intended purpose, by competent operators, and in line with any usage guidance provided by OUTTA at handover.",
      ],
    },
    {
      heading: "4. Loss, theft and damage",
      body: [
        "You're responsible for equipment from collection until it's returned to and inspected by OUTTA. This includes loss, theft, and damage beyond normal wear, regardless of cause.",
        "Where damage or loss occurs, repair or replacement costs are deducted from the security deposit; where costs exceed the deposit, the balance is payable by you.",
        "We strongly recommend production insurance for any rental involving higher-value equipment — ask us if you need a recommendation.",
      ],
    },
    {
      heading: "5. Late returns",
      body: [
        "Equipment must be returned by the agreed date and time. Late returns are charged at the applicable daily rate for each additional day, and may affect availability for the next renter — please contact us as early as possible if you need to extend.",
      ],
    },
    {
      heading: "6. Cancellations and changes",
      body: [
        "Cancellations made with reasonable notice before the rental start date are eligible for a full or partial refund of any deposit paid, at OUTTA's discretion depending on notice given. Cancellations close to the rental date may forfeit some or all of the deposit, since equipment is held exclusively for you.",
        "Changes to a confirmed kit or dates are subject to availability and may affect pricing.",
      ],
    },
    {
      heading: "7. Delivery and collection",
      body: [
        "Where delivery or collection is arranged (see Services), a delivery fee applies based on location. Equipment remains your responsibility from the moment of delivery, whether or not a OUTTA team member is present.",
      ],
    },
    {
      heading: "8. Prohibited use",
      body: [
        "Equipment may not be sub-rented to a third party, taken outside the agreed shoot location without prior approval, or used for any unlawful purpose.",
      ],
    },
  ],
};
