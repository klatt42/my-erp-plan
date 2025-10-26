"use client";

/**
 * Emergency Mode Client Component
 * Optimized for mobile use during active emergencies
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Phone,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  X,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ERPSection {
  title: string;
  content: string;
}

interface EmergencyModeClientProps {
  facilityName: string;
  contactSection?: ERPSection;
  scenarioSection?: ERPSection;
  evacuationSection?: ERPSection;
  planId: string;
  orgId: string;
}

interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export function EmergencyModeClient({
  facilityName,
  contactSection,
  scenarioSection,
  evacuationSection,
  planId,
  orgId,
}: EmergencyModeClientProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [emergencyStartTime, setEmergencyStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");

  // Extract action items from scenario section
  useEffect(() => {
    if (scenarioSection) {
      const lines = scenarioSection.content.split("\n");
      const items: ActionItem[] = [];

      console.log('[Emergency Mode] Scenario section content:', scenarioSection.content.substring(0, 500));

      for (const line of lines) {
        const trimmed = line.trim();

        // Match bullets (-, *, +) or numbered lists (1., 2., etc.)
        if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("+") || trimmed.match(/^\d+\./)) {
          const cleanText = trimmed
            .replace(/^[-*+]\s+/, "")
            .replace(/^\d+\.\s+/, "")
            .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
            .replace(/\*(.+?)\*/g, "$1")      // Remove italic
            .trim();

          if (cleanText.length > 5) { // Ignore very short items
            items.push({
              id: `action-${items.length}`,
              text: cleanText,
              completed: false,
            });

            if (items.length >= 15) break; // Limit to 15 critical actions
          }
        }
      }

      console.log('[Emergency Mode] Extracted action items:', items.length);
      setActionItems(items);
    } else {
      console.log('[Emergency Mode] No scenario section found');
    }
  }, [scenarioSection]);

  // Timer for elapsed time
  useEffect(() => {
    if (!emergencyStartTime) {
      const startTime = new Date();
      setEmergencyStartTime(startTime);
    }

    const interval = setInterval(() => {
      if (emergencyStartTime) {
        const now = new Date();
        const diff = now.getTime() - emergencyStartTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        setElapsedTime(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [emergencyStartTime]);

  const toggleAction = (id: string) => {
    setActionItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = actionItems.filter((item) => item.completed).length;
  const progress = actionItems.length > 0 ? (completedCount / actionItems.length) * 100 : 0;

  // Parse emergency contacts from table
  const parseContacts = (content: string) => {
    const contacts: Array<{ service: string; phone: string; company?: string }> = [];
    const lines = content.split("\n");
    let phoneColumnIndex = -1;
    let serviceColumnIndex = -1;
    let companyColumnIndex = -1;

    for (const line of lines) {
      if (line.includes("|") && !line.match(/^[-:|]+$/)) {
        const cells = line.split("|").map((c) => c.trim()).filter(Boolean);

        // Detect header row to find column indices
        if (cells[0]?.toLowerCase().includes("service") ||
            cells[0]?.toLowerCase().includes("role")) {
          serviceColumnIndex = 0;

          // Find phone column
          for (let i = 0; i < cells.length; i++) {
            const header = cells[i].toLowerCase();
            if (header.includes("phone") || header.includes("number") || header.includes("contact")) {
              phoneColumnIndex = i;
            }
            if (header.includes("company")) {
              companyColumnIndex = i;
            }
          }
          continue; // Skip header row
        }

        // Extract data rows
        if (serviceColumnIndex >= 0 && phoneColumnIndex >= 0 && cells.length > phoneColumnIndex) {
          const service = cells[serviceColumnIndex];
          const phone = cells[phoneColumnIndex];
          const company = companyColumnIndex >= 0 ? cells[companyColumnIndex] : undefined;

          // Skip empty rows or placeholder values
          if (service && phone &&
              !phone.includes("[") &&
              !phone.toLowerCase().includes("phone") &&
              phone.trim().length > 0) {

            // For support services, show company name instead of service category
            const displayName = company && company.trim().length > 0 && !company.includes("[")
              ? company
              : service;

            contacts.push({
              service: displayName,
              phone,
              company
            });
          }
        }
      }
    }

    return contacts.slice(0, 8); // Top 8 contacts
  };

  const emergencyContacts = contactSection ? parseContacts(contactSection.content) : [];

  return (
    <div className="min-h-screen bg-red-950 text-white">
      {/* Header */}
      <div className="bg-red-900 border-b border-red-800 sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
                EMERGENCY MODE
              </h1>
              <p className="text-sm text-red-200 mt-1">{facilityName}</p>
            </div>
            <Link href={`/${orgId}/plans/${planId}`}>
              <Button variant="outline" size="sm" className="bg-white text-red-900 border-white hover:bg-red-100 hover:text-red-900">
                <X className="h-4 w-4 mr-2" />
                Exit
              </Button>
            </Link>
          </div>

          {/* Timer and Progress */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-red-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-red-200 mb-1">
                <Clock className="h-4 w-4" />
                Elapsed Time
              </div>
              <div className="text-2xl font-mono font-bold">{elapsedTime}</div>
            </div>
            <div className="bg-red-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-red-200 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                Progress
              </div>
              <div className="text-2xl font-bold">
                {completedCount}/{actionItems.length}
                <span className="text-base ml-2 text-red-200">({Math.round(progress)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto p-4 space-y-4">
        {/* Emergency Contacts */}
        {emergencyContacts.length > 0 && (
          <Card className="border-2 border-red-600 bg-red-900">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Phone className="h-5 w-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {emergencyContacts.map((contact, index) => (
                  <a
                    key={index}
                    href={`tel:${contact.phone.replace(/[^0-9]/g, "")}`}
                    className="flex items-center justify-between p-3 bg-red-800 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <span className="font-medium text-white">{contact.service}</span>
                    <span className="text-xl font-bold text-yellow-400">{contact.phone}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Checklist */}
        {actionItems.length > 0 ? (
          <Card className="bg-red-900 border-red-700">
            <CardHeader>
              <CardTitle className="text-white text-xl">Critical Actions</CardTitle>
              <p className="text-sm text-red-200 mt-2">
                Tap each item to check it off as you complete it. Progress is tracked above.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleAction(item.id)}
                    className={`flex items-start gap-3 p-4 rounded-lg transition-all cursor-pointer hover:scale-[1.02] ${
                      item.completed
                        ? "bg-green-900/50 border-2 border-green-700"
                        : "bg-red-800 border-2 border-red-600 hover:border-red-400"
                    }`}
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={() => toggleAction(item.id)}
                      className="mt-1 h-6 w-6 border-2 pointer-events-none"
                    />
                    <label
                      htmlFor={item.id}
                      className={`flex-1 text-base cursor-pointer select-none ${
                        item.completed ? "line-through text-gray-400" : "text-white"
                      }`}
                    >
                      {item.text}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : scenarioSection && scenarioSection.content.trim().length > 0 ? (
          <Card className="bg-red-900 border-red-700">
            <CardHeader>
              <CardTitle className="text-white text-xl">Emergency Procedures</CardTitle>
              <p className="text-sm text-red-200 mt-2">
                Follow the procedures below. Refer to the full plan for complete details.
              </p>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert prose-sm max-w-none text-white [&>*]:text-white [&_p]:text-white [&_li]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_table]:text-white [&_th]:bg-red-800 [&_th]:text-white [&_th]:font-bold [&_td]:text-white [&_thead]:border-red-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {scenarioSection.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-red-900 border-red-700">
            <CardHeader>
              <CardTitle className="text-white text-xl">Emergency Procedures</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white text-center py-8">
                No emergency procedures found in this plan. Please refer to the complete plan document or call 911 for immediate assistance.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Evacuation Info */}
        {evacuationSection && evacuationSection.content.trim().length > 0 && (
          <Card className="bg-red-900 border-red-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-xl">
                <MapPin className="h-5 w-5" />
                Evacuation Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert prose-sm max-w-none text-white [&>*]:text-white [&_p]:text-white [&_li]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_table]:text-white [&_th]:bg-red-800 [&_th]:text-white [&_th]:font-bold [&_td]:text-white [&_thead]:border-red-700 [&_strong]:text-white">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {evacuationSection.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Alert */}
        <Alert className="bg-yellow-900 border-yellow-600 text-yellow-100">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This is a simplified emergency view. Refer to the
            complete plan for detailed procedures. Call 911 for life-threatening emergencies.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
