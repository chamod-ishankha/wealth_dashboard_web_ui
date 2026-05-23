# Code Reference

## Components
- `src/components/DashboardSummary.jsx`
  - Renders dashboard metrics, period selector, transaction list, historical summary, and financial goals section.
  - Financial goals carousel uses snap-based horizontal scrolling with desktop header controls.
- `src/components/TransactionsEntryForm.jsx`
  - Transaction creation form.
  - Uses typed category selection.
- `src/components/CategoryManager.jsx`
  - Create/edit/delete categories with explicit type (`income`, `expense`, `transfer`).
- `src/components/CategoryTypeSelect.jsx`
  - Reusable typed category picker used in create/edit flows.
- `src/components/InstallmentProgressBar.jsx`
  - Goal/installment card UI with progress, stats, and payment actions.

## Hooks
- `src/hooks/useTransactions.js`
  - Loads full transaction stream for selected user.
- `src/hooks/usePaginatedTransactions.js`
  - Cursor-based server-side pagination for table rendering.
- `src/hooks/useCategories.js`
  - Reads and updates typed categories in Firestore.
- `src/hooks/useInstallments.js`
  - CRUD/toggle/pay operations for active installments.
- `src/hooks/useMonthlySalaries.js`
  - Retrieves monthly salary records.
- `src/hooks/useUserSettings.js`
  - Retrieves user settings (for example salary date).

## Utility Layer
- `src/utils/transactionStats.js`
  - `calculateMonthlySummary(...)`: selected-period aggregation used by dashboard cards.
  - `groupTransactionsByYearMonth(...)`: historical grouping.
  - `getAvailableYears(...)`, `getAvailableMonthsForYear(...)`: period selector data.
  - `getTransactionType(...)`: fallback type inference by category.

## App Composition
- `src/App.jsx`
  - Owns global screen state (period selection, add/edit modals).
  - Creates/updates/deletes transactions.
  - Passes data + handlers to `DashboardSummary`.

## Firestore Metadata
- `firestore.indexes.json`
  - Composite index definitions required for paginated and filtered queries.
