import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const CATEGORY_TYPES = ["expense", "income", "transfer"];

function normalizeCategoryType(type) {
  const value = String(type || "expense").toLowerCase();
  return CATEGORY_TYPES.includes(value) ? value : "expense";
}

function normalizeCategory(category) {
  if (!category) return null;

  if (typeof category === "string") {
    const name = category.trim();
    if (!name) return null;

    return {
      name,
      type:
        name === "Reload"
          ? "income"
          : name === "Withdraw"
            ? "transfer"
            : "expense",
    };
  }

  const name = String(category.name || category.label || "").trim();
  if (!name) return null;

  return {
    name,
    type: normalizeCategoryType(category.type),
  };
}

export default function useCategories(user) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.uid || !db) {
      setCategories([]);
      setLoading(false);
      return undefined;
    }

    const categoriesDocId = `${user.uid}_categories`;
    const unsubscribe = onSnapshot(
      doc(db, "userCategories", categoriesDocId),
      (snapshot) => {
        if (snapshot.exists()) {
          const normalized = (snapshot.data().categories || [])
            .map(normalizeCategory)
            .filter(Boolean);
          setCategories(normalized);
          setError("");
        } else {
          setCategories([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching categories:", err);
        setError(err.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid]);

  async function addCategory(categoryName, categoryType = "expense") {
    if (!user?.uid || !db || !categoryName.trim()) {
      return;
    }

    const categoriesDocId = `${user.uid}_categories`;
    try {
      const newCategory = normalizeCategory({
        name: categoryName.trim(),
        type: categoryType,
      });
      const nextCategories = [...categories, newCategory].filter(Boolean);

      await setDoc(
        doc(db, "userCategories", categoriesDocId),
        {
          userId: user.uid,
          categories: nextCategories,
          updatedAt: new Date(),
        },
        { merge: true },
      );
    } catch (err) {
      console.error("Failed to add category:", err);
      setError(err.message);
    }
  }

  async function updateCategory(previousName, nextCategory) {
    if (!user?.uid || !db || !previousName || !nextCategory?.name?.trim()) {
      return;
    }

    const categoriesDocId = `${user.uid}_categories`;
    try {
      const normalized = normalizeCategory(nextCategory);
      const nextCategories = categories
        .map((category) =>
          category.name === previousName ? normalized : category,
        )
        .filter(Boolean);

      await setDoc(
        doc(db, "userCategories", categoriesDocId),
        {
          userId: user.uid,
          categories: nextCategories,
          updatedAt: new Date(),
        },
        { merge: true },
      );
    } catch (err) {
      console.error("Failed to update category:", err);
      setError(err.message);
    }
  }

  async function removeCategory(categoryName) {
    if (!user?.uid || !db) {
      return;
    }

    const categoriesDocId = `${user.uid}_categories`;
    try {
      const nextCategories = categories.filter(
        (category) => category.name !== categoryName,
      );

      await setDoc(
        doc(db, "userCategories", categoriesDocId),
        {
          userId: user.uid,
          categories: nextCategories,
          updatedAt: new Date(),
        },
        { merge: true },
      );
    } catch (err) {
      console.error("Failed to remove category:", err);
      setError(err.message);
    }
  }

  const categoryNames = categories.map((category) => category.name);

  return {
    categories,
    categoryNames,
    loading,
    error,
    addCategory,
    updateCategory,
    removeCategory,
  };
}
