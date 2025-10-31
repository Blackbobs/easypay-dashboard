import { axiosConfig } from "@/utils/axios-config";

export interface Admin {
  _id: string;
  username: string;
  email: string;
  college: string;
  department: string;
  dueType: string;
  totalAmountAvailable: number;
  receiptName: string;
  createdAt: string;
}

export interface SetAdminTotalAmountRequest {
  adminId: string;
  totalAmountAvailable: number;
}

export interface SetAdminTotalAmountResponse {
  data: {
    username: string;
    email: string;
    college: string;
    department: string;
    dueType: string;
    totalAmountAvailable: number;
  };
  message: string;
  success: boolean;
}

export interface GetAdminTotalAmountResponse {
  data: {
    college: string;
    department: string;
    dueType: string;
    totalAmountAvailable: number;
  };
  message: string;
  success: boolean;
}

export interface GetAllAdminsResponse {
  data: Admin[];
  message: string;
  success: boolean;
}

export const getAdminTotalAmount = async () => {
  try {
    const response = await axiosConfig.get<GetAdminTotalAmountResponse>(
      "/users/admin/total-amount"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching admin total amount:", error);
    throw error;
  }
};

export const getAllAdmins = async () => {
  try {
    const response = await axiosConfig.get<GetAllAdminsResponse>(
      "/users/admins"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all admins:", error);
    throw error;
  }
};

export const setAdminTotalAmount = async (data: SetAdminTotalAmountRequest) => {
  try {
    const response = await axiosConfig.post<SetAdminTotalAmountResponse>(
      "/users/admin/total-amount",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error setting admin total amount:", error);
    throw error;
  }
};
