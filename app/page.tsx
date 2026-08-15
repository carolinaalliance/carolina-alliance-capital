import Link from "next/link";

const services = [
  {
    number: "01",
    title: "Private Lending",
    description:
      "Thoughtful private financing solutions structured around the borrower, the asset, and the opportunity.",
  },
  {
    number: "02",
    title: "Real Estate Capital",
    description:
      "Capital solutions for acquisitions, investment properties, bridge opportunities, and qualified real estate transactions.",
  },
  {
    number: "03",
    title: "Business Capital",
    description:
      "Relationship-driven financing for qualified businesses, entrepreneurs, and strategic opportunities.",
  },
  {
    number: "04",
    title: "Private Wealth",
    description:
      "A long-term approach to capital stewardship, family wealth, and strategic financial planning.",
  },
];

const principles = [
  "Relationship First",
  "Disciplined Underwriting",
  "Long-Term Thinking",
  "Confidentiality",
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" aria-label="Carolina Alliance Capital home">
            <div className="brand-title">CAROLINA ALLIANCE</div>
            <div className="brand-subtitle">CAPITAL</div>
          </Link>

          <nav className="site-nav" aria-label="Main navigation">
            <Link href="#capital">Private Capital</Link>
            <Link href="#real-estate">Real Estate</Link>
            <Link href="#business">Business</Link>
            <Link href="#about">About</Link>
          </nav>

          <Link href="/contact" className="header-button">
            Private Consultation
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">
            Private Capital • Real Estate • Business
          </p>

          <h1 className="hero-title">
            Capital with
            <span>purpose.</span>
          </h1>

          <p className="hero-copy">
            Private capital solutions grounded in relationships, disciplined
            decision-making, and a long-term view of wealth.
          </p>

          <div className="button-row">
            <Link href="/contact" className="button-primary">
              Start a Conversation
            </Link>

            <Link href="#about" className="button-secondary">
              Explore Our Approach
            </Link>
          </div>
        </div>
      </section>

      <section className="section intro-section" id="about">
        <div className="section-inner intro-grid">
          <div>
            <p className="section-label">A Different Approach</p>
          </div>

          <div>
            <h2 className="section-heading">
              Money is important.
              <br />
              <em>Relationships are more important.</em>
            </h2>

            <p className="section-copy">
              Carolina Alliance Capital is being built around a simple
              principle: capital should serve a purpose. We pursue
              opportunities through careful analysis, transparent
              communication, responsible stewardship, and relationships
              designed to last.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="capital">
        <div className="section-inner">
          <div className="services-header">
            <div>
              <p className="section-label">Our Capabilities</p>

              <h2 className="section-heading">
                Private capital.
                <br />
                <em>Personally considered.</em>
              </h2>
            </div>

            <p className="services-header-copy">
              Solutions designed around the individual transaction rather than
              forcing every opportunity into the same box.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <article className="service-card" key={service.number}>
                <div className="service-number">{service.number}</div>

                <h3 className="service-title">{service.title}</h3>

                <p className="service-copy">{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section philosophy-section" id="business">
        <div className="section-inner philosophy-grid">
          <div>
            <p className="eyebrow">Our Philosophy</p>

            <h2 className="section-heading">
              Built for the
              <br />
              <em>long term.</em>
            </h2>
          </div>

          <div>
            <p className="philosophy-copy">
              We believe good financial decisions begin with understanding the
              people, property, businesses, and objectives behind the numbers.
            </p>

            <div className="principles">
              {principles.map((principle, index) => (
                <div className="principle-row" key={principle}>
                  <span>{principle}</span>
                  <span>0{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="real-estate">
        <div className="section-inner feature-grid">
          <div className="feature-visual">
            <p className="feature-quote">
              Capital decisions deserve more than an algorithm. We look beyond
              the transaction to understand the complete opportunity.
            </p>
          </div>

          <div>
            <p className="section-label">Real Estate Capital</p>

            <h2 className="section-heading">
              Real estate is more
              <br />
              <em>than collateral.</em>
            </h2>

            <p className="section-copy">
              Every property has a story, every investment has an objective,
              and every transaction has its own risk profile. Our approach
              begins by understanding all three.
            </p>

            <Link href="#consultation" className="text-link">
              Explore Real Estate Capital →
            </Link>
          </div>
        </div>
      </section>

      <section className="section cta-section" id="consultation">
        <div className="section-inner">
          <div className="cta-inner">
            <p className="section-label">Begin a Conversation</p>

            <h2 className="section-heading">
              Some opportunities deserve
              <br />
              <em>a closer look.</em>
            </h2>

            <p className="section-copy">
              Tell us about the opportunity, property, business, or objective
              you're considering.
            </p>

            <div className="button-row" style={{ justifyContent: "center" }}>
             <Link href="/contact" className="button-dark">
  Request a Private Consultation
</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              CAROLINA ALLIANCE
              <span>CAPITAL</span>
            </div>

            <div className="footer-disclaimer">
              Carolina Alliance Capital is not represented on this website as
              a bank or federally insured depository institution. Products,
              services, licensing, eligibility requirements, and disclosures
              will vary according to the final legal and regulatory structure
              of the company. Nothing on this website constitutes an offer of
              securities, investment advice, or a commitment to lend.
            </div>
          </div>

          <div className="footer-bottom">
            © {new Date().getFullYear()} Carolina Alliance Capital. All rights
            reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
