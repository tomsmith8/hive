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

function IngestCodeStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto bg-card text-card-foreground p-8 rounded-lg border mt-8">
      <h2 className="text-2xl font-bold mb-2">Ingest Code</h2>
      <p className="mb-4">This is a placeholder for the Ingest Code step.</p>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
}

export function CodeGraphWizard({ user }: CodeGraphWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectName, setProjectName] = useState("");
  const [graphStepStatus, setGraphStepStatus] = useState<'idle' | 'pending' | 'complete'>('idle');

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
            onNext={handleNext}
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