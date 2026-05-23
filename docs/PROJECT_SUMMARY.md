# Wealth Dashboard - Project Summary

## Overview

Wealth Dashboard is a React and Firebase personal finance web app with a responsive UI for mobile and desktop. It supports transaction tracking, typed categories, monthly budgeting, and financial goal tracking.

## Current Features

- Transaction create, edit, and delete.
- Typed categories: income, expense, transfer.
- Period filtering by year and month.
- Server-side paginated transaction list.
- Dashboard metrics for income, expenses, and net savings.
- Personal budget status based on Personal expenses.
- Financial Goals carousel:
  - swipe on mobile
  - header controls on desktop
  - snap-aligned full-card navigation

## Metric Rules

- Monthly Income = configured monthly salary for selected period + selected-period income transactions.
- Total Expenses = selected-period expense transactions.
- Net Savings = Monthly Income - Total Expenses.
- Remaining Personal Budget = personal budget limit - Personal category expenses.

## Main Modules

- `src/App.jsx`: top-level app flow, transaction modal flows, CRUD handlers.
- `src/components/DashboardSummary.jsx`: dashboard layout, metrics, lists, goal carousel.
- `src/components/CategoryManager.jsx`: category management UI.
- `src/components/CategoryTypeSelect.jsx`: typed category picker.
- `src/components/InstallmentProgressBar.jsx`: goal card UI.
- `src/hooks/usePaginatedTransactions.js`: server-side pagination hook.
- `src/hooks/useCategories.js`: typed category data hook.
- `src/hooks/useInstallments.js`: goals/installments hook.
- `src/utils/transactionStats.js`: summary and grouping utilities.

## Firestore Collections

- `transactions`
- `monthlyBudgets`
- `userCategories`
- `activeInstallments`

## Current State

This summary reflects the latest implementation including typed categories, transaction pagination, goals carousel improvements, and income metric fixes.
