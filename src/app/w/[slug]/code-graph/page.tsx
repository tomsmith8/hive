"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useWizardFlow } from "@/hooks/useWizardFlow";
import { useRepositories } from "@/hooks/useRepositories";
import { useEnvironmentVars } from "@/hooks/useEnvironmentVars";
import { WizardStep, Repository } from "@/types/wizard";
import { ServicesData } from "@/components/stakgraph/types";
import { parseRepositoryName } from "@/utils/repositoryParser";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { WizardStepRenderer } from "@/components/wizard/WizardStepRenderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

export default function CodeGraphPage() {
  // Get user info from session
  const { data: session } = useSession();
  const { workspace } = useWorkspace();
  
  const user = {
    name: session?.user?.name,
    email: session?.user?.email,
    image: session?.user?.image,
    github: (session?.user as { github?: { username?: string; publicRepos?: number; followers?: number } })?.github,
  };

  // Wizard flow management
  const { 
    loading: wizardLoading,
    error: wizardError,
    hasSwarm,
    swarmId,
    swarmStatus: _swarmStatus,
    wizardStep, 
    stepStatus, 
    wizardData,
    localState,
    updateLocalState,
    resetLocalState,
    createSwarm,
    updateWizardProgress,
    refresh: refreshWizardState
  } = useWizardFlow({ workspaceSlug: workspace?.slug || '' });

  // Additional local state for swarm operations
  const [ingestStepStatus, setIngestStepStatus] = useState<'idle' | 'pending' | 'complete'>('idle');
  const [swarmCreationStatus, setSwarmCreationStatus] = useState<'idle' | 'pending' | 'active' | 'error'>('idle');
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // External data hooks
  const { repositories, loading: repositoriesLoading } = useRepositories({ username: user.github?.username });
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

  // Determine current step based on swarm state or local state
  const currentStep = useMemo(() => {
    if (hasSwarm && wizardStep && stepMapping[wizardStep as keyof typeof stepMapping]) {
      return stepMapping[wizardStep as keyof typeof stepMapping];
    }
    return localState.step;
  }, [hasSwarm, wizardStep, stepMapping, localState.step]);

  // Sync wizard data with local state when swarm exists
  useEffect(() => {
    if (hasSwarm && wizardData) {
      const updates: Partial<typeof localState> = {};
      
      if (wizardData.selectedRepo) {
        updates.selectedRepo = wizardData.selectedRepo as Repository;
      }
      if (wizardData.projectName) {
        updates.projectName = wizardData.projectName as string;
      }
      if (wizardData.repoName) {
        updates.repoName = wizardData.repoName as string;
      }
      if (wizardData.servicesData) {
        updates.servicesData = wizardData.servicesData as ServicesData;
      }
      
      if (Object.keys(updates).length > 0) {
        updateLocalState(updates);
      }
    }
  }, [hasSwarm, wizardData, updateLocalState]);

  // Reset local state on page load if no swarm exists
  useEffect(() => {
    if (!wizardLoading && !hasSwarm) {
      resetLocalState();
    }
  }, [wizardLoading, hasSwarm, resetLocalState]);
  
  // Parse repository name using regex when selected
  useEffect(() => {
    if (localState.selectedRepo) {
      const parsed = parseRepositoryName(localState.selectedRepo.name);
      updateLocalState({
        projectName: parsed,
        repoName: localState.selectedRepo.name,
      });
    }
  }, [localState.selectedRepo, updateLocalState]);

  // Swarm polling effect
  useEffect(() => {
    if (swarmId && swarmCreationStatus === 'pending') {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/swarm/poll?id=${swarmId}`);
          const data = await res.json();
          if (data.status === 'ACTIVE') {
            setSwarmCreationStatus('active');
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          }
        } catch {
          setSwarmCreationStatus('error');
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      }, 3000);
      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [swarmId, swarmCreationStatus]);

  // Navigation handlers
  const handleNext = useCallback(async () => {
    if (currentStep < 9) {
      const newStep = (currentStep + 1) as WizardStep;
      
      if (hasSwarm) {
        // Update persisted state
        const newWizardStep = reverseStepMapping[newStep as keyof typeof reverseStepMapping];
        try {
          await updateWizardProgress({
            wizardStep: newWizardStep,
            stepStatus: 'PENDING',
            wizardData: {
              selectedRepo: localState.selectedRepo,
              projectName: localState.projectName,
              repoName: localState.repoName,
              servicesData: localState.servicesData,
              step: newStep,
            }
          });
        } catch (error) {
          console.error('Failed to update wizard progress:', error);
        }
      } else {
        // Update local state only
        updateLocalState({ step: newStep });
      }
    }
  }, [currentStep, hasSwarm, updateWizardProgress, localState, reverseStepMapping, updateLocalState]);

  const handleBack = useCallback(async () => {
    if (currentStep > 1) {
      const newStep = (currentStep - 1) as WizardStep;
      
      if (hasSwarm) {
        // Update persisted state
        const newWizardStep = reverseStepMapping[newStep as keyof typeof reverseStepMapping];
        try {
          await updateWizardProgress({
            wizardStep: newWizardStep,
            stepStatus: 'PENDING',
            wizardData: {
              selectedRepo: localState.selectedRepo,
              projectName: localState.projectName,
              repoName: localState.repoName,
              servicesData: localState.servicesData,
              step: newStep,
            }
          });
        } catch (error) {
          console.error('Failed to update wizard progress:', error);
        }
      } else {
        // Update local state only
        updateLocalState({ step: newStep });
      }
    }
  }, [currentStep, hasSwarm, updateWizardProgress, localState, reverseStepMapping, updateLocalState]);

  const handleStepChange = useCallback(async (newStep: WizardStep) => {
    if (hasSwarm) {
      // Update persisted state
      const newWizardStep = reverseStepMapping[newStep as keyof typeof reverseStepMapping];
      try {
        await updateWizardProgress({
          wizardStep: newWizardStep,
          stepStatus: 'PENDING',
          wizardData: {
            selectedRepo: localState.selectedRepo,
            projectName: localState.projectName,
            repoName: localState.repoName,
            servicesData: localState.servicesData,
            step: newStep,
          }
        });
      } catch (error) {
        console.error('Failed to update wizard progress:', error);
      }
    } else {
      // Update local state only
      updateLocalState({ step: newStep });
    }
  }, [hasSwarm, updateWizardProgress, localState, reverseStepMapping, updateLocalState]);
  
  const handleStatusChange = useCallback(async (status: 'PENDING' | 'STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED') => {
    if (hasSwarm) {
      try {
        await updateWizardProgress({
          stepStatus: status,
          wizardData: {
            selectedRepo: localState.selectedRepo,
            projectName: localState.projectName,
            repoName: localState.repoName,
            servicesData: localState.servicesData,
            step: currentStep,
          }
        });
      } catch (error) {
        console.error('Failed to update step status:', error);
      }
    }
    // For local state, status changes are not persisted
  }, [hasSwarm, updateWizardProgress, localState, currentStep]);

  // Swarm creation handler - this is the trigger point for persistence
  const handleCreateSwarm = async () => {
    setSwarmCreationStatus('pending');
    try {
      const swarmData = {
        selectedRepo: localState.selectedRepo,
        projectName: localState.projectName,
        repoName: localState.repoName,
        servicesData: localState.servicesData,
        envVars: envVars,
        step: currentStep,
      };

      // First create the wizard record
      await createSwarm(swarmData);
      
      // Then call your existing swarm creation API
      const res = await fetch('/api/swarm', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: workspace?.id,
          name: localState.projectName || localState.repoName,
        }),
      });
      
      const data = await res.json();
      if (data.success && data.data?.id) {
        setSwarmCreationStatus('active');
      } else {
        setSwarmCreationStatus('error');
      }
    } catch (error) {
      console.error('Failed to create swarm:', error);
      setSwarmCreationStatus('error');
    }
  };

  const handleSwarmContinue = () => {
    updateLocalState({ step: 5 });
    setSwarmCreationStatus('idle');
  };

  // Other handlers
  const handleRepoSelect = (repo: Repository) => {
    updateLocalState({ selectedRepo: repo });
  };

  const handleProjectNameChange = (name: string) => {
    updateLocalState({ projectName: name });
  };

  const handleSearchChange = (term: string) => {
    updateLocalState({ searchTerm: term });
  };

  const handleIngestStart = () => {
    setIngestStepStatus('pending');
  };

  const handleIngestContinue = () => {
    setIngestStepStatus('complete');
    handleNext();
  };

  const handleServicesChange = (data: Partial<ServicesData>) => {
    const newServicesData = { ...localState.servicesData, ...data, services: data.services ?? localState.servicesData.services };
    updateLocalState({ servicesData: newServicesData });
  };


  // Loading state
  if (wizardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
            <CardTitle>Loading Wizard</CardTitle>
            <CardDescription>Checking your wizard progress...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Error state
  if (wizardError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle>Error Loading Wizard</CardTitle>
            <CardDescription>{wizardError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refreshWizardState} className="w-full">
              <Loader2 className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get current step status for display
  const currentStepStatus = hasSwarm ? stepStatus : undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Setting up CodeGraph</h1>
          </div>

          {/* Progress Indicator */}
          <WizardProgress currentStep={currentStep} totalSteps={9} stepStatus={currentStepStatus} />

          {/* Step Renderer */}
          <WizardStepRenderer
            step={currentStep}
            repositories={repositories}
            selectedRepo={localState.selectedRepo}
            searchTerm={localState.searchTerm}
            loading={repositoriesLoading}
            projectName={localState.projectName}
            repoName={localState.repoName}
            ingestStepStatus={ingestStepStatus}
            servicesData={localState.servicesData}
            swarmStatus={swarmCreationStatus}
            envVars={localState.envVars}
            onSearchChange={handleSearchChange}
            onRepoSelect={handleRepoSelect}
            onProjectNameChange={handleProjectNameChange}
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
            stepStatus={currentStepStatus as 'PENDING' | 'STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
} 