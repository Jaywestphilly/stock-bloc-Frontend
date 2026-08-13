import React, { useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";

interface AuthState {
  user: User | null;
  username: string | null;
  loading: boolean;
}

const useAuthStore = create<AuthState>(() => ({
  user: null,
  username: null,
  loading: true,
}));

let initialized = false;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      useAuthStore.setState({ user: currentUser });
      if (currentUser) {
        let currentUsername = currentUser.displayName || null;
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(docRef);
          if (snap.exists() && snap.data().username) {
            currentUsername = snap.data().username;
          }
        } catch (e) {
          console.warn("Failed to fetch username in authStore", e);
        }
        useAuthStore.setState({ username: currentUsername });
      } else {
        useAuthStore.setState({ username: null });
      }
      useAuthStore.setState({ loading: false });
    });
    return () => {
      unsubscribe();
      initialized = false;
    };
  }, []);

  return <>{children}</>;
};

export const useAuth = () => useAuthStore();

