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
};

export type AssessmentFieldErrors = Record<string, string>;

type RequiredTextField = Exclude<keyof AssessmentPayload, 'scopeAuthorization' | 'businessAuthorization' | 'honeypot'>;

const emailPattern = /^\S+@\S+\.\S+$/;

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

  if (payload.workEmail && !emailPattern.test(payload.workEmail)) errors.workEmail = 'Enter a valid work email.';
  if (payload.website && !isValidWebsite(payload.website)) errors.website = 'Enter a valid website or domain.';
  if (!payload.scopeAuthorization) errors.scopeAuthorization = 'Please confirm the assessment authorization terms.';
  if (!payload.businessAuthorization) errors.businessAuthorization = 'Please confirm that you are authorized to request this assessment.';

  return errors;
}
