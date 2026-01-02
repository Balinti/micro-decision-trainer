import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/scoring/roiModel";

interface RiskFeedback {
  risk_key: string;
  label: string;
  typical_downside: {
    min: number;
    max: number;
  };
  better_default: string;
}

interface RiskFeedbackListProps {
  risks: RiskFeedback[];
}

export function RiskFeedbackList({ risks }: RiskFeedbackListProps) {
  if (risks.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <p className="text-green-700">
            No major risks identified. You navigated the conversation well.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {risks.map((risk) => (
        <Card key={risk.risk_key} className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              {risk.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700 mb-2">
              Typical downside: {formatCurrency(risk.typical_downside.min)} -{" "}
              {formatCurrency(risk.typical_downside.max)}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Better approach:</strong> {risk.better_default}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
