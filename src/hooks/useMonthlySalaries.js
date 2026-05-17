import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, firebaseReady } from "../firebase";
import { getPeriodKey } from "../utils/transactionStats";

export default function useMonthlySalaries() {
  const [salaryByPeriod, setSalaryByPeriod] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseReady || !db) {
      setSalaryByPeriod({});
      setLoading(false);
      setError(
        "Firebase config is missing. Add your VITE_FIREBASE_* values to .env.local.",
      );
      return;
    }

    const budgetsRef = collection(db, "monthlyBudgets");

    const unsubscribe = onSnapshot(
      budgetsRef,
      (snapshot) => {
        const nextSalaryByPeriod = {};

        snapshot.docs.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          const periodKey =
            data.periodKey || getPeriodKey(data.year, data.month);
          const salary = Number(data.monthlySalary || 0);

          if (periodKey) {
            nextSalaryByPeriod[periodKey] = Number.isFinite(salary)
              ? salary
              : 0;
          }
        });

        setSalaryByPeriod(nextSalaryByPeriod);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        setSalaryByPeriod({});
        setLoading(false);
        setError(snapshotError.message || "Failed to load monthly budgets.");
      },
    );

    return unsubscribe;
  }, []);

  return { salaryByPeriod, loading, error };
}
