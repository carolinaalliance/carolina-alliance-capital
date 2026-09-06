"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type DashboardStats = {
  customers: number;
  accounts: number;
  pendingCustomers: number;
  openActivities: number;
  totalDemoBalance: number;
};

export default function PrivateBankingDashboard() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    customers: 0,
    accounts: 0,
    pendingCustomers: 0,
    openActivities: 0,
    totalDemoBalance: 0,
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
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
        customersResult,
        accountsResult,
        pendingCustomersResult,
        activitiesResult,
        balancesResult,
      ] = await Promise.all([
        supabase
          .from("banking_customers")
          .select("id", { count: "exact", head: true })
          .eq("is_demo", true),

        supabase
          .from("banking_accounts")
          .select("id", { count: "exact", head: true })
          .eq("is_demo", true),

        supabase
          .from("banking_customers")
          .select("id", { count: "exact", head: true })
          .eq("is_demo", true)
          .neq("customer_status", "approved"),

        supabase
          .from("banking_relationship_activities")
          .select("id", { count: "exact", head: true })
          .eq("is_demo", true)
          .eq("activity_status", "open"),

        supabase
          .from("banking_accounts")
          .select("current_balance")
          .eq("is_demo", true),
      ]);

      if (
        customersResult.error ||
        accountsResult.error ||
        pendingCustomersResult.error ||
        activitiesResult.error ||
        balancesResult.error
      ) {
        setErrorMessage(
          "We could not load the Private Banking dashboard."
        );
        setLoading(false);
        return;
      }

      const totalDemoBalance =
        balancesResult.data?.reduce(
          (total, account) =>
            total + Number(account.current_balance || 0),
          0
        ) || 0;

      setStats({
        customers: customersResult.count || 0,
        accounts: accountsResult.count || 0,
        pendingCustomers:
          pendingCustomersResult.count || 0,
        openActivities: activitiesResult.count || 0,
        totalDemoBalance,
      });

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <main className="private-banking-page">
        Loading Private Banking Center...
      </main>
    );
  }

  return (
    <main className="private-banking-page">
      <div className="private-banking-header">
        <div>
          <p className="private-banking-eyebrow">
            CAROLINA ALLIANCE CAPITAL
          </p>

          <h1>Private Banking Center</h1>

          <p className="private-banking-subtitle">
            Development and demo banking environment
          </p>
        </div>

        <Link href="/admin">
          Back to Command Center
        </Link>
      </div>

      {errorMessage && (
        <div className="private-banking-error">
          {errorMessage}
        </div>
      )}

      <section className="private-banking-stats">
        <div className="private-banking-stat-card">
          <span>Total Customers</span>
          <strong>{stats.customers}</strong>
        </div>

        <div className="private-banking-stat-card">
          <span>Total Accounts</span>
          <strong>{stats.accounts}</strong>
        </div>

        <div className="private-banking-stat-card">
          <span>Demo Account Balances</span>
          <strong>
            {stats.totalDemoBalance.toLocaleString(
              "en-US",
              {
                style: "currency",
                currency: "USD",
              }
            )}
          </strong>
        </div>

        <div className="private-banking-stat-card">
          <span>Pending Onboarding</span>
          <strong>{stats.pendingCustomers}</strong>
        </div>

        <div className="private-banking-stat-card">
          <span>Open Client Activities</span>
          <strong>{stats.openActivities}</strong>
        </div>
      </section>

      <section className="private-banking-modules">
        <Link
          href="/admin/private-banking/customers"
          className="private-banking-module-card"
        >
          <h2>Customers</h2>
          <p>
            Private clients, businesses, onboarding,
            verification, and relationship management.
          </p>
        </Link>

        <Link
          href="/admin/private-banking/accounts"
          className="private-banking-module-card"
        >
          <h2>Accounts</h2>
          <p>
            Checking, savings, money market, and
            account ownership.
          </p>
        </Link>

        <Link
          href="/admin/private-banking/transactions"
          className="private-banking-module-card"
        >
          <h2>Transactions</h2>
          <p>
            Ledger activity, transfers, deposits,
            withdrawals, ACH, and wires.
          </p>
        </Link>

        <Link
          href="/admin/private-banking/documents"
          className="private-banking-module-card"
        >
          <h2>Statements & Documents</h2>
          <p>
            Statements, disclosures, notices,
            correspondence, and account documents.
          </p>
        </Link>

        <Link
          href="/admin/private-banking/relationships"
          className="private-banking-module-card"
        >
          <h2>Relationship Management</h2>
          <p>
            Calls, meetings, follow-ups, reviews,
            and service requests.
          </p>
        </Link>
      </section>
    </main>
  );
}
