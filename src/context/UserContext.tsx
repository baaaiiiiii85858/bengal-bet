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
  id: string;
  name: string;
  phone: string;
  walletInfo: {
    bkash?: string;
    nagad?: string;
    rocket?: string;
  };
  remainingTurnover?: number;
  depositCount?: number;
  specialBonus?: number;
  balance?: number; // Add balance to UserData for type safety
}

interface UserContextType {
  balance: number;
  remainingTurnover: number;
  updateBalance: (amount: number) => void;
  wager: (amount: number) => void;
  user: UserData | null;
  loading: boolean;
  login: (phone: string, pass: string) => Promise<void>;
  register: (name: string, phone: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [remainingTurnover, setRemainingTurnover] = useState(0);
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
        const unsubSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setUser({ id: doc.id, ...data } as UserData);
            setBalance(data.balance || 0);
            setRemainingTurnover(data.remainingTurnover || 0);
          }
          setLoading(false);
        }, (error) => {
          console.error("Snapshot error:", error);
          setLoading(false);
        });

        return () => unsubSnapshot();
      } else {
        setUser(null);
        setBalance(0);
        setRemainingTurnover(0);
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

  const wager = async (amount: number) => {
    if (!fbUser) return;
    const newTurnover = Math.max(0, remainingTurnover - amount);
    setRemainingTurnover(newTurnover);
    await setDoc(doc(db, "users", fbUser.uid), { remainingTurnover: newTurnover }, { merge: true });
  };

  const getEmail = (phone: string) => `${phone}@bengalbet.com`;

  const login = async (phone: string, pass: string) => {
    await signInWithEmailAndPassword(auth, getEmail(phone), pass);
  };

  const register = async (name: string, phone: string, pass: string) => {
    const email = getEmail(phone);
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    
    // Create user doc in Firestore
    await setDoc(doc(db, "users", res.user.uid), {
      name,
      phone,
      balance: 0,
      remainingTurnover: 0,
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
      remainingTurnover,
      updateBalance, 
      wager,
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
