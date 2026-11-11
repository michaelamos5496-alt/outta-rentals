export interface ProjectDetails {
  projectName: string;
  projectType: string;
  shootLocation: string;
  productionDays: string;
  crewSize: string;
  additionalNotes: string;
}

export const emptyProjectDetails: ProjectDetails = {
  projectName: "",
  projectType: "",
  shootLocation: "",
  productionDays: "",
  crewSize: "",
  additionalNotes: "",
};

export interface CustomerDetails {
  name: string;
  company: string;
  email: string;
  phone: string;
  whatsapp: string;
}

export const emptyCustomerDetails: CustomerDetails = {
  name: "",
  company: "",
  email: "",
  phone: "",
  whatsapp: "",
};

export type DeliveryMethod = "pickup" | "delivery" | "";

export interface DeliveryDetails {
  method: DeliveryMethod;
  location: string;
  instructions: string;
}

export const emptyDeliveryDetails: DeliveryDetails = {
  method: "",
  location: "",
  instructions: "",
};

export interface QuoteKitLine {
  productSlug: string;
  productName: string;
  quantity: number;
  dayRate: number;
}

export interface QuoteSubmissionPayload {
  kit: QuoteKitLine[];
  startDate: string;
  endDate: string;
  rentalDays: number;
  estimatedTotal: number;
  project: ProjectDetails;
  customer: CustomerDetails;
  delivery: DeliveryDetails;
}

export type FieldErrors = Record<string, string>;
