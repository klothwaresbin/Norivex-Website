export type AssessmentPayload = {
  fullName: string;
  businessName: string;
  workEmail: string;
  phone: string;
  website: string;
  industry: string;
  companySize: string;
  reviewed: string;
  contactMethod: string;
  message: string;
  scopeAuthorization: boolean;
  businessAuthorization: boolean;
  honeypot: string;
  turnstileToken: string;
};

export type AssessmentFieldErrors = Record<string, string>;

type RequiredTextField = Exclude<keyof AssessmentPayload, 'scopeAuthorization' | 'businessAuthorization' | 'honeypot' | 'turnstileToken'>;

const emailPattern = /^\S+@\S+\.\S+$/;
const textLimits: Partial<Record<keyof AssessmentPayload, number>> = {
  fullName: 100,
  businessName: 120,
  workEmail: 254,
  phone: 40,
  website: 300,
  industry: 120,
  companySize: 40,
  reviewed: 120,
  contactMethod: 40,
  message: 2000,
  honeypot: 200,
  turnstileToken: 4096,
};

const allowedCompanySizes = new Set(['Just me', '2–10 employees', '11–50 employees', '51–250 employees', '251+ employees']);
const allowedReviewed = new Set(['Public-facing website', 'Publicly accessible systems', 'Email/domain configuration', 'Basic security hygiene', 'Source code review, only if I own/provide the code', 'General security consultation', 'Not sure yet']);
const allowedContactMethods = new Set(['Email', 'Phone', 'Either email or phone']);

export function isValidWebsite(value: string) {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    return Boolean(url.hostname && url.hostname.includes('.') && !url.username && !url.password);
  } catch {
    return false;
  }
}

export function validateAssessmentPayload(payload: AssessmentPayload): AssessmentFieldErrors {
  const errors: AssessmentFieldErrors = {};
  const requiredFields: Array<[RequiredTextField, string]> = [
    ['fullName', 'Full name'],
    ['businessName', 'Business name'],
    ['workEmail', 'Work email'],
    ['website', 'Business website/domain'],
    ['industry', 'Business type or industry'],
    ['companySize', 'Approximate company size'],
    ['reviewed', 'What they would like reviewed'],
    ['contactMethod', 'Preferred contact method'],
    ['message', 'Short message or additional context'],
  ];

  requiredFields.forEach(([name, label]) => {
    if (!payload[name].trim()) errors[name] = `${label} is required.`;
  });

  for (const [name, limit] of Object.entries(textLimits) as Array<[keyof AssessmentPayload, number]>) {
    const value = payload[name];
    if (typeof value === 'string' && value.length > limit) {
      errors[name] = `Keep this field under ${limit} characters.`;
    }
  }

  if (payload.workEmail && !emailPattern.test(payload.workEmail)) errors.workEmail = 'Enter a valid work email.';
  if (payload.website && !isValidWebsite(payload.website)) errors.website = 'Enter a valid website or domain.';
  if (payload.companySize && !allowedCompanySizes.has(payload.companySize)) errors.companySize = 'Select a valid company size.';
  if (payload.reviewed && !allowedReviewed.has(payload.reviewed)) errors.reviewed = 'Select a valid review option.';
  if (payload.contactMethod && !allowedContactMethods.has(payload.contactMethod)) errors.contactMethod = 'Select a valid contact method.';
  if (!payload.scopeAuthorization) errors.scopeAuthorization = 'Please confirm the assessment authorization terms.';
  if (!payload.businessAuthorization) errors.businessAuthorization = 'Please confirm that you are authorized to request this assessment.';

  return errors;
}
