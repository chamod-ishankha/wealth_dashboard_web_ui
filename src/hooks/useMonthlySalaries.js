import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db, firebaseReady } from "../firebase";
import { getPeriodKey } from "../utils/transactionStats";

export default function useMonthlySalaries(user, periodKey = "") {
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

    if (!user?.uid) {
      setSalaryByPeriod({});
      setLoading(false);
      setError("");
      return;
    }

    const budgetsRef = collection(db, "monthlyBudgets");
    const queryParts = [where("userId", "==", user.uid)];

    if (periodKey) {
      queryParts.push(where("periodKey", "==", periodKey));
    }

    const budgetsQuery = query(budgetsRef, ...queryParts);

    const unsubscribe = onSnapshot(
      budgetsQuery,
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
  }, [user?.uid, periodKey]);

  return { salaryByPeriod, loading, error };
}
