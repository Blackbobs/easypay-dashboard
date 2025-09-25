"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { fetchTransactionById, updateTransactionStatus } from "@/lib/fetch-transactions";
import { Transaction } from "@/interface/transaction";

export default function TransactionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const {
    data: transaction,
    isLoading,
    isError,
  } = useQuery<Transaction>({
    queryKey: ["transaction", id],
    queryFn: () => fetchTransactionById(id),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (newStatus: string) => updateTransactionStatus(id, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaction", id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Loading transaction...</p>
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Failed to load transaction.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6">
        {/* Back */}
        <div className="mb-6 flex items-center">
          <Link
            href="/admin/transactions"
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Transaction Details
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          Reference: <span className="font-mono">{transaction.reference}</span>
        </p>

        {/* Student Info */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Student Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Detail label="Full Name" value={transaction.fullName} />
            <Detail label="Email" value={transaction.email} />
            <Detail label="Phone Number" value={transaction.phoneNumber} />
            <Detail label="Matric Number" value={transaction.matricNumber} />
            <Detail label="College" value={transaction.college} />
            <Detail label="Department" value={transaction.department} />
          </div>
        </div>

        {/* Payment Info */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Payment Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Detail
              label="Amount"
              value={`₦${Number(transaction.amount).toLocaleString()}`}
            />
            <Detail label="Payment Method" value={transaction.paymentMethod} />
            <Detail label="Bank" value={transaction.bank} />
            <Detail label="Due Type" value={transaction.dueType} />
            <Detail label="Status" value={transaction.status} status />
            <Detail
              label="Date"
              value={new Date(transaction.createdAt).toLocaleString()}
            />
          </div>
        </div>

        {/* Proof of Payment */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Proof of Payment
          </h2>
          {transaction.proofUrl ? (
            <img
              src={transaction.proofUrl}
              alt="Payment Proof"
              className="w-full max-w-md border rounded-md shadow-sm"
            />
          ) : (
            <p className="text-gray-500 text-sm">No proof uploaded.</p>
          )}
        </div>

        {/* Admin Actions */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Admin Controls
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => mutation.mutate("success")}
              disabled={mutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 disabled:opacity-50"
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Approve"
              )}
            </button>
            <button
              onClick={() => mutation.mutate("failed")}
              disabled={mutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 disabled:opacity-50"
            >
              {mutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Reject"
              )}
            </button>
          </div>
          {mutation.isSuccess && (
            <p className="text-green-600 text-sm mt-2">
              Status updated successfully ✅
            </p>
          )}
          {mutation.isError && (
            <p className="text-red-600 text-sm mt-2">
              Failed to update status ❌
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: boolean;
}) {
  if (status) {
    return (
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            value === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : value === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {value}
        </span>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium text-gray-900">{value || "-"}</p>
    </div>
  );
}
