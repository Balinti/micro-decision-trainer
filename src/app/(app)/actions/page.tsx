"use client";

import { useState, useEffect } from "react";
import { ActionChecklist } from "@/components/ActionChecklist";
import { MeetingDatePicker } from "@/components/MeetingDatePicker";
import { LoadingState } from "@/components/LoadingState";
import { DEFAULT_ACTION_TEMPLATES } from "@/lib/validators/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface Action {
  id: string;
  type: string;
  title: string;
  status: "todo" | "done";
  due_date: string | null;
}

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([]);
  const [meetingDate, setMeetingDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch("/api/actions");
      if (response.ok) {
        const data = await response.json();
        setActions(data.items || []);
      }
    } catch (error) {
      console.error("Failed to load actions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (actionId: string, newStatus: "todo" | "done") => {
    // Optimistic update
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: newStatus } : a))
    );

    try {
      const response = await fetch(`/api/actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update action");
      }
    } catch (error) {
      // Revert on error
      setActions((prev) =>
        prev.map((a) =>
          a.id === actionId
            ? { ...a, status: newStatus === "todo" ? "done" : "todo" }
            : a
        )
      );
      toast({
        title: "Error",
        description: "Failed to update action",
        variant: "destructive",
      });
    }
  };

  const handleAdd = async (title: string, type: string) => {
    try {
      const response = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type }),
      });

      if (!response.ok) {
        throw new Error("Failed to add action");
      }

      const data = await response.json();
      setActions((prev) => [
        { id: data.id, title, type, status: "todo", due_date: null },
        ...prev,
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add action",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (actionId: string) => {
    const action = actions.find((a) => a.id === actionId);
    setActions((prev) => prev.filter((a) => a.id !== actionId));

    try {
      const response = await fetch(`/api/actions/${actionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete action");
      }
    } catch (error) {
      // Revert on error
      if (action) {
        setActions((prev) => [action, ...prev]);
      }
      toast({
        title: "Error",
        description: "Failed to delete action",
        variant: "destructive",
      });
    }
  };

  const handleSaveMeetingDate = async (date: string | null) => {
    setIsSaving(true);
    setMeetingDate(date);

    // In a full implementation, save to upcoming_events table
    toast({
      title: "Meeting date saved",
      description: date ? `Set for ${new Date(date).toLocaleDateString()}` : "Cleared",
    });

    setIsSaving(false);
  };

  const addSuggestedActions = () => {
    DEFAULT_ACTION_TEMPLATES.slice(0, 5).forEach((template) => {
      if (!actions.some((a) => a.type === template.type)) {
        handleAdd(template.title, template.type);
      }
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading your actions..." />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Action Plan</h1>
        <p className="text-gray-600">
          Track your preparation steps for your upcoming conversation.
        </p>
      </div>

      <div className="grid gap-6">
        <MeetingDatePicker
          currentDate={meetingDate}
          onSave={handleSaveMeetingDate}
          isLoading={isSaving}
        />

        <ActionChecklist
          actions={actions}
          onToggle={handleToggle}
          onAdd={handleAdd}
          onDelete={handleDelete}
        />

        {actions.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-600 mb-4">
                Get started with our recommended preparation steps.
              </p>
              <Button onClick={addSuggestedActions}>
                Add Suggested Actions
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
