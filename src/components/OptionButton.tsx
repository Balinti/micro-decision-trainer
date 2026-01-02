"use client";

import { cn } from "@/lib/utils";

interface OptionButtonProps {
  label: string;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export function OptionButton({
  label,
  isSelected,
  isDisabled,
  onClick,
}: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "w-full text-left p-4 rounded-lg border-2 transition-all",
        "hover:border-primary hover:bg-primary/5",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-gray-200 bg-white"
      )}
    >
      <span className="text-sm md:text-base">{label}</span>
    </button>
  );
}
