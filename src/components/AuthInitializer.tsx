"use client";

import { useEffect } from "react";
import { useAuthRTK } from "@/hooks/useAuthRTK";

export function AuthInitializer() {
  const { initializeAuth } = useAuthRTK();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return null; // This component doesn't render anything
}









