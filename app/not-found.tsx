/* oxlint-disable nextjs/no-html-link-for-pages */

export default function NotFound() {
  return (
    <main className="site-shell legal-shell">
      <header className="legal-header section-pad">
        <a className="brand" href="/#top" aria-label="Norivex Cyber home">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span>Norivex<span className="brand-muted"> Cyber</span></span>
        </a>
      </header>
      <section className="legal-content section-pad">
        <div className="legal-hero">
          <p className="eyebrow"><span className="status-dot" /> 404</p>
          <h1>That page could not be found.</h1>
          <p className="legal-intro">The address may have changed or the page may no longer exist.</p>
          <a className="button button-primary" href="/">Return to Norivex Cyber</a>
        </div>
      </section>
    </main>
  );
}
