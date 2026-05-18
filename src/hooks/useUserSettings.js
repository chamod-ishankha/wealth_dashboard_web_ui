import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, firebaseReady } from "../firebase";

const DEFAULT_SALARY_DATE = 30;

function normalizeSalaryDate(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return DEFAULT_SALARY_DATE;
  }

  return Math.min(31, Math.max(1, Math.trunc(numericValue)));
}

export default function useUserSettings(user) {
  const [salaryDate, setSalaryDate] = useState(DEFAULT_SALARY_DATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseReady || !db) {
      setSalaryDate(DEFAULT_SALARY_DATE);
      setLoading(false);
      setError(
        "Firebase config is missing. Add your VITE_FIREBASE_* values to .env.local.",
      );
      return undefined;
    }

    if (!user?.uid) {
      setSalaryDate(DEFAULT_SALARY_DATE);
      setLoading(false);
      setError("");
      return undefined;
    }

    setLoading(true);

    const settingsRef = doc(db, "userSettings", user.uid);

    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() || {};
          setSalaryDate(normalizeSalaryDate(data.salaryDate));
        } else {
          setSalaryDate(DEFAULT_SALARY_DATE);
        }

        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        setSalaryDate(DEFAULT_SALARY_DATE);
        setLoading(false);
        setError(snapshotError.message || "Failed to load user settings.");
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  async function saveUserSettings(nextSalaryDate) {
    if (!user?.uid || !db) return false;

    const normalizedSalaryDate = normalizeSalaryDate(nextSalaryDate);

    try {
      await setDoc(doc(db, "userSettings", user.uid), {
        userId: user.uid,
        salaryDate: normalizedSalaryDate,
      });

      return true;
    } catch (saveError) {
      console.error("Failed to save user settings:", saveError);
      setError(saveError.message || "Failed to save user settings.");
      return false;
    }
  }

  return {
    salaryDate,
    loading,
    error,
    saveUserSettings,
  };
}
