"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { CodeGraphWizardProps, WizardStep, Repository } from "@/types/wizard";
import { useRepositories } from "@/hooks/useRepositories";
import { useEnvironmentVars } from "@/hooks/useEnvironmentVars";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useWizardState } from "@/hooks/useWizardState";
import { parseRepositoryName } from "@/utils/repositoryParser";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { WizardStepRenderer } from "@/components/wizard/WizardStepRenderer";
import { ServicesData } from "@/components/stakgraph/types";


export function CodeGraphWizard({ user }: CodeGraphWizardProps) {
  const { workspace } = useWorkspace();
  const { 
    wizardStep, 
    stepStatus, 
    wizardData, 
    updateWizardProgress 
  } = useWizardState({ workspaceSlug: workspace?.slug || '' });
  
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
  
  // Step mapping from wizard step keys to numbers
  const stepMapping = useMemo(() => ({
    'WELCOME': 1,
    'REPOSITORY_SELECT': 2,
    'PROJECT_NAME': 3,
    'GRAPH_INFRASTRUCTURE': 4,
    'INGEST_CODE': 5,
    'ADD_SERVICES': 6,
    'ENVIRONMENT_SETUP': 7,
    'REVIEW_POOL_ENVIRONMENT': 8,
    'STAKWORK_SETUP': 9,
  }), []);
  
  const reverseStepMapping = useMemo(() => ({
    1: 'WELCOME',
    2: 'REPOSITORY_SELECT',
    3: 'PROJECT_NAME',
    4: 'GRAPH_INFRASTRUCTURE',
    5: 'INGEST_CODE',
    6: 'ADD_SERVICES',
    7: 'ENVIRONMENT_SETUP',
    8: 'REVIEW_POOL_ENVIRONMENT',
    9: 'STAKWORK_SETUP',
  }), []);

  // Sync wizard state with local state
  useEffect(() => {
    if (wizardStep && stepMapping[wizardStep as keyof typeof stepMapping]) {
      setStep(stepMapping[wizardStep as keyof typeof stepMapping]);
    }
    if (wizardData) {
      if (wizardData.selectedRepo) {
        setSelectedRepo(wizardData.selectedRepo as Repository);
      }
      if (wizardData.projectName) {
        setProjectName(wizardData.projectName as string);
      }
      if (wizardData.repoName) {
        setRepoName(wizardData.repoName as string);
      }
      if (wizardData.servicesData) {
        setServicesData(wizardData.servicesData as ServicesData);
      }
    }
  }, [wizardStep, wizardData, stepMapping]);
  
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

  const handleNext = useCallback(async () => {
    if (step < 9) {
      const newStep = (step + 1) as WizardStep;
      const newWizardStep = reverseStepMapping[newStep];
      
      try {
        await updateWizardProgress({
          wizardStep: newWizardStep,
          stepStatus: 'PENDING',
          wizardData: {
            selectedRepo,
            projectName,
            repoName,
            servicesData,
            step: newStep,
          }
        });
        setStep(newStep);
      } catch (error) {
        console.error('Failed to update wizard progress:', error);
      }
    }
  }, [step, updateWizardProgress, selectedRepo, projectName, repoName, servicesData, reverseStepMapping]);

  const handleBack = useCallback(async () => {
    if (step > 1) {
      const newStep = (step - 1) as WizardStep;
      const newWizardStep = reverseStepMapping[newStep];
      
      try {
        await updateWizardProgress({
          wizardStep: newWizardStep,
          stepStatus: 'PENDING',
          wizardData: {
            selectedRepo,
            projectName,
            repoName,
            servicesData,
            step: newStep,
          }
        });
        setStep(newStep);
      } catch (error) {
        console.error('Failed to update wizard progress:', error);
      }
    }
  }, [step, updateWizardProgress, selectedRepo, projectName, repoName, servicesData, reverseStepMapping]);

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

  const handleStepChange = useCallback(async (newStep: WizardStep) => {
    const newWizardStep = reverseStepMapping[newStep];
    
    try {
      await updateWizardProgress({
        wizardStep: newWizardStep,
        stepStatus: 'PENDING',
        wizardData: {
          selectedRepo,
          projectName,
          repoName,
          servicesData,
          step: newStep,
        }
      });
      setStep(newStep);
      
      if (newStep === 4) {
        setSwarmId(null);
        setSwarmStatus('idle');
      }
    } catch (error) {
      console.error('Failed to update wizard progress:', error);
    }
  }, [updateWizardProgress, selectedRepo, projectName, repoName, servicesData, reverseStepMapping]);
  
  const handleStatusChange = useCallback(async (status: 'PENDING' | 'STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED') => {
    try {
      await updateWizardProgress({
        stepStatus: status,
        wizardData: {
          selectedRepo,
          projectName,
          repoName,
          servicesData,
          step,
        }
      });
    } catch (error) {
      console.error('Failed to update step status:', error);
    }
  }, [updateWizardProgress, selectedRepo, projectName, repoName, servicesData, step]);


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
        stepStatus={stepStatus}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
} 