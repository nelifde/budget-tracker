"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = { open: boolean; onClose: () => void };

const EXAMPLE_PROMPTS = [
	{
		title: "After a spend we might ask",
		question: "How did you feel about this spend?",
		options: [
			"Fine, it was planned",
			"A bit guilty",
			"Anxious",
			"Relieved",
			"Not sure",
		],
	},
	{
		title: "Then",
		question: "Why did you spend? (optional)",
		hint: "e.g. stressed, bored, with friends, saw a deal…",
	},
];

const EXAMPLE_REMINDERS = [
	{
		situation: "You're about to log an impulsive Food spend.",
		message:
			"Last time you did this, you said you felt anxious because you were stressed. Take a breath — you've got this.",
	},
	{
		situation: "Similar to last week: impulsive Shopping.",
		message:
			"You once wrote you felt guilty because you were bored. Remember that moment? No judgment — just here to remind you.",
	},
	{
		situation: "Another Drink spend.",
		message:
			"You said Drink runs often happen when you're out with friends. Same situation now? We're in your corner.",
	},
	{
		situation: "You've logged a few impulsive spends today.",
		message:
			"You mentioned stress was a trigger before. Whatever's going on — we're just pausing to bring that back. You're doing great by being here.",
	},
];

export function ReflectionsMockupSheet({ open, onClose }: Props) {
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
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
								Reflections & reminders
							</h2>
							<button
								type="button"
								onClick={onClose}
								className="min-tap px-3 py-2 rounded-lg text-[var(--text-secondary)] font-display font-bold"
							>
								Close
							</button>
						</div>

						<p className="text-[var(--text-secondary)] font-display text-sm leading-relaxed mb-8">
							From time to time we'll ask you about a spend — how you felt and
							why. When we notice similar activity later, we'll gently remind
							you of that moment. No judgment, just you and your patterns.
						</p>

						<h3 className="text-sm font-display font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">
							Example prompts we might ask
						</h3>
						<div className="space-y-4 mb-8">
							{EXAMPLE_PROMPTS.map((p, i) => (
								<div
									key={i}
									className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--xp-bar-bg)]"
								>
									<p className="text-xs font-display text-[var(--text-secondary)] mb-1">
										{p.title}
									</p>
									<p className="font-display font-bold text-[var(--text-primary)] mb-2">
										{p.question}
									</p>
									{p.options && (
										<div className="flex flex-wrap gap-2 mt-2">
											{p.options.map((opt, j) => (
												<span
													key={j}
													className="px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] text-[var(--text-secondary)] font-display text-xs"
												>
													{opt}
												</span>
											))}
										</div>
									)}
									{p.hint && (
										<p className="text-xs text-[var(--text-secondary)] mt-2 font-display italic">
											{p.hint}
										</p>
									)}
								</div>
							))}
						</div>

						<h3 className="text-sm font-display font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4">
							Example reminders you might see
						</h3>
						<p className="text-[var(--text-secondary)] font-display text-xs mb-4">
							When we detect similar activity (e.g. same category, impulsive
							again), we might show:
						</p>
						<div className="space-y-4">
							{EXAMPLE_REMINDERS.map((r, i) => (
								<div
									key={i}
									className="p-4 rounded-xl border border-[var(--accent-purple)]/50 bg-[var(--accent-purple)]/10"
								>
									<p className="text-xs font-display font-bold text-[var(--accent-purple)] mb-2">
										{r.situation}
									</p>
									<p className="font-display text-sm text-[var(--text-primary)] leading-relaxed">
										{r.message}
									</p>
								</div>
							))}
						</div>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
