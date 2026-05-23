# Layout Architecture

## High-Level Layout

- Top-level shell in `src/App.jsx`.
- Main content in `src/components/DashboardSummary.jsx`.
- Responsive structure:
  - Mobile: stacked sections.
  - Desktop: 4-column grid (3/4 main content + 1/4 sidebar).

## Dashboard Sections

- Header: title and context label (`Month Year - N transactions`).
- Period selector: year and month filters.
- Metric cards: Monthly Income, Income Transactions, Expense Transactions, Transfer Transactions, Net Savings.
- Main content area:
  - Personal budget and fixed-expense cards.
  - Transactions list/table with pagination.
  - Historical monthly summary blocks.
- Sidebar:
  - Monthly income input.
  - Safe-to-spend widget.
  - Financial Goals carousel.

## Financial Goals Carousel

- Horizontal scroll container with snap behavior.
- Each goal card uses full-frame width inside the track.
- Mobile interaction:
  - swipe
  - snap to a single card
- Desktop interaction:
  - header previous/next controls
  - position indicator (`current/total`)

## Metric Calculation Notes

- Monthly Income = configured salary + income transactions.
- Expense Transactions = sum of expense-type transactions.
- Transfer Transactions = sum of transfer-type transactions.
- Net Savings = Monthly Income - (Expense Transactions + Transfer Transactions).
- Fixed Expenses = Expense Transactions - Personal Spent.

## Responsive Notes

- `sm` and above shows desktop-optimized controls.
- Mobile keeps touch-first behavior.
- Containers use `w-full` and overflow rules to avoid horizontal bleed.
