"use client";

import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
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
  MoreHorizontal
} from "lucide-react";
import { fetchRecentTransactions } from "@/lib/fetch-transactions";
import { RecentTransaction } from "@/interface/transaction";
import { useCurrentUser } from "@/hooks/useUser";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  status: "success" | "successful" | "pending" | "failed";
  // add other fields like amount, date, etc.
}


export default function Home() {
  const router = useRouter();
  const response = useCurrentUser();
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["recentTransactions"],
    queryFn: fetchRecentTransactions,
  });

  useEffect(() => {
    if (!response) {
      router.replace("/login");
    }
  }, [response, router]);

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
      {
        title: "Active Students",
        value: "89",
        change: "+5.1%",
        icon: Users,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        trend: "up"
      },
  // {
  //   title: "Total Revenue",
  //   value: "₦2,450,000",
  //   change: "+12.5%",
  //   icon: DollarSign,
  //   color: "text-green-600",
  // },
  // {
  //   title: "This Month",
  //   value: "₦485,000",
  //   change: "+15.3%",
  //   icon: Calendar,
  //   color: "text-amber-600",
  // },
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
          <Link href={`/transactions/${txn._id}`}>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </Link>
        );
      },
    },
  ];

  const table = useReactTable({
    data: transactions?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
              <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="inline-flex items-center  px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
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

        {/* Quick Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                <Plus className="w-4 h-4" />
                New Transaction
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors duration-200">
                <Target className="w-4 h-4" />
                Bulk Approve
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors duration-200">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </div>
          </div>
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
                  When students make payments, they`ll appear here. Check back soon for updates.
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
  );
}