import { axiosConfig } from "@/utils/axios-config";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCurrentUser = () => {
    try {
        const response = useQuery({
            queryKey: ["user"],
            queryFn: async () => {
              const { data } = await axiosConfig.get("/users/me");
              return data.data;
            },
            retry: false,
          });
          return response
    } catch {
        toast.error("Please login to access the dashboard")
        return null
    }
 
};
