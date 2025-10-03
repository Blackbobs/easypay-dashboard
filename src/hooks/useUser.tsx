// hooks/useUser.ts
import { axiosConfig } from "@/utils/axios-config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  username: string;
  college: string;
  department: string;
  role: "admin" | "superAdmin" | "user";
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