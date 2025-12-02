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

export interface UserData {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  walletInfo: {
    bkash?: string;
    nagad?: string;
    rocket?: string;
  };
  remainingTurnover?: number;
  depositCount?: number;
  specialBonus?: number;
  balance?: number; // Add balance to UserData for type safety
  withdrawPin?: string;
  referralCode?: string;
  referredBy?: string;
  totalTurnover?: number;
  referralBonusGiven?: boolean;
  affiliateStats?: {
    totalInvited: number;
    totalEarnings: number;
    claimable: number;
  };
  vipLevel?: number;
  role?: 'user' | 'admin' | 'master_admin';
  permissions?: string[]; // e.g. ['finance', 'users', 'games']
  claimableRewards?: {
    id: string;
    type: string;
    amount: number;
    level: number;
    claimed: boolean;
    createdAt: string;
  }[];
}

interface VipLevel {
  id: number;
  name: string;
  turnoverRequired: number;
  levelUpBonus: number;
}

interface VipSettings {
  levels: VipLevel[];
}

interface UserContextType {
  balance: number;
  remainingTurnover: number;
  updateBalance: (amount: number) => void;
  wager: (amount: number) => void;
  user: UserData | null;
  loading: boolean;
  login: (phone: string, pass: string) => Promise<void>;
  register: (name: string, phone: string, pass: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  affiliateSettings: {
    turnoverTarget: number;
    bonusAmount: number;
    commissionPercent: number;
    referralDomain?: string;
  };
  vipSettings: VipSettings;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [remainingTurnover, setRemainingTurnover] = useState(0);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [affiliateSettings, setAffiliateSettings] = useState({
    turnoverTarget: 4000,
    bonusAmount: 200,
    commissionPercent: 5,
    referralDomain: "https://bengalbet.com"
  });
  const [vipSettings, setVipSettings] = useState<VipSettings>({ levels: [] });

  // Listen for auth state changes
  useEffect(() => {
    // Fetch Settings
    const fetchSettings = async () => {
      try {
        const { getDoc, doc } = await import("firebase/firestore");
        
        // Affiliate
        const affSnap = await getDoc(doc(db, "settings", "affiliate"));
        if (affSnap.exists()) {
          const s = affSnap.data();
          setAffiliateSettings({
            turnoverTarget: s.turnoverTarget || 4000,
            bonusAmount: s.bonusAmount || 200,
            commissionPercent: s.commissionPercent || 5,
            referralDomain: s.referralDomain || "https://bengalbet.com"
          });
        }

        // VIP
        const vipSnap = await getDoc(doc(db, "settings", "vip"));
        if (vipSnap.exists()) {
          setVipSettings(vipSnap.data() as VipSettings);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();

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
    if (!fbUser || !user) return;
    const newTurnover = Math.max(0, remainingTurnover - amount);
    setRemainingTurnover(newTurnover);
    
    const { increment, arrayUnion } = await import("firebase/firestore");
    
    // Update user stats
    await setDoc(doc(db, "users", fbUser.uid), { 
      remainingTurnover: newTurnover,
      totalTurnover: increment(amount)
    }, { merge: true });

    // Check for Affiliate Bonus (Dynamic Target)
    if (user.referredBy && !user.referralBonusGiven) {
      const currentTotal = (user.totalTurnover || 0) + amount;
      if (currentTotal >= affiliateSettings.turnoverTarget) {
        const bonus = affiliateSettings.bonusAmount;
        await setDoc(doc(db, "users", fbUser.uid), { referralBonusGiven: true }, { merge: true });
        const referrerRef = doc(db, "users", user.referredBy);
        await setDoc(referrerRef, {
          "affiliateStats.totalEarnings": increment(bonus),
          "affiliateStats.claimable": increment(bonus)
        }, { merge: true });
      }
    }

    // Check VIP Level Up
    if (vipSettings.levels.length > 0) {
      const currentTotal = (user.totalTurnover || 0) + amount;
      const currentLevel = user.vipLevel || 0;
      
      // Find highest level reached
      const reachedLevel = vipSettings.levels
        .filter(l => currentTotal >= l.turnoverRequired)
        .sort((a, b) => b.id - a.id)[0];

      if (reachedLevel && reachedLevel.id > currentLevel) {
        // Level Up!
        await setDoc(doc(db, "users", fbUser.uid), { 
          vipLevel: reachedLevel.id,
          claimableRewards: arrayUnion({
            id: `vip_${reachedLevel.id}_${Date.now()}`,
            type: "vip_levelup",
            amount: reachedLevel.levelUpBonus,
            level: reachedLevel.id,
            claimed: false,
            createdAt: new Date().toISOString()
          })
        }, { merge: true });
        
        // Notification
        const { addDoc, collection } = await import("firebase/firestore");
        await addDoc(collection(db, "notifications"), {
          userId: fbUser.uid,
          title: "VIP Level Up!",
          message: `Congratulations! You reached ${reachedLevel.name}. Claim your ৳${reachedLevel.levelUpBonus} bonus now!`,
          type: "success",
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    }
  };

  const getEmail = (phone: string) => `${phone}@bengalbet.com`;

  const login = async (phone: string, pass: string) => {
    await signInWithEmailAndPassword(auth, getEmail(phone), pass);
  };

  const register = async (name: string, phone: string, pass: string, referralCode?: string) => {
    const email = getEmail(phone);
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    
    let referredBy = "";
    if (referralCode) {
      const { collection, query, where, getDocs } = await import("firebase/firestore");
      const q = query(collection(db, "users"), where("referralCode", "==", referralCode));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const referrerDoc = querySnapshot.docs[0];
        referredBy = referrerDoc.id;
        const { increment } = await import("firebase/firestore");
        await setDoc(doc(db, "users", referredBy), {
          "affiliateStats.totalInvited": increment(1)
        }, { merge: true });
      }
    }

    // Generate own referral code
    const myReferralCode = res.user.uid.slice(0, 8).toUpperCase();

    // Random Avatar
    const avatars = ["/user1.png", "/user2.png", "/user3.png"];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    // Create user doc in Firestore
    await setDoc(doc(db, "users", res.user.uid), {
      name,
      phone,
      avatar: randomAvatar,
      balance: 0,
      remainingTurnover: 0,
      walletInfo: {},
      createdAt: new Date().toISOString(),
      referralCode: myReferralCode,
      referredBy,
      totalTurnover: 0,
      referralBonusGiven: false,
      affiliateStats: {
        totalInvited: 0,
        totalEarnings: 0,
        claimable: 0
      },
      vipLevel: 0,
      claimableRewards: []
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
      closeAuthModal: () => setAuthModalOpen(false),
      affiliateSettings,
      vipSettings
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
