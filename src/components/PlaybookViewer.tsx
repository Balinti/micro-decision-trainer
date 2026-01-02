"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/CopyButton";
import { MessageSquare, Mail, Shield, AlertCircle } from "lucide-react";

interface PlaybookContent {
  talking_points: string[];
  followup_email: string;
  fallback_plan: string[];
  red_flags: string[];
}

interface PlaybookViewerProps {
  content: PlaybookContent;
  isPersonalized: boolean;
}

export function PlaybookViewer({ content, isPersonalized }: PlaybookViewerProps) {
  return (
    <div className="space-y-6">
      {/* Talking Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
            Talking Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {content.talking_points.map((point, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-primary font-bold">{index + 1}.</span>
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <CopyButton
              text={content.talking_points.join("\n\n")}
              label="Copy talking points"
            />
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-primary" />
            Follow-up Email Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPersonalized ? (
            <>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg font-sans">
                {content.followup_email}
              </pre>
              <div className="mt-4">
                <CopyButton
                  text={content.followup_email}
                  label="Copy email"
                />
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic">{content.followup_email}</p>
          )}
        </CardContent>
      </Card>

      {/* Fallback Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Fallback Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {content.fallback_plan.map((item, index) => (
              <li key={index} className="flex gap-2 text-gray-700">
                <span className="text-gray-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Red Flags */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-red-700">
            <AlertCircle className="h-5 w-5" />
            Red Flags to Watch For
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {content.red_flags.map((flag, index) => (
              <li key={index} className="flex gap-2 text-gray-700">
                <span className="text-red-400">!</span>
                {flag}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
