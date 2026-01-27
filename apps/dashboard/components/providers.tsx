"use client";

import { SessionProvider } from "@/components/auth/session-provider";
import { ToastProvider } from "@while/ui";
import { Toaster } from "@while/ui";
import { ThemeProvider } from "next-themes";
import type { Session } from "next-auth";
import type { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  session: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <SessionProvider session={session}>
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
