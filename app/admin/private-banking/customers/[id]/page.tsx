"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

type BankingCustomer = {
  id: string;
  customer_type: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  customer_status: string;
  onboarding_status: string;
  risk_rating: string | null;
  relationship_manager: string | null;
  internal_notes: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

type BankingAccount = {
  id: string;
  account_type: string;
  account_name: string;
  account_number_display: string | null;
  account_status: string;
  current_balance: number;
  available_balance: number;
  interest_rate: number | null;
  opened_date: string | null;
  is_demo: boolean;
};

type Verification = {
  id: string;
  verification_type: string;
  verification_status: string;
  provider_name: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
};

type RelationshipActivity = {
  id: string;
  activity_type: string;
  subject: string;
  activity_notes: string | null;
  activity_status: string;
  assigned_to: string | null;
  follow_up_date: string | null;
  completed_at: string | null;
  created_at: string;
};

type BankingDocument = {
  id: string;
  document_type: string;
  document_title: string;
  document_status: string;
  document_period_start: string | null;
  document_period_end: string | null;
  published_at: string | null;
  created_at: string;
};

export default function PrivateBankingCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();

  const customerId = String(params.id || "");

  const [customer, setCustomer] =
    useState<BankingCustomer | null>(null);

  const [accounts, setAccounts] =
    useState<BankingAccount[]>([]);

  const [verifications, setVerifications] =
    useState<Verification[]>([]);

  const [activities, setActivities] =
    useState<RelationshipActivity[]>([]);

  const [documents, setDocuments] =
    useState<BankingDocument[]>([]);

  const [customerStatus, setCustomerStatus] =
    useState("prospect");

  const [onboardingStatus, setOnboardingStatus] =
    useState("not_started");

  const [riskRating, setRiskRating] =
    useState("unrated");

  const [relationshipManager, setRelationshipManager] =
    useState("");

  const [internalNotes, setInternalNotes] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [saveMessage, setSaveMessage] =
    useState("");

  useEffect(() => {
    async function loadWorkspace() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data: adminRecord } = await supabase
        .from("capital_admins")
        .select("role, is_active")
        .eq("user_id", user.id)
        .maybeSingle<{
          role: string;
          is_active: boolean;
        }>();

      if (
        !adminRecord ||
        adminRecord.role !== "admin" ||
        adminRecord.is_active !== true
      ) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      const [
        customerResult,
        ownershipResult,
        verificationResult,
        activityResult,
        documentResult,
      ] = await Promise.all([
        supabase
          .from("banking_customers")
          .select(`
            id,
            customer_type,
            first_name,
            last_name,
            business_name,
            email,
            phone,
            customer_status,
            onboarding_status,
            risk_rating,
            relationship_manager,
            internal_notes,
            is_demo,
            created_at,
            updated_at
          `)
          .eq("id", customerId)
          .maybeSingle<BankingCustomer>(),

        supabase
          .from("banking_account_owners")
          .select(`
            account_id,
            banking_accounts (
              id,
              account_type,
              account_name,
              account_number_display,
              account_status,
              current_balance,
              available_balance,
              interest_rate,
              opened_date,
              is_demo
            )
          `)
          .eq("customer_id", customerId),

        supabase
          .from("banking_customer_verifications")
          .select(`
            id,
            verification_type,
            verification_status,
            provider_name,
            reviewed_by,
            reviewed_at,
            notes
          `)
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false }),

        supabase
          .from("banking_relationship_activities")
          .select(`
            id,
            activity_type,
            subject,
            activity_notes,
            activity_status,
            assigned_to,
            follow_up_date,
            completed_at,
            created_at
          `)
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false }),

        supabase
          .from("banking_documents")
          .select(`
            id,
            document_type,
            document_title,
            document_status,
            document_period_start,
            document_period_end,
            published_at,
            created_at
          `)
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false }),
      ]);

      if (
        customerResult.error ||
        !customerResult.data
      ) {
        setErrorMessage(
          customerResult.error
            ? `We could not load this customer: ${customerResult.error.message}`
            : "This banking customer could not be found."
        );

        setLoading(false);
        return;
      }

      setCustomer(customerResult.data);

      setCustomerStatus(
        customerResult.data.customer_status || "prospect"
      );

      setOnboardingStatus(
        customerResult.data.onboarding_status ||
          "not_started"
      );

      setRiskRating(
        customerResult.data.risk_rating || "unrated"
      );

      setRelationshipManager(
        customerResult.data.relationship_manager || ""
      );

      setInternalNotes(
        customerResult.data.internal_notes || ""
      );

      if (!ownershipResult.error) {
        const ownedAccounts =
          ownershipResult.data
            ?.map((row: any) => row.banking_accounts)
            .filter(Boolean) || [];

        setAccounts(ownedAccounts);
      }

      if (!verificationResult.error) {
        setVerifications(
          verificationResult.data || []
        );
      }

      if (!activityResult.error) {
        setActivities(activityResult.data || []);
      }

      if (!documentResult.error) {
        setDocuments(documentResult.data || []);
      }

      setLoading(false);
    }

    if (customerId) {
      loadWorkspace();
    }
  }, [customerId, router]);

  const displayName = useMemo(() => {
    if (!customer) return "";

    if (
      customer.customer_type === "business" &&
      customer.business_name
    ) {
      return customer.business_name;
    }

    return `${customer.first_name || ""} ${
      customer.last_name || ""
    }`.trim();
  }, [customer]);

  const totalBalance = useMemo(() => {
    return accounts.reduce(
      (total, account) =>
        total + Number(account.current_balance || 0),
      0
    );
  }, [accounts]);

  const totalAvailable = useMemo(() => {
    return accounts.reduce(
      (total, account) =>
        total + Number(account.available_balance || 0),
      0
    );
  }, [accounts]);

  async function handleSave() {
    if (!customer) return;

    setSaving(true);
    setSaveMessage("");
    setErrorMessage("");

    const updatedAt = new Date().toISOString();

   const { data: updatedCustomer, error } = await supabase
  .from("banking_customers")
  .update({
    customer_status: customerStatus,
    onboarding_status: onboardingStatus,
    risk_rating: riskRating,
    relationship_manager:
      relationshipManager.trim() || null,
    internal_notes:
      internalNotes.trim() || null,
    updated_at: updatedAt,
  })
  .eq("id", customer.id)
  .select("id")
  .maybeSingle();
    
   if (error || !updatedCustomer) {
  setErrorMessage(
    error
      ? `We could not save this customer: ${error.message}`
      : "The customer record was not updated. Check database permissions."
  );

  setSaving(false);
  return;
}
    setCustomer({
      ...customer,
      customer_status: customerStatus,
      onboarding_status: onboardingStatus,
      risk_rating: riskRating,
      relationship_manager:
        relationshipManager.trim() || null,
      internal_notes:
        internalNotes.trim() || null,
      updated_at: updatedAt,
    });

    setSaveMessage("Customer profile saved.");
    setSaving(false);
  }

  function formatMoney(value: number) {
    return Number(value || 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  function formatDate(value: string | null) {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="pb-client-workspace-page">
        Loading private client workspace...
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="pb-client-workspace-page">
        <div className="pb-client-error">
          {errorMessage ||
            "This banking customer could not be found."}
        </div>
      </main>
    );
  }

  return (
    <main className="pb-client-workspace-page">
      <header className="pb-client-workspace-header">
        <div>
          <p className="pb-client-workspace-eyebrow">
            PRIVATE CLIENT MANAGEMENT
          </p>

          <h1>{displayName}</h1>

          <p>
            {customer.customer_type === "business"
              ? "Business Private Banking Relationship"
              : "Individual Private Banking Relationship"}
          </p>
        </div>

        <div className="pb-client-header-actions">
          <Link href="/admin/private-banking/customers">
            ← Back to Customers
          </Link>

          <Link href="/admin/private-banking">
            Banking Center
          </Link>
        </div>
      </header>

      {errorMessage && (
        <div className="pb-client-error">
          {errorMessage}
        </div>
      )}

      {saveMessage && (
        <div className="pb-client-success">
          {saveMessage}
        </div>
      )}

      <section className="pb-client-summary-grid">
        <div className="pb-client-summary-card">
          <span>Total Relationship Balance</span>

          <strong>
            {formatMoney(totalBalance)}
          </strong>

          <small>
            Across {accounts.length} account
            {accounts.length === 1 ? "" : "s"}
          </small>
        </div>

        <div className="pb-client-summary-card">
          <span>Available Balance</span>

          <strong>
            {formatMoney(totalAvailable)}
          </strong>

          <small>Current available funds</small>
        </div>

        <div className="pb-client-summary-card">
          <span>Customer Status</span>

          <strong className="pb-client-summary-text">
            {customerStatus.replaceAll("_", " ")}
          </strong>

          <small>Relationship standing</small>
        </div>

        <div className="pb-client-summary-card">
          <span>Onboarding</span>

          <strong className="pb-client-summary-text">
            {onboardingStatus.replaceAll("_", " ")}
          </strong>

          <small>Current onboarding stage</small>
        </div>
      </section>

      <section className="pb-client-workspace-grid">
        <div className="pb-client-main-column">
          <section className="pb-client-panel">
            <div className="pb-client-panel-heading">
              <div>
                <p>CLIENT PROFILE</p>
                <h2>Relationship Overview</h2>
              </div>

              <span>
                Demo Environment
              </span>
            </div>

            <div className="pb-client-profile-grid">
              <div>
                <span>Customer</span>
                <strong>{displayName}</strong>
              </div>

              <div>
                <span>Customer Type</span>
                <strong>
                  {customer.customer_type}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {customer.email || "—"}
                </strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>
                  {customer.phone || "—"}
                </strong>
              </div>

              <div>
                <span>Relationship Manager</span>
                <strong>
                  {customer.relationship_manager ||
                    "Unassigned"}
                </strong>
              </div>

              <div>
                <span>Client Since</span>
                <strong>
                  {formatDate(customer.created_at)}
                </strong>
              </div>
            </div>
          </section>

          <section className="pb-client-panel">
            <div className="pb-client-panel-heading">
              <div>
                <p>DEPOSIT RELATIONSHIP</p>
                <h2>Accounts</h2>
              </div>

              <Link
                href={`/admin/private-banking/accounts?customer=${customer.id}`}
              >
                Manage Accounts →
              </Link>
            </div>

            {accounts.length === 0 ? (
              <div className="pb-client-empty-state">
                <h3>No accounts yet</h3>

                <p>
                  This customer does not yet have any
                  demo banking accounts.
                </p>
              </div>
            ) : (
              <div className="pb-client-account-list">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="pb-client-account-row"
                  >
                    <div>
                      <strong>
                        {account.account_name}
                      </strong>

                      <span>
                        {account.account_type.replaceAll(
                          "_",
                          " "
                        )}
                        {account.account_number_display
                          ? ` • ${account.account_number_display}`
                          : ""}
                      </span>
                    </div>

                    <div>
                      <span>Available</span>

                      <strong>
                        {formatMoney(
                          account.available_balance
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Current</span>

                      <strong>
                        {formatMoney(
                          account.current_balance
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Status</span>

                      <strong>
                        {account.account_status}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="pb-client-panel">
            <div className="pb-client-panel-heading">
              <div>
                <p>COMPLIANCE WORKFLOW</p>
                <h2>Verification & KYC</h2>
              </div>
            </div>

            {verifications.length === 0 ? (
              <div className="pb-client-empty-state">
                <h3>No verification records yet</h3>

                <p>
                  Identity, address, business,
                  beneficial ownership, and screening
                  records will appear here.
                </p>
              </div>
            ) : (
              <div className="pb-client-simple-list">
                {verifications.map((verification) => (
                  <div key={verification.id}>
                    <div>
                      <strong>
                        {verification.verification_type.replaceAll(
                          "_",
                          " "
                        )}
                      </strong>

                      <span>
                        {verification.provider_name ||
                          "Internal review"}
                      </span>
                    </div>

                    <strong>
                      {verification.verification_status.replaceAll(
                        "_",
                        " "
                      )}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="pb-client-panel">
            <div className="pb-client-panel-heading">
              <div>
                <p>CLIENT RECORDS</p>
                <h2>Statements & Documents</h2>
              </div>

              <Link
                href="/admin/private-banking/documents"
              >
                View Documents →
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="pb-client-empty-state">
                <h3>No documents yet</h3>

                <p>
                  Statements, disclosures, notices,
                  correspondence, and other customer
                  documents will appear here.
                </p>
              </div>
            ) : (
              <div className="pb-client-simple-list">
                {documents.slice(0, 6).map((document) => (
                  <div key={document.id}>
                    <div>
                      <strong>
                        {document.document_title}
                      </strong>

                      <span>
                        {document.document_type.replaceAll(
                          "_",
                          " "
                        )}
                      </span>
                    </div>

                    <strong>
                      {document.document_status}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="pb-client-panel">
            <div className="pb-client-panel-heading">
              <div>
                <p>RELATIONSHIP HISTORY</p>
                <h2>Recent Activity</h2>
              </div>

              <Link href="/admin/private-banking/relationships">
                View All →
              </Link>
            </div>

            {activities.length === 0 ? (
              <div className="pb-client-empty-state">
                <h3>No relationship activity yet</h3>

                <p>
                  Calls, meetings, follow-ups, reviews,
                  and service requests will appear here.
                </p>
              </div>
            ) : (
              <div className="pb-client-activity-list">
                {activities.slice(0, 6).map((activity) => (
                  <div key={activity.id}>
                    <span className="pb-client-activity-icon">
                      •
                    </span>

                    <div>
                      <strong>
                        {activity.subject}
                      </strong>

                      <span>
                        {activity.activity_type.replaceAll(
                          "_",
                          " "
                        )}
                        {" • "}
                        {formatDate(
                          activity.follow_up_date ||
                            activity.created_at
                        )}
                      </span>
                    </div>

                    <strong>
                      {activity.activity_status}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="pb-client-side-column">
          <section className="pb-client-side-panel">
            <div className="pb-client-side-heading">
              <p>RELATIONSHIP CONTROL</p>
              <h2>Client Status</h2>
            </div>

            <label>
              <span>Customer Status</span>

              <select
                value={customerStatus}
                onChange={(event) =>
                  setCustomerStatus(event.target.value)
                }
              >
                <option value="prospect">
                  Prospect
                </option>

                <option value="onboarding">
                  Onboarding
                </option>

                <option value="pending_review">
                  Pending Review
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="restricted">
                  Restricted
                </option>

                <option value="closed">
                  Closed
                </option>
              </select>
            </label>

            <label>
              <span>Onboarding Status</span>

              <select
                value={onboardingStatus}
                onChange={(event) =>
                  setOnboardingStatus(
                    event.target.value
                  )
                }
              >
                <option value="not_started">
                  Not Started
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="pending_review">
                  Pending Review
                </option>

                <option value="complete">
                  Complete
                </option>
              </select>
            </label>

            <label>
              <span>Risk Rating</span>

              <select
                value={riskRating}
                onChange={(event) =>
                  setRiskRating(event.target.value)
                }
              >
                <option value="unrated">
                  Unrated
                </option>

                <option value="low">
                  Low
                </option>

                <option value="moderate">
                  Moderate
                </option>

                <option value="high">
                  High
                </option>
              </select>
            </label>

            <label>
              <span>Relationship Manager</span>

              <input
                value={relationshipManager}
                onChange={(event) =>
                  setRelationshipManager(
                    event.target.value
                  )
                }
                placeholder="Relationship manager"
              />
            </label>
          </section>

          <section className="pb-client-side-panel">
            <div className="pb-client-side-heading">
              <p>INTERNAL</p>
              <h2>Private Notes</h2>
            </div>

            <textarea
              value={internalNotes}
              onChange={(event) =>
                setInternalNotes(event.target.value)
              }
              placeholder="Internal relationship notes, servicing information, follow-up items, or administrative observations..."
            />

            <p className="pb-client-note-warning">
              Internal only. Do not display these notes
              in the customer portal.
            </p>
          </section>

          <section className="pb-client-side-panel pb-client-security-panel">
            <div className="pb-client-side-heading">
              <p>CLIENT ACCESS</p>
              <h2>Private Client Portal</h2>
            </div>

            <div className="pb-client-portal-status">
              <span>Portal Access</span>
              <strong>Not Connected</strong>
            </div>

            <p>
              A secure customer login will later be
              linked to this customer record. That login
              will only expose this client's authorized
              accounts, transactions, statements, and
              service tools.
            </p>
          </section>

          <button
            type="button"
            className="pb-client-save-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Client Profile"}
          </button>
        </aside>
      </section>
    </main>
  );
}
