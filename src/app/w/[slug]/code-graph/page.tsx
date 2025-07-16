"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useWizardState } from "@/hooks/useWizardState";
import { useRepositories } from "@/hooks/useRepositories";
import { useEnvironmentVars } from "@/hooks/useEnvironmentVars";
import { WizardStep, Repository } from "@/types/wizard";
import { ServicesData } from "@/components/stakgraph/types";
import { parseRepositoryName } from "@/utils/repositoryParser";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { WizardStepRenderer } from "@/components/wizard/WizardStepRenderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, Clock, Play } from "lucide-react";

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

  // Wizard state management
  const { 
    wizardStep, 
    stepStatus, 
    wizardData, 
    loading: wizardLoading,
    error: wizardError,
    updateWizardProgress,
    refresh: refreshWizardState
  } = useWizardState({ workspaceSlug: workspace?.slug || '' });
  
  // Local component state
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
      setProjectName(parsed);
      setRepoName(selectedRepo.name);
    }
  }, [selectedRepo]);

  // Swarm polling effect
  useEffect(() => {
    if (swarmId && swarmStatus === 'pending') {
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
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [swarmId, swarmStatus]);

  // Navigation handlers
  const handleNext = useCallback(async () => {
    if (step < 9) {
      const newStep = (step + 1) as WizardStep;
      const newWizardStep = reverseStepMapping[newStep as keyof typeof reverseStepMapping];
      
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
      const newWizardStep = reverseStepMapping[newStep as keyof typeof reverseStepMapping];
      
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

  const handleStepChange = useCallback(async (newStep: WizardStep) => {
    const newWizardStep = reverseStepMapping[newStep as keyof typeof reverseStepMapping];
    
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

  // Swarm handlers
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

  const handleSwarmContinue = () => {
    setStep(5);
    setSwarmId(null);
    setSwarmStatus('idle');
  };

  // Other handlers
  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo);
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

  // Helper function to get step status icon
  const getStepStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'STARTED':
      case 'PROCESSING':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Play className="w-4 h-4 text-gray-400" />;
    }
  };

  // Helper function to get step status color
  const getStepStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'STARTED':
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'FAILED':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Helper function to get step names
  const getStepName = (stepNumber: WizardStep) => {
    const stepNames = {
      1: 'Welcome',
      2: 'Repository Selection',
      3: 'Project Name',
      4: 'Graph Infrastructure',
      5: 'Ingest Code',
      6: 'Add Services',
      7: 'Environment Setup',
      8: 'Review Pool Environment',
      9: 'Stakwork Setup',
    };
    return stepNames[stepNumber] || 'Unknown Step';
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
            <CardDescription>Fetching your wizard progress...</CardDescription>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation/Breadcrumb Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-foreground">Code Graph Setup</h1>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Step {step} of 9:</span>
                  <span className="text-sm font-medium">{getStepName(step)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className={`${getStepStatusColor(stepStatus)} border`}>
                  {getStepStatusIcon(stepStatus)}
                  <span className="ml-2 capitalize">{stepStatus?.toLowerCase() || 'Ready'}</span>
                </Badge>
                {workspace && (
                  <Badge variant="secondary">
                    {workspace.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Progress Indicator */}
          <WizardProgress currentStep={step} totalSteps={9} stepStatus={stepStatus} />

          {/* Step Renderer */}
          <WizardStepRenderer
            step={step}
            repositories={repositories}
            selectedRepo={selectedRepo}
            searchTerm={searchTerm}
            loading={repositoriesLoading}
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
            stepStatus={stepStatus as 'PENDING' | 'STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
} 