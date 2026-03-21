"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDrag } from "@use-gesture/react";
import { motion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
	completeCoachCheckIn,
	dismissCoachCheckIn,
	fetchCoachCheckIn,
	fetchCoachReflection,
	fetchSafeToSpend,
} from "@/lib/api";
import { CoachCheckInBanner } from "./CoachCheckInBanner";
import { CoachBanner } from "./CoachBanner";
import { NudgeBanner } from "./NudgeBanner";
import { ReflectionLogSheet } from "./ReflectionLogSheet";

type Props = {
	onPullToAdd: () => void;
	onOpenBudget: () => void;
	onOpenSettings: () => void;
	onOpenSpendings: () => void;
	onOpenReflectionsMockup: () => void;
};

const MOCK_COACH =
	"You've logged a few impulsive spends this week. No judgment — want to look at what they had in common?";
const MOCK_NUDGE =
	"You haven't logged anything today. Pull down when you spend so we can keep your Safe to Spend updated.";

const CURRENCY_SYMBOL: Record<string, string> = {
	USD: "$",
	EUR: "€",
	GBP: "£",
	TRY: "₺",
	JPY: "¥",
};

function formatMoney(amount: number, currency: string = "USD"): string {
	const sym = CURRENCY_SYMBOL[currency] ?? `${currency} `;
	return `${sym}${amount.toFixed(2)}`;
}

