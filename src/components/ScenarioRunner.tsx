"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { OptionButton } from "@/components/OptionButton";
import { LoadingState } from "@/components/LoadingState";
import { trackOptionSelected } from "@/lib/analytics/events";

interface Option {
  option_key: string;
  label: string;
}

interface Node {
  node_key: string;
  step_index: number;
  context: string;
  manager_line: string;
  options: Option[];
  is_terminal?: boolean;
}

interface ScenarioRunnerProps {
  sessionId: string;
  scenarioTitle: string;
  initialNode: Node;
  userId: string;
  totalSteps?: number;
}

export function ScenarioRunner({
  sessionId,
  scenarioTitle,
  initialNode,
  userId,
  totalSteps = 6,
}: ScenarioRunnerProps) {
  const router = useRouter();
  const [currentNode, setCurrentNode] = useState<Node>(initialNode);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const progress = (currentNode.step_index / totalSteps) * 100;

  const handleOptionSelect = async (optionKey: string) => {
    setSelectedOption(optionKey);
    setIsLoading(true);

    // Track analytics
    trackOptionSelected(
      userId,
      sessionId,
      currentNode.node_key,
      optionKey,
      currentNode.step_index
    );

    try {
      const response = await fetch(`/api/sessions/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option_key: optionKey }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      const data = await response.json();

      if (data.node.is_terminal) {
        // Complete the session
        await completeSession();
      } else {
        setCurrentNode(data.node);
        setSelectedOption(null);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to complete session");
      }

      const data = await response.json();
      router.push(data.playbook_url);
    } catch (error) {
      console.error("Error completing session:", error);
    }
  };

  if (isLoading && currentNode.is_terminal) {
    return (
      <div className="max-w-2xl mx-auto">
        <LoadingState message="Calculating your results..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-2">{scenarioTitle}</h1>
        <div className="flex items-center gap-3">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-sm text-gray-500">
            Step {currentNode.step_index}
          </span>
        </div>
      </div>

      {/* Context Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gray-600">Situation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{currentNode.context}</p>
        </CardContent>
      </Card>

      {/* Manager Line */}
      <Card className="mb-6 border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-blue-600">M</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Your Manager</p>
              <p className="text-lg">{currentNode.manager_line}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      {currentNode.options.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            How do you respond?
          </p>
          {currentNode.options.map((option) => (
            <OptionButton
              key={option.option_key}
              label={option.label}
              isSelected={selectedOption === option.option_key}
              isDisabled={isLoading}
              onClick={() => handleOptionSelect(option.option_key)}
            />
          ))}
        </div>
      )}

      {/* Terminal state - auto-complete */}
      {currentNode.is_terminal && currentNode.options.length === 0 && (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            The conversation has reached its conclusion.
          </p>
          <Button onClick={completeSession} disabled={isLoading}>
            {isLoading ? "Processing..." : "See Your Results"}
          </Button>
        </div>
      )}
    </div>
  );
}
