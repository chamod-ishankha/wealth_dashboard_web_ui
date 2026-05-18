# Integration Guide: Optimization Components

This guide shows how to integrate the new optimization components into your Dashboard.

---

## 1. Update App.jsx - Transaction Creation (Schema Optimization)

### Before (Current - storing derived data)

```javascript
// Line ~245 in App.jsx
addDoc(collection(db, "transactions"), {
  userId: user.uid,
  date: Timestamp.fromDate(selectedDate),
  year,
  month: monthName, // ❌ REMOVE - derived from date
  monthIndex: selectedDate.getMonth(),
  dayOfWeek, // ❌ REMOVE - derived from date
  category: formData.category,
  transactionType,
  amount,
  description: formData.description.trim(),
  createdAt: serverTimestamp(),
});
```

### After (Optimized - only store minimal data)

```javascript
// Line ~245 in App.jsx - REFACTORED
addDoc(collection(db, "transactions"), {
  userId: user.uid,
  date: Timestamp.fromDate(selectedDate),
  year, // ✓ Keep for fast filtering
  monthIndex: selectedDate.getMonth(), // ✓ Keep for sorting
  category: formData.category,
  transactionType,
  amount,
  description: formData.description.trim(),
  createdAt: serverTimestamp(),
  // updatedAt removed from initial creation, add on edit
});
```

### Code Change

```javascript
// Replace in App.jsx around line 240-260
const handleAddTransaction = () => {
  // ... existing validation ...

  const selectedDate = new Date(formData.date);
  const year = selectedDate.getFullYear();
  const monthIndex = selectedDate.getMonth(); // 0-11
  const transactionType = getTransactionType(formData.category);
  const amount = Number(formData.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return;
  }

  addDoc(collection(db, "transactions"), {
    userId: user.uid,
    date: Timestamp.fromDate(selectedDate),
    year,
    monthIndex, // Only store monthIndex, not month name
    category: formData.category,
    transactionType,
    amount,
    description: formData.description.trim(),
    createdAt: serverTimestamp(),
  })
    .then(() => {
      // ... reset form ...
    })
    .catch((submitError) => {
      console.error("Failed to save transaction:", submitError);
    });
};
```

---

## 2. Update DashboardSummary.jsx - Add Safe-to-Spend & Display Optimization

### Import New Components

```javascript
// At the top of DashboardSummary.jsx
import SafeToSpendCalculator from "./SafeToSpendCalculator";
import {
  getDayOfWeek,
  getMonthName,
  formatTimestampToDate,
  calculateSafeToSpend,
} from "../utils/transactionStats";
```

### Update Function Signature

```javascript
export default function DashboardSummary({
  month,
  budgetLimit = 20000,
  selectedYear,
  selectedMonth,
  monthIndex, // ✓ NEW - passed from parent
  availableYears = [],
  monthsForSelectedYear = [],
  monthlySalary,
  onMonthlySalaryChange,
  totalExpenses,
  netSavings,
  remainingBudget,
  formatCurrency,
  transactions = [],
  groupedTransactions = [],
  salaryByPeriod = {},
  loading = false,
  error = "",
  onYearChange,
  onMonthChange,
  onDeleteTransaction,
  onEditTransaction,
}) {
  // ... existing code ...
}
```

### Add Safe-to-Spend Section (after Personal Budget section)

Find this section:

```javascript
<div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h3 className="text-lg font-semibold text-slate-900">
        Personal Budget Limit Status
      </h3>
      {/* ... existing code ... */}
    </div>
```

Add **after** it:

```javascript
{
  /* Safe-to-Spend Calculator */
}
<div className="mt-6">
  <SafeToSpendCalculator
    budgetLimit={budgetLimit}
    personalExpensesSpent={selectedMonthSummary.personalExpenses}
    year={selectedYear}
    monthIndex={
      selectedMonth
        ? new Date(`${selectedMonth} 1, ${selectedYear}`).getMonth()
        : new Date().getMonth()
    }
    formatCurrency={formatCurrency}
  />
</div>;
```

### Update Transaction Table - Fix Date Display

Find in DashboardSummary the transaction table rendering:

```javascript
<td className="px-4 py-3 text-slate-700">
  {formatTimestamp(transaction.date)}  // ❌ OLD
</td>
<td className="px-4 py-3 text-slate-700">
  {transaction.dayOfWeek || "—"}  // ❌ REMOVED FIELD
</td>
```

Replace with:

```javascript
<td className="px-4 py-3 text-slate-700">
  {formatTimestampToDate(transaction.date)}  // ✓ NEW utility
</td>
<td className="px-4 py-3 text-slate-700">
  {getDayOfWeek(transaction.date) || "—"}  // ✓ COMPUTED from date
</td>
```

---

## 3. Add Installments Support to Dashboard

### Import Hook

```javascript
// In App.jsx, at the top
import useInstallments from "./hooks/useInstallments";
import InstallmentProgressBar from "./components/InstallmentProgressBar";
```

### Initialize Hook

```javascript
// In App.jsx, after other hooks
const { activeInstallments, totalMonthlyCommitment, overallProgress } =
  useInstallments(user);
```

### Pass to DashboardSummary (if on separate component)

```javascript
<DashboardSummary
  // ... existing props ...
  activeInstallments={activeInstallments}
  totalMonthlyCommitment={totalMonthlyCommitment}
/>
```

