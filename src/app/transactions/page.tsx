"use client";

import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Eye } from "lucide-react";
import { RecentTransaction } from "@/interface/transaction";
import { useState } from "react";
import { fetchAllTransaction } from "@/lib/fetch-transactions";

export default function TransactionsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["allTransactions", page],
    queryFn: () => fetchAllTransaction(page, 10),
    placeholderData: keepPreviousData,
  });

  const transactions: RecentTransaction[] = data?.data ?? [];
  const meta = data?.meta;

  const columns: ColumnDef<RecentTransaction>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: (info) => (
        <div className="font-medium text-gray-900 text-nowrap">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      accessorKey: "dueType",
      header: "Due",
      cell: (info) => (
        <div className="text-gray-600 text-nowrap">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as string;
        return (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : status === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: (info) => (
        <div className="text-gray-600 text-nowrap">
          {new Date(info.getValue() as string).toLocaleDateString()}
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
            <button className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary/90">
              <Eye className="w-4 h-4 mr-1" /> View
            </button>
          </Link>
        );
      },
    },
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">All Transactions</h1>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="py-4">
            {isLoading ? (
              <p className="text-center text-gray-500 py-6">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="p-4 text-nowrap bg-secondary text-white font-medium"
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
                  <tbody>
                    {table.getRowModel().rows.map((row, i) => (
                      <tr
                        key={row.id}
                        className={
                          i % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50 hover:bg-gray-100"
                        }
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="p-4 text-gray-800">
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

         {/* Pagination Controls */}
{meta && (
  <div className="flex justify-between items-center p-4 border-t text-sm text-gray-600">
    <button
      disabled={page === 1}
      onClick={() => setPage((p) => p - 1)}
      className="px-3 py-1 border rounded-md disabled:opacity-50"
    >
      Previous
    </button>

    {/* Current Page Indicator */}
    <span>
      Page {page} of {meta.totalPages}
    </span>

    <button
      disabled={page === meta.totalPages}
      onClick={() => setPage((p) => p + 1)}
      className="px-3 py-1 border rounded-md disabled:opacity-50"
    >
      Next
    </button>
  </div>
)}

        </div>
      </div>
    </div>
  );
}
