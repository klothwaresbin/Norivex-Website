import { Resend } from 'resend';
import { type AssessmentPayload, validateAssessmentPayload } from '../../../lib/assessment';

type JsonObject = Record<string, unknown>;
type TurnstileVerification = { success?: boolean; ['error-codes']?: string[] };

const MAX_REQUEST_BYTES = 16 * 1024;
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function json(body: JsonObject, status: number) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function requestOriginAllowed(request: Request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;

  try {
    const url = new URL(origin);
    if (url.origin === 'https://norivexcyber.date') return true;
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return true;
    return url.hostname.endsWith('.workers.dev');
  } catch {
    return false;
  }
}

async function verifyTurnstile(token: string, request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const form = new FormData();
  form.set('secret', secret);
  form.set('response', token);

  const remoteIp = request.headers.get('CF-Connecting-IP');
  if (remoteIp) form.set('remoteip', remoteIp);

  try {
    const response = await fetch(SITEVERIFY_URL, { method: 'POST', body: form });
    if (!response.ok) return false;
    const result = (await response.json()) as TurnstileVerification;
    return result.success === true;
  } catch {
    return false;
  }
}

export async function GET() {
  return json({ error: 'Method not allowed.' }, 405);
}

export async function POST(request: Request) {
  if (!requestOriginAllowed(request)) return json({ error: 'Request origin is not allowed.' }, 403);

  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return json({ error: 'Content-Type must be application/json.' }, 415);
  }

  const declaredLength = Number(request.headers.get('Content-Length') ?? '0');
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return json({ error: 'Request is too large.' }, 413);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return json({ error: 'Unable to read request body.' }, 400);
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return json({ error: 'Request is too large.' }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  if (!isJsonObject(body)) return json({ error: 'Request body must be a JSON object.' }, 400);

  const payload: AssessmentPayload = {
    fullName: readString(body.fullName),
    businessName: readString(body.businessName),
    workEmail: readString(body.workEmail),
    phone: readString(body.phone),
    website: readString(body.website),
    industry: readString(body.industry),
    companySize: readString(body.companySize),
    reviewed: readString(body.reviewed),
    contactMethod: readString(body.contactMethod),
    message: readString(body.message),
    scopeAuthorization: body.scopeAuthorization === true,
    businessAuthorization: body.businessAuthorization === true,
    honeypot: readString(body.honeypot),
    turnstileToken: readString(body.turnstileToken),
  };

  if (payload.honeypot) return json({ error: 'Unable to process this request.' }, 400);

  const fields = validateAssessmentPayload(payload);
  if (Object.keys(fields).length > 0) return json({ error: 'Please correct the highlighted fields.', fields }, 422);

  if (!(await verifyTurnstile(payload.turnstileToken, request))) {
    return json({ error: 'Bot verification failed. Please refresh the page and try again.' }, 403);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const destination = process.env.ASSESSMENT_NOTIFICATION_EMAIL;
  if (!apiKey || !destination) return json({ error: 'Email notifications are not configured yet.' }, 503);

  const businessSubject = payload.businessName.replace(/[\r\n]/g, ' ').slice(0, 120);
  const submittedAt = new Date().toISOString();
  const row = (label: string, value: string) => `<tr><td style="padding:7px 14px 7px 0;color:#5f7180;vertical-align:top"><strong>${escapeHtml(label)}</strong></td><td style="padding:7px 0;color:#102231">${escapeHtml(value || 'Not provided')}</td></tr>`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#102231;max-width:680px"><h1 style="font-size:22px;margin:0 0 8px">New Norivex Cyber Assessment Request</h1><p style="color:#5f7180;margin:0 0 20px">Submitted ${escapeHtml(submittedAt)}</p><table style="border-collapse:collapse;width:100%;font-size:14px">${row('Full name', payload.fullName)}${row('Business name', payload.businessName)}${row('Work email', payload.workEmail)}${row('Phone number', payload.phone)}${row('Website/domain', payload.website)}${row('Industry', payload.industry)}${row('Company size', payload.companySize)}${row('Areas requested for review', payload.reviewed)}${row('Preferred contact method', payload.contactMethod)}${row('Additional message/context', payload.message)}${row('Scope authorization accepted', payload.scopeAuthorization ? 'Yes' : 'No')}${row('Business authorization confirmed', payload.businessAuthorization ? 'Yes' : 'No')}${row('Submission timestamp', submittedAt)}</table></div>`;

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: destination,
      replyTo: payload.workEmail,
      subject: `New Norivex Cyber Assessment Request — ${businessSubject}`,
      html,
    });

    if (error || !data?.id) return json({ error: 'Unable to send the assessment request right now.' }, 502);
    return json({ ok: true }, 200);
  } catch {
    return json({ error: 'Unable to send the assessment request right now.' }, 502);
  }
}
