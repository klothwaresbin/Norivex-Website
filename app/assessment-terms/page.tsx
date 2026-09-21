import type { Metadata } from 'next';
import { LegalPage } from '../../components/legal-page';

export const metadata: Metadata = {
  title: 'Assessment Terms',
  description: 'Scope, authorization, and limitations for Norivex Cyber introductory security assessments.',
  alternates: { canonical: '/assessment-terms' },
};

export default function AssessmentTermsPage() {
  return <LegalPage eyebrow="Assessment terms" title="Clear boundaries before any review begins." intro="These terms describe the current scope and expectations for Norivex Cyber’s introductory, permission-based security assessments." sections={[
    { heading: 'Authorization comes first', paragraphs: ['Submitting the web form does not authorize security testing. Testing only begins after written authorization and an agreed scope are in place.', 'The requester must have authority to request an assessment for the business, website, domain, network, application, or system involved. Norivex Cyber may decline a request if authorization, ownership, or scope cannot be verified.'] },
    { heading: 'Current assessment approach', paragraphs: ['Norivex Cyber currently provides introductory, permission-based, non-destructive security assessments. Scope boundaries must be documented before work begins, and no activity will extend outside the agreed scope. Findings will be shared with the authorized business contact.'] },
    { heading: 'Activities that are not included', paragraphs: ['No exploitation, privilege escalation, persistence, destructive testing, denial-of-service testing, credential attacks, social engineering, or intrusive testing will be performed unless explicitly agreed to in writing as part of a future authorized engagement.'] },
    { heading: 'Limits and recommendations', paragraphs: ['No security assessment can guarantee that every vulnerability will be identified. No assessment can guarantee complete security or eliminate all cybersecurity risk.', 'The client remains responsible for deciding whether and how to implement recommendations. Norivex Cyber provides practical guidance based on the agreed scope and information available at the time of review.'] },
    { heading: 'General service information', paragraphs: ['These terms provide general service information and are not legal advice. Questions about a request or potential scope can be sent to connor@norivexcyber.date or by phone at 276-806-0921.'] },
  ]} />;
}
