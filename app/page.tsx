'use client';

import { useAuthStore } from "@/lib/store/useAuthStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { user, loading, checkAuth } = useAuthStore();

  // Check if user is logged in
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect based on authentication status
  useEffect(() => {
    if (!loading) {
      if (user) {
        // If user is logged in, redirect to dashboard
        router.replace('/dashboard');
      } else {
        // If user is not logged in, redirect to login
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          Loading...
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold text-center">Link Saver</h1>
          <p className="text-xl text-center max-w-md">
            Save and organize your favorite links in one place
          </p>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/login"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
          >
            Register
          </Link>
        </div>

        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold mb-4">Features</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Save links with custom titles and descriptions</li>
            <li>Organize links into collections</li>
            <li>Search and filter your saved links</li>
            <li>Access your links from anywhere</li>
          </ul>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Link Saver. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
