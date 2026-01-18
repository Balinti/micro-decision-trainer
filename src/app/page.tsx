"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { decisions, Decision } from "@/data/decisions";

type GameState = "menu" | "playing" | "feedback" | "results";

interface SessionResult {
  decision: Decision;
  chosenOption: string;
  timeSpent: number;
  timedOut: boolean;
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [sessionDecisions, setSessionDecisions] = useState<Decision[]>([]);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [sessionLength, setSessionLength] = useState(5);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentDecision = sessionDecisions[currentDecisionIndex];

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startSession = useCallback(() => {
    let filteredDecisions = decisions;
    if (difficulty !== "all") {
      filteredDecisions = decisions.filter(d => d.difficulty === difficulty);
    }

    const shuffled = shuffleArray(filteredDecisions);
    const selected = shuffled.slice(0, Math.min(sessionLength, shuffled.length));

    setSessionDecisions(selected);
    setResults([]);
    setCurrentDecisionIndex(0);
    setGameState("playing");
  }, [difficulty, sessionLength]);

  const handleOptionSelect = useCallback((option: string) => {
    if (selectedOption !== null || gameState !== "playing") return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const timeSpent = (Date.now() - startTimeRef.current) / 1000;

    setSelectedOption(option);
    setResults(prev => [...prev, {
      decision: currentDecision,
      chosenOption: option,
      timeSpent,
      timedOut: false
    }]);
    setGameState("feedback");
  }, [selectedOption, gameState, currentDecision]);

  const handleTimeout = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const timeSpent = currentDecision.timeLimit;

