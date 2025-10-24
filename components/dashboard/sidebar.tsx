"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Users,
  Package,
  Settings,
  CreditCard,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/10">
      <div className="flex h-16 items-center px-6">
        <Link href={`/${orgId}`} className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">ME</span>
          </div>
          <span className="font-semibold">My-ERP-Plan</span>
        </Link>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const href = `/${orgId}${item.href}`;
          const isActive = pathname === href || pathname?.startsWith(href + "/");

          return (
            <Link
              key={item.name}
              href={href}
              className={cn(
                "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
