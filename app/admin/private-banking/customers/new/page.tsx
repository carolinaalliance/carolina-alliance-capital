"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

export default function AddBankingCustomerPage() {
  const router = useRouter();

  const [customerType, setCustomerType] =
    useState("individual");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [relationshipManager, setRelationshipManager] =
    useState("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");

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

    if (
      customerType === "individual" &&
      (!firstName.trim() || !lastName.trim())
    ) {
      setErrorMessage(
        "First name and last name are required for an individual customer."
      );
      setSaving(false);
      return;
    }

    if (
      customerType === "business" &&
      !businessName.trim()
    ) {
      setErrorMessage(
        "Business name is required for a business customer."
      );
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("banking_customers")
      .insert({
        customer_type: customerType,

        first_name:
          customerType === "individual"
            ? firstName.trim()
            : null,

        last_name:
          customerType === "individual"
            ? lastName.trim()
            : null,

        business_name:
          customerType === "business"
            ? businessName.trim()
            : null,

        email: email.trim() || null,
        phone: phone.trim() || null,

        customer_status: "prospect",
        onboarding_status: "not_started",
        risk_rating: "unrated",

        relationship_manager:
          relationshipManager.trim() || null,

        is_demo: true,

        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error || !data) {
      setErrorMessage(
        error
          ? `We could not create the customer: ${error.message}`
          : "We could not create the customer."
      );

      setSaving(false);
      return;
    }

    router.push(
      `/admin/private-banking/customers/${data.id}`
    );
  }

  return (
    <main className="pb-customer-form-page">
      <header className="pb-customer-form-header">
        <div>
          <p className="pb-customers-eyebrow">
            PRIVATE BANKING
          </p>

          <h1>Add Customer</h1>

          <p>
            Create a new development/demo private
            banking customer record.
          </p>
        </div>

        <Link href="/admin/private-banking/customers">
          ← Back to Customers
        </Link>
      </header>

      <form
        className="pb-customer-form"
        onSubmit={handleSubmit}
      >
        <section className="pb-customer-form-section">
          <div className="pb-customer-form-section-heading">
            <h2>Customer Profile</h2>

            <p>
              Basic relationship information for this
              private banking customer.
            </p>
          </div>

          {errorMessage && (
            <div className="pb-customers-error">
              {errorMessage}
            </div>
          )}

          <div className="pb-customer-form-grid">
            <label>
              <span>Customer Type</span>

              <select
                value={customerType}
                onChange={(event) =>
                  setCustomerType(event.target.value)
                }
              >
                <option value="individual">
                  Individual
                </option>

                <option value="business">
                  Business
                </option>
              </select>
            </label>

            {customerType === "individual" ? (
              <>
                <label>
                  <span>First Name</span>

                  <input
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(event.target.value)
                    }
                    placeholder="First name"
                  />
                </label>

                <label>
                  <span>Last Name</span>

                  <input
                    value={lastName}
                    onChange={(event) =>
                      setLastName(event.target.value)
                    }
                    placeholder="Last name"
                  />
                </label>
              </>
            ) : (
              <label className="pb-customer-form-wide">
                <span>Business Name</span>

                <input
                  value={businessName}
                  onChange={(event) =>
                    setBusinessName(event.target.value)
                  }
                  placeholder="Business name"
                />
              </label>
            )}

            <label>
              <span>Email</span>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="client@example.com"
              />
            </label>

            <label>
              <span>Phone</span>

              <input
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="864-555-0100"
              />
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
                placeholder="Assigned relationship manager"
              />
            </label>
          </div>
        </section>

        <div className="pb-customer-form-actions">
          <Link href="/admin/private-banking/customers">
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Creating Customer..."
              : "Create Customer"}
          </button>
        </div>
      </form>
    </main>
  );
}
