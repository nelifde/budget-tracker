"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
	message: string | null;
	onDismiss: () => void;
};

export function CoachBanner({ message, onDismiss }: Props) {
	return (
		<AnimatePresence>
			{message && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					className="mx-4 mt-4 p-4 rounded-xl border border-[var(--accent-purple)] bg-[var(--bg-secondary)]"
				>
					<p className="text-[var(--text-primary)] font-display text-sm leading-relaxed">
						{message}
					</p>
					<button
						type="button"
						onClick={onDismiss}
						className="mt-3 text-[var(--accent-purple)] font-display font-bold text-sm min-tap"
					>
						Got it
					</button>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
