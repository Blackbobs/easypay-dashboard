import axios from "axios";
import { useAuthStore } from "@/store/auth";

export const axiosConfig = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api/v1",
  withCredentials: true,
});

// Response interceptor
axiosConfig.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const message = error.response?.data?.message;

    // ✅ list of messages that should trigger refresh
    const refreshableMessages = [
      "Access token expired",
      "No access token provided",
      "Invalid access token",
    ];

    if (
      status === 401 &&
      message &&
      refreshableMessages.includes(message) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await axiosConfig.post("/users/refresh");
        return axiosConfig(originalRequest);
      } catch (refreshErr) {
        const { clearUser } = useAuthStore.getState();
        clearUser();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);
