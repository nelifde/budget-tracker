"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	deleteTransaction,
	fetchSafeToSpend,
	fetchTransactions,
	type Transaction,
} from "@/lib/api";
import { SwipeableRow } from "./SwipeableRow";

const CURRENCY_SYMBOL: Record<string, string> = {
	USD: "$",
	EUR: "€",
	GBP: "£",
	TRY: "₺",
	JPY: "¥",
};

function formatMoney(
	amount: number | string,
	currency: string = "USD",
): string {
	const n = typeof amount === "string" ? parseFloat(amount) : amount;
	const sym = CURRENCY_SYMBOL[currency] ?? `${currency} `;
	return `${sym}${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
}

function formatDate(iso: string): string {
	const d = new Date(iso);
	const today = new Date();
	if (d.toDateString() === today.toDateString()) return "Today";
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
	return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type Props = { currency?: string; onClose: () => void };

export function SpendingsScreen({ currency = "USD", onClose }: Props) {
	const queryClient = useQueryClient();
	const { data: transactions, isLoading } = useQuery({
		queryKey: ["transactions"],
		queryFn: () => fetchTransactions({ limit: 100 }),
	});

	const { data: summary } = useQuery({
		queryKey: ["safe-to-spend"],
		queryFn: () => fetchSafeToSpend(),
	});

	const hasMonthlyBudget =
		summary?.monthlyBudget != null && summary.monthlyBudget > 0;
	const budgetLeft = hasMonthlyBudget
		? (summary?.remainingInPeriod ?? 0)
		: null;
	const displayCurrency = summary?.currency ?? currency;

	return (
		<div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
			<div className="flex items-center justify-between p-4 border-b border-[var(--xp-bar-bg)]">
				<h1 className="text-xl font-display font-bold text-[var(--text-primary)]">
					My spendings
				</h1>
				<button
					type="button"
					onClick={onClose}
					className="min-tap px-4 py-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-display font-bold"
				>
					Close
				</button>
			</div>
			{hasMonthlyBudget && (
				<div className="mx-4 mt-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--xp-bar-bg)]">
					<p className="text-xs font-display text-[var(--text-secondary)] uppercase tracking-wider mb-1">
						Budget left (this month)
					</p>
					<p
						className="text-2xl font-display font-bold"
						style={{
							color:
								(budgetLeft ?? 0) <= 0
									? "var(--xp-bar-danger)"
									: "var(--accent-green)",
						}}
					>
						{formatMoney(budgetLeft ?? 0, displayCurrency)}
					</p>
				</div>
			)}
			<div className="flex-1 overflow-y-auto p-4">
				{isLoading ? (
					<p className="text-[var(--text-secondary)] font-display">Loading…</p>
				) : !transactions?.length ? (
					<p className="text-[var(--text-secondary)] font-display">
						No spendings yet. Pull down on home to log one.
					</p>
				) : (
					<ul className="space-y-2">
						{transactions.map((tx: Transaction) => (
							<li key={tx.id}>
								<SwipeableRow
									onDelete={async () => {
										await deleteTransaction(tx.id);
										queryClient.invalidateQueries({
											queryKey: ["transactions"],
										});
										queryClient.invalidateQueries({
											queryKey: ["safe-to-spend"],
										});
									}}
									deleteLabel="Delete"
								>
									<div className="flex items-center justify-between p-4">
										<div className="flex items-center gap-3">
											<div
												className="w-10 h-10 rounded-full shrink-0"
												style={{
													backgroundColor: tx.category?.color
														? `${tx.category.color}30`
														: "var(--xp-bar-bg)",
												}}
											/>
											<div>
												<p className="font-display font-bold text-[var(--text-primary)]">
													{tx.category?.name ?? "Uncategorized"}
												</p>
												<p className="text-sm text-[var(--text-secondary)] font-display">
													{formatDate(tx.date)} ·{" "}
													{tx.spendType === "IMPULSIVE"
														? "Impulsive"
														: "Planned"}
												</p>
											</div>
										</div>
										<p className="font-display font-bold text-[var(--text-primary)]">
											{formatMoney(Number(tx.amount), currency)}
										</p>
									</div>
								</SwipeableRow>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
