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
monthly_noi: number | null;  
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
const [monthlyNoi, setMonthlyNoi] = useState("");  

  const collateralNumber = Number(collateralValue) || 0;
const equityNumber = Number(borrowerEquity) || 0;
const proposedLoanNumber = Number(proposedLoanAmount) || 0;

const ltv =
  collateralNumber > 0
    ? (proposedLoanNumber / collateralNumber) * 100
    : 0;

const equityPercent =
  collateralNumber > 0
    ? (equityNumber / collateralNumber) * 100
    : 0;

let riskLevel = "Not Rated";

if (collateralNumber > 0 && proposedLoanNumber > 0) {
  if (ltv <= 60) {
    riskLevel = "Lower";
  } else if (ltv <= 70) {
    riskLevel = "Moderate";
  } else if (ltv <= 80) {
    riskLevel = "Elevated";
  } else {
    riskLevel = "High";
  }
}
  const annualRate = Number(interestRate) || 0;
const termNumber = Number(termMonths) || 0;

const monthlyRate =
  annualRate > 0 ? annualRate / 100 / 12 : 0;

let monthlyPayment = 0;
let totalPayments = 0;
let totalInterest = 0;

if (
  proposedLoanNumber > 0 &&
  annualRate > 0 &&
  termNumber > 0
) {
  if (paymentType === "interest_only") {
    monthlyPayment =
      proposedLoanNumber * monthlyRate;

    totalPayments =
      monthlyPayment * termNumber;

    totalInterest = totalPayments;
  } else if (paymentType === "amortizing") {
    monthlyPayment =
      proposedLoanNumber *
      (
        monthlyRate *
        Math.pow(1 + monthlyRate, termNumber)
      ) /
      (
        Math.pow(1 + monthlyRate, termNumber) - 1
      );

    totalPayments =
      monthlyPayment * termNumber;

    totalInterest =
      totalPayments - proposedLoanNumber;
  }
}
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
      monthly_noi,
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
     setCollateralValue(
  data.collateral_value !== null
    ? String(data.collateral_value)
    : ""
);

setBorrowerEquity(
  data.borrower_equity !== null
    ? String(data.borrower_equity)
    : ""
);

setProposedLoanAmount(
  data.proposed_loan_amount !== null
    ? String(data.proposed_loan_amount)
    : ""
);

setInterestRate(
  data.interest_rate !== null
    ? String(data.interest_rate)
    : ""
);

setTermMonths(
  data.term_months !== null
    ? String(data.term_months)
    : ""
);

 setMonthlyNoi(
  data.monthly_noi !== null
    ? String(data.monthly_noi)
    : ""
);     

setPaymentType(data.payment_type || "");
setExitStrategy(data.exit_strategy || "");
setUnderwritingNotes(data.underwriting_notes || "");
setUnderwritingDecision(
  data.underwriting_decision || "pending"
);
setApprovalConditions(data.approval_conditions || ""); 
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
      collateral_value:
  collateralValue !== ""
    ? Number(collateralValue)
    : null,

borrower_equity:
  borrowerEquity !== ""
    ? Number(borrowerEquity)
    : null,

proposed_loan_amount:
  proposedLoanAmount !== ""
    ? Number(proposedLoanAmount)
    : null,

 monthly_noi:
  monthlyNoi !== ""
    ? Number(monthlyNoi)
    : null,
      
interest_rate:
  interestRate !== ""
    ? Number(interestRate)
    : null,

term_months:
  termMonths !== ""
    ? Number(termMonths)
    : null,

payment_type: paymentType || null,
exit_strategy: exitStrategy || null,
underwriting_notes: underwritingNotes || null,
underwriting_decision: underwritingDecision || "pending",
approval_conditions: approvalConditions || null,
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
    Underwriting Workspace
  </p>

  <div className="underwriting-grid">
    <div className="form-field">
      <label>Collateral Value</label>
      <input
        type="number"
        value={collateralValue}
        onChange={(event) =>
          setCollateralValue(event.target.value)
        }
        placeholder="0"
      />
    </div>

    <div className="form-field">
      <label>Borrower Equity</label>
      <input
        type="number"
        value={borrowerEquity}
        onChange={(event) =>
          setBorrowerEquity(event.target.value)
        }
        placeholder="0"
      />
    </div>

    <div className="form-field">
      <label>Proposed Loan Amount</label>
      <input
        type="number"
        value={proposedLoanAmount}
        onChange={(event) =>
          setProposedLoanAmount(event.target.value)
        }
        placeholder="0"
      />
    </div>

    <div className="form-field">
  <label>Monthly Net Operating Income</label>

  <input
    type="number"
    step="0.01"
    value={monthlyNoi}
    onChange={(event) =>
      setMonthlyNoi(event.target.value)
    }
    placeholder="0"
  />
