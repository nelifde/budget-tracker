"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchCategories, postQuickExpense } from "@/lib/api";

type Step = "amount" | "planned-impulsive" | "category";

type Props = { open: boolean; onClose: () => void; onLogged?: () => void };

export function QuickAddSheet({ open, onClose, onLogged }: Props) {
	const [step, setStep] = useState<Step>("amount");
	const [amount, setAmount] = useState("");
	const [spendType, setSpendType] = useState<"PLANNED" | "IMPULSIVE" | null>(
		null,
	);
	const [sending, setSending] = useState(false);

	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: fetchCategories,
		enabled: open && step === "category",
	});

	useEffect(() => {
		if (open) {
			setStep("amount");
			setAmount("");
			setSpendType(null);
		}
	}, [open]);

	const handleAmountDone = () => {
		if (amount && Number(amount) > 0) setStep("planned-impulsive");
	};

	const handlePlannedImpulsive = (type: "PLANNED" | "IMPULSIVE") => {
		setSpendType(type);
		setStep("category");
	};

	const handleLog = async (categoryId?: string | null) => {
		const num = Number(amount);
		if (!Number.isFinite(num) || num <= 0 || !spendType) return;
		setSending(true);
		try {
			await postQuickExpense({
				amount: num,
				spendType,
				categoryId: categoryId ?? undefined,
			});
			onLogged?.();
			onClose();
		} catch {
			// could show toast
		} finally {
			setSending(false);
		}
	};

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
					className="bg-[var(--bg-primary)] rounded-t-3xl shadow-xl min-h-[50vh] flex flex-col"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="flex-1 p-6 overflow-y-auto">
						<AnimatePresence mode="wait">
							{step === "amount" && (
								<motion.div
									key="amount"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="flex flex-col items-center"
								>
									<p className="text-[var(--text-secondary)] font-display text-sm mb-2">
										Amount
									</p>
									<p className="text-display-hero font-display text-[var(--text-primary)] mb-8">
										{amount || "0"}.00
									</p>
									<div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
										{[
											"1",
											"2",
											"3",
											"4",
											"5",
											"6",
											"7",
											"8",
											"9",
											".",
											"0",
											"⌫",
										].map((key) => (
											<button
												key={key}
												type="button"
												className="min-tap rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] font-display text-2xl font-bold active:scale-95 transition"
												onClick={() =>
													key === "⌫"
														? setAmount((a) => a.slice(0, -1))
														: setAmount((a) => a + key)
												}
											>
												{key}
											</button>
										))}
									</div>
									<button
										type="button"
										className="min-tap w-full max-w-[280px] mt-6 rounded-xl bg-[var(--accent-green)] text-black font-display font-bold text-lg"
										onClick={handleAmountDone}
									>
										Next
									</button>
								</motion.div>
							)}
							{step === "planned-impulsive" && (
								<motion.div
									key="planned-impulsive"
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
									className="flex flex-col items-center justify-center min-h-[200px]"
								>
									<p className="text-xl font-display font-bold text-[var(--text-primary)] mb-8">
										Planned or Impulsive?
									</p>
									<div className="flex gap-4">
										<button
											type="button"
											className="min-tap px-8 py-4 rounded-xl bg-[var(--accent-green)] text-black font-display font-bold"
											onClick={() => handlePlannedImpulsive("PLANNED")}
										>
											Planned
										</button>
										<button
											type="button"
											className="min-tap px-8 py-4 rounded-xl bg-[var(--accent-purple)] text-white font-display font-bold"
											onClick={() => handlePlannedImpulsive("IMPULSIVE")}
										>
											Impulsive
										</button>
									</div>
								</motion.div>
							)}
							{step === "category" && (
								<motion.div
									key="category"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="flex flex-col"
								>
									<p className="text-lg font-display font-bold text-[var(--text-primary)] mb-4">
										Where did you spend? (optional)
									</p>
									<div className="flex flex-wrap gap-2 mb-6">
										<button
											type="button"
											onClick={() => handleLog(null)}
											disabled={sending}
											className="min-tap px-4 py-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-display font-bold disabled:opacity-50"
										>
											{sending ? "…" : "Skip"}
										</button>
										{categories.map((c) => (
											<button
												key={c.id}
												type="button"
												onClick={() => handleLog(c.id)}
												disabled={sending}
												className="min-tap px-4 py-3 rounded-xl font-display font-bold text-white disabled:opacity-50"
												style={{ backgroundColor: c.color }}
											>
												{c.name}
											</button>
										))}
									</div>
									<p className="text-sm text-[var(--text-secondary)] font-display">
										Tap a tag to log with that category, or Skip to log without.
									</p>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
