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

export function CodeGraphWizard({ user }: CodeGraphWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectName, setProjectName] = useState("");

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
    if (step < 6) {
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
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
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
      case 6:
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
      <WizardProgress currentStep={step} totalSteps={6} />
      {renderCurrentStep()}
    </div>
  );
} 