import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db, firebaseReady } from "../firebase";

export default function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseReady || !db) {
      setTransactions([]);
      setLoading(false);
      setError(
        "Firebase config is missing. Add your VITE_FIREBASE_* values to .env.local.",
      );
      return;
    }

    const transactionsRef = collection(db, "transactions");
    const transactionsQuery = query(transactionsRef);

    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        docs.sort((left, right) => {
          const leftDate = left.date ? new Date(left.date).getTime() : 0;
          const rightDate = right.date ? new Date(right.date).getTime() : 0;

          return rightDate - leftDate;
        });

        setTransactions(docs);
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        setTransactions([]);
        setLoading(false);
        setError(snapshotError.message || "Failed to load transactions.");
      },
    );

    return unsubscribe;
  }, []);

  return { transactions, loading, error };
}
