"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn, Pagination } from "@/components/ui";
import { MUTED, RED, PINE, LINE, FOREST, BRASS_SOFT } from "@/lib/theme";

export default function AdminAuditPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [logs, setLogs] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data.user.adminRole !== "full") router.replace("/admin");
        else setAuthorized(true);
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    fetch(`/api/admin/audit?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || []);
        setTotalPages(Math.max(1, Math.ceil((data.total || 0) / data.pageSize)));
      });
  }, [authorized, page]);

  const verify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    const res = await fetch("/api/admin/audit/verify");
    const data = await res.json();
    setVerifyResult(data);
    setVerifying(false);
  };

  if (!authorized) return null;

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-8 pt-8 pb-16">
      <Link href="/admin" className="text-sm font-semibold underline" style={{ color: PINE }}>← Admin</Link>
      <h1 className="disp font-bold mt-3" style={{ fontSize: "clamp(1.7rem,4vw,2.2rem)" }}>Audit log</h1>
      <p className="mt-1 text-[14px]" style={{ color: MUTED }}>
        Append-only, hash-chained record of every signup, login, verification decision, deposit/withdrawal approval,
        and booking status change. Editing or deleting a row here directly in the database is blocked by a DB trigger —
        this page can only read.
      </p>

      <div className="card soft p-5 mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="disp font-bold text-[15px]">Chain integrity</h2>
          <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>
            Recomputes every row&apos;s hash from its content and checks the chain is unbroken.
          </p>
        </div>
        <Btn small primary disabled={verifying} onClick={verify}>{verifying ? "Checking…" : "Verify chain"}</Btn>
      </div>

      {verifyResult && (
        <div className="card soft p-4 mt-3" style={verifyResult.ok ? { background: BRASS_SOFT, borderColor: FOREST } : { borderColor: RED }}>
          {verifyResult.ok ? (
            <p className="text-[14px] font-semibold" style={{ color: FOREST }}>
              ✓ Chain intact — {verifyResult.checked} rows verified, no tampering detected.
            </p>
          ) : (
            <p className="text-[14px] font-semibold" style={{ color: RED }}>
              ✕ Chain broken at row #{verifyResult.brokenAtSeq} &mdash; {verifyResult.reason}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 card soft divide-y" style={{ borderColor: LINE }}>
        {!logs && <p className="p-4 text-[13px]" style={{ color: MUTED }}>Loading…</p>}
        {logs?.length === 0 && <p className="p-4 text-[13px]" style={{ color: MUTED }}>Nothing logged yet.</p>}
        {logs?.map((l) => (
          <div key={l.id} className="p-4">
            <div className="flex flex-wrap gap-3 justify-between items-baseline">
              <p className="font-semibold text-[14px]">{l.eventType}</p>
              <p className="text-[12px]" style={{ color: MUTED }}>{new Date(l.createdAt).toLocaleString()}</p>
            </div>
            <p className="text-[13px] mt-0.5" style={{ color: MUTED }}>
              {l.actorEmail || "system"}{l.targetType && ` · ${l.targetType}:${String(l.targetId).slice(0, 8)}`}
            </p>
            {l.metadata && Object.keys(l.metadata).length > 0 && (
              <p className="text-[12px] mt-1" style={{ color: MUTED, fontFamily: "monospace" }}>{JSON.stringify(l.metadata)}</p>
            )}
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </main>
  );
}