export function HomeScreen({
	onPullToAdd,
	onOpenBudget,
	onOpenSettings,
	onOpenSpendings,
	onOpenReflectionsMockup,
}: Props) {
	const [demoMode, setDemoMode] = useState(false);
	const [coachMessage, setCoachMessage] = useState<string | null>(null);
	const [nudgeMessage, setNudgeMessage] = useState<string | null>(null);
	const [coachBannerDismissed, setCoachBannerDismissed] = useState(false);
	const [reflectionDismissed, setReflectionDismissed] = useState(false);
	const queryClient = useQueryClient();

	const { data: summary, isLoading } = useQuery({
		queryKey: ["safe-to-spend"],
		queryFn: () => fetchSafeToSpend(),
		refetchOnWindowFocus: true,
	});

	const { data: coachData } = useQuery({
		queryKey: ["coach-reflection"],
		queryFn: fetchCoachReflection,
		enabled: !demoMode,
	});
	const { data: coachCheckInData } = useQuery({
		queryKey: ["coach-checkin"],
		queryFn: fetchCoachCheckIn,
		enabled: !demoMode,
		refetchInterval: 60_000,
	});

	const showReflectionSheet =
		!demoMode &&
		!!coachData?.prompt &&
		!!coachData?.requestFeelingLog &&
		!reflectionDismissed;

	useEffect(() => {
		if (coachData?.prompt && coachData?.requestFeelingLog) {
			setReflectionDismissed(false);
		}
	}, [coachData?.prompt, coachData?.requestFeelingLog]);

	const coachBannerMessage = demoMode
		? coachMessage
		: coachData?.prompt && !coachData?.requestFeelingLog && !coachBannerDismissed
			? coachData.prompt
			: null;
	const coachCheckIn = demoMode ? null : coachCheckInData?.checkIn ?? null;

	useEffect(() => {
		if (!coachCheckIn || typeof window === "undefined" || !("Notification" in window))
			return;
		const notifiedKey = "budget_tracker_last_checkin_notified";
		const alreadyNotified = localStorage.getItem(notifiedKey);
		if (alreadyNotified === coachCheckIn.id) return;
		if (Notification.permission === "granted") {
			new Notification("Budget check-in", { body: coachCheckIn.prompt });
			localStorage.setItem(notifiedKey, coachCheckIn.id);
		}
	}, [coachCheckIn]);

	const safeToSpend = demoMode ? 12.5 : (summary?.safeToSpendToday ?? null);
	const xpPercent = demoMode ? 18 : (summary?.xpPercent ?? 100);
	const currency = summary?.currency ?? "USD";
	const exceededDailySafeLimit = demoMode
		? false
		: (summary?.exceededDailySafeLimit ?? false);

	const ref = useRef<HTMLDivElement>(null);
	const y = useSpring(0, { stiffness: 300, damping: 30 });

	const isWarning = xpPercent < 40 && xpPercent >= 20;
	const isDanger = xpPercent < 20;
	const atZero = safeToSpend != null && safeToSpend <= 0;

	useDrag(
		({ movement: [, my], down, velocity: [, vy] }) => {
			if (my > 0) {
				y.set(Math.min(my, 120));
				if (!down && (my > 80 || vy > 0.3)) {
					onPullToAdd();
					y.set(0);
				} else if (!down) y.set(0);
			} else if (!down) {
				y.set(0);
			}
		},
		{
			axis: "y",
			pointer: { touch: true },
			target: ref,
			from: () => [0, y.get()],
		},
	);

	const xpBarColor = isDanger
		? "var(--xp-bar-danger)"
		: isWarning
			? "var(--xp-bar-warning)"
			: "var(--xp-bar-fill)";

	return (
		<div ref={ref} className="relative touch-none select-none">
			<motion.div style={{ y }} className="flex flex-col min-h-[80vh] px-4">
				<div className="flex items-center justify-between mt-4 mb-2">
					<div className="flex gap-2 flex-wrap">
						<button
							type="button"
							onClick={onOpenBudget}
							className="min-tap px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-display text-sm font-bold"
							aria-label="My budget"
						>
							My budget
						</button>
						<button
							type="button"
							onClick={onOpenSettings}
							className="min-tap px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-display text-sm font-bold"
							aria-label="Settings"
						>
							Settings
						</button>
						<button
							type="button"
							onClick={onOpenSpendings}
							className="min-tap px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-display text-sm font-bold"
						>
							Spendings
						</button>
						<button
							type="button"
							onClick={onOpenReflectionsMockup}
							className="min-tap px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-display text-sm font-bold"
						>
							Reflections
						</button>
					</div>
					<div className="flex gap-2 flex-wrap justify-end">
						<button
							type="button"
							onClick={() => {
								setDemoMode((d) => !d);
								if (!demoMode) {
									setCoachMessage(MOCK_COACH);
									setNudgeMessage(MOCK_NUDGE);
								} else {
									setCoachMessage(null);
									setNudgeMessage(null);
									setCoachBannerDismissed(false);
									setReflectionDismissed(false);
								}
							}}
							className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-display text-xs font-bold min-tap"
						>
							{demoMode ? "Exit preview" : "Preview notifications"}
						</button>
						{typeof window !== "undefined" &&
							"Notification" in window &&
							Notification.permission !== "granted" && (
								<button
									type="button"
									onClick={() => Notification.requestPermission()}
									className="px-3 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-display text-xs font-bold min-tap"
								>
									Enable browser alerts
								</button>
							)}
					</div>
				</div>

				<CoachBanner
					message={coachBannerMessage}
					onDismiss={() => {
						if (demoMode) setCoachMessage(null);
						else setCoachBannerDismissed(true);
					}}
				/>
				<CoachCheckInBanner
					message={coachCheckIn?.prompt ?? null}
					onDismiss={async () => {
						if (!coachCheckIn?.id) return;
						await dismissCoachCheckIn(coachCheckIn.id);
						queryClient.invalidateQueries({ queryKey: ["coach-checkin"] });
					}}
					onComplete={async () => {
						if (!coachCheckIn?.id) return;
						await completeCoachCheckIn(coachCheckIn.id);
						queryClient.invalidateQueries({ queryKey: ["coach-checkin"] });
					}}
				/>
				<ReflectionLogSheet
					open={showReflectionSheet}
					onClose={() => {
						setReflectionDismissed(true);
						queryClient.invalidateQueries({ queryKey: ["coach-reflection"] });
					}}
					promptMessage={coachData?.prompt ?? ""}
					categoryName={coachData?.categoryName}
					categoryId={coachData?.categoryId}
					onSubmitted={() => {
						setReflectionDismissed(true);
						queryClient.invalidateQueries({ queryKey: ["coach-reflection"] });
					}}
				/>
				<NudgeBanner
					message={nudgeMessage}
					onDismiss={() => setNudgeMessage(null)}
				/>

				<div className="flex flex-col items-center justify-center flex-1">
					<p className="text-[var(--text-secondary)] text-sm uppercase tracking-wider mb-2 font-display">
						Safe to spend today
					</p>
					{isLoading && !demoMode ? (
						<p className="text-display-hero font-display text-[var(--text-secondary)]">
							…
						</p>
					) : (
						<p
							className="text-display-hero font-display"
							style={{
								color: atZero ? "var(--xp-bar-danger)" : "var(--accent-green)",
							}}
						>
							{safeToSpend != null ? formatMoney(safeToSpend, currency) : "—"}
						</p>
					)}
					<div className="w-full max-w-xs mt-8 h-3 rounded-full bg-[var(--xp-bar-bg)] overflow-hidden">
						<motion.div
							className="h-full rounded-full"
							style={{
								backgroundColor: xpBarColor,
								boxShadow: isDanger
									? "0 0 12px var(--xp-bar-danger)"
									: undefined,
							}}
							initial={false}
							animate={{
								width: `${xpPercent}%`,
								opacity: isDanger ? [1, 0.85, 1] : 1,
							}}
							transition={{
								width: { type: "spring", stiffness: 300, damping: 30 },
								opacity: isDanger ? { repeat: Infinity, duration: 1.5 } : {},
							}}
						/>
					</div>
					{exceededDailySafeLimit ? (
						<p className="text-[var(--xp-bar-danger)] font-display text-sm font-bold mt-2">
							You exceeded today's safe limit. Pause before the next spend.
						</p>
					) : isDanger ? (
						<p className="text-[var(--xp-bar-danger)] font-display text-sm font-bold mt-2">
							Budget low — slow down spending
						</p>
					) : isWarning ? (
						<p className="text-[var(--xp-bar-warning)] font-display text-sm mt-2">
							Getting low
						</p>
					) : null}
					<p className="text-[var(--text-secondary)] text-sm mt-4 font-display">
						Pull down to log an expense
					</p>
				</div>
			</motion.div>
		</div>
	);
}