    setTimedOut(true);
    setResults(prev => [...prev, {
      decision: currentDecision,
      chosenOption: "No decision",
      timeSpent,
      timedOut: true
    }]);
    setGameState("feedback");
  }, [currentDecision]);

  const nextDecision = useCallback(() => {
    setSelectedOption(null);
    setTimedOut(false);

    if (currentDecisionIndex >= sessionDecisions.length - 1) {
      setGameState("results");
    } else {
      setCurrentDecisionIndex(prev => prev + 1);
      setGameState("playing");
    }
  }, [currentDecisionIndex, sessionDecisions.length]);

  useEffect(() => {
    if (gameState === "playing" && currentDecision) {
      setTimeRemaining(currentDecision.timeLimit);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [gameState, currentDecision, handleTimeout]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState === "playing" && currentDecision) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= currentDecision.options.length) {
          handleOptionSelect(currentDecision.options[num - 1]);
        }
      } else if (gameState === "feedback") {
        if (e.key === "Enter" || e.key === " ") {
          nextDecision();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, currentDecision, handleOptionSelect, nextDecision]);

  const getTimerColor = () => {
    if (!currentDecision) return "bg-green-500";
    const percentage = timeRemaining / currentDecision.timeLimit;
    if (percentage > 0.5) return "bg-green-500";
    if (percentage > 0.25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getAverageTime = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, r) => sum + r.timeSpent, 0);
    return (total / results.length).toFixed(1);
  };

  const getDecisionRate = () => {
    if (results.length === 0) return 0;
    const decided = results.filter(r => !r.timedOut).length;
    return Math.round((decided / results.length) * 100);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "text-green-400";
      case "medium": return "text-yellow-400";
      case "hard": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  if (gameState === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <main className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Micro Decision Trainer
            </h1>
            <p className="text-purple-200 text-lg">
              Train your brain to decide faster
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Difficulty
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["all", "easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      difficulty === d
                        ? "bg-purple-600 text-white"
                        : "bg-white/10 text-purple-200 hover:bg-white/20"
                    }`}
                    aria-pressed={difficulty === d}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Session Length: {sessionLength} decisions
              </label>
              <input
                type="range"
                min="3"
                max="15"
                value={sessionLength}
                onChange={(e) => setSessionLength(parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                aria-label="Number of decisions in session"
              />
              <div className="flex justify-between text-xs text-purple-300 mt-1">
                <span>Quick (3)</span>
                <span>Long (15)</span>
              </div>
            </div>

            <button
              onClick={startSession}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Start Training
            </button>

            <div className="text-center text-purple-300 text-sm">
              <p>Press number keys (1-4) for quick selection</p>
              <p>Press Enter or Space to continue</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (gameState === "playing" && currentDecision) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <main className="max-w-lg w-full">
          <div className="mb-4 flex justify-between items-center text-purple-200">
            <span className="text-sm">
              Decision {currentDecisionIndex + 1} of {sessionDecisions.length}
            </span>
            <span className={`text-sm font-medium ${getDifficultyColor(currentDecision.difficulty)}`}>
              {currentDecision.category}
            </span>
          </div>

          <div className="w-full bg-white/20 rounded-full h-3 mb-6 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${getTimerColor()}`}
              style={{ width: `${(timeRemaining / currentDecision.timeLimit) * 100}%` }}
              role="progressbar"
              aria-valuenow={timeRemaining}
              aria-valuemin={0}
              aria-valuemax={currentDecision.timeLimit}
              aria-label={`${timeRemaining} seconds remaining`}
            />
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <p className="text-white text-xl leading-relaxed">
              {currentDecision.scenario}
            </p>
          </div>

          <div className="space-y-3" role="group" aria-label="Decision options">
            {currentDecision.options.map((option, index) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className="w-full py-4 px-6 bg-white/10 hover:bg-purple-600/50 text-white text-left rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-purple-400 flex items-center gap-4"
              >
                <span className="w-8 h-8 rounded-full bg-purple-600/50 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-lg">{option}</span>
              </button>
            ))}
          </div>

          <div className="text-center mt-6 text-5xl font-bold text-white">
            {timeRemaining}
          </div>
        </main>
      </div>
    );
  }

  if (gameState === "feedback") {
    const lastResult = results[results.length - 1];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <main className="max-w-md w-full text-center">
          <div className={`text-6xl mb-6 ${timedOut ? "animate-pulse" : "animate-bounce"}`}>
            {timedOut ? "\u23F1\uFE0F" : "\u2713"}
          </div>

          <h2 className={`text-3xl font-bold mb-4 ${timedOut ? "text-yellow-400" : "text-green-400"}`}>
            {timedOut ? "Time's Up!" : "Decision Made!"}
          </h2>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
            {!timedOut && lastResult && (
              <>
                <p className="text-purple-200 mb-2">You chose:</p>
                <p className="text-white text-xl font-semibold mb-4">
                  {lastResult.chosenOption}
                </p>
                <p className="text-purple-200">
                  Decision time: <span className="text-white font-medium">{lastResult.timeSpent.toFixed(1)}s</span>
                </p>
              </>
            )}
            {timedOut && (
              <p className="text-yellow-200">
                Remember: A quick decision is often better than no decision!
              </p>
            )}
          </div>

          <button
            onClick={nextDecision}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {currentDecisionIndex >= sessionDecisions.length - 1 ? "View Results" : "Next Decision"}
          </button>

          <p className="text-purple-300 text-sm mt-4">
            Press Enter or Space to continue
          </p>
        </main>
      </div>
    );
  }

  if (gameState === "results") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <main className="max-w-lg w-full">
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            Session Complete!
          </h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{getDecisionRate()}%</p>
              <p className="text-purple-200 text-sm">Decision Rate</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-400">{getAverageTime()}s</p>
              <p className="text-purple-200 text-sm">Avg. Time</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-purple-400">{results.length}</p>
              <p className="text-purple-200 text-sm">Decisions</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 max-h-80 overflow-y-auto">
            <h3 className="text-white font-semibold mb-3">Your Decisions</h3>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${result.timedOut ? "bg-yellow-500/20" : "bg-green-500/20"}`}
                >
                  <p className="text-white text-sm mb-1 line-clamp-2">
                    {result.decision.scenario.substring(0, 80)}...
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className={result.timedOut ? "text-yellow-300" : "text-green-300"}>
                      {result.chosenOption}
                    </span>
                    <span className="text-purple-300">
                      {result.timeSpent.toFixed(1)}s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={startSession}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              Train Again
            </button>
            <button
              onClick={() => setGameState("menu")}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-purple-200 font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              Back to Menu
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
