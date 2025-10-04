// app/search/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Search, 
  X, 
  ArrowLeft, 
  Eye, 
  CreditCard, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle,
  Filter,
  Download,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { searchTransactions, deleteTransaction } from "@/lib/fetch-transactions";
import { ITransaction, RecentTransaction } from "@/interface/transaction";
import { useCurrentUser, useCanPerformActions, useUserPermissions } from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
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
              <strong>Email:</strong> {transaction.email}
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Type:</strong> {transaction.dueType}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Amount:</strong> ₦{transaction.amount}
            </p>
          </div>

          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this transaction? All associated data will be permanently removed.
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

function SearchPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const canPerformActions = useCanPerformActions();
  const permissions = useUserPermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    transaction: ITransaction | null;
  }>({
    isOpen: false,
    transaction: null
  });

  // Debug logging
  useEffect(() => {
    console.log('User:', user);
    console.log('Can perform actions:', canPerformActions);
    console.log('Permissions:', permissions);
  }, [user, canPerformActions, permissions]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: transactions = [], isLoading, isError } = useQuery({
    queryKey: ["searchTransactions", debouncedSearchQuery],
    queryFn: () => searchTransactions(debouncedSearchQuery),
    enabled: debouncedSearchQuery.trim().length > 0,
  });

  // Delete transaction handler
  const handleDeleteTransaction = async () => {
    if (!deleteModal.transaction) return;

    try {
      await deleteTransaction(deleteModal.transaction._id);
      
      // Invalidate and refetch the search query
      await queryClient.invalidateQueries({ queryKey: ["searchTransactions"] });
      
      // Close the modal
      setDeleteModal({ isOpen: false, transaction: null });
      
      toast.success("Transaction deleted successfully");
      
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'successful':
        return <CheckCircle className="w-3 h-3" />;
      case 'failed':
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
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

  if (userLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Navigation Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Search Transactions</h1>
                  <p className="text-gray-600">Find transactions by email, name, reference, or matric number</p>
                  {user && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">Logged in as:</span>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md capitalize">
                        {user.role}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <Filter className="w-4 h-4" />
                  Advanced Filter
                </button>
                <button className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </button>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="Search by email, student name, reference number, or matric number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {searchQuery && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button
                        onClick={clearSearch}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
                
                {debouncedSearchQuery && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <Search className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          {isLoading ? "Searching..." : `${transactions?.data?.length || 0} results found`}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        Search query: <span className="font-medium text-gray-900">&quot;{debouncedSearchQuery}&quot;</span>
                      </span>
                    </div>
                    
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                        Clear Search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Search Results
                    </h2>
                    <p className="text-sm text-gray-600">
                      {debouncedSearchQuery 
                        ? `Transactions matching "${debouncedSearchQuery}"`
                        : "Enter a search query to find transactions"
                      }
                    </p>
                  </div>
                </div>
                {canPerformActions && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-sm font-medium text-amber-700">
                      Admin Mode: Delete actions enabled
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Results Content */}
            <div className="overflow-hidden">
              {!debouncedSearchQuery ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Start Searching
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Enter an email address, student name, reference number, or matric number to search through all transactions.
                  </p>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-blue-100"></div>
                  </div>
                  <p className="text-gray-600 mt-4 font-medium">Searching transactions...</p>
                  <p className="text-gray-400 text-sm mt-1">Looking for matches across all transactions</p>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 bg-red-100 rounded-full mb-4">
                    <XCircle className="h-10 w-10 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Search Error
                  </h3>
                  <p className="text-gray-500 text-center max-w-md mb-4">
                    There was an error performing the search. Please try again.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              ) : !transactions?.data?.length ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No transactions found
                  </h3>
                  <p className="text-gray-500 text-center max-w-md mb-4">
                    No transactions found matching &quot;<span className="font-medium">{debouncedSearchQuery}</span>&quot;. Try adjusting your search terms.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={clearSearch}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                      Clear Search
                    </button>
                    <Link
                      href="/transactions"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Browse All Transactions
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Student Information
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Payment Type
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {transactions.data.map((transaction: ITransaction) => (
                        <tr
                          key={transaction._id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                <Users className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {transaction.email}
                                </div>
                                {transaction.fullName && (
                                  <div className="text-xs text-gray-500">
                                    {transaction.fullName}
                                  </div>
                                )}
                                {transaction.matricNumber && (
                                  <div className="text-xs text-gray-400">
                                    {transaction.matricNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                <CreditCard className="w-3 h-3 mr-1" />
                                {transaction.dueType}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(transaction.status)}`}>
                              {getStatusIcon(transaction.status)}
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(transaction.createdAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₦{transaction.amount?.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Link href={`/transactions/${transaction._id}`}>
                                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                              </Link>
                              {canPerformActions && (
                                <button 
                                  onClick={() => setDeleteModal({ isOpen: true, transaction })}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            {transactions?.data?.length > 0 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Showing all {transactions.data.length} search results
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">
                      Search query: &quot;{debouncedSearchQuery}&quot;
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, transaction: null })}
        onConfirm={handleDeleteTransaction}
        transaction={deleteModal.transaction}
      />
    </>
  );
}

export default function SearchPage() {
  return <SearchPageContent />;
}