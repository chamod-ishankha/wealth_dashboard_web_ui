import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";

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
          setCategories(snapshot.data().categories || []);
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

  async function addCategory(categoryName) {
    if (!user?.uid || !db || !categoryName.trim()) {
      return;
    }

    const categoriesDocId = `${user.uid}_categories`;
    try {
      await updateDoc(doc(db, "userCategories", categoriesDocId), {
        categories: arrayUnion(categoryName.trim()),
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Failed to add category:", err);
      setError(err.message);
    }
  }

  async function removeCategory(categoryName) {
    if (!user?.uid || !db) {
      return;
    }

    const categoriesDocId = `${user.uid}_categories`;
    try {
      await updateDoc(doc(db, "userCategories", categoriesDocId), {
        categories: arrayRemove(categoryName),
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Failed to remove category:", err);
      setError(err.message);
    }
  }

  return { categories, loading, error, addCategory, removeCategory };
}
