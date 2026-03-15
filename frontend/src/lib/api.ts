const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const DEV_USER_KEY = "budget_tracker_dev_user_id";

function getDevUserId(): string {
	if (typeof window === "undefined") return "";
	let id = localStorage.getItem(DEV_USER_KEY);
	if (!id) {
		id =
			"dev-" +
			Math.random().toString(36).slice(2) +
			"-" +
			Date.now().toString(36);
		localStorage.setItem(DEV_USER_KEY, id);
	}
	return id;
}

function headers(): HeadersInit {
	const userId = getDevUserId();
	return {
		"Content-Type": "application/json",
		"x-user-id": userId,
	};
}

export type SafeToSpendResult = {
	safeToSpendToday: number;
	xpPercent: number;
	remainingInPeriod: number;
	spentToday: number;
	monthlyBudget: number | null;
	spentThisMonth: number;
	currency: string;
};

export async function fetchSafeToSpend(
	date?: string,
): Promise<SafeToSpendResult> {
	const url = date
		? `${API_BASE}/api/summary/safe-to-spend?date=${encodeURIComponent(date)}`
		: `${API_BASE}/api/summary/safe-to-spend`;
	const res = await fetch(url, { headers: headers() });
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
	return res.json();
}

export type UserSettings = {
	currency: string;
	simplified: boolean;
	monthlyBudgetAmount: number | null;
};

export async function fetchSettings(): Promise<UserSettings> {
	const res = await fetch(`${API_BASE}/api/user/settings`, {
		headers: headers(),
	});
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
	return res.json();
}

export async function updateSettings(
	data: Partial<UserSettings>,
): Promise<UserSettings> {
	const res = await fetch(`${API_BASE}/api/user/settings`, {
		method: "PATCH",
		headers: headers(),
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
	return res.json();
}

export async function postQuickExpense(body: {
	amount: number;
	spendType: "PLANNED" | "IMPULSIVE";
	accountId?: string;
	categoryId?: string;
	note?: string;
}): Promise<unknown> {
	const res = await fetch(`${API_BASE}/api/quick/expense`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
	return res.json();
}

export type Category = {
	id: string;
	name: string;
	type: string;
	color: string;
	sortOrder: number;
};

export async function fetchCategories(): Promise<Category[]> {
	const res = await fetch(`${API_BASE}/api/categories`, { headers: headers() });
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
	return res.json();
}

export type Transaction = {
	id: string;
	amount: number | string;
	date: string;
	note: string | null;
	spendType: string;
	category: { id: string; name: string; color: string } | null;
};

export async function fetchTransactions(params?: {
	from?: string;
	to?: string;
	limit?: number;
}): Promise<Transaction[]> {
	const sp = new URLSearchParams();
	if (params?.from) sp.set("from", params.from);
	if (params?.to) sp.set("to", params.to);
	if (params?.limit) sp.set("limit", String(params.limit));
	const q = sp.toString();
	const url = q
		? `${API_BASE}/api/transactions?${q}`
		: `${API_BASE}/api/transactions`;
	const res = await fetch(url, { headers: headers() });
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
	return res.json();
}

export async function deleteTransaction(id: string): Promise<void> {
	const res = await fetch(`${API_BASE}/api/transactions/${id}`, {
		method: "DELETE",
		headers: headers(),
	});
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
}

export type CoachReflectionResponse = {
	prompt: string | null;
	requestFeelingLog?: boolean;
	trigger?: string;
	categoryId?: string;
	categoryName?: string;
};

export async function fetchCoachReflection(): Promise<CoachReflectionResponse> {
	const res = await fetch(`${API_BASE}/api/coach/reflection`, {
		headers: headers(),
	});
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
	return res.json();
}

export async function postReflection(body: {
	feelingKey: string;
	reasonKey: string;
	categoryId?: string | null;
}): Promise<{ ok: boolean }> {
	const res = await fetch(`${API_BASE}/api/coach/reflection`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
	return res.json();
}

export async function fetchCoachReminder(
	categoryId?: string | null,
): Promise<{ reminder: string | null }> {
	const sp = new URLSearchParams();
	if (categoryId) sp.set("categoryId", categoryId);
	const q = sp.toString();
	const url = q
		? `${API_BASE}/api/coach/reminder?${q}`
		: `${API_BASE}/api/coach/reminder`;
	const res = await fetch(url, { headers: headers() });
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
	return res.json();
}

export type BudgetLine = {
	id: string;
	name: string;
	amount: number | string;
	periodStart: string;
	periodEnd: string;
};

export type BudgetsResponse = {
	budgets: BudgetLine[];
	total: number;
};

export async function fetchBudgets(
	year?: number,
	month?: number,
): Promise<BudgetsResponse> {
	const sp = new URLSearchParams();
	if (year != null) sp.set("year", String(year));
	if (month != null) sp.set("month", String(month));
	const q = sp.toString();
	const url = q ? `${API_BASE}/api/budgets?${q}` : `${API_BASE}/api/budgets`;
	const res = await fetch(url, { headers: headers() });
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
	return res.json();
}

export async function createBudgetLine(
	name: string,
	amount: number,
): Promise<BudgetLine> {
	const res = await fetch(`${API_BASE}/api/budgets`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify({ name, amount }),
	});
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
	return res.json();
}

export async function deleteBudgetLine(id: string): Promise<void> {
	const res = await fetch(`${API_BASE}/api/budgets/${id}`, {
		method: "DELETE",
		headers: headers(),
	});
	if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
}
