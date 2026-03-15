"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BudgetSheet } from "@/components/BudgetSheet";
import { HomeScreen } from "@/components/HomeScreen";
import { QuickAddSheet } from "@/components/QuickAddSheet";
import { ReflectionsMockupSheet } from "@/components/ReflectionsMockupSheet";
import { SettingsSheet } from "@/components/SettingsSheet";
import { SpendingsScreen } from "@/components/SpendingsScreen";
import { ThemeScript } from "@/components/ThemeScript";
import { fetchSafeToSpend } from "@/lib/api";

export default function Home() {
	const [sheetOpen, setSheetOpen] = useState(false);
	const [budgetSheetOpen, setBudgetSheetOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [spendingsOpen, setSpendingsOpen] = useState(false);
	const [reflectionsMockupOpen, setReflectionsMockupOpen] = useState(false);
	const queryClient = useQueryClient();
	const { data: summary } = useQuery({
		queryKey: ["safe-to-spend"],
		queryFn: () => fetchSafeToSpend(),
	});

	return (
		<main className="min-h-screen bg-[var(--bg-primary)]">
			<ThemeScript />
			{spendingsOpen ? (
				<SpendingsScreen
					currency={summary?.currency}
					onClose={() => setSpendingsOpen(false)}
				/>
			) : (
				<>
					<HomeScreen
						onPullToAdd={() => setSheetOpen(true)}
						onOpenBudget={() => setBudgetSheetOpen(true)}
						onOpenSettings={() => setSettingsOpen(true)}
						onOpenSpendings={() => setSpendingsOpen(true)}
						onOpenReflectionsMockup={() => setReflectionsMockupOpen(true)}
					/>
					<BudgetSheet
						open={budgetSheetOpen}
						onClose={() => setBudgetSheetOpen(false)}
						onSaved={() =>
							queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] })
						}
					/>
					<ReflectionsMockupSheet
						open={reflectionsMockupOpen}
						onClose={() => setReflectionsMockupOpen(false)}
					/>
					<QuickAddSheet
						open={sheetOpen}
						onClose={() => setSheetOpen(false)}
						onLogged={() => {
							queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
							queryClient.invalidateQueries({ queryKey: ["transactions"] });
						}}
					/>
					<SettingsSheet
						open={settingsOpen}
						onClose={() => setSettingsOpen(false)}
						onSaved={() => {
							queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
							queryClient.invalidateQueries({ queryKey: ["settings"] });
						}}
					/>
				</>
			)}
		</main>
	);
}
