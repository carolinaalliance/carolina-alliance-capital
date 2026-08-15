"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const { error } = await supabase
    .from("capital_requests")
    .insert({
      full_name: String(formData.get("name") || ""),
      company: String(formData.get("company") || "") || null,
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      capital_type: String(formData.get("capitalType") || ""),
      estimated_amount:
        String(formData.get("amount") || "") || null,
      location:
        String(formData.get("location") || "") || null,
      description:
        String(formData.get("description") || ""),
      preferred_contact_method:
        String(formData.get("contactMethod") || "either"),
    });

  if (error) {
  console.error("Capital request submission error:", error);

  alert(
    `Supabase error: ${error.message}`
  );

  return;
}

  setSubmitted(true);
}

  if (submitted) {
    return (
      <main>
        <section className="contact-page">
          <div className="contact-shell">
            <Link href="/" className="contact-brand">
              <span>CAROLINA ALLIANCE</span>
              <small>CAPITAL</small>
            </Link>

            <div className="contact-success">
              <p className="section-label">Request Received</p>

              <h1 className="contact-title">
                Thank you for
                <em> starting the conversation.</em>
              </h1>

              <p className="contact-intro">
                Your information has been received. A member of Carolina
                Alliance Capital will review the opportunity and follow up
                regarding the appropriate next step.
              </p>

              <Link href="/" className="button-dark">
                Return Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="contact-page">
        <div className="contact-shell">
          <div className="contact-topbar">
            <Link href="/" className="contact-brand">
              <span>CAROLINA ALLIANCE</span>
              <small>CAPITAL</small>
            </Link>

            <Link href="/" className="contact-back">
              ← Return Home
            </Link>
          </div>

          <div className="contact-grid">
            <div className="contact-copy">
              <p className="section-label">Private Consultation</p>

              <h1 className="contact-title">
                Tell us about the
                <em> opportunity.</em>
              </h1>

              <p className="contact-intro">
                Every transaction begins with understanding the people,
                property, business, and objective behind the numbers.
              </p>

              <div className="contact-note">
                <strong>Confidential by design.</strong>
                <p>
                  Information submitted through this form is intended for
                  initial evaluation only and does not constitute an
                  application, approval, commitment to lend, investment
                  advice, or offer of securities.
                </p>
              </div>
            </div>

            <form className="capital-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="name">Full Name</label>
                  <input id="name" name="name" type="text" required />
                </div>

                <div className="form-field">
                  <label htmlFor="company">Company</label>
                  <input id="company" name="company" type="text" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" required />
                </div>

                <div className="form-field">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" type="tel" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="capitalType">Capital Need</label>
                  <select id="capitalType" name="capitalType" required>
                    <option value="">Select one</option>
                    <option value="private-lending">Private Lending</option>
                    <option value="real-estate">Real Estate Capital</option>
                    <option value="business">Business Capital</option>
                    <option value="other">Other Opportunity</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="amount">Estimated Amount</label>
                  <input
                    id="amount"
                    name="amount"
                    type="text"
                    placeholder="$"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="location">
                  Property or Business Location
                </label>
                <input id="location" name="location" type="text" />
              </div>

              <div className="form-field">
                <label htmlFor="description">
                  Brief Description of Opportunity
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={7}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="contactMethod">
                  Preferred Contact Method
                </label>

                <select id="contactMethod" name="contactMethod">
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                  <option value="either">Either</option>
                </select>
              </div>

              <button type="submit" className="button-dark form-submit">
                Submit Private Request
              </button>

              <p className="form-disclaimer">
                Submission does not constitute an application for credit,
                approval, commitment to lend, investment agreement, or
                financial advisory relationship.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
