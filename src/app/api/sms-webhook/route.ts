import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, increment, getDoc } from "firebase/firestore";

// Regex patterns for Bkash and Nagad
const PATTERNS = {
  bkash: /TrxID\s+([A-Z0-9]+)/i,
  nagad: /TxnID:\s+([A-Z0-9]+)/i,
  amount: /(?:Tk|BDT)\s*([\d,]+\.?\d*)/i
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret, message } = body;

    // Validate Secret Key (Store this in env or firestore in production)
    if (secret !== "sk_live_51M...") { // Match the one shown in Admin UI
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Received SMS:", message);

    // Extract TrxID
    let trxId = null;
    if (message.match(PATTERNS.bkash)) {
      trxId = message.match(PATTERNS.bkash)[1];
    } else if (message.match(PATTERNS.nagad)) {
      trxId = message.match(PATTERNS.nagad)[1];
    }

    if (!trxId) {
      return NextResponse.json({ message: "No TrxID found" }, { status: 200 });
    }

    console.log("Extracted TrxID:", trxId);

    // Find pending deposit with this TrxID
    const depositsRef = collection(db, "deposits");
    const q = query(depositsRef, where("trxId", "==", trxId), where("status", "==", "pending"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No pending deposit found for TrxID:", trxId);
      // Optional: Store in 'unclaimed_transactions' collection
      return NextResponse.json({ message: "Transaction not matched" }, { status: 200 });
    }

    const depositDoc = snapshot.docs[0];
    const depositData = depositDoc.data();

    // Fetch Settings for Bonus
    const settingsSnap = await getDoc(doc(db, "settings", "finance"));
    let bonusPercent = 0;
    let turnoverMultiplier = 1;
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      bonusPercent = data.bonusPercent || 0;
      turnoverMultiplier = data.turnoverMultiplier || 1;
    }

    // Calculate Bonus and Turnover
    const amount = depositData.amount;
    const bonus = amount * (bonusPercent / 100);
    const totalCredit = amount + bonus;
    const turnoverReq = totalCredit * turnoverMultiplier;

    // Approve Deposit
    await updateDoc(doc(db, "deposits", depositDoc.id), {
      status: "approved",
      approvedAt: new Date().toISOString(),
      autoApproved: true
    });

    // Update User Balance
    await updateDoc(doc(db, "users", depositData.userId), {
      balance: increment(totalCredit),
      remainingTurnover: increment(turnoverReq)
    });

    return NextResponse.json({ success: true, message: "Deposit approved" });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
