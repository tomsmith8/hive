import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GraphInfrastructureStepProps {
  graphDomain: string;
  status: "idle" | "pending" | "complete";
  onCreate: () => void;
  onComplete: () => void;
  onBack: () => void;
}

export function GraphInfrastructureStep({
  graphDomain,
  status,
  onCreate,
  onComplete,
  onBack,
}: GraphInfrastructureStepProps) {
  const isPending = status === "pending";
  // Countdown state for pending
  const [countdown, setCountdown] = useState(5);
  useEffect(() => {
    if (isPending) {
      setCountdown(5);
    }
  }, [isPending]);
  useEffect(() => {
    if (isPending && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isPending, countdown]);
  const canContinue = isPending && countdown === 0;
  return (
    <Card className="max-w-2xl mx-auto bg-card text-card-foreground">
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
        <AnimatePresence mode="wait">
          {!isPending ? (
            <motion.div
              key="title-creating"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CardTitle className="text-2xl">Creating Graph Infrastructure</CardTitle>
              <CardDescription>Your graph infrastructure domain will be:</CardDescription>
            </motion.div>
          ) : (
            <motion.div
              key="title-swarm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CardTitle className="text-2xl">Setting up Swarm</CardTitle>
              <CardDescription>Your swarm is being set up. This may take a few minutes.</CardDescription>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="graphDomain" className="text-sm font-medium text-foreground">
            Graph Domain
          </Label>
          <Input
            id="graphDomain"
            value={`${graphDomain}.sphinx.chat`}
            readOnly
            tabIndex={-1}
            className="mt-2 bg-muted cursor-not-allowed select-all focus:outline-none focus:ring-0 hover:bg-muted"
            style={{ pointerEvents: 'none' }}
          />
        </div>
        <div className="flex justify-between pt-4">
          {!isPending && (
            <Button variant="outline" type="button" onClick={onBack}>
              Back
            </Button>
          )}
          {status === "idle" && (
            <Button className="px-8 bg-primary text-primary-foreground hover:bg-primary/90" type="button" onClick={onCreate}>
              Create
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {status === "pending" && (
            <div className="flex flex-col items-end gap-2 w-full">
              <Button
                className={`mt-2 ml-auto px-8 ${canContinue ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground'}`}
                type="button"
                onClick={onComplete}
                disabled={!canContinue}
              >
                {canContinue ? 'Continue' : `Continue (${countdown})`}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 