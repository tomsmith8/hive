"use client";

import { useState, useEffect, useRef } from "react";
import { CodeGraphWizardProps, WizardStep, Repository } from "@/types/wizard";
import { useRepositories } from "@/hooks/useRepositories";
import { useEnvironmentVars } from "@/hooks/useEnvironmentVars";
import { parseRepositoryName } from "@/utils/repositoryParser";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { WizardStepRenderer } from "@/components/wizard/WizardStepRenderer";
import { ServicesData } from "@/components/stakgraph/types";


export function CodeGraphWizard({ user }: CodeGraphWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectName, setProjectName] = useState("");
  const [repoName, setRepoName] = useState("");
  const [ingestStepStatus, setIngestStepStatus] = useState<'idle' | 'pending' | 'complete'>('idle');
  const [servicesData, setServicesData] = useState<ServicesData>({ services: [] });
  const [swarmId, setSwarmId] = useState<string | null>(null);
  const [swarmStatus, setSwarmStatus] = useState<'idle' | 'pending' | 'active' | 'error'>('idle');
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      setRepoName(selectedRepo.name);
    }
  }, [selectedRepo]);

  // Swarm polling effect
  useEffect(() => {
    if (swarmId && swarmStatus === 'pending') {
      // Start polling
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/swarm/poll?id=${swarmId}`);
          const data = await res.json();
          if (data.status === 'ACTIVE') {
            setSwarmStatus('active');
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          }
        } catch {
          setSwarmStatus('error');
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      }, 3000);
      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }
    // Cleanup on unmount or when swarmId/status changes
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [swarmId, swarmStatus]);

  // Handler to create swarm
  const handleCreateSwarm = async () => {
    setSwarmStatus('pending');
    try {
      const res = await fetch('/api/swarm', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data?.id) {
        setSwarmId(data.data.id);
      } else {
        setSwarmStatus('error');
      }
    } catch {
      setSwarmStatus('error');
    }
  };

  // Handler for continue (when swarm is active)
  const handleSwarmContinue = () => {
    setStep(5);
    setSwarmId(null);
    setSwarmStatus('idle');
  };

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo);
  };

  const handleNext = () => {
    if (step < 9) {
      setStep((step + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as WizardStep);
    }
  };

  const handleIngestStart = () => {
    setIngestStepStatus('pending');
  };

  const handleIngestContinue = () => {
    setIngestStepStatus('complete');
    handleNext();
  };

  const handleServicesChange = (data: Partial<ServicesData>) => {
    setServicesData(prev => ({ ...prev, ...data, services: data.services ?? prev.services }));
  };

  const handleStepChange = (newStep: WizardStep) => {
    setStep(newStep);
    if (newStep === 4) {
      setSwarmId(null);
      setSwarmStatus('idle');
    }
  };


  return (
    <div className="space-y-6">
      <WizardProgress currentStep={step} totalSteps={9} />
      <WizardStepRenderer
        step={step}
        repositories={repositories}
        selectedRepo={selectedRepo}
        searchTerm={searchTerm}
        loading={loading}
        projectName={projectName}
        repoName={repoName}
        ingestStepStatus={ingestStepStatus}
        servicesData={servicesData}
        swarmStatus={swarmStatus}
        envVars={envVars}
        onSearchChange={setSearchTerm}
        onRepoSelect={handleRepoSelect}
        onProjectNameChange={setProjectName}
        onIngestStart={handleIngestStart}
        onIngestContinue={handleIngestContinue}
        onCreateSwarm={handleCreateSwarm}
        onSwarmContinue={handleSwarmContinue}
        onServicesChange={handleServicesChange}
        onEnvChange={handleEnvChange}
        onAddEnv={handleAddEnv}
        onRemoveEnv={handleRemoveEnv}
        onNext={handleNext}
        onBack={handleBack}
        onStepChange={handleStepChange}
      />
    </div>
  );
} 