
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function IngestCodeStep({
  status,
  onStart,
  onContinue,
  onBack,
  onStatusChange
}: {
  status: 'idle' | 'pending' | 'complete';
  onStart: () => void;
  onContinue: () => void;
  onBack: () => void;
  onStatusChange?: (status: 'PENDING' | 'STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED') => void;
}) {
  const isPending = status === 'pending';
  const [countdown, setCountdown] = useState(5);

  const handleStart = () => {
    console.log("CALLED handleStart")
    onStatusChange?.('PROCESSING');
    console.log("CALLING onStart()")
    onStart();
  };

  const handleContinue = () => {
    onStatusChange?.('COMPLETED');
    onContinue();
  };

  const canContinue = isPending;

  return (
    <Card className="max-w-2xl mx-auto bg-card text-card-foreground">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mx-auto mb-4">
          <svg width="80" height="64" viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="32" r="12" fill="#E0E7FF" />
            <circle cx="40" cy="32" r="5" fill="#60A5FA">
              <animate attributeName="r" values="5;7;5" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="64" cy="20" r="4" fill="#2563EB">
              <animate attributeName="r" values="4;6;4" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
            </circle>
            <circle cx="64" cy="44" r="4" fill="#2563EB">
              <animate attributeName="r" values="4;6;4" dur="1.2s" begin="0.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="16" cy="20" r="4" fill="#2563EB">
              <animate attributeName="r" values="4;6;4" dur="1.2s" begin="0.9s" repeatCount="indefinite" />
            </circle>
            <circle cx="16" cy="44" r="4" fill="#2563EB">
              <animate attributeName="r" values="4;6;4" dur="1.2s" begin="1.2s" repeatCount="indefinite" />
            </circle>
            <line x1="40" y1="32" x2="64" y2="20" stroke="#60A5FA" strokeWidth="2">
              <animate attributeName="stroke" values="#60A5FA;#2563EB;#60A5FA" dur="1.2s" repeatCount="indefinite" />
            </line>
            <line x1="40" y1="32" x2="64" y2="44" stroke="#60A5FA" strokeWidth="2">
              <animate attributeName="stroke" values="#60A5FA;#2563EB;#60A5FA" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
            </line>
            <line x1="40" y1="32" x2="16" y2="20" stroke="#60A5FA" strokeWidth="2">
              <animate attributeName="stroke" values="#60A5FA;#2563EB;#60A5FA" dur="1.2s" begin="0.6s" repeatCount="indefinite" />
            </line>
            <line x1="40" y1="32" x2="16" y2="44" stroke="#60A5FA" strokeWidth="2">
              <animate attributeName="stroke" values="#60A5FA;#2563EB;#60A5FA" dur="1.2s" begin="0.9s" repeatCount="indefinite" />
            </line>
            <line x1="16" y1="20" x2="16" y2="44" stroke="#60A5FA" strokeWidth="2" opacity="0.5" />
            <line x1="64" y1="20" x2="64" y2="44" stroke="#60A5FA" strokeWidth="2" opacity="0.5" />
          </svg>
        </div>
        <AnimatePresence mode="wait">
          {!isPending ? (
            <motion.div key="title-ingest" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <CardTitle className="text-2xl">Ingest Code</CardTitle>
              <CardDescription>We will now ingest your codebase. This may take a few minutes.</CardDescription>
            </motion.div>
          ) : (
            <motion.div key="title-ingest-pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <CardTitle className="text-2xl">Ingesting Code</CardTitle>
              <CardDescription>Your codebase is being ingested. Please wait...</CardDescription>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between pt-4">
          {/* {!isPending && (
            <Button variant="outline" type="button" onClick={onBack}>Back</Button>
          )} */}
          {status === 'idle' && (
            <Button className="px-8 bg-primary text-primary-foreground hover:bg-primary/90" type="button" onClick={handleStart}>
              Start Ingest
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {status === 'pending' && (
            <Button
              className={`ml-auto px-8 ${canContinue ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground'}`}
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
            >
              {canContinue ? 'Continue' : `Continue (${countdown})`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}