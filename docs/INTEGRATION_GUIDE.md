# Integration Guide

## Prerequisites
- Firebase project configured.
- Firestore + Auth enabled.
- Environment variables for Firebase app config.

## Data Collections
- `transactions`
  - Core financial entries with `transactionType`, `year`, `monthIndex`.
- `userCategories`
  - User-specific category list with typed entries `{ name, type }`.
- `monthlyBudgets`
  - Per-period salary/base income settings.
- `activeInstallments`
  - Financial goals/installments records.

## Important Runtime Behavior
- Dashboard period filters all metrics and table content.
- Monthly income metric includes:
  - configured monthly salary for the period, plus
  - selected-period income transactions.
- Net savings and budget widgets are derived from selected period summary.

## Firestore Indexes
- Keep `firestore.indexes.json` in sync with query patterns.
- Deploy indexes when query fields/order are changed.

## Validation Checklist
- Add/edit/delete transaction updates table and metrics.
- Income transaction updates Monthly Income and Net Savings.
- Period change updates cards, table, and historical values.
- Financial goals swipe and desktop controls snap to full card.
- Category type changes reflect in forms and badges.
