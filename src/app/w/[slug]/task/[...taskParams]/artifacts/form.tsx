"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Artifact, FormContent, Option } from "@/lib/chat";

// Artifact Components
export function FormArtifact({
  messageId,
  artifact,
  onAction,
}: {
  messageId: string;
  artifact: Artifact;
  onAction: (messageId: string, action: Option, webhook: string) => void;
}) {
  const content = artifact.content as FormContent;

  const handleSubmit = (action: Option) => {
    onAction(messageId, action, content.webhook);
  };

  return (
    <Card className="p-4 bg-card border rounded-lg">
      <p className="text-sm font-medium mb-3">{content.actionText}</p>
      <div className="space-y-2">
        {content.options.map((option, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleSubmit(option)}
            className="w-full justify-start"
          >
            {option.optionLabel}
          </Button>
        ))}
      </div>
    </Card>
  );
}
