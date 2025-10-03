"use client";

import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Eye,
  ArrowUpRight,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Zap,
  Target,
  TrendingDown,
  Plus,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
  Trash2,
  LogOut,
  User
} from "lucide-react";
import { fetchRecentTransactions, deleteTransaction } from "@/lib/fetch-transactions";
import { RecentTransaction } from "@/interface/transaction";
import { useCurrentUser, useLogout, useCanPerformActions, User as UserType } from "@/hooks/useUser";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  status: "success" | "successful" | "pending" | "failed";
}

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

// User Profile Dropdown Component
function UserProfileDropdown({ user, onLogout }: { user: UserType; onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 text-sm">{user.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {user.role}
                    </span>
                    {user.college && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 truncate">
                        {user.college}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const canPerformActions = useCanPerformActions();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    transaction: RecentTransaction | null;
  }>({
    isOpen: false,
    transaction: null
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["recentTransactions"],
    queryFn: fetchRecentTransactions,
  });

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/login");
    }
  }, [user, userLoading, router]);

  // Delete transaction handler
  const handleDeleteTransaction = async () => {
    if (!deleteModal.transaction) return;

    try {
      await deleteTransaction(deleteModal.transaction._id);
      
      // Invalidate and refetch the transactions query
      await queryClient.invalidateQueries({ queryKey: ["recentTransactions"] });
      
      // Close the modal
      setDeleteModal({ isOpen: false, transaction: null });
      
      console.log("Transaction deleted successfully");
      
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Calculate dynamic stats from actual data
  const stats = useMemo(() => {
    const transactionData: Transaction[] = transactions?.data || [];
    const total = transactionData.length;
    const successful = transactionData.filter(
      (t: Transaction) => t.status === "success" || t.status === "successful"
    ).length;

    const pending = transactionData.filter(
      (t: Transaction) => t.status === "pending"
    ).length;

    const failed = transactionData.filter(
      (t: Transaction) => t.status === "failed"
    ).length;

    // Calculate success rate
    const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : "0.0";
    
    return [
      {
        title: "Total Transactions",
        value: total.toString(),
        change: "+12.5%",
        icon: CreditCard,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        trend: "up"
      },
      {
        title: "Successful Payments",
        value: successful.toString(),
        change: `${successRate}% success rate`,
        icon: CheckCircle,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        trend: "up"
      },
      {
        title: "Pending Reviews",
        value: pending.toString(),
        change: pending > 5 ? "Needs attention" : "Under control",
        icon: Clock,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        trend: pending > 5 ? "down" : "up"
      },
    ];
  }, [transactions]);

  const columns: ColumnDef<RecentTransaction>[] = [
    {
      accessorKey: "email",
      header: "Student Email",
      cell: (info) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
            <Users className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {info.getValue() as string}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "dueType",
      header: "Payment Type",
      cell: (info) => (
        <div className="flex items-center">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <CreditCard className="w-3 h-3 mr-1" />
            {info.getValue() as string}
          </span>
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
        
        return (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            isPending
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : isSuccess
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"  
              : "bg-red-50 text-red-700 border-red-200"
          }`}>
            {isPending ? (
              <Clock className="w-3 h-3" />
            ) : isSuccess ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: (info) => (
        <div className="flex flex-col">
          <div className="text-sm font-medium text-gray-900">
            {new Date(info.getValue() as string).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(info.getValue() as string).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
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
            <Link href={`/transactions/${txn._id}`}>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </Link>
            {canPerformActions && (
              <button 
                onClick={() => setDeleteModal({ isOpen: true, transaction: txn })}
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
    data: transactions?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
          
          {/* Enhanced Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Dashboard Overview
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Monitor student payments and platform performance in real-time
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* User Profile Dropdown */}
                {user && (
                  <UserProfileDropdown 
                    user={user} 
                    onLogout={handleLogout}
                  />
                )}
                
                <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <Download className="w-4 h-4 mr-2" />
                  Export&nbsp;
                  <span className="max-md:hidden">Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${stat.borderColor}`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </p>
                    <p className={`text-sm font-medium flex items-center ${
                      stat.trend === "up" ? "text-emerald-600" : "text-amber-600"
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Recent Transactions
                    </h2>
                    <p className="text-sm text-gray-600">
                      Latest payment activities from students
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <Link href="/transactions">
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      View All Transactions
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-hidden">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-blue-100"></div>
                  </div>
                  <p className="text-gray-600 mt-4 font-medium">Loading recent transactions...</p>
                  <p className="text-gray-400 text-sm mt-1">Fetching the latest data</p>
                </div>
              ) : !transactions?.data?.length ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <CreditCard className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No transactions yet
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    When students make payments, they&apos;ll appear here. Check back soon for updates.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="border-b border-gray-200 bg-gray-50">
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="px-6 py-4 text-left text-sm font-semibold text-gray-900"
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
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
                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
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
                </div>
              )}
            </div>

            {/* Footer */}
            {transactions?.data?.length > 0 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Showing {Math.min(10, transactions.data.length)} of {transactions.data.length} recent transactions
                  </span>
                  <Link href="/transactions" className="text-blue-600 hover:text-blue-700 font-medium">
                    View all →
                  </Link>
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