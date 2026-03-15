"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { postReflection } from "@/lib/api";

const FEELING_OPTIONS: { key: string; label: string }[] = [
	{ key: "fine", label: "Fine, it was planned" },
	{ key: "guilty", label: "A bit guilty" },
	{ key: "anxious", label: "Anxious" },
	{ key: "relieved", label: "Relieved" },
	{ key: "not_sure", label: "Not sure" },
];

const REASON_OPTIONS: { key: string; label: string }[] = [
	{ key: "stressed", label: "Stressed" },
	{ key: "bored", label: "Bored" },
	{ key: "with_friends", label: "With friends" },
	{ key: "saw_deal", label: "Saw a deal" },
	{ key: "not_sure", label: "Not sure" },
];

type Props = {
	open: boolean;
	onClose: () => void;
	promptMessage: string;
	categoryName?: string;
	categoryId?: string | null;
	onSubmitted?: () => void;
};

export function ReflectionLogSheet({
	open,
	onClose,
	promptMessage,
	categoryId,
	onSubmitted,
}: Props) {
	const [feelingKey, setFeelingKey] = useState<string | null>(null);
	const [reasonKey, setReasonKey] = useState<string | null>(null);
	const [sending, setSending] = useState(false);

	const handleSubmit = async () => {
		if (!feelingKey || !reasonKey || sending) return;
		setSending(true);
		try {
			await postReflection({
				feelingKey,
				reasonKey,
				categoryId: categoryId ?? undefined,
			});
			onSubmitted?.();
			onClose();
		} catch {
			// could show toast
		} finally {
			setSending(false);
		}
	};

	const canSubmit = feelingKey && reasonKey;

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
					<div className="p-6 pb-10">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
								How did you feel?
							</h2>
							<button
								type="button"
								onClick={onClose}
								className="min-tap px-3 py-2 rounded-lg text-[var(--text-secondary)] font-display font-bold"
							>
								Close
							</button>
						</div>

						<p className="text-[var(--text-primary)] font-display text-sm leading-relaxed mb-6">
							{promptMessage}
						</p>

						<p className="text-xs font-display text-[var(--text-secondary)] uppercase tracking-wider mb-2">
							How did you feel about it?
						</p>
						<div className="flex flex-wrap gap-2 mb-6">
							{FEELING_OPTIONS.map((opt) => (
								<button
									key={opt.key}
									type="button"
									onClick={() => setFeelingKey(opt.key)}
									className={`min-tap px-3 py-2 rounded-lg font-display text-sm font-medium border ${
										feelingKey === opt.key
											? "bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]"
											: "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--xp-bar-bg)]"
									}`}
								>
									{opt.label}
								</button>
							))}
						</div>

						<p className="text-xs font-display text-[var(--text-secondary)] uppercase tracking-wider mb-2">
							Why did you spend?
						</p>
						<div className="flex flex-wrap gap-2 mb-8">
							{REASON_OPTIONS.map((opt) => (
								<button
									key={opt.key}
									type="button"
									onClick={() => setReasonKey(opt.key)}
									className={`min-tap px-3 py-2 rounded-lg font-display text-sm font-medium border ${
										reasonKey === opt.key
											? "bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]"
											: "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--xp-bar-bg)]"
									}`}
								>
									{opt.label}
								</button>
							))}
						</div>

						<button
							type="button"
							onClick={handleSubmit}
							disabled={!canSubmit || sending}
							className="w-full min-tap py-3 rounded-xl font-display font-bold text-white bg-[var(--accent-purple)] disabled:opacity-50 disabled:pointer-events-none"
						>
							{sending ? "Saving…" : "Save reflection"}
						</button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
