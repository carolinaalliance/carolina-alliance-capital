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

type AccountMix = {
  checking: number;
  savings: number;
  moneyMarket: number;
  cds: number;
  other: number;
};

type RecentTransaction = {
  id: string;
  transaction_type: string;
  description: string | null;
  created_at: string;
};

type RelationshipActivity = {
  id: string;
  subject: string;
  activity_type: string;
  follow_up_date: string | null;
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

  const [accountMix, setAccountMix] = useState<AccountMix>({
    checking: 0,
    savings: 0,
    moneyMarket: 0,
    cds: 0,
    other: 0,
  });

  const [recentTransactions, setRecentTransactions] =
    useState<RecentTransaction[]>([]);

  const [relationshipAlerts, setRelationshipAlerts] =
    useState<RelationshipActivity[]>([]);

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
        accountTypesResult,
        recentTransactionsResult,
        relationshipAlertsResult,
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

        supabase
          .from("banking_accounts")
          .select("account_type")
          .eq("is_demo", true),

        supabase
          .from("banking_transactions")
          .select(
            "id, transaction_type, description, created_at"
          )
          .eq("is_demo", true)
          .order("created_at", { ascending: false })
          .limit(5),

        supabase
          .from("banking_relationship_activities")
          .select(
            "id, subject, activity_type, follow_up_date"
          )
          .eq("is_demo", true)
          .eq("activity_status", "open")
          .order("created_at", { ascending: false })
          .limit(4),
      ]);

      if (
        customersResult.error ||
        accountsResult.error ||
        pendingCustomersResult.error ||
        activitiesResult.error ||
        balancesResult.error ||
        accountTypesResult.error ||
        recentTransactionsResult.error ||
        relationshipAlertsResult.error
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

      const mix: AccountMix = {
        checking: 0,
        savings: 0,
        moneyMarket: 0,
        cds: 0,
        other: 0,
      };

      accountTypesResult.data?.forEach((account) => {
        if (
          account.account_type === "business_checking" ||
          account.account_type === "personal_checking"
        ) {
          mix.checking += 1;
        } else if (account.account_type === "savings") {
          mix.savings += 1;
        } else if (account.account_type === "money_market") {
          mix.moneyMarket += 1;
        } else if (account.account_type === "cd") {
          mix.cds += 1;
        } else {
          mix.other += 1;
        }
      });

      setStats({
        customers: customersResult.count || 0,
        accounts: accountsResult.count || 0,
        pendingCustomers:
          pendingCustomersResult.count || 0,
        openActivities: activitiesResult.count || 0,
        totalDemoBalance,
      });

      setAccountMix(mix);

      setRecentTransactions(
        recentTransactionsResult.data || []
      );

      setRelationshipAlerts(
        relationshipAlertsResult.data || []
      );

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <main className="private-banking-loading">
        Loading Private Banking Center...
      </main>
    );
  }

  const totalMix =
    accountMix.checking +
    accountMix.savings +
    accountMix.moneyMarket +
    accountMix.cds +
    accountMix.other;

  const percent = (value: number) =>
    totalMix > 0
      ? Math.round((value / totalMix) * 100)
      : 0;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="private-banking-page">
      <header className="pb-hero">
        <div className="pb-brand-area">
          <div className="pb-bank-icon">
            <span>▥</span>
          </div>

          <div>
            <p className="pb-eyebrow">
              CAROLINA ALLIANCE CAPITAL
            </p>

            <h1>Private Banking Center</h1>

            <p className="pb-hero-tagline">
              WEALTH &nbsp;|&nbsp; RELATIONSHIPS
              &nbsp;|&nbsp; OPPORTUNITY
              &nbsp;|&nbsp; A STRONGER TOMORROW
            </p>
          </div>
        </div>

        <div className="pb-hero-right">
          <div className="pb-hero-quote">
            More Than Banking.
            <br />
            A Higher Standard.
          </div>

          <Link
            href="/admin"
            className="pb-command-button"
          >
            ← Back to Command Center
          </Link>

          <span className="pb-security-text">
            SECURE. PRIVATE. CONFIDENTIAL.
          </span>
        </div>
      </header>

      {errorMessage && (
        <div className="pb-error">
          {errorMessage}
        </div>
      )}

      <section className="pb-stat-grid">
        <div className="pb-stat-card">
          <div className="pb-stat-icon">♟</div>

          <div>
            <span>TOTAL CUSTOMERS</span>
            <strong>{stats.customers}</strong>
            <small>Private clients & businesses</small>
          </div>
        </div>

        <div className="pb-stat-card">
          <div className="pb-stat-icon">▣</div>

          <div>
            <span>TOTAL ACCOUNTS</span>
            <strong>{stats.accounts}</strong>
            <small>Checking, savings, money market</small>
          </div>
        </div>

        <div className="pb-stat-card">
          <div className="pb-stat-icon">●</div>

          <div>
            <span>DEMO ACCOUNT BALANCES</span>
            <strong>
              {stats.totalDemoBalance.toLocaleString(
                "en-US",
                {
                  style: "currency",
                  currency: "USD",
                }
              )}
            </strong>
            <small>Total across all accounts</small>
          </div>
        </div>

        <div className="pb-stat-card">
          <div className="pb-stat-icon">▤</div>

          <div>
            <span>PENDING ONBOARDING</span>
            <strong>{stats.pendingCustomers}</strong>
            <small>Awaiting review</small>
          </div>
        </div>

        <div className="pb-stat-card">
          <div className="pb-stat-icon">□</div>

          <div>
            <span>OPEN CLIENT ACTIVITIES</span>
            <strong>{stats.openActivities}</strong>
            <small>Calls, meetings, follow-ups</small>
          </div>
        </div>
      </section>

      <section className="pb-portfolio-section">
        <div className="pb-portfolio-header">
          <div>
            <p className="pb-section-eyebrow">
              PRIVATE BANKING SNAPSHOT
            </p>

            <h2>Portfolio Overview</h2>

            <p>
              A snapshot of your private banking
              relationships
            </p>
          </div>

          <div className="pb-portfolio-date">
            {today}
          </div>
        </div>

        <div className="pb-portfolio-grid">
          <div className="pb-balance-panel">
            <span>Total Portfolio Balance</span>

            <strong>
              {stats.totalDemoBalance.toLocaleString(
                "en-US",
                {
                  style: "currency",
                  currency: "USD",
                }
              )}
            </strong>

            <div className="pb-balance-divider" />

            <div className="pb-balance-metrics">
              <div>
                <strong>
                  {accountMix.checking}
                </strong>
                <span>Checking Accounts</span>
              </div>

              <div>
                <strong>
                  {accountMix.savings}
                </strong>
                <span>Savings Accounts</span>
              </div>

              <div>
                <strong>
                  {stats.pendingCustomers}
                </strong>
                <span>Accounts in Review</span>
              </div>

              <div>
                <strong>
                  {stats.accounts}
                </strong>
                <span>Total Accounts</span>
              </div>
            </div>
          </div>

          <div className="pb-account-mix-panel">
            <h3>Account Mix</h3>

            <div className="pb-account-mix-content">
              <div className="pb-donut">
                <div className="pb-donut-center">
                  <strong>{stats.accounts}</strong>
                  <span>Total Accounts</span>
                </div>
              </div>

              <div className="pb-mix-list">
                <div>
                  <span>
                    <i className="pb-dot pb-dot-green" />
                    Checking
                  </span>

                  <strong>
                    {accountMix.checking} (
                    {percent(accountMix.checking)}%)
                  </strong>
                </div>

                <div>
                  <span>
                    <i className="pb-dot pb-dot-teal" />
                    Savings
                  </span>

                  <strong>
                    {accountMix.savings} (
                    {percent(accountMix.savings)}%)
                  </strong>
                </div>

                <div>
                  <span>
                    <i className="pb-dot pb-dot-gold" />
                    Money Market
                  </span>

                  <strong>
                    {accountMix.moneyMarket} (
                    {percent(accountMix.moneyMarket)}%)
                  </strong>
                </div>

                <div>
                  <span>
                    <i className="pb-dot pb-dot-bronze" />
                    CDs
                  </span>

                  <strong>
                    {accountMix.cds} (
                    {percent(accountMix.cds)}%)
                  </strong>
                </div>

                <div>
                  <span>
                    <i className="pb-dot pb-dot-gray" />
                    Other
                  </span>

                  <strong>
                    {accountMix.other} (
                    {percent(accountMix.other)}%)
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-activity-panel">
            <div className="pb-panel-heading">
              <h3>Recent Activity</h3>

              <Link href="/admin/private-banking/transactions">
                View All →
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="pb-empty-list">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="pb-activity-row"
                  >
                    <span className="pb-activity-circle">
                      ↕
                    </span>

                    <div>
                      <strong>
                        No recent transactions
                      </strong>

                      <span>
                        Transactions will appear here
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="pb-activity-row"
                >
                  <span className="pb-activity-circle">
                    ↕
                  </span>

                  <div>
                    <strong>
                      {transaction.transaction_type
                        .replaceAll("_", " ")
                        .toUpperCase()}
                    </strong>

                    <span>
                      {transaction.description ||
                        "Banking transaction"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pb-alert-panel">
            <div className="pb-panel-heading">
              <h3>Relationship Manager Alerts</h3>

              <Link href="/admin/private-banking/relationships">
                View All →
              </Link>
            </div>

            {relationshipAlerts.length === 0 ? (
              <div className="pb-alert-empty">
                <div className="pb-alert-icon">
                  ♟
                </div>

                <strong>No open alerts</strong>

                <p>
                  Client follow-ups, reviews, and
                  service requests will appear here.
                </p>
              </div>
            ) : (
              <div className="pb-alert-list">
                {relationshipAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="pb-alert-item"
                  >
                    <strong>{alert.subject}</strong>

                    <span>
                      {alert.activity_type.replaceAll(
                        "_",
                        " "
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="pb-module-grid">
        <Link
          href="/admin/private-banking/customers"
          className="pb-module-card pb-module-featured"
        >
          <div className="pb-module-icon">♟</div>

          <div>
            <h2>Customers</h2>

            <p>
              Private clients, businesses, onboarding,
              verification, and relationship management.
            </p>
          </div>

          <span className="pb-module-arrow">→</span>
        </Link>

        <Link
          href="/admin/private-banking/accounts"
          className="pb-module-card"
        >
          <div className="pb-module-icon">▣</div>

          <div>
            <h2>Accounts</h2>

            <p>
              Checking, savings, money market, and
              account ownership.
            </p>
          </div>

          <span className="pb-module-arrow">→</span>
        </Link>

        <Link
          href="/admin/private-banking/transactions"
          className="pb-module-card"
        >
          <div className="pb-module-icon">⇄</div>

          <div>
            <h2>Transactions</h2>

            <p>
              Ledger activity, transfers, deposits,
              withdrawals, ACH, and wires.
            </p>
          </div>

          <span className="pb-module-arrow">→</span>
        </Link>

        <Link
          href="/admin/private-banking/documents"
          className="pb-module-card"
        >
          <div className="pb-module-icon">▤</div>

          <div>
            <h2>Statements & Documents</h2>

            <p>
              Statements, disclosures, notices,
              correspondence, and account documents.
            </p>
          </div>

          <span className="pb-module-arrow">→</span>
        </Link>

        <Link
          href="/admin/private-banking/relationships"
          className="pb-module-card"
        >
          <div className="pb-module-icon">◆</div>

          <div>
            <h2>Relationship Management</h2>

            <p>
              Calls, meetings, follow-ups, reviews,
              and service requests.
            </p>
          </div>

          <span className="pb-module-arrow">→</span>
        </Link>

        <div className="pb-vision-card">
          <div>
            <span>“</span>

            <p>
              Building Wealth.
              <br />
              Strengthening Communities.
            </p>
          </div>
        </div>
      </section>

      <footer className="pb-footer">
        <div>
          <strong>CAROLINA ALLIANCE CAPITAL</strong>
          <span>PRIVATE BANKING</span>
        </div>

        <p>
          Confidential &nbsp;|&nbsp; For authorized
          use only &nbsp;|&nbsp; Development and demo
          environment
        </p>

        <em>
          Discipline Today. A Brighter Tomorrow.
        </em>
      </footer>
    </main>
  );
}
