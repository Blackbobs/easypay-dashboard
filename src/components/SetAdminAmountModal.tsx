"use client";

import { useState } from "react";
import { X, Loader2, User, Search } from "lucide-react";
import { useSetAdminTotalAmount, useAllAdmins } from "@/hooks/useUser";

interface SetAdminAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SetAdminAmountModal({
  isOpen,
  onClose,
}: SetAdminAmountModalProps) {
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");
  const [totalAmountAvailable, setTotalAmountAvailable] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const setAdminAmountMutation = useSetAdminTotalAmount();
  const { data: admins = [], isLoading: adminsLoading } = useAllAdmins();

  if (!isOpen) return null;

  // Filter admins based on search term
  const filteredAdmins = admins.filter((admin) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      admin.username.toLowerCase().includes(searchLower) ||
      admin.email.toLowerCase().includes(searchLower) ||
      admin.college?.toLowerCase().includes(searchLower) ||
      admin.department?.toLowerCase().includes(searchLower) ||
      admin.dueType?.toLowerCase().includes(searchLower)
    );
  });

  const selectedAdmin = admins.find((admin) => admin._id === selectedAdminId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAdminId || !totalAmountAvailable) {
      return;
    }

    const amount = parseFloat(totalAmountAvailable);
    if (isNaN(amount) || amount < 0) {
      return;
    }

    setAdminAmountMutation.mutate(
      {
        adminId: selectedAdminId,
        totalAmountAvailable: amount,
      },
      {
        onSuccess: () => {
          // Reset form
          setSelectedAdminId("");
          setTotalAmountAvailable("");
          setSearchTerm("");
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    if (!setAdminAmountMutation.isPending) {
      setSelectedAdminId("");
      setTotalAmountAvailable("");
      setSearchTerm("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl font-bold text-blue-600">₦</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Set Admin Total Amount
                </h3>
                <p className="text-sm text-gray-600">
                  Select an admin and set their total amount
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={setAdminAmountMutation.isPending}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, email, college, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={setAdminAmountMutation.isPending}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors duration-200"
              />
            </div>
          </div>
        </div>

        {/* Admin List */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 max-h-60">
          {adminsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading admins...</span>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchTerm
                  ? "No admins found matching your search"
                  : "No admins available"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAdmins.map((admin) => (
                <div
                  key={admin._id}
                  onClick={() => setSelectedAdminId(admin._id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedAdminId === admin._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {admin.username}
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                          {admin.dueType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                      <div className="flex gap-2 mt-1">
                        {admin.college && (
                          <span className="text-xs text-gray-500">
                            College: {admin.college}
                          </span>
                        )}
                        {admin.department && (
                          <span className="text-xs text-gray-500">
                            Dept: {admin.department}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ₦{admin.totalAmountAvailable?.toLocaleString() || "0"}
                      </p>
                      <p className="text-xs text-gray-500">Current Amount</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 border-t border-gray-200 space-y-4"
        >
          {/* Selected Admin Info */}
          {selectedAdmin && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900">
                Setting amount for: {selectedAdmin.username}
              </p>
              <p className="text-xs text-blue-700">{selectedAdmin.email}</p>
            </div>
          )}

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Amount Available <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={totalAmountAvailable}
              onChange={(e) => setTotalAmountAvailable(e.target.value)}
              disabled={setAdminAmountMutation.isPending || !selectedAdminId}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-700 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors duration-200"
              placeholder={
                selectedAdminId ? "Enter total amount" : "Select an admin first"
              }
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={setAdminAmountMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={setAdminAmountMutation.isPending || !selectedAdminId}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {setAdminAmountMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting...
                </>
              ) : (
                <>
                  <span className="font-bold">₦</span>
                  Set Amount
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
