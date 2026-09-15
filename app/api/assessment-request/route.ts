import { Resend } from 'resend';
import { type AssessmentPayload, validateAssessmentPayload } from '../../../lib/assessment';

type JsonObject = Record<string, unknown>;

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
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET() {
  return json({ error: 'Method not allowed.' }, 405);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
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
  };

  // Reject the hidden anti-spam field before checking configuration or contacting Resend.
  if (payload.honeypot) return json({ error: 'Unable to process this request.' }, 400);

  // Future Turnstile integration belongs here: verify its server-side token before Resend.
  const fields = validateAssessmentPayload(payload);

  if (Object.keys(fields).length > 0) return json({ error: 'Please correct the highlighted fields.', fields }, 422);

  const apiKey = process.env.RESEND_API_KEY;
  const destination = process.env.ASSESSMENT_NOTIFICATION_EMAIL;
  if (!apiKey || !destination) return json({ error: 'Email notifications are not configured yet.' }, 503);

  const businessSubject = payload.businessName.replace(/[\r\n]/g, ' ').slice(0, 120);
  const submittedAt = new Date().toISOString();
  const row = (label: string, value: string) => `<tr><td style="padding:7px 14px 7px 0;color:#5f7180;vertical-align:top"><strong>${escapeHtml(label)}</strong></td><td style="padding:7px 0;color:#102231">${escapeHtml(value || 'Not provided')}</td></tr>`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#102231;max-width:680px"><h1 style="font-size:22px;margin:0 0 8px">New Norivex Cyber Assessment Request</h1><p style="color:#5f7180;margin:0 0 20px">Submitted ${escapeHtml(submittedAt)}</p><table style="border-collapse:collapse;width:100%;font-size:14px">${row('Full name', payload.fullName)}${row('Business name', payload.businessName)}${row('Work email', payload.workEmail)}${row('Phone number', payload.phone)}${row('Website/domain', payload.website)}${row('Industry', payload.industry)}${row('Company size', payload.companySize)}${row('Areas requested for review', payload.reviewed)}${row('Preferred contact method', payload.contactMethod)}${row('Additional message/context', payload.message)}${row('Scope authorization accepted', payload.scopeAuthorization ? 'Yes' : 'No')}${row('Business authorization confirmed', payload.businessAuthorization ? 'Yes' : 'No')}${row('Submission timestamp', submittedAt)}</table></div>`;

  try {
    const resend = new Resend(apiKey);
    // Use Resend's test sender while developing; configure a verified production sender later.
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
