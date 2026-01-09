"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { OptionButton } from "@/components/OptionButton";
import { TrialExpiredModal } from "@/components/TrialExpiredModal";
import type { Scenario } from "@/types/db";

const TRIAL_DURATION_SECONDS = 180; // 3 minutes
const TRIAL_STORAGE_KEY = "trial_progress";

interface TrialNode {
  node_key: string;
  step_index: number;
  context: string;
  manager_line: string;
  is_terminal: boolean;
  options: {
    option_key: string;
    label: string;
    next_node_key: string | null;
  }[];
}

interface PathEntry {
  node_key: string;
  option_key: string;
  answered_at: string;
}

interface TrialProgress {
  scenarioId: string;
  currentNodeKey: string;
  pathJson: PathEntry[];
  startedAt: string;
  remainingSeconds: number;
}

interface TrialScenarioRunnerProps {
  scenario: Pick<Scenario, "id" | "title" | "description">;
  nodes: Record<string, TrialNode>;
  totalSteps: number;
}

export function TrialScenarioRunner({
  scenario,
  nodes,
  totalSteps,
}: TrialScenarioRunnerProps) {
  const [currentNode, setCurrentNode] = useState<TrialNode>(nodes["start"]);
  const [pathJson, setPathJson] = useState<PathEntry[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(TRIAL_DURATION_SECONDS);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load saved progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(TRIAL_STORAGE_KEY);
    if (saved) {
      try {
        const progress: TrialProgress = JSON.parse(saved);
        // Only restore if it's the same scenario and not expired
        if (progress.scenarioId === scenario.id) {
          const startedAt = new Date(progress.startedAt);
          const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
          const remaining = TRIAL_DURATION_SECONDS - elapsed;

          if (remaining > 0 && nodes[progress.currentNodeKey]) {
            setCurrentNode(nodes[progress.currentNodeKey]);
            setPathJson(progress.pathJson);
            setRemainingSeconds(remaining);
          } else {
            // Trial expired, clear and show modal
            localStorage.removeItem(TRIAL_STORAGE_KEY);
            if (remaining <= 0) {
              setShowExpiredModal(true);
            }
          }
        }
      } catch {
        localStorage.removeItem(TRIAL_STORAGE_KEY);
      }
    } else {
      // New trial - save initial state
      saveProgress("start", [], TRIAL_DURATION_SECONDS);
    }
  }, [scenario.id, nodes]);

  // Save progress to localStorage
  const saveProgress = useCallback(
    (nodeKey: string, path: PathEntry[], seconds: number) => {
      const progress: TrialProgress = {
        scenarioId: scenario.id,
        currentNodeKey: nodeKey,
        pathJson: path,
        startedAt: new Date(Date.now() - (TRIAL_DURATION_SECONDS - seconds) * 1000).toISOString(),
        remainingSeconds: seconds,
      };
      localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(progress));
    },
    [scenario.id]
  );

  // Countdown timer
  useEffect(() => {
    if (showExpiredModal || currentNode.is_terminal) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowExpiredModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showExpiredModal, currentNode.is_terminal]);

  // Handle option selection
  const handleOptionSelect = (optionKey: string) => {
    if (isTransitioning || showExpiredModal) return;

    setSelectedOption(optionKey);
    setIsTransitioning(true);

    const option = currentNode.options.find((o) => o.option_key === optionKey);
    if (!option) return;

    // Add to path
    const newPath: PathEntry[] = [
      ...pathJson,
      {
        node_key: currentNode.node_key,
        option_key: optionKey,
        answered_at: new Date().toISOString(),
      },
    ];
    setPathJson(newPath);

    // Navigate to next node
    setTimeout(() => {
      if (option.next_node_key && nodes[option.next_node_key]) {
        const nextNode = nodes[option.next_node_key];
        setCurrentNode(nextNode);
        saveProgress(nextNode.node_key, newPath, remainingSeconds);
      } else {
        // Reached terminal - show modal to sign up to see results
        setShowExpiredModal(true);
      }
      setSelectedOption(null);
      setIsTransitioning(false);
    }, 300);
  };

  // Handle terminal state
  const handleSeeResults = () => {
    setShowExpiredModal(true);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer color based on remaining time
  const getTimerColor = () => {
    if (remainingSeconds <= 30) return "text-red-600";
    if (remainingSeconds <= 60) return "text-orange-500";
    return "text-gray-600";
  };

  const progress = (currentNode.step_index / totalSteps) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">{scenario.title}</h1>
          <div
            className={`font-mono text-lg font-semibold ${getTimerColor()}`}
          >
            {formatTime(remainingSeconds)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-sm text-gray-500">
            Step {currentNode.step_index}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Free trial - Sign up to save your progress
        </p>
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
      {currentNode.options.length > 0 && !currentNode.is_terminal && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            How do you respond?
          </p>
          {currentNode.options.map((option) => (
            <OptionButton
              key={option.option_key}
              label={option.label}
              isSelected={selectedOption === option.option_key}
              isDisabled={isTransitioning || showExpiredModal}
              onClick={() => handleOptionSelect(option.option_key)}
            />
          ))}
        </div>
      )}

      {/* Terminal state */}
      {currentNode.is_terminal && currentNode.options.length === 0 && (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            The conversation has reached its conclusion.
          </p>
          <button
            onClick={handleSeeResults}
            className="rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            See Your Results
          </button>
        </div>
      )}

      {/* Expired Modal */}
      <TrialExpiredModal
        isOpen={showExpiredModal}
        isCompleted={currentNode.is_terminal}
      />
    </div>
  );
}
