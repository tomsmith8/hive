"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { GitHubConnectionStep } from './GitHubConnectionStep';
import { OrganizationSelectionStep } from './OrganizationSelectionStep';
import { RepositorySelectionStep } from './RepositorySelectionStep';
import { WizardStep } from './WizardStep';
import { GitHubOrganization, GitHubRepository } from '@/lib/github';
import { getGitHubOAuthError } from '@/lib/github/errors';

interface OnboardingData {
  githubToken: string;
  selectedOrganizations: string[];
  selectedRepositories: string[];
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [githubToken, setGitHubToken] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<GitHubOrganization[]>([]);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);

  // Check for OAuth callback
  useEffect(() => {
    const errorCode = searchParams.get('error');
    if (errorCode) {
      const errorInfo = getGitHubOAuthError(errorCode);
      setError(errorInfo.userMessage);
      return;
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code && state) {
      fetchGitHubData();
    }
  }, [searchParams]);

  const fetchGitHubData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get token and user data from the callback
      const tokenResponse = await fetch('/api/user/github/token');
      if (!tokenResponse.ok) {
        throw new Error('Failed to get GitHub token');
      }
      
      const { token } = await tokenResponse.json();
      setGitHubToken(token);

      // Fetch organizations
      const orgsResponse = await fetch('/api/user/github/organizations');
      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json();
        setOrganizations(orgsData.organizations || []);
      }

      // Fetch repositories
      const reposResponse = await fetch('/api/user/github/repositories');
      if (reposResponse.ok) {
        const reposData = await reposResponse.json();
        setRepositories(reposData.repositories || []);
      }

      setCurrentStep(1);
    } catch {
      setError('Failed to fetch GitHub data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubConnected = async (token: string) => {
    setGitHubToken(token);
    setIsLoading(true);
    setError(null);

    try {
      // Fetch organizations
      const orgsResponse = await fetch('/api/user/github/organizations');
      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json();
        setOrganizations(orgsData.organizations || []);
      }

      // Fetch repositories
      const reposResponse = await fetch('/api/user/github/repositories');
      if (reposResponse.ok) {
        const reposData = await reposResponse.json();
        setRepositories(reposData.repositories || []);
      }

      setCurrentStep(1);
    } catch {
      setError('Failed to fetch GitHub data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizationsSelected = async () => {
    setCurrentStep(2);
  };

  const handleRepositoriesSelected = (repos: string[]) => {
    setCurrentStep(3);
    
    // Complete the onboarding
    onComplete({
      githubToken: githubToken as string,
      selectedOrganizations: organizations.map(org => org.login),
      selectedRepositories: repos,
    });
  };

  const handleBack = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <GitHubConnectionStep
            onConnected={handleGitHubConnected}
            onError={handleError}
          />
        );

      case 1:
        return (
          <OrganizationSelectionStep
            organizations={organizations}
            onOrganizationsSelected={handleOrganizationsSelected}
            onBack={handleBack}
          />
        );

      case 2:
        return (
          <RepositorySelectionStep
            repositories={repositories}
            onRepositoriesSelected={handleRepositoriesSelected}
            onBack={handleBack}
          />
        );

      case 3:
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Setup Complete!</h3>
            <p className="text-muted-foreground">
              Let&apos;s get you set up with Hive. We&apos;ll help you connect your GitHub account and configure your workspace.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return 'Connect to GitHub';
      case 1:
        return 'Select Organizations';
      case 2:
        return 'Select Repositories';
      case 3:
        return 'Setup Complete';
      default:
        return 'Onboarding';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 0:
        return 'Connect your GitHub account to get started with code analysis.';
      case 1:
        return 'Choose which organizations you want to analyze.';
      case 2:
        return 'Select the repositories you want to include in your analysis.';
      case 3:
        return 'Your setup is complete and analysis is starting.';
      default:
        return 'Welcome to Hive!';
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 font-medium mb-2">Error</div>
        <div className="text-red-700 mb-4">{error}</div>
        <button
          onClick={() => {
            setError(null);
            setCurrentStep(0);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <WizardStep
      title={getStepTitle()}
      description={getStepDescription()}
      loading={isLoading}
      showBack={currentStep > 0}
      showNext={currentStep < 3}
      onBack={handleBack}
    >
      {renderCurrentStep()}
    </WizardStep>
  );
} 