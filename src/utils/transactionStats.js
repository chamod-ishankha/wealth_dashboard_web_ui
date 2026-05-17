const MONTH_ORDER = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

export const EXPENSE_CATEGORIES = new Set([
  "Fuel",
  "Bills",
  "Loan",
  "Koko",
  "Personal",
]);
export const INCOME_CATEGORIES = new Set(["Reload"]);

export function getTransactionType(category = "") {
  if (INCOME_CATEGORIES.has(category)) {
    return "income";
  }

  if (EXPENSE_CATEGORIES.has(category)) {
    return "expense";
  }

  return "transfer";
}

export function formatCurrentMonthLabel(date = new Date()) {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export function sumTransactions(transactions = [], predicate = () => true) {
  return transactions.reduce((total, transaction) => {
    if (!predicate(transaction)) {
      return total;
    }

    const amount = Number(transaction.amount || 0);
    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);
}

export function calculateMonthlySummary(
  transactions = [],
  year,
  month,
  budgetLimit = 0,
  salaryOverride = 0,
) {
  const monthlyTransactions = transactions.filter((transaction) => {
    const transactionYear = Number(
      transaction.year ?? new Date(transaction.date).getFullYear(),
    );
    const transactionMonth =
      transaction.month ??
      new Date(transaction.date).toLocaleString("en-US", { month: "long" });

    return (
      String(transactionYear) === String(year) && transactionMonth === month
    );
  });

  const totalIncome = sumTransactions(
    monthlyTransactions,
    (transaction) => transaction.transactionType === "income",
  );
  const totalExpenses = sumTransactions(
    monthlyTransactions,
    (transaction) => transaction.transactionType === "expense",
  );
  const monthlySalary =
    Number.isFinite(Number(salaryOverride)) && Number(salaryOverride) > 0
      ? Number(salaryOverride)
      : totalIncome;
  const netSavings = monthlySalary - totalExpenses;
  const remainingBudget = budgetLimit - totalExpenses;

  return {
    monthlyTransactions,
    totalIncome,
    totalExpenses,
    monthlySalary,
    netSavings,
    remainingBudget,
  };
}

export function groupTransactionsByYearMonth(transactions = []) {
  const groups = new Map();

  for (const transaction of transactions) {
    const year = Number(
      transaction.year ?? new Date(transaction.date).getFullYear(),
    );
    const month =
      transaction.month ??
      new Date(transaction.date).toLocaleString("en-US", { month: "long" });
    const monthIndex = Number(
      transaction.monthIndex ?? MONTH_ORDER[month] ?? 0,
    );
    const key = `${year}-${String(monthIndex).padStart(2, "0")}`;

    if (!groups.has(key)) {
      groups.set(key, {
        year,
        month,
        monthIndex,
        transactions: [],
      });
    }

    groups.get(key).transactions.push(transaction);
  }

  return Array.from(groups.values()).sort((left, right) => {
    if (left.year !== right.year) {
      return right.year - left.year;
    }

    return right.monthIndex - left.monthIndex;
  });
}

export function getAvailableYears(transactions = []) {
  const years = new Set();

  for (const transaction of transactions) {
    const year = Number(
      transaction.year ?? new Date(transaction.date).getFullYear(),
    );

    if (Number.isFinite(year)) {
      years.add(year);
    }
  }

  return Array.from(years).sort((left, right) => right - left);
}

export function getAvailableMonthsForYear(
  groupedTransactions = [],
  selectedYear,
) {
  return groupedTransactions
    .filter((group) => String(group.year) === String(selectedYear))
    .map((group) => group.month);
}

export function getPeriodKey(year, month) {
  return `${year}-${month}`;
}