</div>
    <div className="form-field">
      <label>Interest Rate</label>
      <input
        type="number"
        step="0.01"
        value={interestRate}
        onChange={(event) =>
          setInterestRate(event.target.value)
        }
        placeholder="0.00"
      />
    </div>

    <div className="form-field">
      <label>Term Months</label>
      <input
        type="number"
        value={termMonths}
        onChange={(event) =>
          setTermMonths(event.target.value)
        }
        placeholder="12"
      />
    </div>

    <div className="form-field">
      <label>Payment Type</label>
      <select
        value={paymentType}
        onChange={(event) =>
          setPaymentType(event.target.value)
        }
      >
        <option value="">Select one</option>
        <option value="interest_only">
          Interest Only
        </option>
        <option value="amortizing">
          Amortizing
        </option>
        <option value="balloon">
          Balloon
        </option>
        <option value="custom">
          Custom
        </option>
      </select>
    </div>
  </div>

  <div className="underwriting-calculations">
  <div className="underwriting-calculation-card">
    <span>Loan-to-Value</span>

    <strong>
      {collateralNumber > 0
        ? `${ltv.toFixed(1)}%`
        : "—"}
    </strong>
  </div>

  <div className="underwriting-calculation-card">
    <span>Borrower Equity</span>

    <strong>
      {collateralNumber > 0
        ? `${equityPercent.toFixed(1)}%`
        : "—"}
    </strong>
  </div>

  <div className="underwriting-calculation-card">
    <span>Risk Indicator</span>

    <strong>{riskLevel}</strong>
  </div>

  <div className="underwriting-calculation-card">
    <span>Equity Cushion</span>

    <strong>
      {collateralNumber > 0
        ? `${Math.max(
            collateralNumber - proposedLoanNumber,
            0
          ).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          })}`
        : "—"}
    </strong>
  </div>
</div>

 <div className="debt-service-calculations">
  <div className="underwriting-calculation-card">
    <span>Monthly Payment</span>

    <strong>
      {monthlyPayment > 0
        ? monthlyPayment.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          })
        : "—"}
    </strong>
  </div>

  <div className="underwriting-calculation-card">
    <span>Total Payments</span>

    <strong>
      {totalPayments > 0
        ? totalPayments.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          })
        : "—"}
    </strong>
  </div>

  <div className="underwriting-calculation-card">
    <span>Total Interest</span>

    <strong>
      {totalInterest > 0
        ? totalInterest.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          })
        : "—"}
    </strong>
  </div>

  <div className="underwriting-calculation-card">
    <span>Interest-Only Payment</span>

    <strong>
      {proposedLoanNumber > 0 && monthlyRate > 0
        ? (
            proposedLoanNumber * monthlyRate
          ).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          })
        : "—"}
    </strong>
  </div>
</div>         
<div className="underwriting-summary">
  <p className="section-label">
    Proposed Structure Summary
  </p>

  <p>
    {proposedLoanNumber > 0
      ? `Proposed financing of ${proposedLoanNumber.toLocaleString(
          "en-US",
          {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }
        )}`
      : "No proposed loan amount entered"}
    {collateralNumber > 0
      ? ` against collateral valued at ${collateralNumber.toLocaleString(
          "en-US",
          {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }
        )}, resulting in an LTV of ${ltv.toFixed(1)}%.`
      : "."}
  </p>

  {interestRate && (
    <p>
      Proposed rate: {interestRate}%.
      {termMonths
        ? ` Term: ${termMonths} months.`
        : ""}
      {paymentType
        ? ` Payment structure: ${paymentType.replaceAll(
            "_",
            " "
          )}.`
        : ""}
    </p>
  )}
</div>        
  <div className="form-field">
    <label>Exit Strategy</label>
    <textarea
      rows={4}
      value={exitStrategy}
      onChange={(event) =>
        setExitStrategy(event.target.value)
      }
      placeholder="Sale, refinance, business cash flow, disposition..."
    />
  </div>

  <div className="form-field">
    <label>Underwriting Decision</label>
    <select
      value={underwritingDecision}
      onChange={(event) =>
        setUnderwritingDecision(event.target.value)
      }
    >
      <option value="pending">Pending</option>
      <option value="approved">Approved</option>
      <option value="conditional">
        Conditionally Approved
      </option>
      <option value="declined">Declined</option>
    </select>
  </div>

  <div className="form-field">
    <label>Approval Conditions</label>
    <textarea
      rows={5}
      value={approvalConditions}
      onChange={(event) =>
        setApprovalConditions(event.target.value)
      }
      placeholder="List any conditions required before approval or funding..."
    />
  </div>

  <div className="form-field">
    <label>Underwriting Notes</label>
    <textarea
      rows={7}
      value={underwritingNotes}
      onChange={(event) =>
        setUnderwritingNotes(event.target.value)
      }
      placeholder="Document analysis, risks, strengths, questions, and recommendations..."
    />
  </div>
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
