import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseReady } from "../firebase";

const DEFAULT_CATEGORIES = [
  "Fuel",
  "Bills",
  "Loan",
  "Koko",
  "Personal",
  "Withdraw",
  "Reload",
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setUser(null);
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function register(email, password) {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized.");
    }

    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Create default categories for the new user
    if (db && credential.user?.uid) {
      try {
        const categoriesDocId = `${credential.user.uid}_categories`;
        await setDoc(doc(db, "userCategories", categoriesDocId), {
          userId: credential.user.uid,
          categories: DEFAULT_CATEGORIES,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Failed to create default categories:", error);
      }
    }

    return credential;
  }

  async function login(email, password) {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized.");
    }

    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized.");
    }

    return signOut(auth);
  }

  async function resetPassword(email) {
    if (!auth) {
      throw new Error("Firebase Auth is not initialized.");
    }

    return sendPasswordResetEmail(auth, email);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      register,
      login,
      logout,
      resetPassword,
    }),
    [user, loading],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking authentication session...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}

export default AuthContext;
