"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { WhitelistRole } from "@/lib/schemas/auth";
import type { WhitelistRecord } from "@/lib/whitelist-log";

type ApiOk = { ok: true; records: WhitelistRecord[] };
type ApiErr = { ok: false; error?: string };

export function WhitelistManager() {
  const [records, setRecords] = useState<WhitelistRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WhitelistRole>("member");
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/whitelist");
      const json = (await res.json()) as ApiOk | ApiErr;
      if (!res.ok || !json.ok) {
        setError("無法載入白名單。");
        return;
      }
      setRecords(json.records);
    } catch {
      setError("無法連線。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const json = (await res.json()) as ApiOk | ApiErr;
      if (!res.ok || !json.ok) {
        const err = !json.ok ? json.error : undefined;
        if (err === "ALREADY_EXISTS") {
          setError("此 Email 已在白名單中。");
        } else {
          setError("新增失敗，請確認 Email 格式。");
        }
        return;
      }
      setRecords(json.records);
      setEmail("");
      setRole("member");
    } catch {
      setError("無法連線。");
    } finally {
      setSubmitting(false);
    }
  }

  async function onRemove(targetEmail: string) {
    if (!confirm(`確定要移除 ${targetEmail}？`)) return;
    setRemoving(targetEmail);
    setError(null);
    try {
      const res = await fetch("/api/admin/whitelist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      const json = (await res.json()) as ApiOk | ApiErr;
      if (!res.ok || !json.ok) {
        const err = !json.ok ? json.error : undefined;
        if (err === "LAST_ADMIN") {
          setError("無法移除最後一位管理員。");
        } else {
          setError("移除失敗。");
        }
        return;
      }
      setRecords(json.records);
    } catch {
      setError("無法連線。");
    } finally {
      setRemoving(null);
    }
  }

  if (loading) {
    return (
      <div className="h-40 animate-pulse rounded-2xl border border-edge bg-surface" />
    );
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={onAdd}
        className="rounded-2xl border border-edge bg-surface p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-ink">新增白名單</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="wl-email" className="mb-1.5 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="wl-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-edge bg-page px-3 py-2.5 text-sm text-ink outline-none ring-ring focus:ring-2"
              placeholder="member@example.com"
            />
          </div>
          <div className="sm:w-40">
            <label htmlFor="wl-role" className="mb-1.5 block text-sm font-medium text-ink">
              角色
            </label>
            <select
              id="wl-role"
              value={role}
              onChange={(e) => setRole(e.target.value as WhitelistRole)}
              className="w-full rounded-xl border border-edge bg-page px-3 py-2.5 text-sm text-ink outline-none ring-ring focus:ring-2"
            >
              <option value="member">會員</option>
              <option value="admin">管理員</option>
            </select>
          </div>
          <Button type="submit" loading={submitting} className="sm:mb-0.5">
            新增
          </Button>
        </div>
      </form>

      {error ? (
        <p
          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-edge bg-surface shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-edge bg-page/60 text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">角色</th>
              <th className="px-4 py-3 font-medium">新增時間</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  尚無白名單資料
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r.email} className="border-b border-edge last:border-0">
                  <td className="px-4 py-3 text-ink">{r.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        r.role === "admin"
                          ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                          : "rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-medium text-muted"
                      }
                    >
                      {r.role === "admin" ? "管理員" : "會員"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(r.createdAt).toLocaleString("zh-TW", {
                      timeZone: "Asia/Taipei",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-sm text-rose-600 hover:underline disabled:opacity-50"
                      disabled={removing === r.email}
                      onClick={() => void onRemove(r.email)}
                    >
                      {removing === r.email ? "移除中…" : "移除"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
