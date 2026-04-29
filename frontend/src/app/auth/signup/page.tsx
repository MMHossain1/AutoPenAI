"use client";

import { useState } from "react";
import { AlertCircle, Eye, EyeOff, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/landing/Header";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const { register, login, error, isLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [matchError, setMatchError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMatchError("Passwords do not match");
      return;
    } else {
      setMatchError("");
    }

    try {
      await register({ username, password });
      await login({ username, password });
      router.push("/home");
    } catch {
      // error is already handled in useAuth
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col antialiased bg-[#f6f6f8] dark:bg-[#111621] text-[#111318] dark:text-white">
      {/* Full-page dot grid with radial fade */}
      <div className="pointer-events-none absolute inset-0 z-0 [background-image:radial-gradient(#d1d5db_1px,transparent_1px)] dark:[background-image:radial-gradient(#2d3748_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)]" />
      <Header showAuthActions={false} showNavigation={false} showThemeToggle={false} />

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 pt-28 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="w-full max-w-[440px] space-y-8">
          {/* Heading */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[#111318] dark:text-white">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-[#616e89] dark:text-[#94a3b8]">
              Sign up to start running security scans
            </p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-[#1a202c] shadow-sm ring-1 ring-[#dbdee6] dark:ring-[#2b3545] rounded-xl p-8">
            {/* Error Banner */}
            {(error || matchError) && (
              <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-100 dark:border-red-900/30 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                    {matchError ? "Passwords do not match" : "Registration failed"}
                  </h3>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {matchError || error}
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium leading-6 text-[#111318] dark:text-[#e2e8f0]"
                >
                  Username
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full rounded-lg border-0 py-2.5 pl-3 text-[#111318] dark:text-white shadow-sm ring-1 ring-inset ring-[#dbdee6] dark:ring-[#4a5568] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-[#2d3748] sm:text-sm sm:leading-6 outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-[#111318] dark:text-[#e2e8f0]"
                >
                  Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-[#111318] dark:text-white shadow-sm ring-1 ring-inset ring-[#dbdee6] dark:ring-[#4a5568] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-[#2d3748] sm:text-sm sm:leading-6 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#616e89] hover:text-[#111318] dark:text-[#94a3b8] dark:hover:text-white outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium leading-6 text-[#111318] dark:text-[#e2e8f0]"
                >
                  Confirm Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-lg border-0 py-2.5 pl-3 pr-10 text-[#111318] dark:text-white shadow-sm ring-1 ring-inset ring-[#dbdee6] dark:ring-[#4a5568] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:bg-[#2d3748] sm:text-sm sm:leading-6 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#616e89] hover:text-[#111318] dark:text-[#94a3b8] dark:hover:text-white outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all disabled:opacity-60"
              >
                <UserPlus size={18} />
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </div>

          {/* Footer link */}
          <p className="text-center text-sm text-[#616e89] dark:text-[#94a3b8]">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold leading-6 text-blue-600 hover:text-blue-500 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}