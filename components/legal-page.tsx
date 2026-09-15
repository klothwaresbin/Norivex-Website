/* oxlint-disable nextjs/no-html-link-for-pages */

type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export function LegalPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: LegalSection[] }) {
  return (
    <main className="site-shell legal-shell">
      <header className="legal-header section-pad">
        <a className="brand" href="/#top" aria-label="Norivex Cyber home"><span className="brand-mark" aria-hidden="true"><span /></span><span>Norivex<span className="brand-muted"> Cyber</span></span></a>
        <nav className="legal-nav" aria-label="Site navigation"><a href="/#about">About</a><a href="/#contact">Request an assessment</a></nav>
      </header>
      <article className="legal-content section-pad">
        <div className="legal-hero">
          <p className="eyebrow"><span className="status-dot" /> {eyebrow}</p>
          <h1>{title}</h1>
          <p className="legal-intro">{intro}</p>
        </div>
        <div className="legal-sections">
          {sections.map(section => (
            <section className="legal-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets ? <ul>{section.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul> : null}
            </section>
          ))}
        </div>
      </article>
      <footer className="footer section-pad legal-footer"><a className="brand" href="/#top"><span className="brand-mark" aria-hidden="true"><span /></span><span>Norivex<span className="brand-muted"> Cyber</span></span></a><p>Cybersecurity assessments for modern businesses.</p><nav className="footer-nav" aria-label="Legal navigation"><a href="/privacy">Privacy Policy</a><a href="/assessment-terms">Assessment Terms</a></nav><span className="footer-meta">© 2026 Norivex Cyber · Built with care</span></footer>
    </main>
  );
}
