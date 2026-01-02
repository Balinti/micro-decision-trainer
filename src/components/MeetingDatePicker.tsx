"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { daysUntil } from "@/lib/utils/time";

interface MeetingDatePickerProps {
  currentDate: string | null;
  onSave: (date: string | null) => void;
  isLoading?: boolean;
}

export function MeetingDatePicker({
  currentDate,
  onSave,
  isLoading = false,
}: MeetingDatePickerProps) {
  const [date, setDate] = useState(currentDate || "");
  const [isEditing, setIsEditing] = useState(!currentDate);

  const handleSave = () => {
    onSave(date || null);
    setIsEditing(false);
  };

  const handleClear = () => {
    setDate("");
    onSave(null);
    setIsEditing(false);
  };

  const days = date ? daysUntil(date) : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Meeting
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isEditing && currentDate ? (
          <div>
            <p className="text-2xl font-bold mb-1">
              {format(new Date(currentDate), "MMMM d, yyyy")}
            </p>
            {days !== null && (
              <p className="text-gray-600 mb-4">
                {days === 0
                  ? "Today!"
                  : days === 1
                  ? "Tomorrow"
                  : days > 0
                  ? `${days} days away`
                  : "Date has passed"}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Change Date
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-date">
                When is your compensation conversation?
              </Label>
              <Input
                id="meeting-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
              {currentDate && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="ghost" onClick={handleClear}>
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
