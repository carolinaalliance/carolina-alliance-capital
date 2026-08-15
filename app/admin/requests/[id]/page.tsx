"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

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
  internal_notes: string | null;
  follow_up_date: string | null;
  created_at: string;
};

export default function CapitalRequestDetailPage() {
  const router = useRouter();
  const params = useParams();

  const requestId = String(params.id || "");

  const [loading, setLoading] = useState(true);
  const [request, setRequest] =
    useState<CapitalRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadRequest() {
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

      const { data, error } = await supabase
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
            internal_notes,
            follow_up_date,
            created_at
          `
        )
        .eq("id", requestId)
        .maybeSingle<CapitalRequest>();

      if (error || !data) {
        setErrorMessage(
          "We could not load this capital request."
        );
        setLoading(false);
        return;
      }

      setRequest(data);
      setLoading(false);
    }

    if (requestId) {
      loadRequest();
    }
  }, [requestId, router]);

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="admin-dashboard-loading">
        <div>Loading capital request...</div>
      </main>
    );
  }

  if (errorMessage || !request) {
    return (
      <main className="admin-dashboard-page">
        <section className="admin-dashboard-shell">
          <Link
            href="/admin"
            className="admin-dashboard-link"
          >
            ← Back to Command Center
          </Link>

          <div className="admin-empty-state">
            <h3>Request unavailable.</h3>
            <p>{errorMessage}</p>
          </div>
        </section>
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

        <Link
          href="/admin"
          className="admin-signout-button"
        >
          Back to Command Center
        </Link>
      </header>

      <section className="admin-dashboard-shell">
        <div className="request-detail-topbar">
          <div>
            <p className="section-label">
              Capital Request
            </p>

            <h1 className="request-detail-title">
              {request.full_name}
            </h1>

            <p className="request-detail-subtitle">
              Submitted {formatDate(request.created_at)}
            </p>
          </div>

          <div className="request-detail-status-box">
            <span>Status</span>
            <strong>
              {request.status.replaceAll("_", " ")}
            </strong>
          </div>
        </div>

        <div className="request-detail-grid">
          <section className="request-detail-card">
            <p className="section-label">
              Opportunity Overview
            </p>

            <div className="request-detail-fields">
              <div>
                <span>Client</span>
                <strong>{request.full_name}</strong>
              </div>

              <div>
                <span>Company</span>
                <strong>
                  {request.company || "Not provided"}
                </strong>
              </div>

              <div>
                <span>Capital Type</span>
                <strong>
                  {request.capital_type.replaceAll(
                    "-",
                    " "
                  )}
                </strong>
              </div>

              <div>
                <span>Requested Capital</span>
                <strong>
                  {request.estimated_amount ||
                    "Not provided"}
                </strong>
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
          </section>

          <section className="request-detail-card">
            <p className="section-label">
              Contact Information
            </p>

            <div className="request-detail-fields">
              <div>
                <span>Email</span>
                <strong>{request.email}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{request.phone}</strong>
              </div>

              <div>
                <span>Preferred Contact</span>
                <strong>
                  {request.preferred_contact_method ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <span>Follow-Up Date</span>
                <strong>
                  {request.follow_up_date ||
                    "Not scheduled"}
                </strong>
              </div>
            </div>
          </section>
        </div>

        <section className="request-detail-card request-detail-wide">
          <p className="section-label">
            Opportunity Description
          </p>

          <p className="request-detail-description">
            {request.description}
          </p>
        </section>

        <section className="request-detail-card request-detail-wide">
          <p className="section-label">
            Internal Notes
          </p>

          <p className="request-detail-description">
            {request.internal_notes ||
              "No internal notes have been added yet."}
          </p>
        </section>
      </section>
    </main>
  );
}
