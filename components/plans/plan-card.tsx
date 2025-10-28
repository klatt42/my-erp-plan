"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Calendar, Eye, Edit2, ArrowRight } from "lucide-react";
import type { EmergencyPlan } from "@/lib/types";
import { formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PlanCardProps {
  plan: EmergencyPlan;
  orgId: string;
}

const statusConfig = {
  draft: {
    bg: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    border: "border-gray-300 dark:border-gray-600",
    gradient: "from-gray-500/10 to-gray-500/5",
  },
  review: {
    bg: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    border: "border-yellow-300 dark:border-yellow-600",
    gradient: "from-yellow-500/10 to-yellow-500/5",
  },
  active: {
    bg: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    border: "border-green-300 dark:border-green-600",
    gradient: "from-green-500/10 to-green-500/5",
  },
  archived: {
    bg: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    border: "border-red-300 dark:border-red-600",
    gradient: "from-red-500/10 to-red-500/5",
  },
};

export function PlanCard({ plan, orgId }: PlanCardProps) {
  const statusStyle = statusConfig[plan.status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <Link href={`/${orgId}/plans/${plan.id}`}>
        <div
          className={cn(
            "relative overflow-hidden rounded-xl",
            "bg-gradient-to-br from-white/90 to-white/60",
            "dark:from-gray-800/90 dark:to-gray-900/60",
            "border border-gray-200/50 dark:border-gray-700/50",
            "shadow-glass backdrop-blur-xl",
            "transition-all duration-300",
            "hover:shadow-glass-lg hover:border-primary/30",
            "cursor-pointer h-full"
          )}
        >
          {/* Status gradient overlay */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            statusStyle.gradient
          )} />

          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-shimmer" />
          </div>

          <div className="relative p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md" />
                  <div className="relative rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                    Version {plan.version}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="truncate">{formatDate(plan.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  "border flex-shrink-0",
                  statusStyle.bg,
                  statusStyle.border
                )}
              >
                {plan.status}
              </div>
            </div>

            {/* Facility info from content_json */}
            {plan.content_json && typeof plan.content_json === 'object' && 'facilityName' in plan.content_json && (
              <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                <p className="text-sm font-medium text-muted-foreground truncate">
                  {plan.content_json.facilityName as string}
                </p>
                {('facilityType' in plan.content_json) && (
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize truncate">
                    {plan.content_json.facilityType as string} Facility
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors"
                asChild
              >
                <span className="flex items-center justify-center gap-2">
                  <Eye className="h-3.5 w-3.5" />
                  View
                </span>
              </Button>
              {plan.status === "draft" && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/${orgId}/plans/${plan.id}/edit`;
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              )}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
    </motion.div>
  );
}
