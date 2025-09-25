import { axiosConfig } from "@/utils/axios-config"

export const login = async (data: {email: string; password: string}) => {
        const response = await axiosConfig.post("/users/signin", data)
        return response.data
}