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
  collateral_value: number | null;
borrower_equity: number | null;
proposed_loan_amount: number | null;
interest_rate: number | null;
term_months: number | null;
payment_type: string | null;
exit_strategy: string | null;
underwriting_notes: string | null;
underwriting_decision: string | null;
approval_conditions: string | null;
};

export default function CapitalRequestDetailPage() {
  const router = useRouter();
  const params = useParams();

  const requestId = String(params.id || "");

  const [loading, setLoading] = useState(true);
  const [request, setRequest] =
    useState<CapitalRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [status, setStatus] = useState("");
const [priority, setPriority] = useState("");
const [followUpDate, setFollowUpDate] = useState("");
const [internalNotes, setInternalNotes] = useState("");
const [saving, setSaving] = useState(false);
const [saveMessage, setSaveMessage] = useState("");
  const [collateralValue, setCollateralValue] = useState("");
const [borrowerEquity, setBorrowerEquity] = useState("");
const [proposedLoanAmount, setProposedLoanAmount] = useState("");
const [interestRate, setInterestRate] = useState("");
const [termMonths, setTermMonths] = useState("");
const [paymentType, setPaymentType] = useState("");
const [exitStrategy, setExitStrategy] = useState("");
const [underwritingNotes, setUnderwritingNotes] = useState("");
const [underwritingDecision, setUnderwritingDecision] =
  useState("pending");
const [approvalConditions, setApprovalConditions] = useState("");

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
      collateral_value,
      borrower_equity,
      proposed_loan_amount,
      interest_rate,
      term_months,
      payment_type,
      exit_strategy,
      underwriting_notes,
      underwriting_decision,
      approval_conditions,
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
      setStatus(data.status || "new");
setPriority(data.priority || "normal");
setFollowUpDate(data.follow_up_date || "");
setInternalNotes(data.internal_notes || "");
      setLoading(false);
    }

    if (requestId) {
      loadRequest();
    }
  }, [requestId, router]);

  async function handleSave() {
  if (!request) return;

  setSaving(true);
  setSaveMessage("");

  const { error } = await supabase
    .from("capital_requests")
    .update({
      status,
      priority,
      follow_up_date: followUpDate || null,
      internal_notes: internalNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", request.id);

  if (error) {
    setSaveMessage(
      "We could not save these changes. Please try again."
    );
    setSaving(false);
    return;
  }

  setRequest({
    ...request,
    status,
    priority,
    follow_up_date: followUpDate || null,
    internal_notes: internalNotes || null,
  });

  setSaveMessage("Changes saved successfully.");
  setSaving(false);
}
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

  <select
    value={status}
    onChange={(event) =>
      setStatus(event.target.value)
    }
    className="request-detail-select"
  >
    <option value="new">New</option>
    <option value="reviewing">Under Review</option>
    <option value="contacted">Contacted</option>
    <option value="due_diligence">
      Due Diligence
    </option>
    <option value="qualified">Qualified</option>
    <option value="approved">Approved</option>
    <option value="declined">Declined</option>
    <option value="closed">Closed</option>
  </select>
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

  <select
    value={priority}
    onChange={(event) =>
      setPriority(event.target.value)
    }
    className="request-detail-inline-select"
  >
    <option value="low">Low</option>
    <option value="normal">Normal</option>
    <option value="high">High</option>
    <option value="urgent">Urgent</option>
  </select>
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

  <input
    type="date"
    value={followUpDate}
    onChange={(event) =>
      setFollowUpDate(event.target.value)
    }
    className="request-detail-input"
  />
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

  <textarea
    value={internalNotes}
    onChange={(event) =>
      setInternalNotes(event.target.value)
    }
    className="request-detail-notes"
    rows={8}
    placeholder="Add internal underwriting notes, follow-up details, concerns, or next steps..."
  />

  <div className="request-detail-save-row">
    {saveMessage && (
      <span className="request-detail-save-message">
        {saveMessage}
      </span>
    )}

    <button
      type="button"
      onClick={handleSave}
      className="button-dark"
      disabled={saving}
    >
      {saving ? "Saving..." : "Save Changes"}
    </button>
  </div>
</section>
      </section>
    </main>
  );
}
