"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { JsonTextarea } from "@/components/JsonTextarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateScenarioGraph } from "@/lib/validators/scenario";
import { toast } from "@/components/ui/use-toast";

interface ScenarioData {
  slug: string;
  title: string;
  description: string;
  difficulty: number;
  estimated_minutes: number;
  is_published: boolean;
  is_pro_only: boolean;
}

interface NodeData {
  node_key: string;
  step_index: number;
  context: string;
  manager_line: string;
  options_json: any[];
  scoring_json: any;
  is_terminal: boolean;
}

interface AdminScenarioEditorProps {
  scenario?: ScenarioData;
  nodes?: NodeData[];
  scenarioId?: string;
  isNew?: boolean;
}

export function AdminScenarioEditor({
  scenario: initialScenario,
  nodes: initialNodes,
  scenarioId,
  isNew = false,
}: AdminScenarioEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [scenario, setScenario] = useState<ScenarioData>(
    initialScenario || {
      slug: "",
      title: "",
      description: "",
      difficulty: 2,
      estimated_minutes: 4,
      is_published: false,
      is_pro_only: true,
    }
  );

  const [nodesJson, setNodesJson] = useState(
    JSON.stringify(initialNodes || [], null, 2)
  );

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleScenarioChange = (field: keyof ScenarioData, value: any) => {
    setScenario((prev) => ({ ...prev, [field]: value }));
  };

  const validateNodes = () => {
    try {
      const nodes = JSON.parse(nodesJson);
      if (!Array.isArray(nodes)) {
        setValidationErrors(["Nodes must be an array"]);
        return false;
      }

      const { valid, errors } = validateScenarioGraph(nodes);
      setValidationErrors(errors);
      return valid;
    } catch (e) {
      setValidationErrors(["Invalid JSON format"]);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateNodes()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const nodes = JSON.parse(nodesJson);
      const payload = { scenario, nodes };

      const url = isNew
        ? "/api/admin/scenarios"
        : `/api/admin/scenarios/${scenarioId}`;
      const method = isNew ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save scenario");
      }

      toast({
        title: "Success",
        description: isNew
          ? "Scenario created successfully"
          : "Scenario updated successfully",
      });

      router.push("/admin/scenarios");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scenario Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={scenario.slug}
                onChange={(e) => handleScenarioChange("slug", e.target.value)}
                placeholder="budget-pushback"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={scenario.title}
                onChange={(e) => handleScenarioChange("title", e.target.value)}
                placeholder="Budget Pushback"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={scenario.description}
              onChange={(e) =>
                handleScenarioChange("description", e.target.value)
              }
              placeholder="Handle 'budget is tight' without conceding too early."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty (1-5)</Label>
              <Select
                value={String(scenario.difficulty)}
                onValueChange={(value) =>
                  handleScenarioChange("difficulty", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} -{" "}
                      {["", "Easy", "Easy-Medium", "Medium", "Medium-Hard", "Hard"][d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_minutes">Estimated Minutes</Label>
              <Input
                id="estimated_minutes"
                type="number"
                min={1}
                max={30}
                value={scenario.estimated_minutes}
                onChange={(e) =>
                  handleScenarioChange(
                    "estimated_minutes",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_published"
                checked={scenario.is_published}
                onCheckedChange={(checked) =>
                  handleScenarioChange("is_published", checked)
                }
              />
              <Label htmlFor="is_published">Published</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_pro_only"
                checked={scenario.is_pro_only}
                onCheckedChange={(checked) =>
                  handleScenarioChange("is_pro_only", checked)
                }
              />
              <Label htmlFor="is_pro_only">Pro Only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nodes JSON Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Scenario Nodes (JSON)</CardTitle>
        </CardHeader>
        <CardContent>
          <JsonTextarea
            value={nodesJson}
            onChange={setNodesJson}
            onValidate={validateNodes}
            errors={validationErrors}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Saving..." : isNew ? "Create Scenario" : "Save Changes"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/scenarios")}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
