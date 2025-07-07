import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

interface WorkspaceSetupStepProps {
  workspaceName: string;
  onWorkspaceNameChange: (name: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function WorkspaceSetupStep({
  workspaceName,
  onWorkspaceNameChange,
  onNext,
  onBack,
}: WorkspaceSetupStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Card className="max-w-2xl mx-auto bg-card text-card-foreground">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mx-auto mb-4">
          {/* Animated Workspace SVG - purple/violet */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Central node */}
            <circle cx="32" cy="32" r="8" fill="#8B5CF6">
              <animate attributeName="r" values="8;10;8" dur="1.2s" repeatCount="indefinite" />
            </circle>
            {/* Orbiting nodes */}
            <circle cx="32" cy="14" r="4" fill="#A78BFA">
              <animate attributeName="cy" values="14;10;14" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="32" r="4" fill="#A78BFA">
              <animate attributeName="cx" values="50;54;50" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="32" cy="50" r="4" fill="#A78BFA">
              <animate attributeName="cy" values="50;54;50" dur="1.2s" begin="0.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="14" cy="32" r="4" fill="#A78BFA">
              <animate attributeName="cx" values="14;10;14" dur="1.2s" begin="0.6s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
        <CardTitle className="text-2xl">Create Workspace</CardTitle>
        <CardDescription>
          Set up your workspace for code graph analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="workspaceName" className="text-sm font-medium text-foreground">
              Workspace Name
            </Label>
            <Input
              id="workspaceName"
              value={workspaceName}
              onChange={(e) => onWorkspaceNameChange(e.target.value)}
              className="mt-2"
              required
            />
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="outline" type="button" onClick={onBack}>
              Back
            </Button>
            <Button className="px-8 bg-primary text-primary-foreground hover:bg-primary/90" type="submit">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 