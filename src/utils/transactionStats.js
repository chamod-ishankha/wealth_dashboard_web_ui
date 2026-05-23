const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const EXPENSE_CATEGORIES = new Set([
  "Fuel",
  "Bills",
  "Loan",
  "Koko",
  "Personal",
  "Reload",
]);
export const INCOME_CATEGORIES = new Set([]);

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
      transaction.year ??
        (transaction.date ? new Date(transaction.date).getFullYear() : NaN),
    );

    const transactionMonth = getTransactionMonth(transaction);

    return (
      String(transactionYear) === String(year) && transactionMonth === month
    );
  });

  // Sort transactions: primary by date (latest first), secondary by category (ascending)
  monthlyTransactions.sort((a, b) => {
    // Resolve date to JS Date
    function toTime(tx) {
      try {
        if (!tx) return 0;
        if (tx.date && tx.date.toDate) return tx.date.toDate().getTime();
        if (tx.date) return new Date(tx.date).getTime();
        // Fallback to year/monthIndex/day if available
        if (tx.year !== undefined && tx.monthIndex !== undefined) {
          return new Date(
            Number(tx.year),
            Number(tx.monthIndex),
            tx.day || 1,
          ).getTime();
        }
        return 0;
      } catch (err) {
        return 0;
      }
    }

    const ta = toTime(a);
    const tb = toTime(b);

    if (ta !== tb) return tb - ta; // latest first

    const ca = (a.category || "").toString();
    const cb = (b.category || "").toString();
    return ca.localeCompare(cb);
  });

  const totalIncome = sumTransactions(monthlyTransactions, (transaction) => {
    const transactionType = String(
      transaction.transactionType || getTransactionType(transaction.category),
    ).toLowerCase();

    return transactionType === "income";
  });

  // Separate Personal expenses from Fixed expenses
  const personalExpenses = sumTransactions(
    monthlyTransactions,
    (transaction) => {
      const transactionType = String(
        transaction.transactionType || getTransactionType(transaction.category),
      ).toLowerCase();

      return (
        transactionType === "expense" && transaction.category === "Personal"
      );
    },
  );

  const fixedExpenses = sumTransactions(monthlyTransactions, (transaction) => {
    const transactionType = String(
      transaction.transactionType || getTransactionType(transaction.category),
    ).toLowerCase();

    return transactionType === "expense" && transaction.category !== "Personal";
  });

  const totalExpenses = personalExpenses + fixedExpenses;

  const configuredSalary =
    Number.isFinite(Number(salaryOverride)) && Number(salaryOverride) > 0
      ? Number(salaryOverride)
      : 0;

  // Monthly income = configured base salary + income transactions for the period.
  const monthlySalary = configuredSalary + totalIncome;

  const netSavings = monthlySalary - totalExpenses;

  // Budget limit applies only to Personal expenses
  const remainingBudget = budgetLimit - personalExpenses;

  return {
    monthlyTransactions,
    totalIncome,
    totalExpenses,
    personalExpenses,
    fixedExpenses,
    monthlySalary,
    netSavings,
    remainingBudget,
  };
}

