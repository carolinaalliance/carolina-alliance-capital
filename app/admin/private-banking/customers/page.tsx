"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

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
  is_demo: boolean;
  created_at: string;
};

export default function PrivateBankingCustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<BankingCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCustomers() {
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

      const { data, error } = await supabase
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
          is_demo,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(
          `We could not load banking customers: ${error.message}`
        );
        setLoading(false);
        return;
      }

      setCustomers(data || []);
      setLoading(false);
    }

    loadCustomers();
  }, [router]);

  function displayName(customer: BankingCustomer) {
    if (
      customer.customer_type === "business" &&
      customer.business_name
    ) {
      return customer.business_name;
    }

    const name = `${customer.first_name || ""} ${
      customer.last_name || ""
    }`.trim();

    return name || "Unnamed Customer";
  }

  if (loading) {
    return (
      <main className="pb-customers-page">
        Loading customers...
      </main>
    );
  }

  return (
    <main className="pb-customers-page">
      <header className="pb-customers-header">
        <div>
          <p className="pb-customers-eyebrow">
            PRIVATE BANKING
          </p>

          <h1>Customers</h1>

          <p>
            Private clients, businesses, onboarding,
            verification, and relationship management.
          </p>
        </div>

        <div className="pb-customers-header-actions">
          <Link href="/admin/private-banking">
            ← Back to Banking Center
          </Link>

          <button type="button">
            + Add Customer
          </button>
        </div>
      </header>

      {errorMessage && (
        <div className="pb-customers-error">
          {errorMessage}
        </div>
      )}

      <section className="pb-customers-summary">
        <div>
          <span>Total Customers</span>
          <strong>{customers.length}</strong>
        </div>

        <div>
          <span>Individuals</span>
          <strong>
            {
              customers.filter(
                (customer) =>
                  customer.customer_type === "individual"
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Businesses</span>
          <strong>
            {
              customers.filter(
                (customer) =>
                  customer.customer_type === "business"
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Pending Review</span>
          <strong>
            {
              customers.filter(
                (customer) =>
                  customer.customer_status ===
                    "pending_review" ||
                  customer.onboarding_status ===
                    "pending_review"
              ).length
            }
          </strong>
        </div>
      </section>

      <section className="pb-customers-panel">
        <div className="pb-customers-panel-heading">
          <div>
            <h2>Private Client Directory</h2>
            <p>
              Development and demo customer records
            </p>
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="pb-customers-empty">
            <div className="pb-customers-empty-icon">
              ♟
            </div>

            <h3>No banking customers yet</h3>

            <p>
              Add your first demo private banking customer
              to begin testing onboarding, accounts, and
              the customer portal.
            </p>
          </div>
        ) : (
          <div className="pb-customers-table-wrapper">
            <table className="pb-customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Onboarding</th>
                  <th>Risk</th>
                  <th>Relationship Manager</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong>
                        {displayName(customer)}
                      </strong>

                      <span>
                        {customer.email ||
                          "No email on file"}
                      </span>
                    </td>

                    <td>
                      {customer.customer_type}
                    </td>

                    <td>
                      <span className="pb-customer-status">
                        {customer.customer_status.replaceAll(
                          "_",
                          " "
                        )}
                      </span>
                    </td>

                    <td>
                      {customer.onboarding_status.replaceAll(
                        "_",
                        " "
                      )}
                    </td>

                    <td>
                      {customer.risk_rating || "unrated"}
                    </td>

                    <td>
                      {customer.relationship_manager ||
                        "Unassigned"}
                    </td>

                    <td>
                      <Link
                        href={`/admin/private-banking/customers/${customer.id}`}
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
