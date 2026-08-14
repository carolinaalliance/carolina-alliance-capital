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
    <main className="min-h-screen bg-[#f6f3ec] text-[#17231d]">
      {/* Header */}
      <header className="absolute left-0 top-0 z-50 w-full border-b border-white/15">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <Link href="/" className="group">
            <div className="text-xl font-semibold tracking-[0.16em] text-white">
              CAROLINA ALLIANCE
            </div>
            <div className="mt-1 text-[10px] tracking-[0.42em] text-[#d4bd84]">
              CAPITAL
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-white/85 lg:flex">
            <Link href="#capital" className="transition hover:text-white">
              Private Capital
            </Link>
            <Link href="#real-estate" className="transition hover:text-white">
              Real Estate
            </Link>
            <Link href="#business" className="transition hover:text-white">
              Business
            </Link>
            <Link href="#about" className="transition hover:text-white">
              About
            </Link>
          </nav>

          <Link
            href="/contact"
            className="rounded-sm border border-[#d4bd84] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#d4bd84] hover:text-[#17231d]"
          >
            Private Consultation
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-[#14251e]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -right-32 top-24 h-[520px] w-[520px] rounded-full border border-[#d4bd84]/30" />
          <div className="absolute -right-10 top-10 h-[520px] w-[520px] rounded-full border border-[#d4bd84]/15" />
          <div className="absolute bottom-[-250px] left-[-160px] h-[600px] w-[600px] rounded-full border border-white/10" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-6 pt-32 lg:px-10">
          <div className="max-w-4xl">
            <p className="mb-7 text-xs font-semibold uppercase tracking-[0.35em] text-[#d4bd84]">
              Private Capital • Real Estate • Business
            </p>

            <h1 className="max-w-4xl text-5xl font-light leading-[1.05] tracking-tight text-white md:text-7xl lg:text-[88px]">
              Capital with
              <span className="block font-serif italic text-[#d4bd84]">
                purpose.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/70 md:text-xl">
              Private capital solutions grounded in relationships,
              disciplined decision-making, and a long-term view of wealth.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="bg-[#d4bd84] px-7 py-4 text-center text-xs font-semibold uppercase tracking-[0.17em] text-[#17231d] transition hover:bg-[#e1cd9f]"
              >
                Start a Conversation
              </Link>

              <Link
                href="#capital"
                className="border border-white/25 px-7 py-4 text-center text-xs font-semibold uppercase tracking-[0.17em] text-white transition hover:border-white/60"
              >
                Explore Our Approach
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="border-b border-[#17231d]/10 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#887344]">
              A Different Approach
            </p>
          </div>

          <div>
            <h2 className="max-w-3xl text-3xl font-light leading-tight md:text-5xl">
              Money is important.
              <span className="font-serif italic text-[#887344]">
                {" "}
                Relationships are more important.
              </span>
            </h2>

            <p className="mt-7 max-w-2xl text-base leading-8 text-[#526058]">
              Carolina Alliance Capital is being built around a simple
              principle: capital should serve a purpose. We pursue
              opportunities through careful analysis, transparent
              communication, responsible stewardship, and relationships
              designed to last.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="capital" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-16 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-[#887344]">
                Our Capabilities
              </p>

              <h2 className="text-4xl font-light md:text-6xl">
                Private capital.
                <span className="block font-serif italic text-[#887344]">
                  Personally considered.
                </span>
              </h2>
            </div>

            <p className="max-w-sm leading-7 text-[#667169]">
              Solutions designed around the individual transaction rather
              than forcing every opportunity into the same box.
            </p>
          </div>

          <div className="grid border-l border-t border-[#17231d]/15 md:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.number}
                className="group min-h-[310px] border-b border-r border-[#17231d]/15 p-8 transition duration-300 hover:bg-[#17231d] md:p-10"
              >
                <div className="text-xs tracking-[0.2em] text-[#9a8657]">
                  {service.number}
                </div>

                <h3 className="mt-20 text-2xl font-normal transition group-hover:text-white md:text-3xl">
                  {service.title}
                </h3>

                <p className="mt-4 max-w-md leading-7 text-[#667169] transition group-hover:text-white/65">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-[#17231d] py-24 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-[#d4bd84]">
                Our Philosophy
              </p>

              <h2 className="max-w-lg text-4xl font-light leading-tight md:text-6xl">
                Built for the
                <span className="block font-serif italic text-[#d4bd84]">
                  long term.
                </span>
              </h2>
            </div>

            <div>
              <p className="max-w-xl text-lg leading-8 text-white/70">
                We believe good financial decisions begin with understanding
                the people, property, businesses, and objectives behind the
                numbers.
              </p>

              <div className="mt-12">
                {principles.map((principle, index) => (
                  <div
                    key={principle}
                    className="flex items-center justify-between border-t border-white/15 py-5"
                  >
                    <span className="text-lg">{principle}</span>
                    <span className="text-xs text-[#d4bd84]">
                      0{index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Estate */}
      <section id="real-estate" className="py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:px-10">
          <div className="flex min-h-[500px] items-end bg-[#d9d3c4] p-10">
            <div className="max-w-sm border-l border-[#887344] pl-6">
              <p className="text-sm leading-7 text-[#536058]">
                Capital decisions deserve more than an algorithm. We look
                beyond the transaction to understand the complete opportunity.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center lg:pl-12">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-[#887344]">
              Real Estate Capital
            </p>

            <h2 className="text-4xl font-light leading-tight md:text-6xl">
              Real estate is more
              <span className="block font-serif italic text-[#887344]">
                than collateral.
              </span>
            </h2>

            <p className="mt-7 max-w-xl leading-8 text-[#667169]">
              Every property has a story, every investment has an objective,
              and every transaction has its own risk profile. Our approach
              begins by understanding all three.
            </p>

            <Link
              href="/real-estate-capital"
              className="mt-9 w-fit border-b border-[#17231d] pb-2 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              Explore Real Estate Capital →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#e3ddcf] py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-[#887344]">
            Begin a Conversation
          </p>

          <h2 className="text-4xl font-light leading-tight md:text-6xl">
            Some opportunities deserve
            <span className="block font-serif italic text-[#887344]">
              a closer look.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-xl leading-8 text-[#667169]">
            Tell us about the opportunity, property, business, or objective
            you're considering.
          </p>

          <Link
            href="/contact"
            className="mt-9 inline-block bg-[#17231d] px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white"
          >
            Request a Private Consultation
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0e1814] py-14 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div>
              <div className="text-lg tracking-[0.15em]">
                CAROLINA ALLIANCE
              </div>
              <div className="mt-1 text-[10px] tracking-[0.42em] text-[#d4bd84]">
                CAPITAL
              </div>
            </div>

            <div className="max-w-xl text-xs leading-6 text-white/45">
              Carolina Alliance Capital is not represented on this website as
              a bank or federally insured depository institution. Products,
              services, licensing, eligibility requirements, and disclosures
              will vary according to the final legal and regulatory structure
              of the company. Nothing on this website constitutes an offer of
              securities, investment advice, or a commitment to lend.
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-7 text-xs text-white/35">
            © {new Date().getFullYear()} Carolina Alliance Capital. All rights
            reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
