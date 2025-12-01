"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

interface UserData {
  name: string;
  phone: string;
  walletInfo: {
    bkash?: string;
    nagad?: string;
    rocket?: string;
  };
}

interface UserContextType {
  balance: number;
  updateBalance: (amount: number) => void;
  user: UserData | null;
  loading: boolean;
  login: (phone: string, pass: string) => Promise<void>;
  register: (phone: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth State Changed:", currentUser?.uid);
      setFbUser(currentUser);
      if (currentUser) {
        // Fetch user data from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        
        // Real-time listener for user data
        onSnapshot(userDocRef, (doc) => {
          console.log("Snapshot received:", doc.exists());
          if (doc.exists()) {
            const data = doc.data();
            setUser(data as UserData);
            setBalance(data.balance || 0);
          }
          setLoading(false); // Set loading false only after data is received
        }, (error) => {
          console.error("Snapshot error:", error);
          setLoading(false); // Ensure loading is set false on error
        });
        
        // Close modal on successful login
        setAuthModalOpen(false);

        // Cleanup old subscription if exists? 
        // Note: This return inside callback doesn't work for onAuthStateChanged cleanup.
        // We need to handle cleanup differently if we want to unsubscribe from snapshot on logout.
      } else {
        setUser(null);
        setBalance(0);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateBalance = async (amount: number) => {
    if (!fbUser) return;
    const newBalance = balance + amount;
    // Optimistic update
    setBalance(newBalance);
    // Update Firestore
    await setDoc(doc(db, "users", fbUser.uid), { balance: newBalance }, { merge: true });
  };

  // Helper to convert phone to email
  const getEmail = (phone: string) => `${phone}@bengalbet.com`;

  const login = async (phone: string, pass: string) => {
    await signInWithEmailAndPassword(auth, getEmail(phone), pass);
  };

  const register = async (phone: string, pass: string) => {
    const email = getEmail(phone);
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    
    // Create user doc in Firestore
    await setDoc(doc(db, "users", res.user.uid), {
      phone,
      balance: 0, // Initial balance
      walletInfo: {},
      createdAt: new Date().toISOString()
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (data: Partial<UserData>) => {
    if (!fbUser) return;
    await setDoc(doc(db, "users", fbUser.uid), data, { merge: true });
  };

  return (
    <UserContext.Provider value={{ 
      balance, 
      updateBalance, 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      updateProfile,
      authModalOpen,
      openAuthModal: () => setAuthModalOpen(true),
      closeAuthModal: () => setAuthModalOpen(false)
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
