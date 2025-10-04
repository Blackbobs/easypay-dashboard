import { TransactionsResponse } from "@/interface/transaction";
import { axiosConfig } from "@/utils/axios-config";

export const fetchRecentTransactions = async () => {
  try {
    const response = await axiosConfig.get("/transactions/recent");
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchAllTransaction = async (page = 1, limit = 50) => {
  try {
    const response = await axiosConfig.get<TransactionsResponse>(
      `/transactions?page=${page}&limit=${limit}`
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchTransactionById = async (id: string) => {
  const response = await axiosConfig.get(`/transactions/${id}`);
  console.log(response);
  return response.data;
};
export const updateTransactionStatus = async (id: string, status: string) => {
  const res = await axiosConfig.patch(`/transactions/${id}`, { status });
  return res.data;
};

export const deleteTransaction = async (id: string) => {
  const response = await axiosConfig.delete(`/transactions/${id}`);
  return response.data;
};

export const searchTransactions = async (query: string) => {
  try {
    const response = await axiosConfig.get(`/transactions/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error("Error searching transactions:", error);
    throw error;
  }
};