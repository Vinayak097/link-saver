'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface AuthInitializerProps {
  children: ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const { checkAuth } = useAuthStore();

  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}
