"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
	message: string | null;
	onComplete: () => void;
	onDismiss: () => void;
};

export function CoachCheckInBanner({ message, onComplete, onDismiss }: Props) {
	return (
		<AnimatePresence>
			{message && (
				<motion.div
					initial={{ opacity: 0, y: -8 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -8 }}
					className="mx-4 mt-4 p-4 rounded-xl border border-[var(--accent-green)] bg-[var(--accent-green)]/10"
				>
					<p className="text-[var(--text-primary)] font-display text-sm leading-relaxed">
						{message}
					</p>
					<div className="mt-3 flex gap-2">
						<button
							type="button"
							onClick={onComplete}
							className="min-tap px-3 py-2 rounded-lg bg-[var(--accent-green)] text-black font-display text-sm font-bold"
						>
							I checked in
						</button>
						<button
							type="button"
							onClick={onDismiss}
							className="min-tap px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-display text-sm font-bold"
						>
							Later
						</button>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
