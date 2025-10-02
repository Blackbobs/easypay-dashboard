import { axiosConfig } from "@/utils/axios-config";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  username: string;
  college: string;
  department: string;
  role: "admin" | "superAdmin";
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
        toast.error("Please login to access the dashboard");
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return response;
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