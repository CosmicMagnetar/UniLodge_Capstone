"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/common/Footer";
import { LoadingPage } from "@/components/common/LoadingPage";
import { api } from "@/services/api";
import { User } from "@/types";

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const user = await api.getMe();
          setCurrentUser(user);
        } catch {
          localStorage.removeItem("token");
        }
      }
      setTimeout(() => setInitialLoading(false), 1000);
    };
    
    initializeApp();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    router.push('/');
  };

  const handleNavigate = (newPage: string) => {
    if (newPage === 'home') router.push('/');
    else if (newPage === 'login') router.push('/login');
    else if (newPage === 'guest-dashboard') router.push('/guest');
    else if (newPage === 'admin-dashboard') router.push('/admin');
    else if (newPage === 'warden-dashboard') router.push('/warden');
    else if (newPage === 'my-bookings') router.push('/bookings');
  };

  if (initialLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        user={currentUser as any}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <main className="flex-grow">{
        // We pass the user context dynamically to children using cloneElement is hard in app router.
        // The children are just server/client components. They can fetch on their own or we use a context context.
        // Actually since we want exact replica, we should just render children here!
        children
      }</main>
      <Footer />
    </div>
  );
}
