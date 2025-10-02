"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, User, CreditCard, FileText, Settings, CheckCircle, XCircle, Clock, Copy, Eye, Building, Home, Receipt, Trash2 } from "lucide-react";
import {
  fetchTransactionById,
  updateTransactionStatus,
  deleteTransaction,
} from "@/lib/fetch-transactions";
import { ITransaction, Transaction } from "@/interface/transaction";
import { useState } from "react";
import Image from "next/image";
import SendReceiptButton from "@/components/SendReceiptButton";
import { toast } from "sonner";
import { useCanPerformActions } from "@/hooks/useUser";

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  transaction 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: ITransaction | null;
}) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Transaction
              </h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Reference:</strong> {transaction.reference}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Student:</strong> {transaction.fullName}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Email:</strong> {transaction.email}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Type:</strong> {transaction.dueType}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Amount:</strong> ₦{transaction.amount?.toLocaleString()}
            </p>
          </div>

          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this transaction? All associated data will be permanently removed from the system.
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransactionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const canPerformActions = useCanPerformActions();
  const [copiedReference, setCopiedReference] = useState(false);
  const [imagePreview, setImagePreview] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    transaction: ITransaction | null;
  }>({
    isOpen: false,
    transaction: null
  });

  const {
    data: transaction,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["transaction", id],
    queryFn: () => fetchTransactionById(id),
    enabled: !!id,
  });

  const handleSendReceipt = async (transaction: ITransaction) => {
    try {
      const res = await fetch("/api/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");

      toast.success("Receipt sent successfully ✅");
    } catch (err) {
      console.error("Error sending receipt:", err);
      toast.error("Failed to send receipt ❌");
    }
  };

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) => updateTransactionStatus(id, newStatus),

    onSuccess: (updatedTransaction, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transaction", id] });

      console.log("Status updated to:", variables);

      if (variables === "successful") {
        handleSendReceipt(updatedTransaction.data);
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteTransaction(id),
    
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["allTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["recentTransactions"] });
      
      // Show success message
      toast.success("Transaction deleted successfully");
      
      // Redirect to transactions page
      router.push("/transactions");
    },
    
    onError: (error) => {
      console.error("Failed to delete transaction:", error);
      toast.error("Failed to delete transaction");
    }
  });

  const copyReference = async () => {
    if (transaction?.data.reference) {
      await navigator.clipboard.writeText(transaction.data.reference);
      setCopiedReference(true);
      setTimeout(() => setCopiedReference(false), 2000);
    }
  };

  const handleDeleteTransaction = () => {
    if (transaction?.data) {
      setDeleteModal({
        isOpen: true,
        transaction: transaction.data
      });
    }
  };

  const confirmDelete = () => {
    deleteMutation.mutate();
    setDeleteModal({ isOpen: false, transaction: null });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading transaction details...</p>
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200 max-w-md mx-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Transaction Not Found</h2>
          <p className="text-gray-600 text-center mb-4">We couldn&apos;t load the transaction details. Please try again.</p>
          <Link
            href="/transactions"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/transactions"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Transactions
            </Link>
            
            {/* Delete Button - Only show for superAdmin */}
            {canPerformActions && (
              <button
                onClick={handleDeleteTransaction}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Transaction'}
              </button>
            )}
          </div>

          {/* Header Card */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Transaction Details
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm">Reference:</span>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-md">
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {transaction.data.reference}
                    </span>
                    <button
                      onClick={copyReference}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      title="Copy reference"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {copiedReference && (
                      <span className="text-green-600 text-xs font-medium">Copied!</span>
                    )}
                  </div>
                </div>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium ${getStatusColor(transaction.data.status)}`}>
                {getStatusIcon(transaction.data.status)}
                {transaction.data.status.charAt(0).toUpperCase() + transaction.data.status.slice(1)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Student Information */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Student Information</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailField label="Full Name" value={transaction.data.fullName} />
                    <DetailField label="Email" value={transaction.data.email} />
                    <DetailField label="Phone Number" value={transaction.data.phoneNumber} />
                    <DetailField label="Matric Number" value={transaction.data.matricNumber} />
                    <DetailField label="College" value={transaction.data.college} />
                    <DetailField label="Department" value={transaction.data.department} />
                    <DetailField label="Student Type" value={transaction.data.studentType} />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailField label="Payment Method" value={transaction.data.paymentMethod} />
                    <DetailField label="Due Type" value={transaction.data.dueType} />
                    <DetailField 
                      label="Status" 
                      value={transaction.data.status} 
                      status 
                    />
                    <DetailField
                      label="Transaction Date"
                      value={new Date(transaction.data.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    />
                    <DetailField 
                      label="Amount" 
                      value={`₦${transaction.data.amount?.toLocaleString()}`} 
                    />
                    <DetailField label="Receipt Name" value={transaction.data.receiptName} />
                  </div>
                </div>
              </div>

              {/* Accommodation Information */}
              {(transaction.data.hostel || transaction.data.roomNumber) && (
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Home className="w-5 h-5 text-purple-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">Accommodation Information</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailField label="Hostel" value={transaction.data.hostel} />
                      <DetailField label="Room Number" value={transaction.data.roomNumber} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Proof of Payment */}
              <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Proof of Payment</h2>
                  </div>
                </div>
                <div className="p-6">
                  {transaction.data.proofUrl ? (
                    <div className="space-y-3">
                      <div className="relative group">
                        <Image
                          src={transaction?.data?.proofUrl}
                          alt="Payment Proof"
                          width={400}
                          height={300}
                          className="w-full max-h-[300px] rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                          onClick={() => setImagePreview(true)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center rounded-lg transition-all duration-200">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </div>
                      <button
                        onClick={() => setImagePreview(true)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Size
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No proof of payment uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Actions - Only show for superAdmin */}
              {canPerformActions && (
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Settings className="w-5 h-5 text-orange-600" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">Admin Actions</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Status
                      </label>
                      <select
                        value={transaction.data.status}
                        onChange={(e) => statusMutation.mutate(e.target.value)}
                        disabled={statusMutation.isPending}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <option value="pending">Pending</option>
                        <option value="successful">Successful</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>

                    <button
                      onClick={() => statusMutation.mutate(transaction.data.status)}
                      disabled={statusMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {statusMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {statusMutation.isPending ? 'Updating...' : 'Save Changes'}
                    </button>

                    {statusMutation.isSuccess && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-green-700 text-sm font-medium">
                          Status updated successfully
                        </p>
                      </div>
                    )}
                    
                    {statusMutation.isError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <p className="text-red-700 text-sm font-medium">
                          Failed to update status
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Preview Modal */}
          {imagePreview && transaction.data.proofUrl && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              onClick={() => setImagePreview(false)}
            >
              <div className="relative max-w-4xl max-h-full">
                <Image
                  src={transaction.data.proofUrl}
                  width={800}
                  height={600}
                  alt="Payment Proof - Full Size"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
                <button
                  onClick={() => setImagePreview(false)}
                  className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-all duration-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, transaction: null })}
        onConfirm={confirmDelete}
        transaction={deleteModal.transaction}
      />
    </>
  );
}

function DetailField({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: boolean;
}) {
  if (status) {
    const getStatusDisplay = (status: string) => {
      const config = {
        pending: { 
          bg: 'bg-amber-100', 
          text: 'text-amber-800', 
          border: 'border-amber-200',
          icon: Clock
        },
        successful: { 
          bg: 'bg-emerald-100', 
          text: 'text-emerald-800', 
          border: 'border-emerald-200',
          icon: CheckCircle
        },
        failed: { 
          bg: 'bg-red-100', 
          text: 'text-red-800', 
          border: 'border-red-200',
          icon: XCircle
        }
      };
      
      return config[status as keyof typeof config] || config.pending;
    };

    const statusConfig = getStatusDisplay(value);
    const Icon = statusConfig.icon;

    return (
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
          <Icon className="w-4 h-4" />
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
        {value || <span className="text-gray-400 italic">Not provided</span>}
      </p>
    </div>
  );
}