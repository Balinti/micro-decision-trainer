"use client";

import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Action {
  id: string;
  type: string;
  title: string;
  status: "todo" | "done";
  due_date: string | null;
}

interface ActionChecklistProps {
  actions: Action[];
  onToggle: (actionId: string, newStatus: "todo" | "done") => void;
  onAdd: (title: string, type: string) => void;
  onDelete: (actionId: string) => void;
}

export function ActionChecklist({
  actions,
  onToggle,
  onAdd,
  onDelete,
}: ActionChecklistProps) {
  const [newAction, setNewAction] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newAction.trim()) {
      onAdd(newAction.trim(), "custom");
      setNewAction("");
      setIsAdding(false);
    }
  };

  const todoActions = actions.filter((a) => a.status === "todo");
  const doneActions = actions.filter((a) => a.status === "done");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Action Items</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="New action item..."
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={!newAction.trim()}>
              Add
            </Button>
          </div>
        )}

        {todoActions.length === 0 && doneActions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No action items yet. Add some to track your preparation.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Todo items */}
            {todoActions.length > 0 && (
              <div className="space-y-2">
                {todoActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => onToggle(action.id, "done")}
                    />
                    <span className="flex-1 text-sm">{action.title}</span>
                    <button
                      onClick={() => onDelete(action.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Done items */}
            {doneActions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 font-medium">Completed</p>
                {doneActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-green-50"
                  >
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => onToggle(action.id, "todo")}
                    />
                    <span className="flex-1 text-sm line-through text-gray-500">
                      {action.title}
                    </span>
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