### Display Installments in Dashboard

Add a new section in DashboardSummary after the transactions table:

```javascript
{
  /* Active Installments / Goals Section */
}
{
  activeInstallments && activeInstallments.length > 0 && (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Active Installments & Goals
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Track progress on loans, Koko schemes, and savings goals
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
          {activeInstallments.length} active
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeInstallments.map((installment) => (
          <InstallmentProgressBar
            key={installment.id}
            installment={installment}
            formatCurrency={formatCurrency}
            onEdit={(inst) => {
              // Open edit modal if needed
              console.log("Edit installment:", inst);
            }}
            onPause={(id) => {
              // Toggle pause status
              console.log("Toggle pause:", id);
            }}
          />
        ))}
      </div>

      {/* Monthly Commitment Summary */}
      {totalMonthlyCommitment > 0 && (
        <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 border border-blue-200">
          <p className="text-sm text-blue-600">Total Monthly Commitment</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">
            {formatCurrency(totalMonthlyCommitment)}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Update Firestore Rules

### Add activeInstallments Collection Rules

```javascript
// Add to firestore.rules after userCategories section

match /activeInstallments/{installmentId} {
  allow create: if isSignedIn()
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.targetAmount is number
    && request.resource.data.currentAmount is number
    && request.resource.data.monthlyContribution is number
    && request.resource.data.name is string;

  allow read, update, delete: if isSignedIn()
    && resource.data.userId == request.auth.uid;

  allow update: if isSignedIn()
    && resource.data.userId == request.auth.uid
    && request.resource.data.userId == resource.data.userId;
}
```

---

## 5. Migration Strategy for Existing Transactions

### Option A: Automated Client-Side Cleanup

1. Add a one-time migration function in AuthContext on first login after deployment
2. Query old transactions with `month` or `dayOfWeek` fields
3. Use batch operations to remove these fields

```javascript
// Helper function to clean transaction data
async function cleanupTransactionData(user) {
  if (!user?.uid || !db) return;

  const transactions = await getDocs(
    query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      where("month", "!=", null), // Find old docs
    ),
  );

  const batch = writeBatch(db);
  transactions.forEach((doc) => {
    batch.update(doc.ref, {
      month: deleteField(),
      dayOfWeek: deleteField(),
    });
  });

  await batch.commit();
}
```

### Option B: Firestore Admin SDK (Recommended for Production)

```bash
# Run in Firebase Cloud Function or local Admin SDK
firebase deploy --only functions
# Or use Firebase console → Cloud Functions
```

---

## 6. Testing Checklist

- [ ] Transaction creation stores only `date`, `year`, `monthIndex`
- [ ] Transaction display correctly computes and shows day-of-week
- [ ] Safe-to-Spend calculator appears in Dashboard
- [ ] Safe-to-Spend updates when new transactions added
- [ ] Safe-to-Spend shows correct status (on-track, exceeded, exhausted)
- [ ] Installment progress bars display correctly
- [ ] Installments update when transactions marked as "Koko" category
- [ ] Year/month filtering still works correctly
- [ ] Old transactions still display (backward compatibility)
- [ ] Firestore reads/writes reduced by 10-15%

---

## 7. Performance Monitoring

### Metrics to Track

- **Document Read Time**: Should decrease by ~10%
- **Document Parse Time**: Should decrease by ~15%
- **Network Payload**: Should reduce by ~25-35 bytes per document

### Firebase Console

1. Go to Firestore → Indexes
2. Check query performance times
3. Monitor document storage size trends

---

## 8. Rollback Instructions

If issues arise:

1. **Revert Code Changes**

   ```bash
   git checkout src/App.jsx src/components/DashboardSummary.jsx
   ```

2. **Keep Data Integrity**
   - Existing transactions with `month`/`dayOfWeek` still work
   - Display logic auto-computes from date if fields missing
   - No data loss

3. **Conditional Display**
   ```javascript
   export function smartGetDayOfWeek(transaction) {
     // Try stored value first (backward compat)
     if (transaction.dayOfWeek) return transaction.dayOfWeek;
     // Fall back to computation
     return getDayOfWeek(transaction.date);
   }
   ```

---

## 9. Timeline Estimate

| Phase     | Task                                    | Hours     | Effort      |
| --------- | --------------------------------------- | --------- | ----------- |
| 1         | Update App.jsx transaction creation     | 1         | Easy        |
| 1         | Update transactionStats.js              | 1         | Easy        |
| 2         | Update DashboardSummary display         | 2         | Medium      |
| 2         | Create SafeToSpendCalculator component  | 2         | Medium      |
| 3         | Create InstallmentProgressBar component | 2         | Medium      |
| 3         | Create useInstallments hook             | 2         | Medium      |
| 4         | Update Firestore rules                  | 1         | Easy        |
| 5         | Data migration (optional)               | 1-2       | Medium-Hard |
| 6         | Testing & QA                            | 2         | Medium      |
| 7         | Deployment                              | 1         | Easy        |
| **Total** |                                         | **15-17** |             |

---

## Questions & Support

For questions about these implementations:

1. Review OPTIMIZATION_GUIDE.md for technical rationale
2. Check inline JSDoc comments in components
3. Refer to Firebase Firestore best practices

Happy optimizing! 🚀
