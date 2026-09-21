'use client';
/* oxlint-disable nextjs/no-html-link-for-pages */

import { useState } from 'react';
import { ArrowUpRight, Check, ChevronDown, CircleCheck, ExternalLink, Fingerprint, LockKeyhole, Menu, Radar, ShieldCheck, X, Zap } from 'lucide-react';
import { type AssessmentFieldErrors, type AssessmentPayload, validateAssessmentPayload } from '../lib/assessment';

const services = [
  { number: '01', icon: Radar, title: 'Basic security assessments', copy: 'A clear look at the exposed, everyday pieces of your business — from domain posture to account hygiene.', items: ['Public-facing exposure review', 'MFA, patching & backup check', 'Prioritized written report'] },
  { number: '02', icon: ShieldCheck, title: 'Vulnerability overviews', copy: 'A safe, permission-based review that turns technical signals into practical next steps your team can act on.', items: ['Common misconfiguration checks', 'Risk explained in plain language', 'Remediation roadmap'] },
  { number: '03', icon: Fingerprint, title: 'Security consultations', copy: 'A focused conversation for owners and small teams who want an experienced second set of eyes on security priorities.', items: ['Scope & permission planning', 'Security hygiene guidance', 'Questions answered without jargon'] },
];

const steps = [
  ['01', 'Scope together', 'We agree on exactly what is in scope, what is out of scope, and the written permission needed before anything begins.'],
  ['02', 'Review safely', 'I look for common, actionable gaps using a non-disruptive approach designed to keep your business moving.'],
  ['03', 'Make it useful', 'You receive a concise report with clear priorities, context, and practical recommendations — not a wall of fear.'],
];

type FormSubmitEvent = { preventDefault: () => void; currentTarget: HTMLFormElement };

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <div className={`reveal ${className}`}>{children}</div>; }

function FounderPortrait() {
  return <div className="founder-portrait-frame"><div className="portrait-media"><img src="/connor-headshot.png" alt="Connor, Founder of Norivex Cyber" loading="lazy" decoding="async" /></div><div className="portrait-caption"><span>FOUNDER / NORIVEX CYBER</span><span>MARTINSVILLE, VIRGINIA</span></div></div>;
}

