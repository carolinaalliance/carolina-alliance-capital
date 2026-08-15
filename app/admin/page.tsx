"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type AdminRecord = {
  role: string;
  is_active: boolean;
};

type CapitalRequest = {
  id: string;
  full_name: string;
  company: string | null;
  email: string;
  phone: string;
  capital_type: string;
  estimated_amount: string | null;
  location: string | null;
  description: string;
  preferred_contact_method: string | null;
  status: string;
  priority: string;
  follow_up_date: string | null;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState<CapitalRequest[]>([]);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    async function verifyAdminAndLoadRequests() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data: adminRecord, error: adminError } =
        await supabase
          .from("capital_admins")
          .select("role, is_active")
          .eq("user_id", user.id)
          .maybeSingle<AdminRecord>();

      if (
        adminError ||
        !adminRecord ||
        adminRecord.role !== "admin" ||
        adminRecord.is_active !== true
      ) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      setEmail(user.email || "");

      const { data: capitalRequests, error: requestLoadError } =
        await supabase
          .from("capital_requests")
          .select(
            `
              id,
              full_name,
              company,
              email,
              phone,
              capital_type,
              estimated_amount,
              location,
              description,
              preferred_contact_method,
              status,
              priority,
              follow_up_date,
              created_at
            `
          )
          .order("created_at", { ascending: false });

      if (requestLoadError) {
        setRequestError(
          "We could not load capital requests."
        );
      } else {
        setRequests(capitalRequests || []);
      }

      setLoading(false);
    }

    verifyAdminAndLoadRequests();
  }, [router]);

  const stats = useMemo(() => {
    return {
      newRequests: requests.filter(
        (request) => request.status === "new"
      ).length,

      underReview: requests.filter(
        (request) => request.status === "reviewing"
      ).length,

      dueDiligence: requests.filter(
        (request) => request.status === "due_diligence"
      ).length,

      closed: requests.filter(
        (request) => request.status === "closed"
      ).length,
    };
  }, [requests]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
            <strong>{stats.newRequests}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Under Review</span>
            <strong>{stats.underReview}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Due Diligence</span>
            <strong>{stats.dueDiligence}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Closed</span>
            <strong>{stats.closed}</strong>
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

          {requestError ? (
            <div className="admin-empty-state">
              <h3>Unable to load requests.</h3>
              <p>{requestError}</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="admin-empty-state">
              <h3>No capital requests yet.</h3>

              <p>
                New consultation requests will appear here
                automatically.
              </p>
            </div>
          ) : (
            <div className="capital-request-list">
              {requests.map((request) => (
                <Link
  href={`/admin/requests/${request.id}`}
  className="capital-request-card capital-request-link"
  key={request.id}
>
                  <div className="capital-request-main">
                    <div>
                      <div className="capital-request-meta">
                        <span className="capital-request-status">
                          {request.status.replaceAll("_", " ")}
                        </span>

                        <span>
                          {formatDate(request.created_at)}
                        </span>
                      </div>

                      <h3>{request.full_name}</h3>

                      <p>
                        {request.company
                          ? `${request.company} • `
                          : ""}
                        {request.capital_type.replaceAll(
                          "-",
                          " "
                        )}
                      </p>
                    </div>

                    <div className="capital-request-amount">
                      <span>Requested Capital</span>

                      <strong>
                        {request.estimated_amount || "Not provided"}
                      </strong>
                    </div>
                  </div>

                  <div className="capital-request-details">
                    <div>
                      <span>Email</span>
                      <strong>{request.email}</strong>
                    </div>

                    <div>
                      <span>Phone</span>
                      <strong>{request.phone}</strong>
                    </div>

                    <div>
                      <span>Location</span>
                      <strong>
                        {request.location || "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Priority</span>
                      <strong>{request.priority}</strong>
                    </div>
                  </div>

                  <div className="capital-request-description">
                    <span>Opportunity</span>
                    <p>{request.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
