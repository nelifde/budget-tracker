---
name: My budget rename and new Settings menu
overview: Rename "Add budget" to "My budget" and keep all budget content in that sheet; move app preferences out and create a new Settings menu from scratch with suggested options (currency, simplified, theme, notifications, etc.).
todos: []
isProject: false
---

# My budget rename + new Settings menu from scratch

## Part 1: "My budget" (rename + keep all budget content)

- **Rename** the existing budget sheet and its entry point from "Add budget" to **"My budget"**.
- **Keep in "My budget" only budget-related content:**
  - Budget overview (this month total)
  - Added budgets list (swipe to remove)
  - Add budget (name + amount, Add button)
  - "Or set one total" fallback input (with save/update so `monthlyBudgetAmount` persists)
- **Remove from this sheet:** Currency and Simplified mode (they move to the new Settings).
- **Implementation:** Rename the component to `BudgetSheet` (or keep `SettingsSheet` name but use it only for budget and add a new component for Settings — clearer to have `BudgetSheet` + `SettingsSheet`). In [HomeScreen](frontend/src/components/HomeScreen.tsx) change the first button label to "My budget" and wire it to open the budget sheet. Currency for formatting in My budget can be read from `fetchSettings()` when the sheet opens (display only).

**Files to touch:** Extract budget-only UI into a dedicated sheet (e.g. `BudgetSheet.tsx` from current [SettingsSheet](frontend/src/components/SettingsSheet.tsx) by copying and then removing currency/simplified/Save for settings; or rename and split in place). Update [page.tsx](frontend/src/app/page.tsx) and HomeScreen so "My budget" opens the budget sheet.

---

## Part 2: New Settings menu (from scratch)

Create a **new** Settings screen that is only app/preference options. Suggested options you can include:


| Option                | Description                                       | Backend / notes                                                                                    |
| --------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Currency**          | Display currency (USD, EUR, GBP, TRY, JPY).       | Already in `User`; use existing PATCH settings.                                                    |
| **Simplified mode**   | Fewer options in the app (stored flag).           | Already in `User`; use existing PATCH settings.                                                    |
| **Theme**             | Light / Dark / System.                            | Frontend-only (e.g. class on `html` + localStorage); optional backend later.                       |
| **Notifications**     | Daily or weekly reminder to log spendings.        | New: store preference (e.g. `User.notifyLogReminder`); actual push/reminders need a separate step. |
| **Default account**   | Pre-select this account when logging (quick-add). | New: e.g. `User.defaultAccountId`; dropdown of user's accounts in Settings.                        |
| **Haptic / feedback** | Vibration or sound on log.                        | Frontend-only (e.g. `navigator.vibrate`, sound); store on/off in localStorage or user prefs.       |
| **Reduced motion**    | Less animation.                                   | Frontend-only; respect `prefers-reduced-motion` or a toggle.                                       |
| **Data export**       | Export transactions (CSV/JSON).                   | New endpoint GET export or generate client-side from transactions.                                 |
| **About**             | App version, links, privacy.                      | Static content; no backend.                                                                        |


**Suggested first version of the new Settings menu**

- **Currency** (dropdown)
- **Simplified mode** (toggle)
- **Theme** (Light / Dark / System) — improves your existing light/dark support
- **About** (section with app name, version, maybe link to reflections mockup or support)

Then you can add later: Notifications, Default account, Haptic, Reduced motion, Data export.

**Implementation**

- **New component** `SettingsSheet.tsx` (or replace current one): only these options, same bottom-sheet style. One "Save" that calls `updateSettings({ currency, simplified })` and, for theme, writes to localStorage and applies class.
- **Backend:** No change for currency/simplified. Theme/notifications/default account need new fields only when you add those options.

---

## Part 3: Home and routing

- **HomeScreen:** Two buttons: **"My budget"** (opens budget sheet), **"Settings"** (opens new Settings sheet). Remove the duplicate "Settings" that currently opens the same sheet as Add budget.
- **page.tsx:** Two pieces of state, e.g. `budgetSheetOpen` and `settingsOpen`. Render `BudgetSheet` when budget is open; render the new `SettingsSheet` when settings is open.

---

## Summary

1. **My budget** = one sheet with everything budget (overview, list, add form, single total). Rename from "Add budget"; drop currency/simplified from this sheet.
2. **Settings** = new menu from scratch: Currency, Simplified mode, Theme, About (and optional items above for later).
3. Home: "My budget" and "Settings" open different sheets.

