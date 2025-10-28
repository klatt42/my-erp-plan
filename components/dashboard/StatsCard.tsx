"use client";

import { motion } from "framer-motion";
import { FileText, Users, Package, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const iconMap = {
  FileText,
  Users,
  Package,
  AlertCircle,
};

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof iconMap;
  href: string;
  trend?: {
    value: number;
    label: string;
  };
  index: number;
}

export function StatsCard({ title, value, icon: iconName, href, trend, index }: StatsCardProps) {
  const Icon = iconMap[iconName];
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="group"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-xl",
            "bg-gradient-to-br from-white/90 to-white/60",
            "dark:from-gray-800/90 dark:to-gray-900/60",
            "border border-gray-200/50 dark:border-gray-700/50",
            "shadow-glass backdrop-blur-xl",
            "transition-all duration-300",
            "hover:shadow-glass-lg hover:border-primary/30",
            "cursor-pointer"
          )}
        >
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-shimmer" />
          </div>

          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {title}
              </h3>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                <div className="relative rounded-full bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Value */}
            <div className="space-y-2">
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-bold tracking-tight"
              >
                {value}
              </motion.div>

              {/* Trend indicator */}
              {trend && (
                <div className="flex items-center gap-1 text-xs">
                  <span
                    className={cn(
                      "font-medium",
                      trend.value > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {trend.value > 0 ? "+" : ""}
                    {trend.value}%
                  </span>
                  <span className="text-muted-foreground">{trend.label}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </motion.div>
    </Link>
  );
}
