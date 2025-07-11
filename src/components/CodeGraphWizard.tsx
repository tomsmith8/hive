"use client";

import { useState, useEffect } from "react";
import { CodeGraphWizardProps, WizardStep, Repository } from "@/types/wizard";
import { useRepositories } from "@/hooks/useRepositories";
import { useEnvironmentVars } from "@/hooks/useEnvironmentVars";
import { parseRepositoryName, sanitizeWorkspaceName } from "@/utils/repositoryParser";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { WelcomeStep } from "@/components/wizard/WelcomeStep";
import { RepositorySelectionStep } from "@/components/wizard/RepositorySelectionStep";
import { GraphInfrastructureStep } from "@/components/wizard/GraphInfrastructureStep";
import { EnvironmentSetupStep } from "@/components/wizard/EnvironmentSetupStep";
import { StakworkSetupStep } from "@/components/wizard/StakworkSetupStep";
import { ProjectNameStep } from "@/components/wizard/ProjectNameStep";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function IngestCodeStep({ status, onStart, onContinue, onBack }: { status: 'idle' | 'pending' | 'complete'; onStart: () => void; onContinue: () => void; onBack: () => void }) {
  const isPending = status === 'pending';
  const [countdown, setCountdown] = useState(5);
  useEffect(() => { if (isPending) setCountdown(5); }, [isPending]);
  useEffect(() => { if (isPending && countdown > 0) { const t = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(t); } }, [isPending, countdown]);
  const canContinue = isPending && countdown === 0;
  return (
    <Card className="max-w-2xl mx-auto bg-card text-card-foreground">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mx-auto mb-4">
          {/* Animated graph/network only */}
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
          {!isPending && (
            <Button variant="outline" type="button" onClick={onBack}>Back</Button>
          )}
          {status === 'idle' && (
            <Button className="px-8 bg-primary text-primary-foreground hover:bg-primary/90" type="button" onClick={onStart}>
              Start Ingest
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {status === 'pending' && (
            <Button
              className={`ml-auto px-8 ${canContinue ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground'}`}
              type="button"
              onClick={onContinue}
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

export function CodeGraphWizard({ user }: CodeGraphWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectName, setProjectName] = useState("");
  const [graphStepStatus, setGraphStepStatus] = useState<'idle' | 'pending' | 'complete'>('idle');
  const [ingestStepStatus, setIngestStepStatus] = useState<'idle' | 'pending' | 'complete'>('idle');

  // Use custom hooks
  const { repositories, loading } = useRepositories({ username: user.github?.username });
  const { 
    envVars, 
    handleEnvChange, 
    handleAddEnv, 
    handleRemoveEnv 
  } = useEnvironmentVars();

  // Parse repository name using regex when selected
  useEffect(() => {
    if (selectedRepo) {
      const parsed = parseRepositoryName(selectedRepo.name);
      setProjectName(parsed); // Default project name from repo
    }
  }, [selectedRepo]);

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo);
  };

  const handleNext = () => {
    if (step < 7) {
      setStep((step + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as WizardStep);
    }
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return <WelcomeStep onNext={handleNext} />;
      case 2:
        return (
          <RepositorySelectionStep
            repositories={repositories}
            selectedRepo={selectedRepo}
            searchTerm={searchTerm}
            loading={loading}
            onSearchChange={setSearchTerm}
            onRepoSelect={handleRepoSelect}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ProjectNameStep
            projectName={projectName}
            onProjectNameChange={setProjectName}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <GraphInfrastructureStep
            graphDomain={sanitizeWorkspaceName(projectName)}
            status={graphStepStatus}
            onCreate={() => setGraphStepStatus('pending')}
            onComplete={() => {
              setGraphStepStatus('complete');
              setStep(5);
            }}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <IngestCodeStep
            status={ingestStepStatus}
            onStart={() => setIngestStepStatus('pending')}
            onContinue={() => { setIngestStepStatus('complete'); handleNext(); }}
            onBack={() => {
              setStep(4);
              setGraphStepStatus('idle');
            }}
          />
        );
      case 6:
        return (
          <EnvironmentSetupStep
            envVars={envVars}
            onEnvChange={handleEnvChange}
            onAddEnv={handleAddEnv}
            onRemoveEnv={handleRemoveEnv}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 7:
        return (
          <StakworkSetupStep
            workspaceName={projectName}
            onFinish={handleNext}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <WizardProgress currentStep={step} totalSteps={7} />
      {renderCurrentStep()}
    </div>
  );
} 