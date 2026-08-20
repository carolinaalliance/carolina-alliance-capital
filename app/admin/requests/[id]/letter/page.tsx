"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

type LetterRequest = {
  id: string;
  full_name: string;
  company: string | null;
  email: string;
  location: string | null;
  decision_letter_type: string | null;
  decision_letter_body: string | null;
  decision_letter_generated_at: string | null;
};

export default function DecisionLetterPage() {
  const params = useParams();
  const router = useRouter();

  const requestId = String(params.id || "");

  const [request, setRequest] =
    useState<LetterRequest | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLetter() {
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
        .from("capital_requests")
        .select(
          `
            id,
            full_name,
            company,
            email,
            location,
            decision_letter_type,
            decision_letter_body,
            decision_letter_generated_at
          `
        )
        .eq("id", requestId)
        .maybeSingle<LetterRequest>();

      if (error || !data) {
        setErrorMessage(
          "We could not load this decision letter."
        );
        setLoading(false);
        return;
      }

      setRequest(data);
      setLoading(false);
    }

    if (requestId) {
      loadLetter();
    }
  }, [requestId, router]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <main className="decision-letter-loading">
        Loading decision letter...
      </main>
    );
  }

  if (
    errorMessage ||
    !request ||
    !request.decision_letter_body
  ) {
    return (
      <main className="decision-letter-page">
        <div className="decision-letter-toolbar">
          <Link href={`/admin/requests/${requestId}`}>
            ← Back to Capital Request
          </Link>
        </div>

        <section className="decision-letter-document">
          <h1>No Decision Letter Available</h1>

          <p>
            {errorMessage ||
              "Generate a decision letter from the underwriting workspace first."}
          </p>
        </section>
      </main>
    );
  }

  const letterTitle =
    request.decision_letter_type === "conditional_approval"
      ? "Conditional Approval Letter"
      : request.decision_letter_type === "approval"
      ? "Approval Letter"
      : request.decision_letter_type === "decline"
      ? "Decision Letter"
      : "Decision Letter";

  return (
    <main className="decision-letter-page">
      <div className="decision-letter-toolbar">
        <Link href={`/admin/requests/${requestId}`}>
          ← Back to Capital Request
        </Link>

        <div className="decision-letter-toolbar-actions">
          <span>{letterTitle}</span>

          <button
            type="button"
            onClick={handlePrint}
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      <article className="decision-letter-document">
        <header className="decision-letter-letterhead">
          <div>
            <div className="decision-letter-brand">
              CAROLINA ALLIANCE
            </div>

            <div className="decision-letter-brand-subtitle">
              CAPITAL
            </div>
          </div>
        </header>

        <div className="decision-letter-body">
          {request.decision_letter_body
            .split("\n")
            .map((line, index) => {
              if (!line.trim()) {
                return (
                  <div
                    key={index}
                    className="decision-letter-space"
                  />
                );
              }

              return (
                <p key={index}>
                  {line}
                </p>
              );
            })}
        </div>

        <footer className="decision-letter-footer">
          <p>
            Carolina Alliance Capital
          </p>

          <p>
            Private Capital • Real Estate • Business
          </p>
        </footer>
      </article>
    </main>
  );
}
