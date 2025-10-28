"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Users,
  Package,
  Settings,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  orgId: string;
}

const navigation = [
  { name: "Dashboard", href: "", icon: LayoutDashboard },
  { name: "Emergency Plans", href: "/plans", icon: FileText },
  { name: "Resources", href: "/resources", icon: Package },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Billing", href: "/billing", icon: CreditCard },
];

export function Sidebar({ orgId }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "hidden md:flex h-full flex-col",
        "border-r border-gray-200/50 dark:border-gray-700/50",
        "bg-gradient-to-b from-white/95 to-white/80",
        "dark:from-gray-900/95 dark:to-gray-900/80",
        "backdrop-blur-xl",
        "relative"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4">
        <Link href={`/${orgId}`} className="flex items-center space-x-2 overflow-hidden">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-primary/30 rounded-lg blur-md" />
            <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-lg whitespace-nowrap overflow-hidden"
              >
                My-ERP-Plan
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Collapse button */}
      <div className="px-4 pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full justify-center",
            "hover:bg-primary/10 hover:text-primary",
            "transition-colors"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
        {navigation.map((item) => {
          const href = `/${orgId}${item.href}`;
          const isActive = pathname === href || pathname?.startsWith(href + "/");

          return (
            <Link key={item.name} href={href}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  "relative group",
                  isActive
                    ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon with glow effect */}
                <div className="relative flex-shrink-0">
                  {isActive && (
                    <div className="absolute inset-0 bg-white/30 rounded blur-sm" />
                  )}
                  <item.icon className={cn("h-5 w-5 relative z-10")} />
                </div>

                {/* Label */}
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer gradient */}
      <div className="h-20 bg-gradient-to-t from-white/50 to-transparent dark:from-gray-900/50" />
    </motion.div>
  );
}
