"use client";

import { motion, useMotionValue } from "framer-motion";

const REVEAL_WIDTH = 80;

type Props = {
	children: React.ReactNode;
	onDelete: () => void;
	deleteLabel?: string;
};

export function SwipeableRow({
	children,
	onDelete,
	deleteLabel = "Delete",
}: Props) {
	const x = useMotionValue(0);

	return (
		<div className="relative overflow-hidden rounded-xl">
			{/* Delete action behind */}
			<div
				className="absolute right-0 top-0 bottom-0 flex items-center justify-center min-w-[80px] bg-[var(--xp-bar-danger)]"
				style={{ width: REVEAL_WIDTH }}
			>
				<button
					type="button"
					onClick={onDelete}
					className="min-tap px-4 py-3 text-white font-display font-bold text-sm"
				>
					{deleteLabel}
				</button>
			</div>
			{/* Sliding content */}
			<motion.div
				className="relative rounded-xl bg-[var(--bg-secondary)]"
				style={{ x }}
				drag="x"
				dragConstraints={{ left: -REVEAL_WIDTH, right: 0 }}
				dragElastic={0.15}
				onDragEnd={(_, info) => {
					const v = x.get();
					if (v < -REVEAL_WIDTH / 2 || info.velocity.x < -200) {
						x.set(-REVEAL_WIDTH);
					} else {
						x.set(0);
					}
				}}
				onTap={() => {
					if (x.get() < -20) x.set(0);
				}}
			>
				{children}
			</motion.div>
		</div>
	);
}
