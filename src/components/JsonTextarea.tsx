"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onValidate?: () => boolean;
  errors?: string[];
  className?: string;
}

export function JsonTextarea({
  value,
  onChange,
  onValidate,
  errors = [],
  className,
}: JsonTextareaProps) {
  const [isValid, setIsValid] = useState(true);
  const [parseError, setParseError] = useState<string | null>(null);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
      setIsValid(true);
      setParseError(null);
    } catch (e: any) {
      setIsValid(false);
      setParseError(e.message);
    }
  };

  useEffect(() => {
    try {
      JSON.parse(value);
      setIsValid(true);
      setParseError(null);
    } catch (e: any) {
      setIsValid(false);
      setParseError(e.message);
    }
  }, [value]);

  const handleValidate = () => {
    if (onValidate) {
      const valid = onValidate();
      setIsValid(valid);
    }
  };

  return (
    <div className={className}>
      <div className="flex gap-2 mb-2">
        <Button type="button" variant="outline" size="sm" onClick={formatJson}>
          Format JSON
        </Button>
        {onValidate && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleValidate}
          >
            Validate
          </Button>
        )}
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "font-mono text-sm min-h-[400px]",
          !isValid && "border-red-500"
        )}
      />

      {/* Status and Errors */}
      <div className="mt-2 space-y-2">
        {isValid && errors.length === 0 && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            Valid JSON
          </div>
        )}

        {parseError && (
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {parseError}
          </div>
        )}

        {errors.length > 0 && (
          <div className="space-y-1">
            {errors.map((error, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-red-600 text-sm"
              >
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
