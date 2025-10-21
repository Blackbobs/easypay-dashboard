"use client";

import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import Link from "next/link";
import { RecentTransaction } from "@/interface/transaction";
import { useState, useMemo, useEffect } from "react";
import {
  Eye,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  SlidersHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  Users,
  CreditCard,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import {
  fetchAllTransaction,
  deleteTransaction,
} from "@/lib/fetch-transactions";
import { useCanPerformActions } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

// Delete Confirmation Modal Component
function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  transaction,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: RecentTransaction | null;
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
            <p className="text-sm text-gray-700 mb-2">
              <strong>Status:</strong> {transaction.status}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Amount:</strong> ₦{transaction.amount}
            </p>
          </div>

          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this transaction? All associated
            data will be permanently removed.
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

export default function TransactionsPage() {
  // const router = useRouter();
  const queryClient = useQueryClient();
  const canPerformActions = useCanPerformActions();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    transaction: RecentTransaction | null;
  }>({
    isOpen: false,
    transaction: null,
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ["allTransactions", page, debouncedSearchTerm],
    queryFn: () => fetchAllTransaction(page, 50),
    placeholderData: keepPreviousData,
  });
  console.log(data);

  const transactions: RecentTransaction[] = data?.data ?? [];
  const meta = data?.meta;

  // Filter transactions based on search term and sort alphabetically by email
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // Apply search filter if search term exists
    if (debouncedSearchTerm.trim()) {
      result = transactions.filter(
        (transaction) =>
          transaction.email
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          transaction.dueType
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          transaction.status
            ?.toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          new Date(transaction.createdAt)
            .toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Sort alphabetically by email
    return result.sort((a, b) => {
      const emailA = (a.email || "").toLowerCase();
      const emailB = (b.email || "").toLowerCase();
      return emailA.localeCompare(emailB);
    });
  }, [transactions, debouncedSearchTerm]);

  // Delete transaction handler
  const handleDeleteTransaction = async () => {
    if (!deleteModal.transaction) return;

    try {
      await deleteTransaction(deleteModal.transaction._id);

      // Invalidate and refetch the transactions query
      await queryClient.invalidateQueries({ queryKey: ["allTransactions"] });

      // Close the modal
      setDeleteModal({ isOpen: false, transaction: null });

      console.log("Transaction deleted successfully");
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  // Quick stats calculations
  const stats = useMemo(() => {
    const total = transactions.length;
    const pending = transactions.filter((t) => t.status === "pending").length;
    const successful = transactions.filter(
      (t) => t.status === "success" || t.status === "successful"
    ).length;
    const failed = transactions.filter((t) => t.status === "failed").length;

    return { total, pending, successful, failed };
  }, [transactions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
      case "successful":
        return <CheckCircle className="w-3 h-3" />;
      case "failed":
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const columns: ColumnDef<RecentTransaction>[] = [
    {
      accessorKey: "email",
      header: "Student Email",
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 text-sm">
            {info.getValue() as string}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "dueType",
      header: "Due Type",
      cell: (info) => (
        <div className="flex items-center">
          <div className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-200">
            {info.getValue() as string}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as string;
        const isSuccess = status === "success" || status === "successful";
        const isPending = status === "pending";
        const isFailed = status === "failed";

        return (
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              isPending
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : isSuccess
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {getStatusIcon(status)}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date Created",
      cell: (info) => (
        <div className="flex flex-col">
          <span className="text-gray-900 text-sm font-medium">
            {new Date(info.getValue() as string).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </span>
          <span className="text-gray-500 text-xs">
            {new Date(info.getValue() as string).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const txn = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <Link
              href={`/transactions/${txn._id}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Link>
            {canPerformActions && (
              <button
                onClick={() =>
                  setDeleteModal({ isOpen: true, transaction: txn })
                }
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="mb-8">
            {/* Back Button and Title */}
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Transaction Management
                </h1>
                <p className="text-gray-600">
                  Monitor and manage all student transactions in one place
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                {/* Search Button */}
                <Link href="/search">
                  <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <Search className="w-4 h-4" />
                    Advanced Search
                  </button>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Data
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <SlidersHorizontal className="w-4 h-4" />
                  Advanced Filter
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Transactions
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Successful
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {stats.successful}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">
                      {stats.pending}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.failed}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative max-w-md w-full">
                <div className="relative flex items-center gap-3 border border-gray-300 bg-white rounded-lg px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-200">
                  <Search className="text-gray-400 h-5 w-5 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="w-full focus:outline-none bg-transparent text-gray-900 placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Results Info */}
              {debouncedSearchTerm && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {filteredTransactions.length} results found
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Main Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-blue-100"></div>
                </div>
                <p className="text-gray-600 mt-4 font-medium">
                  Loading transactions...
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Please wait while we fetch the data
                </p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {debouncedSearchTerm
                    ? "No matching transactions"
                    : "No transactions found"}
                </h3>
                <p className="text-gray-500 text-center max-w-md mb-4">
                  {debouncedSearchTerm
                    ? `No transactions match your search for "${debouncedSearchTerm}". Try adjusting your search terms.`
                    : "There are no transactions to display at the moment. New transactions will appear here once they're created."}
                </p>
                <div className="flex gap-3">
                  {debouncedSearchTerm && (
                    <button
                      onClick={clearSearch}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                      Clear Search
                    </button>
                  )}
                  <Link href="/search">
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Search className="w-4 h-4" />
                      Advanced Search
                    </button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr
                          key={headerGroup.id}
                          className="border-b border-gray-200 bg-gray-50"
                        >
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-900 tracking-wider"
                            >
                              <div className="flex items-center gap-2">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                              </div>
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="px-6 py-4 whitespace-nowrap"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {meta && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>
                            Showing{" "}
                            <span className="font-medium text-gray-900">
                              {(meta.page - 1) * meta.limit + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium text-gray-900">
                              {Math.min(meta.page * meta.limit, meta.total)}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-gray-900">
                              {meta.total}
                            </span>{" "}
                            transactions
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            disabled={meta.page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </button>

                          <div className="flex items-center gap-1">
                            <span className="px-2 py-2 text-sm font-semibold  text-secondary rounded-lg">
                              {meta.page}
                            </span>
                            <span className="px-2 text-sm text-gray-500">
                              of
                            </span>
                            <span className="px-3 py-2 text-sm font-semibold text-primary rounded-lg">
                              {meta.totalPages}
                            </span>
                          </div>

                          <button
                            disabled={meta.page === meta.totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
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
