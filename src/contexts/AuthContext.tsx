import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, getUserDataLocally } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface AuthUserSession {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  username?: string | null;
}

interface AuthContextType {
  user: User | null;
  currentUser: AuthUserSession | null;
  username: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  currentUser: null,
  username: null,
  loading: true,
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [localProfile, setLocalProfile] = useState<AuthUserSession | null>(() => {
    return getUserDataLocally<AuthUserSession>("profile", null);
  });
  const [loading, setLoading] = useState(true);

  // Sync function for localStorage session
  const syncLocalSession = () => {
    const prof = getUserDataLocally<AuthUserSession>("profile", null);
    setLocalProfile(prof);
  };

  useEffect(() => {
    const handleStorageChange = () => syncLocalSession();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("stockbloc_auth_changed", handleStorageChange);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        let currentUsername = currentUser.displayName || null;
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(docRef);
          if (snap.exists() && snap.data().username) {
            currentUsername = snap.data().username;
          }
        } catch (e) {
          console.warn("Failed to fetch username in AuthProvider", e);
        }
        setUsername(currentUsername);
      } else {
        const fallbackProf = getUserDataLocally<AuthUserSession>("profile", null);
        if (fallbackProf) {
          setUsername(fallbackProf.username || fallbackProf.displayName || fallbackProf.email?.split("@")[0] || null);
        } else {
          setUsername(null);
        }
      }
      setLoading(false);
    });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("stockbloc_auth_changed", handleStorageChange);
      unsubscribe();
    };
  }, []);

  const effectiveSession: AuthUserSession | null = user
    ? {
        uid: user.uid,
        displayName: user.displayName || username || user.email?.split("@")[0] || "Stock Bloc Member",
        email: user.email,
        photoURL: user.photoURL,
        username: username || user.displayName || user.email?.split("@")[0] || "Stock Bloc Member",
      }
    : localProfile
    ? {
        uid: localProfile.uid,
        displayName: localProfile.displayName || localProfile.username || localProfile.email?.split("@")[0] || "Stock Bloc Member",
        email: localProfile.email,
        photoURL: localProfile.photoURL,
        username: localProfile.username || localProfile.displayName || localProfile.email?.split("@")[0] || "Stock Bloc Member",
      }
    : null;

  const isAuthenticated = Boolean(user || localProfile);

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: effectiveSession,
        username: username || effectiveSession?.username || effectiveSession?.displayName || null,
        loading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

