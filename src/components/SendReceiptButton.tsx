"use client";
import { ITransaction } from "@/interface/transaction";
import { useState } from "react";

export default function SendReceiptButton({ transaction }: { transaction: ITransaction }) {
  const [loading, setLoading] = useState(false);

  const handleSendReceipt = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      alert("Receipt sent successfully ✅");
    } catch (err) {
      console.error("Error sending receipt:", err);
      alert("Failed to send receipt ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSendReceipt}
      disabled={loading}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
    >
      {loading ? "Sending..." : "Send Receipt"}
    </button>
  );
}
