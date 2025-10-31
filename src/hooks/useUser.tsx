// hooks/useUser.ts
import { axiosConfig } from "@/utils/axios-config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  getAdminTotalAmount,
  setAdminTotalAmount,
  getAllAdmins,
  SetAdminTotalAmountRequest,
} from "@/lib/admin-amount";

export interface User {
  id: string;
  email: string;
  username: string;
  college: string;
  department: string;
  role: "admin" | "superAdmin" | "user";
  totalAmountAvailable?: number;
}

interface UserResponse {
  data: User;
  message: string;
  success: boolean;
}

export const useCurrentUser = () => {
  const response = useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<User | null> => {
      try {
        const { data } = await axiosConfig.get<UserResponse>("/users/me");
        return data.data;
      } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return response;
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  // const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosConfig.post("/users/logout");
      return response.data;
    },
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();

      // Force a hard redirect to ensure cookies are cleared
      window.location.href = "/login";
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");

      // Even if API call fails, clear frontend state and redirect
      queryClient.clear();
      window.location.href = "/login";
    },
  });
};

// Role-based helper hooks
export const useUserRole = () => {
  const { data: user } = useCurrentUser();
  return user?.role || null;
};

export const useIsSuperAdmin = () => {
  const role = useUserRole();
  return role === "superAdmin";
};

export const useIsAdmin = () => {
  const role = useUserRole();
  return role === "admin" || role === "superAdmin";
};

export const useCanPerformActions = () => {
  const role = useUserRole();
  return role === "superAdmin";
};

export const useUserPermissions = () => {
  const role = useUserRole();

  return {
    canView: role === "admin" || role === "superAdmin",
    canEdit: role === "superAdmin",
    canDelete: role === "superAdmin",
    canUpdateStatus: role === "superAdmin",
    isSuperAdmin: role === "superAdmin",
    isAdmin: role === "admin" || role === "superAdmin",
    role,
  };
};

// Hook for admins to get their total amount available
export const useAdminTotalAmount = () => {
  const role = useUserRole();
  // Only regular admins can view their total amount (not superAdmin)
  const isRegularAdmin = role === "admin";

  return useQuery({
    queryKey: ["adminTotalAmount"],
    queryFn: async () => {
      const response = await getAdminTotalAmount();
      return response.data;
    },
    enabled: isRegularAdmin ?? false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for superAdmin to get all admins
export const useAllAdmins = () => {
  const role = useUserRole();
  const isSuperAdmin = role === "superAdmin";

  return useQuery({
    queryKey: ["allAdmins"],
    queryFn: async () => {
      const response = await getAllAdmins();
      return response.data;
    },
    enabled: isSuperAdmin ?? false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for superAdmin to set admin total amount
export const useSetAdminTotalAmount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetAdminTotalAmountRequest) => setAdminTotalAmount(data),
    onSuccess: (response) => {
      toast.success(
        `Total amount set successfully for ${response.data.username}`
      );
      queryClient.invalidateQueries({ queryKey: ["adminTotalAmount"] });
      queryClient.invalidateQueries({ queryKey: ["allAdmins"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to set admin total amount";
      toast.error(errorMessage);
    },
  });
};
