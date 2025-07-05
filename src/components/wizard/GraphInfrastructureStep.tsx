import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

interface GraphInfrastructureStepProps {
  graphDomain: string;
  onNext: () => void;
  onBack: () => void;
}

export function GraphInfrastructureStep({
  graphDomain,
  onNext,
  onBack,
}: GraphInfrastructureStepProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mx-auto mb-4">
          {/* Animated Knowledge Graph SVG */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Edges */}
            <line x1="32" y1="12" x2="12" y2="32" stroke="#60A5FA" strokeWidth="2" />
            <line x1="32" y1="12" x2="52" y2="32" stroke="#60A5FA" strokeWidth="2" />
            <line x1="12" y1="32" x2="32" y2="52" stroke="#60A5FA" strokeWidth="2" />
            <line x1="52" y1="32" x2="32" y2="52" stroke="#60A5FA" strokeWidth="2" />
            {/* Nodes with animation */}
            <circle cx="32" cy="12" r="6" fill="#2563EB">
              <animate attributeName="r" values="6;8;6" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="12" cy="32" r="5" fill="#3B82F6">
              <animate attributeName="r" values="5;7;5" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
            </circle>
            <circle cx="52" cy="32" r="5" fill="#3B82F6">
              <animate attributeName="r" values="5;7;5" dur="1.2s" begin="0.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="32" cy="52" r="5" fill="#60A5FA">
              <animate attributeName="r" values="5;7;5" dur="1.2s" begin="0.9s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
        <CardTitle className="text-2xl">Creating Graph Infrastructure</CardTitle>
        <CardDescription>
          Your graph infrastructure domain will be:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="graphDomain" className="text-sm font-medium text-gray-700">
            Graph Domain
          </Label>
          <Input
            id="graphDomain"
            value={`${graphDomain}.sphinx.chat`}
            readOnly
            className="mt-2 bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div className="flex justify-between pt-4">
          <Button variant="outline" type="button" onClick={onBack}>
            Back
          </Button>
          <Button className="px-8 bg-green-600 hover:bg-green-700" type="button" onClick={onNext}>
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 