function getFormValue(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function AssessmentForm() {
  const [errors, setErrors] = useState<AssessmentFieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');

  async function handleAssessmentSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload: AssessmentPayload = {
      fullName: getFormValue(data, 'fullName'),
      businessName: getFormValue(data, 'businessName'),
      workEmail: getFormValue(data, 'workEmail'),
      phone: getFormValue(data, 'phone'),
      website: getFormValue(data, 'website'),
      industry: getFormValue(data, 'industry'),
      companySize: getFormValue(data, 'companySize'),
      reviewed: getFormValue(data, 'reviewed'),
      contactMethod: getFormValue(data, 'contactMethod'),
      message: getFormValue(data, 'message'),
      scopeAuthorization: data.get('scopeAuthorization') === 'on',
      businessAuthorization: data.get('businessAuthorization') === 'on',
      honeypot: getFormValue(data, 'websiteConfirm'),
    };
    const nextErrors = validateAssessmentPayload(payload);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('sending');
    setSubmitError('');

    try {
      // A future Turnstile token can be added to this request when bot protection is enabled.
      const response = await fetch('/api/assessment-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = (await response.json().catch(() => ({}))) as { error?: string; fields?: AssessmentFieldErrors };
      if (!response.ok) {
        if (result.fields) setErrors(result.fields);
        throw new Error(result.error ?? 'Something went wrong while sending your request. Please try again or contact me directly.');
      }
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong while sending your request. Please try again or contact me directly.');
    }
  }

  function errorFor(name: string) {
    return errors[name] ? <p id={`${name}-error`} className="field-error" role="alert">{errors[name]}</p> : null;
  }

  if (status === 'success') {
    return <div className="contact-form-card success-state"><span className="success-icon"><Check size={23} /></span><h3>Thanks — your request has been received.</h3><p>I’ll review the details and follow up to discuss scope and next steps.</p><button className="button button-outline" type="button" onClick={() => { setStatus('idle'); setErrors({}); }}>Submit another request</button></div>;
  }

  return <div className="contact-form-card"><form noValidate onSubmit={handleAssessmentSubmit}><div className="form-heading"><span>Request a Free Security Assessment</span><span className="required-note">Required fields marked</span></div>{status === 'error' ? <p className="submit-error" role="alert">{submitError}</p> : null}<div className="assessment-form-grid"><input type="text" hidden className="honeypot-field" name="websiteConfirm" tabIndex={-1} autoComplete="off" aria-hidden="true" /><label className="form-field">Full name<input required name="fullName" autoComplete="name" aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'fullName-error' : undefined} />{errorFor('fullName')}</label><label className="form-field">Business name<input required name="businessName" autoComplete="organization" aria-invalid={Boolean(errors.businessName)} aria-describedby={errors.businessName ? 'businessName-error' : undefined} />{errorFor('businessName')}</label><label className="form-field">Work email<input required type="email" name="workEmail" autoComplete="email" aria-invalid={Boolean(errors.workEmail)} aria-describedby={errors.workEmail ? 'workEmail-error' : undefined} />{errorFor('workEmail')}</label><label className="form-field">Phone number <span className="optional-label">optional</span><input type="tel" name="phone" autoComplete="tel" /></label><label className="form-field form-field-full">Business website/domain<input required name="website" inputMode="url" placeholder="yourbusiness.com" aria-invalid={Boolean(errors.website)} aria-describedby={errors.website ? 'website-error' : undefined} />{errorFor('website')}</label><label className="form-field">Business type or industry<input required name="industry" placeholder="e.g. retail, construction, nonprofit" aria-invalid={Boolean(errors.industry)} aria-describedby={errors.industry ? 'industry-error' : undefined} />{errorFor('industry')}</label><label className="form-field">Approximate company size<select required name="companySize" defaultValue="" aria-invalid={Boolean(errors.companySize)} aria-describedby={errors.companySize ? 'companySize-error' : undefined}><option value="" disabled>Select one</option><option>Just me</option><option>2–10 employees</option><option>11–50 employees</option><option>51–250 employees</option><option>251+ employees</option></select>{errorFor('companySize')}</label><label className="form-field">What they would like reviewed<select required name="reviewed" defaultValue="" aria-invalid={Boolean(errors.reviewed)} aria-describedby={errors.reviewed ? 'reviewed-error' : undefined}><option value="" disabled>Select one</option><option>Public-facing website</option><option>Publicly accessible systems</option><option>Email/domain configuration</option><option>Basic security hygiene</option><option>Source code review, only if I own/provide the code</option><option>General security consultation</option><option>Not sure yet</option></select>{errorFor('reviewed')}</label><label className="form-field">Preferred contact method<select required name="contactMethod" defaultValue="" aria-invalid={Boolean(errors.contactMethod)} aria-describedby={errors.contactMethod ? 'contactMethod-error' : undefined}><option value="" disabled>Select one</option><option>Email</option><option>Phone</option><option>Either email or phone</option></select>{errorFor('contactMethod')}</label><label className="form-field form-field-full">Short message or additional context<textarea required name="message" rows={4} placeholder="What prompted you to reach out?" aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error' : undefined} />{errorFor('message')}</label><fieldset className="authorization-fieldset"><legend>Authorization and scope</legend><label className="consent"><input required type="checkbox" name="scopeAuthorization" aria-invalid={Boolean(errors.scopeAuthorization)} aria-describedby={errors.scopeAuthorization ? 'scopeAuthorization-error' : undefined} /><span>I understand that submitting this form does not authorize security testing. Any assessment will only begin after the scope and written authorization are agreed upon.</span></label>{errorFor('scopeAuthorization')}<label className="consent"><input required type="checkbox" name="businessAuthorization" aria-invalid={Boolean(errors.businessAuthorization)} aria-describedby={errors.businessAuthorization ? 'businessAuthorization-error' : undefined} /><span>I confirm that I am authorized to request an assessment for the business, website, domain, or systems listed in this form.</span></label>{errorFor('businessAuthorization')}<p className="form-legal-links"><a href="/privacy">Privacy Policy</a><span aria-hidden="true">·</span><a href="/assessment-terms">Assessment Terms</a></p></fieldset><button className="button button-primary form-submit" type="submit" disabled={status === 'sending'} aria-busy={status === 'sending'}>{status === 'sending' ? 'Sending request...' : <>Request a Free Security Assessment <ArrowUpRight size={17} /></>}</button></div></form><p className="form-disclaimer">Norivex Cyber currently provides introductory, permission-based security assessments focused on identifying visible risks and practical improvements. No exploitation, privilege escalation, destructive testing, or intrusive activity will be performed without explicit written scope and authorization.</p></div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="site-shell">
      <nav className="nav-wrap" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Norivex Cyber home"><span className="brand-mark" aria-hidden="true"><span /></span><span>Norivex<span className="brand-muted"> Cyber</span></span></a>
        <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a><a href="#process" onClick={() => setMenuOpen(false)}>Process</a><a href="#about" onClick={() => setMenuOpen(false)}>About</a><a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>Start a conversation <ArrowUpRight size={15} /></a>
        </div>
        <button className="menu-button" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </nav>

      <section id="top" className="hero section-pad">
        <div className="hero-copy">
          <Reveal><p className="eyebrow"><span className="status-dot" /> Practical security for growing businesses</p></Reveal>
          <Reveal className="delay-1"><h1>See what’s exposed.<br /><em>Know what to do next.</em></h1></Reveal>
          <Reveal className="delay-2"><p className="hero-sub">Norivex Cyber provides straightforward, permission-based security assessments for local businesses — at no cost while I build practical experience.</p></Reveal>
          <Reveal className="delay-3"><div className="hero-actions"><a className="button button-primary" href="#contact">Request a Free Security Assessment <ArrowUpRight size={17} /></a><a className="text-link" href="#services">Explore services <ChevronDown size={16} /></a></div></Reveal>
          <Reveal className="delay-4"><p className="hero-note"><LockKeyhole size={14} /> Safe, non-disruptive & confidential</p></Reveal>
        </div>
        <Reveal className="hero-visual delay-2"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" /><div className="visual-grid" /><div className="visual-core"><span className="core-pulse" /><ShieldCheck size={34} strokeWidth={1.4} /></div><div className="signal signal-top"><span className="signal-line" /><span>surface map</span><strong>ready</strong></div><div className="signal signal-right"><span className="signal-line" /><span>permission</span><strong className="cyan">required</strong></div><div className="signal signal-bottom"><span className="signal-line" /><span>report</span><strong>actionable</strong></div><div className="coordinates">36°43&apos; N&nbsp;&nbsp; 81°06&apos; W</div></Reveal>
      </section>

      <section className="trust-strip" aria-label="Assessment principles"><div><Check size={15} /> Written permission first</div><div><Check size={15} /> No-cost pilot projects</div><div><Check size={15} /> Findings stay confidential</div></section>

      <section id="services" className="section-pad services-section"><Reveal><div className="section-kicker"><span>What I look for</span><span className="kicker-line" /></div></Reveal><div className="section-heading-row"><Reveal><h2>Small gaps can create<br /><span>big questions.</span></h2></Reveal><Reveal className="delay-1"><p className="section-intro">Security doesn’t have to be mysterious or overwhelming. The goal is a calm, focused view of the basics that matter most to your business.</p></Reveal></div><div className="service-grid">{services.map((service, index) => { const Icon = service.icon; return <Reveal key={service.number} className={`delay-${index + 1}`}><article className="service-card"><div className="card-top"><span className="card-number">{service.number}</span><Icon size={22} strokeWidth={1.5} /></div><h3>{service.title}</h3><p>{service.copy}</p><ul>{service.items.map(item => <li key={item}><CircleCheck size={15} />{item}</li>)}</ul><a href="#contact" className="card-link">Talk about this <ArrowUpRight size={15} /></a></article></Reveal>; })}</div></section>

      <section id="process" className="process-section"><div className="section-pad process-inner"><Reveal><div className="section-kicker"><span>How it works</span><span className="kicker-line" /></div><h2>A better first step<br /><span>starts with clarity.</span></h2></Reveal><div className="steps-list">{steps.map(([number, title, copy], index) => <Reveal key={number} className={`step delay-${index + 1}`}><div className="step-number">{number}</div><div><h3>{title}</h3><p>{copy}</p></div><ArrowUpRight className="step-arrow" size={20} /></Reveal>)}</div></div></section>

      <section id="about" className="section-pad about-section"><Reveal className="about-panel"><div className="about-badge"><Zap size={18} /> Meet the founder <span className="about-location">Rooted in Martinsville, Virginia</span></div><div className="founder-layout"><FounderPortrait /><div className="founder-copy"><p className="founder-lede">Hi, I’m Connor — founder of Norivex Cyber.</p><p>I grew up in Martinsville, Virginia, and graduated from Martinsville High School in 2025. During that time, I played basketball and stayed involved in the community through local volunteering, including the Martinsville-Henry County Warming Shelter and community outreach events.</p><p>After high school, I attended Radford University to study cybersecurity. I’ve continued building my skills through independent study, hands-on labs, security research, and practical projects.</p><p>I started Norivex Cyber to help local businesses better understand their security risks and receive clear, practical guidance without unnecessary jargon. I currently offer free, permission-based introductory security assessments while continuing my own training and working toward the TryHackMe SEC-0 certification.</p><p>Long term, I hope to build a career in cybersecurity while continuing to help organizations protect the systems and communities they depend on.</p><a className="text-link" href="#contact">Start with a conversation <ArrowUpRight size={16} /></a></div></div></Reveal></section>

      <section id="contact" className="contact-section section-pad"><div className="contact-grid"><Reveal><div className="section-kicker"><span>Start here</span><span className="kicker-line" /></div><h2>Request a free<br /><em>security assessment.</em></h2><p className="contact-intro">Share a little about your business and what you would like reviewed. There’s no cost and no obligation.</p><div className="contact-details"><a href="tel:+12768060921"><span>Phone</span>276-806-0921</a><a href="mailto:connor@norivexcyber.date"><span>Email</span>connor@norivexcyber.date</a></div><div className="social-links"><a href="https://www.linkedin.com/in/conbonsells/" target="_blank" rel="noreferrer" aria-label="Connor Worthington on LinkedIn"><ExternalLink size={17} /> LinkedIn</a><a href="https://github.com/klothwaresbin" target="_blank" rel="noreferrer" aria-label="Connor Worthington on GitHub"><ExternalLink size={17} /> GitHub</a></div></Reveal><Reveal className="delay-2"><AssessmentForm /></Reveal></div></section>

      <footer className="footer section-pad"><a className="brand" href="#top"><span className="brand-mark" aria-hidden="true"><span /></span><span>Norivex<span className="brand-muted"> Cyber</span></span></a><p>Cybersecurity assessments for modern businesses.</p><nav className="footer-nav" aria-label="Legal navigation"><a href="/privacy">Privacy Policy</a><a href="/assessment-terms">Assessment Terms</a></nav><span className="footer-meta">© 2026 Norivex Cyber · Built with care</span></footer>
    </main>
  );
}
