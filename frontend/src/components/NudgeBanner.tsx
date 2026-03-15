"use client";

import { AnimatePresence, motion } from "framer-motion";

type Props = {
	message: string | null;
	onDismiss?: () => void;
};

export function NudgeBanner({ message, onDismiss }: Props) {
	return (
		<AnimatePresence>
			{message && (
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 8 }}
					className="mx-4 mb-4 p-3 rounded-xl bg-[var(--xp-bar-warning)]/15 border border-[var(--xp-bar-warning)]/50"
				>
					<p className="text-[var(--text-primary)] font-display text-sm">
						{message}
					</p>
					{onDismiss && (
						<button
							type="button"
							onClick={onDismiss}
							className="mt-2 text-[var(--xp-bar-warning)] font-display text-xs font-bold min-tap"
						>
							Dismiss
						</button>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
}