export function groupTransactionsByYearMonth(transactions = []) {
  const groups = new Map();

  for (const transaction of transactions) {
    const year = Number(
      transaction.year ??
        (transaction.date ? new Date(transaction.date).getFullYear() : NaN),
    );

    const month = getTransactionMonth(transaction);
    const monthIndex = Number(getTransactionMonthIndex(transaction) ?? 0);
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

/**
 * SCHEMA OPTIMIZATION FUNCTIONS
 * Compute derived values from minimal stored data
 */

/**
 * Get day of week name from Firestore Timestamp or Date
 * @param {Timestamp|Date|number} dateInput - Firestore Timestamp or JS Date
 * @returns {string} - Day name: "Monday", "Tuesday", etc.
 */
export function getDayOfWeek(dateInput) {
  if (!dateInput) return "—";

  let jsDate;
  if (dateInput.toDate) {
    jsDate = dateInput.toDate(); // Firestore Timestamp
  } else if (dateInput instanceof Date) {
    jsDate = dateInput;
  } else if (typeof dateInput === "number") {
    jsDate = new Date(dateInput);
  } else {
    return "—";
  }

  const dayIndex = jsDate.getDay(); // 0-6, Sunday-Saturday
  return DAY_NAMES[dayIndex] || "—";
}

/**
 * Get full month name from monthIndex (0-11)
 * @param {number} monthIndex - 0=January, 11=December
 * @returns {string} - Month name: "January", "February", etc.
 */
export function getMonthName(monthIndex) {
  const index = Number(monthIndex);
  if (!Number.isFinite(index) || index < 0 || index > 11) {
    return "—";
  }
  return MONTH_NAMES[index];
}

/**
 * Backward-compatible helpers for transaction display
 */
export function getTransactionMonth(transaction) {
  // Prefer explicit stored month (backwards compat)
  if (!transaction) return "—";
  if (transaction.month && typeof transaction.month === "string") {
    return transaction.month;
  }

  // If monthIndex stored, use it
  if (
    transaction.monthIndex !== undefined &&
    transaction.monthIndex !== null &&
    Number.isFinite(Number(transaction.monthIndex))
  ) {
    return getMonthName(Number(transaction.monthIndex));
  }

  // Fallback to date
  if (transaction.date) {
    try {
      const d = transaction.date.toDate
        ? transaction.date.toDate()
        : new Date(transaction.date);
      return MONTH_NAMES[d.getMonth()];
    } catch (err) {
      return "—";
    }
  }

  return "—";
}

export function getTransactionMonthIndex(transaction) {
  if (!transaction) return 0;
  if (transaction.monthIndex !== undefined && transaction.monthIndex !== null) {
    const idx = Number(transaction.monthIndex);
    if (Number.isFinite(idx)) return idx;
  }

  if (transaction.month && typeof transaction.month === "string") {
    const m = MONTH_ORDER[transaction.month] ?? null;
    if (m) return m - 1; // MONTH_ORDER uses 1-based
  }

  if (transaction.date) {
    try {
      const d = transaction.date.toDate
        ? transaction.date.toDate()
        : new Date(transaction.date);
      return d.getMonth();
    } catch (err) {
      return 0;
    }
  }

  return 0;
}

export function getTransactionDay(transaction) {
  if (!transaction) return "—";
  if (transaction.dayOfWeek && typeof transaction.dayOfWeek === "string") {
    return transaction.dayOfWeek;
  }

  return getDayOfWeek(transaction.date);
}

/**
 * Get number of days in a month
 * @param {number} year - e.g., 2026
 * @param {number} monthIndex - 0-11
 * @returns {number} - Days in month (28-31)
 */
export function getMonthDaysCount(year, monthIndex) {
  const nextMonth = new Date(year, Number(monthIndex) + 1, 0);
  return nextMonth.getDate();
}

/**
 * Calculate remaining days until the next salary payout date.
 * If the configured payout day is greater than the days in the month,
 * it is clamped to the last day of that month.
 *
 * @param {number} salaryDate - Day of month salary is paid (1-31)
 * @param {Date} referenceDate - Date to calculate from
 * @returns {number} Days remaining including today
 */
export function getRemainingDaysUntilSalaryDate(
  salaryDate,
  referenceDate = new Date(),
) {
  const payoutDay = Math.min(Math.max(1, Number(salaryDate || 30)), 31);

  const today = new Date(referenceDate);
  const year = today.getFullYear();
  const month = today.getMonth();
  const currentMonthDays = getMonthDaysCount(year, month);
  const currentMonthPayoutDay = Math.min(payoutDay, currentMonthDays);

  const startOfToday = new Date(year, month, today.getDate());
  const targetThisMonth = new Date(year, month, currentMonthPayoutDay);

  let targetDate = targetThisMonth;
  if (today.getDate() > currentMonthPayoutDay) {
    const nextMonth = month + 1;
    const nextMonthDays = getMonthDaysCount(
      year + Math.floor(nextMonth / 12),
      nextMonth % 12,
    );
    const nextMonthPayoutDay = Math.min(payoutDay, nextMonthDays);
    targetDate = new Date(year, month + 1, nextMonthPayoutDay);
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.ceil(
    (new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
    ) -
      startOfToday) /
      msPerDay,
  );

  return Math.max(1, diff + 1);
}

/**
 * Calculate remaining days in month from a given date
 * @param {number} year - e.g., 2026
 * @param {number} monthIndex - 0-11
 * @param {number} dayOfMonth - 1-31, defaults to today
 * @returns {number} - Days remaining (including current day)
 */
export function getRemainingDaysInMonth(year, monthIndex, dayOfMonth = null) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // If checking current month, use today's date
  if (year === currentYear && monthIndex === currentMonth) {
    const daysInMonth = getMonthDaysCount(year, monthIndex);
    const todayDay = today.getDate();
    return daysInMonth - todayDay + 1; // +1 to include today
  }

  // For past/future months, use provided day or first day
  const day = dayOfMonth || 1;
  const daysInMonth = getMonthDaysCount(year, monthIndex);
  return daysInMonth - day + 1;
}

/**
 * Calculate "Safe-to-Spend" daily amount
 * Formula: (Remaining Budget) / (Remaining Days in Month)
 * @param {number} budgetLimit - Total personal budget for month
 * @param {number} personalExpensesSpent - Amount already spent
 * @param {number} year - Current year
 * @param {number} monthIndex - Current month (0-11)
 * @returns {object} - { dailySafeSpend, remainingBudget, remainingDays, status }
 */
export function calculateSafeToSpend(
  budgetLimit,
  personalExpensesSpent,
  year,
  monthIndex,
  salaryDate = null,
) {
  const remainingBudget = budgetLimit - personalExpensesSpent;
  const remainingDays = Number.isFinite(Number(salaryDate))
    ? getRemainingDaysUntilSalaryDate(Number(salaryDate))
    : getRemainingDaysInMonth(year, monthIndex);

  if (remainingDays <= 0) {
    return {
      dailySafeSpend: 0,
      remainingBudget,
      remainingDays: 0,
      status: "month-ended",
    };
  }

  const dailySafeSpend =
    remainingBudget > 0 ? Math.floor(remainingBudget / remainingDays) : 0;

  let status = "on-track";
  if (remainingBudget < 0) {
    status = "budget-exceeded";
  } else if (remainingBudget === 0) {
    status = "budget-exhausted";
  } else if (dailySafeSpend === 0 && remainingBudget > 0) {
    status = "minimal-remaining";
  }

  return {
    dailySafeSpend,
    remainingBudget,
    remainingDays,
    status,
  };
}

/**
 * Format transaction timestamp for display
 * Handles Firestore Timestamp, JS Date, or string
 * @param {Timestamp|Date|string} timestamp - Date to format
 * @returns {string} - Formatted date: "May 17, 2026"
 */
export function formatTimestampToDate(timestamp) {
  if (!timestamp) return "—";

  let jsDate;
  if (timestamp.toDate) {
    jsDate = timestamp.toDate(); // Firestore Timestamp
  } else if (timestamp instanceof Date) {
    jsDate = timestamp;
  } else if (typeof timestamp === "string") {
    jsDate = new Date(timestamp);
  } else if (typeof timestamp === "number") {
    jsDate = new Date(timestamp);
  } else {
    return "—";
  }

  if (!(jsDate instanceof Date) || Number.isNaN(jsDate.getTime())) {
    return "—";
  }

  return jsDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
