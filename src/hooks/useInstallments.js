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
} from "firebase/firestore";
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
    totalMonthlyCommitment,
    totalAmountPaid,
    totalTargetAmount,
    overallProgress,
  };
}
