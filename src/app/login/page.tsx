"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Mail, Shield, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/login";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

interface FormData {
  email: string;
  password: string;
}

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({ mode: "onChange" });

  const router = useRouter();
  const { setUser } = useAuthStore();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data?.success) {
        setUser(data.data);
        toast.success(data.message || "Login successful 🎉");
        router.push("/");
      } else {
        toast.error(data?.message || "Login failed ❌");
      }
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error?.message || "Login failed ❌");
      }
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center px-4 my-10">
      <div className="w-full max-w-md">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-xl font-bold text-center text-gray-900">
              Admin <span className="text-secondary">(Secure Login)</span>
            </h1>
            <p className="text-gray-600 text-sm font-medium text-center">
              Access your admin dashboard
            </p>
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto my-2">
              <Shield className="w-10 h-10 text-secondary" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2 w-full border border-gray-300 rounded-full p-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition">
                <Mail className="text-gray-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@school.edu"
                  {...register("email", { required: "Email is required" })}
                  className="w-full focus:outline-none bg-transparent"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Password
              </label>
              <div className="flex items-center gap-2 w-full border border-gray-300 rounded-full p-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition">
                <ShieldCheck className="text-gray-500" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="w-full focus:outline-none bg-transparent"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <p className="text-center text-xs text-gray-600 mt-4">
              Forgot your password?{" "}
              <Link href={"#!"} className="text-primary">
                Contact IT support
              </Link>
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || mutation.isPending}
              className="w-full flex items-center justify-center bg-primary text-white py-3 rounded-full my-5 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Signing
                  In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
