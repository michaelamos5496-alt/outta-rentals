import type {
  CustomerDetails,
  DeliveryDetails,
  FieldErrors,
  ProjectDetails,
} from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-.\s\d]{7,20}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  return PHONE_RE.test(value.trim());
}

export function validateProjectDetails(project: ProjectDetails): FieldErrors {
  const errors: FieldErrors = {};
  if (!project.projectName.trim()) errors.projectName = "Project name is required.";
  if (!project.projectType.trim()) errors.projectType = "Choose a project type.";
  if (!project.shootLocation.trim()) errors.shootLocation = "Shoot location is required.";
  if (project.productionDays && (!/^\d+$/.test(project.productionDays) || Number(project.productionDays) < 1)) {
    errors.productionDays = "Enter a whole number of days.";
  }
  if (project.crewSize && (!/^\d+$/.test(project.crewSize) || Number(project.crewSize) < 1)) {
    errors.crewSize = "Enter a whole number.";
  }
  return errors;
}

export function validateCustomerDetails(customer: CustomerDetails): FieldErrors {
  const errors: FieldErrors = {};
  if (!customer.name.trim()) errors.name = "Name is required.";
  if (!customer.email.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(customer.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!customer.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!isValidPhone(customer.phone)) {
    errors.phone = "Enter a valid phone number.";
  }
  if (customer.whatsapp.trim() && !isValidPhone(customer.whatsapp)) {
    errors.whatsapp = "Enter a valid WhatsApp number.";
  }
  return errors;
}

export function validateDeliveryDetails(delivery: DeliveryDetails): FieldErrors {
  const errors: FieldErrors = {};
  if (!delivery.method) errors.method = "Choose pickup or delivery.";
  if (delivery.method === "delivery" && !delivery.location.trim()) {
    errors.location = "Delivery location is required.";
  }
  return errors;
}
