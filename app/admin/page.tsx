"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type AdminRecord = {
  role: string;
  is_active: boolean;
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function verifyAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data: adminRecord, error } = await supabase
        .from("capital_admins")
        .select("role, is_active")
        .eq("user_id", user.id)
        .maybeSingle<AdminRecord>();

      if (
        error ||
        !adminRecord ||
        adminRecord.role !== "admin" ||
        adminRecord.is_active !== true
      ) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      setEmail(user.email || "");
      setLoading(false);
    }

    verifyAdmin();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="admin-dashboard-loading">
        <div>Verifying secure access...</div>
      </main>
    );
  }

  return (
    <main className="admin-dashboard-page">
      <header className="admin-dashboard-header">
        <div>
          <div className="admin-dashboard-brand">
            CAROLINA ALLIANCE
          </div>

          <div className="admin-dashboard-brand-subtitle">
            CAPITAL
          </div>
        </div>

        <div className="admin-dashboard-user">
          <span>{email}</span>

          <button
            type="button"
            onClick={handleSignOut}
            className="admin-signout-button"
          >
            Sign Out
          </button>
        </div>
      </header>

      <section className="admin-dashboard-shell">
        <div className="admin-dashboard-intro">
          <p className="section-label">
            Private Capital Administration
          </p>

          <h1 className="admin-dashboard-title">
            Capital Requests
            <em> Command Center</em>
          </h1>

          <p className="admin-dashboard-copy">
            Review new opportunities, manage follow-up,
            track underwriting progress, and move qualified
            capital requests through the pipeline.
          </p>
        </div>

        <div className="admin-dashboard-stats">
          <div className="admin-stat-card">
            <span>New Requests</span>
            <strong>—</strong>
          </div>

          <div className="admin-stat-card">
            <span>Under Review</span>
            <strong>—</strong>
          </div>

          <div className="admin-stat-card">
            <span>Due Diligence</span>
            <strong>—</strong>
          </div>

          <div className="admin-stat-card">
            <span>Closed</span>
            <strong>—</strong>
          </div>
        </div>

        <section className="admin-dashboard-panel">
          <div className="admin-dashboard-panel-header">
            <div>
              <p className="section-label">
                Opportunity Pipeline
              </p>

              <h2>Capital Requests</h2>
            </div>

            <Link
              href="/"
              className="admin-dashboard-link"
            >
              View Public Website →
            </Link>
          </div>

          <div className="admin-empty-state">
            <h3>Command Center foundation is ready.</h3>

            <p>
              The next step will connect this workspace
              directly to the secured capital_requests
              database.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
