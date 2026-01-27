"use client";

import { cn } from "@/lib/utils";
import { navigation, footerLinks } from "@/lib/navigation";
import { X } from "lucide-react";
import Link from "next/link";
import { SidebarNav } from "./sidebar-nav";
import { useSidebar } from "./sidebar-context";

export function MobileNav() {
  const { mobileOpen, setMobileOpen } = useSidebar();

  if (!mobileOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden",
          "animate-in fade-in duration-200",
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 lg:hidden",
          "glass-elevated border-r border-glass-border",
          "animate-in slide-in-from-left duration-300",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-glass-border">
          <Link
            href="/"
            className="font-semibold text-xl tracking-tight"
            onClick={() => setMobileOpen(false)}
          >
            While
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-glass hover:bg-foreground/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav items={navigation} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-glass-border">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">v0.1.0</p>
        </div>
      </div>
    </>
  );
}
