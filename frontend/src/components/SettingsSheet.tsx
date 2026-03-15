"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchSettings, type UserSettings, updateSettings } from "@/lib/api";

const CURRENCIES = ["USD", "EUR", "GBP", "TRY", "JPY"];
const THEME_KEY = "budget_tracker_theme";
export type ThemeValue = "light" | "dark" | "system";

function getStoredTheme(): ThemeValue {
	if (typeof window === "undefined") return "system";
	const s = localStorage.getItem(THEME_KEY);
	if (s === "light" || s === "dark" || s === "system") return s;
	return "system";
}

function applyTheme(value: ThemeValue) {
	if (typeof document === "undefined") return;
	const isDark =
		value === "dark" ||
		(value === "system" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches);
	document.documentElement.classList.toggle("dark", isDark);
}

type Props = { open: boolean; onClose: () => void; onSaved?: () => void };

export function SettingsSheet({ open, onClose, onSaved }: Props) {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [form, setForm] = useState<UserSettings>({
		currency: "USD",
		simplified: true,
		monthlyBudgetAmount: null,
	});
	const [theme, setTheme] = useState<ThemeValue>("system");

	useEffect(() => {
		if (!open) return;
		setError(null);
		setLoading(true);
		setTheme(getStoredTheme());
		fetchSettings()
			.then(setForm)
			.catch((e) => setError((e as Error).message))
			.finally(() => setLoading(false));
	}, [open]);

	const handleSave = async () => {
		setSaving(true);
		setError(null);
		try {
			await updateSettings({
				currency: form.currency,
				simplified: form.simplified,
			});
			localStorage.setItem(THEME_KEY, theme);
			applyTheme(theme);
			onSaved?.();
			onClose();
		} catch (e) {
			setError((e as Error).message);
		} finally {
			setSaving(false);
		}
	};

	const handleThemeChange = (value: ThemeValue) => {
		setTheme(value);
		localStorage.setItem(THEME_KEY, value);
		applyTheme(value);
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
					className="bg-[var(--bg-primary)] rounded-t-3xl shadow-xl max-h-[90vh] overflow-y-auto"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="p-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
								Settings
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
							<p className="text-[var(--text-secondary)] font-display">
								Loading…
							</p>
						) : (
							<div className="space-y-6">
								{/* Currency */}
								<div>
									<label className="block text-sm font-display font-bold text-[var(--text-primary)] mb-2">
										Currency
									</label>
									<select
										value={form.currency}
										onChange={(e) =>
											setForm((f) => ({ ...f, currency: e.target.value }))
										}
										className="w-full min-tap rounded-xl border border-[var(--xp-bar-bg)] bg-[var(--bg-secondary)] px-4 py-3 font-display text-[var(--text-primary)]"
									>
										{CURRENCIES.map((c) => (
											<option key={c} value={c}>
												{c}
											</option>
										))}
									</select>
								</div>

								{/* Simplified mode */}
								<label className="flex items-center gap-3 min-tap">
									<input
										type="checkbox"
										checked={form.simplified}
										onChange={(e) =>
											setForm((f) => ({ ...f, simplified: e.target.checked }))
										}
										className="w-5 h-5 rounded"
									/>
									<span className="font-display text-sm text-[var(--text-primary)]">
										Simplified mode (fewer options)
									</span>
								</label>

								{/* Theme */}
								<div>
									<label className="block text-sm font-display font-bold text-[var(--text-primary)] mb-2">
										Theme
									</label>
									<div className="flex gap-2">
										{(["light", "dark", "system"] as const).map((opt) => (
											<button
												key={opt}
												type="button"
												onClick={() => handleThemeChange(opt)}
												className={`min-tap flex-1 py-3 rounded-xl font-display font-bold text-sm ${
													theme === opt
														? "bg-[var(--accent-purple)] text-white"
														: "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
												}`}
											>
												{opt === "system"
													? "System"
													: opt === "light"
														? "Light"
														: "Dark"}
											</button>
										))}
									</div>
								</div>

								{/* About */}
								<div className="pt-4 border-t border-[var(--xp-bar-bg)]">
									<h3 className="text-sm font-display font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
										About
									</h3>
									<p className="font-display text-sm text-[var(--text-primary)]">
										Budget Tracker
									</p>
									<p className="text-xs text-[var(--text-secondary)] font-display mt-1">
										ADHD-friendly. Minimal decisions, clear numbers.
									</p>
								</div>

								{error && (
									<p className="text-[var(--xp-bar-danger)] font-display text-sm">
										{error}
									</p>
								)}

								<button
									type="button"
									onClick={handleSave}
									disabled={saving}
									className="w-full min-tap rounded-xl bg-[var(--accent-green)] text-black font-display font-bold py-3 disabled:opacity-50"
								>
									{saving ? "Saving…" : "Save"}
								</button>
							</div>
						)}
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
