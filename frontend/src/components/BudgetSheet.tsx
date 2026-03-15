"use client";

import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchSettings,
  updateSettings,
  fetchBudgets,
  createBudgetLine,
  deleteBudgetLine,
  type UserSettings,
  type BudgetLine,
} from "@/lib/api";
import { SwipeableRow } from "./SwipeableRow";

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", TRY: "₺", JPY: "¥" };

function formatMoney(amount: number | string, currency: string = "USD"): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  const sym = CURRENCY_SYMBOL[currency] ?? currency + " ";
  return `${sym}${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
}

type Props = { open: boolean; onClose: () => void; onSaved?: () => void };

export function BudgetSheet({ open, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyTotal, setMonthlyTotal] = useState<number | null>(null);
  const [savingTotal, setSavingTotal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [adding, setAdding] = useState(false);

  const queryClient = useQueryClient();

  const { data: budgetsData } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => fetchBudgets(),
    enabled: open,
  });

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchSettings(),
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    setLoading(true);
    fetchSettings()
      .then((s: UserSettings) => setMonthlyTotal(s.monthlyBudgetAmount ?? null))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [open]);

  const handleSaveTotal = async () => {
    setSavingTotal(true);
    setError(null);
    try {
      await updateSettings({ monthlyBudgetAmount: monthlyTotal ?? null });
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
      onSaved?.();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSavingTotal(false);
    }
  };

  const handleAddBudget = async () => {
    const name = newName.trim();
    const amount = Number(newAmount);
    if (!name || !Number.isFinite(amount) || amount < 0) return;
    setAdding(true);
    setError(null);
    try {
      await createBudgetLine(name, amount);
      setNewName("");
      setNewAmount("");
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await deleteBudgetLine(id);
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const totalBudget =
    budgetsData?.total != null && budgetsData.total > 0
      ? budgetsData.total
      : monthlyTotal ?? 0;
  const budgets = budgetsData?.budgets ?? [];
  const currency = settings?.currency ?? "USD";

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="bg-[var(--bg-primary)] rounded-t-3xl shadow-xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
                My budget
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="min-tap rounded-lg text-[var(--text-secondary)] font-display"
              >
                Close
              </button>
            </div>

            {loading ? (
              <p className="text-[var(--text-secondary)] font-display">Loading…</p>
            ) : (
              <div className="space-y-6">
                {/* Budget overview */}
                <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--xp-bar-bg)]">
                  <h3 className="text-sm font-display font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Budget overview (this month)
                  </h3>
                  <p
                    className="text-2xl font-display font-bold"
                    style={{
                      color:
                        totalBudget > 0 ? "var(--accent-green)" : "var(--text-secondary)",
                    }}
                  >
                    {formatMoney(totalBudget, currency)}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {budgets.length > 0
                      ? "Sum of your added budgets below. Safe to Spend uses this total."
                      : "Add budget lines below, or set a single monthly budget underneath."}
                  </p>
                </div>

                {/* Added budget list */}
                <div>
                  <h3 className="text-sm font-display font-bold text-[var(--text-primary)] mb-3">
                    Added budgets
                  </h3>
                  {budgets.length === 0 ? (
                    <p className="text-sm text-[var(--text-secondary)] font-display">
                      No budget lines yet. Add one below.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {budgets.map((b: BudgetLine) => (
                        <li key={b.id}>
                          <SwipeableRow
                            onDelete={() => handleDeleteBudget(b.id)}
                            deleteLabel="Remove"
                          >
                            <div className="flex items-center justify-between p-3">
                              <div>
                                <p className="font-display font-bold text-[var(--text-primary)]">
                                  {b.name}
                                </p>
                                <p className="text-sm text-[var(--text-secondary)] font-display">
                                  {formatMoney(Number(b.amount), currency)}
                                </p>
                              </div>
                            </div>
                          </SwipeableRow>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Add budget */}
                <div>
                  <h3 className="text-sm font-display font-bold text-[var(--text-primary)] mb-3">
                    Add budget
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Food, Transport"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 min-tap rounded-xl border border-[var(--xp-bar-bg)] bg-[var(--bg-secondary)] px-4 py-3 font-display text-[var(--text-primary)]"
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Amount"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-24 min-tap rounded-xl border border-[var(--xp-bar-bg)] bg-[var(--bg-secondary)] px-4 py-3 font-display text-[var(--text-primary)]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBudget}
                    disabled={adding || !newName.trim() || !Number(newAmount)}
                    className="min-tap mt-2 px-4 py-2 rounded-xl bg-[var(--accent-purple)] text-white font-display text-sm font-bold disabled:opacity-50"
                  >
                    {adding ? "Adding…" : "Add"}
                  </button>
                </div>

                {/* Single monthly budget fallback */}
                <div>
                  <label className="block text-sm font-display font-bold text-[var(--text-primary)] mb-2">
                    Or set one total (if you don't use lines above)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 2000"
                      value={monthlyTotal ?? ""}
                      onChange={(e) =>
                        setMonthlyTotal(
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                      className="flex-1 min-tap rounded-xl border border-[var(--xp-bar-bg)] bg-[var(--bg-secondary)] px-4 py-3 font-display text-[var(--text-primary)]"
                    />
                    <button
                      type="button"
                      onClick={handleSaveTotal}
                      disabled={savingTotal}
                      className="min-tap px-4 py-3 rounded-xl bg-[var(--accent-green)] text-black font-display font-bold disabled:opacity-50"
                    >
                      {savingTotal ? "…" : "Update"}
                    </button>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Used when you have no budget lines. Daily = (this − spent) ÷ days left.
                  </p>
                </div>

                {error && (
                  <p className="text-[var(--xp-bar-danger)] font-display text-sm">{error}</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
