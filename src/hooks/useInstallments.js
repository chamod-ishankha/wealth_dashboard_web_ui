import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { writeBatch, increment } from "firebase/firestore";
import { db } from "../firebase";

/**
 * useInstallments
 * Real-time listener for active financial goals and installments
 * Supports: Loans, Koko schemes, Savings goals
 */
export default function useInstallments(user) {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Real-time listener setup
  useEffect(() => {
    if (!user?.uid || !db) {
      setInstallments([]);
      setLoading(false);
      return undefined;
    }

    try {
      const unsubscribe = onSnapshot(
        query(
          collection(db, "activeInstallments"),
          where("userId", "==", user.uid),
        ),
        (snapshot) => {
          const data = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            // Avoid composite index requirement by filtering deleted docs client-side.
            .filter((item) => item.status !== "deleted");

          // Sort by createdAt descending
          data.sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
          });

          setInstallments(data);
          setError("");
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching installments:", err);
          setError(err.message);
          setLoading(false);
        },
      );

      return unsubscribe;
    } catch (err) {
      console.error("Error in useInstallments:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [user?.uid]);

  /**
   * Compute which active installments are already paid for the current salary cycle.
   * Adds `isPaidThisMonth` boolean to each installment object and updates state.
   */
  useEffect(() => {
    if (!user?.uid || !db || !installments?.length) return undefined;

    let mounted = true;

    async function computePaidFlags(list) {
      try {
        // Determine user's salaryDate (day of month). Fallback to 1.
        const salaryDate =
          Number(user?.salaryDate ?? user?.settings?.salaryDate ?? 1) || 1;

        const now = new Date();

        // Build cycle start - if this month's salaryDate is after now, use previous month
        function buildStartForMonth(year, month, day) {
          const lastDay = new Date(year, month + 1, 0).getDate();
          const d = Math.min(day, lastDay);
          return new Date(year, month, d, 0, 0, 0, 0);
        }

        let start = buildStartForMonth(
          now.getFullYear(),
          now.getMonth(),
          salaryDate,
        );
        if (start > now) {
          // take previous month
          const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          start = buildStartForMonth(
            prev.getFullYear(),
            prev.getMonth(),
            salaryDate,
          );
        }

        // next cycle start (exclusive end)
        const nextStart = new Date(
          start.getFullYear(),
          start.getMonth() + 1,
          start.getDate(),
          0,
          0,
          0,
          0,
        );

        const startTs = Timestamp.fromDate(start);
        const nextStartTs = Timestamp.fromDate(nextStart);

        // Work only with active installments
        const active = list.filter((i) => i.status === "active");
        if (!active.length) return;

        // Collect categories and installment ids to match against
        const categories = Array.from(
          new Set(active.map((i) => i.category).filter(Boolean)),
        );
        const installmentIds = new Set(active.map((i) => i.id));

        // Fetch transactions in this cycle (no category filter in query - will filter in JS)
        // This avoids needing a composite index
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid),
          where("transactionType", "==", "expense"),
          where("date", ">=", startTs),
          where("date", "<", nextStartTs),
        );
        const snap = await getDocs(q);
        const txDocs = [];
        snap.forEach((d) => {
          const data = { id: d.id, ...d.data() };
          txDocs.push(data);
        });

        // Deduplicate by doc id (not needed since we only fetch once, but keep for safety)
        const seen = new Set();
        const txs = txDocs.filter((t) => {
          if (seen.has(t.id)) return false;
          seen.add(t.id);
          return true;
        });

        // Build lookup by category (filtered to active installment categories) and by installmentId
        const paidByCategory = new Set(
          txs
            .filter((t) => categories.includes(t.category))
            .map((t) => t.category),
        );
        const paidByInstallmentId = new Set(
          txs.map((t) => t.installmentId).filter(Boolean),
        );

        // Map over original list and add flag
        const updated = list.map((it) => ({
          ...it,
          isPaidThisMonth:
            Boolean(it.category && paidByCategory.has(it.category)) ||
            Boolean(it.id && paidByInstallmentId.has(it.id)),
        }));

        if (mounted) setInstallments(updated);
      } catch (err) {
        console.error("Error computing paid flags:", err);
        // don't change installments on error
      }
    }

    computePaidFlags(installments);

    return () => {
      mounted = false;
    };
  }, [installments, user?.uid]);

  /**
   * Create a new installment/goal
   */
  async function addInstallment(installmentData) {
    if (!user?.uid || !db) return;

    try {
      await addDoc(collection(db, "activeInstallments"), {
        userId: user.uid,
        name: installmentData.name || "Untitled Goal",
        type: installmentData.type || "goal", // "loan", "koko", "goal"
        totalAmount: Number(
          installmentData.totalAmount || installmentData.targetAmount || 0,
        ),
        targetAmount: Number(
          installmentData.targetAmount || installmentData.totalAmount || 0,
        ),
        currentAmount: Number(installmentData.currentAmount || 0),
        monthlyAmount: Number(
          installmentData.monthlyAmount ||
            installmentData.monthlyContribution ||
            0,
        ),
        monthlyContribution: Number(
          installmentData.monthlyContribution ||
            installmentData.monthlyAmount ||
            0,
        ),
        totalMonths: Number(installmentData.totalMonths || 0),
        startDate: installmentData.startDate || new Date(),
        targetDate: installmentData.targetDate || null,
        category: installmentData.category || "Other", // Links to transaction category
        status: "active",
        color: installmentData.color || "#3B82F6",
        icon: installmentData.icon || "🎯",
        description: installmentData.description || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return true;
    } catch (err) {
      console.error("Error adding installment:", err);
      setError(err.message);
      return false;
    }
  }

  /**
   * Update installment progress
   */
  async function updateInstallmentProgress(installmentId, newAmount) {
    if (!user?.uid || !db || !installmentId) return;

    try {
      await updateDoc(doc(db, "activeInstallments", installmentId), {
        currentAmount: Number(newAmount),
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error("Error updating installment:", err);
      setError(err.message);
      return false;
    }
  }

  /**
   * Update installment details
   */
  async function updateInstallment(installmentId, installmentData) {
    if (!user?.uid || !db || !installmentId) return false;

    try {
      await updateDoc(doc(db, "activeInstallments", installmentId), {
        name: installmentData.name || "Untitled Goal",
        type: installmentData.type || "goal",
        totalAmount: Number(
          installmentData.totalAmount || installmentData.targetAmount || 0,
        ),
        targetAmount: Number(
          installmentData.targetAmount || installmentData.totalAmount || 0,
        ),
        currentAmount: Number(installmentData.currentAmount || 0),
        monthlyAmount: Number(
          installmentData.monthlyAmount ||
            installmentData.monthlyContribution ||
            0,
        ),
        monthlyContribution: Number(
          installmentData.monthlyContribution ||
            installmentData.monthlyAmount ||
            0,
        ),
        totalMonths: Number(installmentData.totalMonths || 0),
        targetDate: installmentData.targetDate || null,
        category: installmentData.category || "Other",
        description: installmentData.description || "",
        updatedAt: serverTimestamp(),
      });

      return true;
    } catch (err) {
      console.error("Error updating installment details:", err);
      setError(err.message);
      return false;
    }
  }

  /**
   * Pause or resume installment
   */
  async function toggleInstallmentStatus(installmentId, newStatus) {
    if (!user?.uid || !db || !installmentId) return;

    try {
      await updateDoc(doc(db, "activeInstallments", installmentId), {
        status: newStatus, // "active", "paused", "completed"
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error("Error toggling installment status:", err);
      setError(err.message);
      return false;
    }
  }

  /**
   * Delete installment
   */
  async function deleteInstallment(installmentId) {
    if (!user?.uid || !db || !installmentId) return;

    try {
      // Soft delete - mark as deleted instead of hard delete
      await updateDoc(doc(db, "activeInstallments", installmentId), {
        status: "deleted",
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error("Error deleting installment:", err);
      setError(err.message);
      return false;
    }
  }

  /**
   * Quick pay an installment by adding an expense transaction linked to the installment
   */
  async function payInstallment(installment, paymentDate = null) {
    if (!user?.uid || !db || !installment) return false;

    try {
      const amount = Number(
        installment.monthlyAmount || installment.monthlyContribution || 0,
      );

      const dateObj =
        paymentDate && paymentDate instanceof Date ? paymentDate : new Date();
      const ts = Timestamp.fromDate(dateObj);
      const year = dateObj.getFullYear();
      const monthIndex = dateObj.getMonth();

      // Use a batch to atomically create the transaction and increment the installment's saved/currentAmount
      const batch = writeBatch(db);

      // New transaction doc ref with auto id
      const txRef = doc(collection(db, "transactions"));
      batch.set(txRef, {
        userId: user.uid,
        amount,
        category: installment.category || "Other",
        transactionType: "expense",
        description: `Paid installment for ${installment.name || installment.title || "installment"}`,
        date: ts,
        year,
        monthIndex,
        installmentId: installment.id,
        createdAt: serverTimestamp(),
      });

      // Update installment document (activeInstallments collection) by incrementing currentAmount
      const instRef = doc(db, "activeInstallments", installment.id);
      batch.update(instRef, {
        currentAmount: increment(amount),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      return true;
    } catch (err) {
      console.error("Error paying installment:", err);
      setError(err.message);
      return false;
    }
  }

  /**
   * Get active installments only
   */
  const activeInstallments = installments.filter((i) => i.status === "active");

  /**
   * Get completed installments
   */
  const completedInstallments = installments.filter(
    (i) => i.status === "completed",
  );

  /**
   * Get total committed monthly amount across all active installments
   */
  const totalMonthlyCommitment = activeInstallments.reduce(
    (sum, i) => sum + (Number(i.monthlyContribution) || 0),
    0,
  );

  /**
   * Get overall progress across all active installments
   */
  const totalAmountPaid = activeInstallments.reduce(
    (sum, i) => sum + (Number(i.currentAmount) || 0),
    0,
  );

  const totalTargetAmount = activeInstallments.reduce(
    (sum, i) => sum + (Number(i.targetAmount) || 0),
    0,
  );

  const overallProgress =
    totalTargetAmount > 0
      ? Math.round((totalAmountPaid / totalTargetAmount) * 100)
      : 0;

  return {
    installments,
    activeInstallments,
    completedInstallments,
    loading,
    error,
    addInstallment,
    updateInstallment,
    updateInstallmentProgress,
    toggleInstallmentStatus,
    deleteInstallment,
    payInstallment,
    totalMonthlyCommitment,
    totalAmountPaid,
    totalTargetAmount,
    overallProgress,
  };
}
