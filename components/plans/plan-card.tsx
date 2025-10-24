import Link from "next/link";
import { FileText, Calendar, Tag } from "lucide-react";
import type { EmergencyPlan } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlanCardProps {
  plan: EmergencyPlan;
  orgId: string;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  review: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  archived: "bg-red-100 text-red-800",
};

export function PlanCard({ plan, orgId }: PlanCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Version {plan.version}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(plan.created_at)}
              </CardDescription>
            </div>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[plan.status]
            }`}
          >
            <Tag className="h-3 w-3 inline mr-1" />
            {plan.status}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${orgId}/plans/${plan.id}`}>View</Link>
          </Button>
          {plan.status === "draft" && (
            <Button size="sm" asChild>
              <Link href={`/${orgId}/plans/${plan.id}/edit`}>Edit</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
