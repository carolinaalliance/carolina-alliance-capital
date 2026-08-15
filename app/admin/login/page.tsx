"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setErrorMessage(
        "We could not sign you in. Please check your email and password."
      );

      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-shell">
        <div className="admin-login-brand">
          <Link href="/">
            <div className="admin-login-brand-name">
              CAROLINA ALLIANCE
            </div>

            <div className="admin-login-brand-subtitle">
              CAPITAL
            </div>
          </Link>
        </div>

        <div className="admin-login-grid">
          <div className="admin-login-intro">
            <p className="section-label">
              Private Administration
            </p>

            <h1 className="admin-login-title">
              Capital management
              <em> begins here.</em>
            </h1>

            <p className="admin-login-copy">
              Secure access to capital requests,
              opportunity review, underwriting,
              follow-up, and internal deal management.
            </p>

            <div className="admin-security-note">
              <strong>Restricted Access</strong>

              <p>
                This area contains private client,
                financial, and transaction information.
                Access is limited to authorized Carolina
                Alliance Capital personnel.
              </p>
            </div>
          </div>

          <div className="admin-login-card">
            <div className="admin-login-card-header">
              <p className="section-label">
                Authorized Access
              </p>

              <h2>Admin Login</h2>

              <p>
                Enter your authorized email address and
                password.
              </p>
            </div>

            <form
              className="admin-login-form"
              onSubmit={handleLogin}
            >
              <div className="form-field">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />
              </div>

              {errorMessage && (
                <div className="admin-login-error">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="button-dark admin-login-button"
                disabled={loading}
              >
                {loading
                  ? "Signing In..."
                  : "Sign In to Command Center"}
              </button>
            </form>

            <div className="admin-login-footer">
              <Link href="/">
                ← Return to Carolina Alliance Capital
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
