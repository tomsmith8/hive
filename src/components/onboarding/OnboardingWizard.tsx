"use client"

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { WizardStep } from './WizardStep';
import { GitHubConnectionStep } from './GitHubConnectionStep';
import { OrganizationSelectionStep } from './OrganizationSelectionStep';
import { RepositorySelectionStep } from './RepositorySelectionStep';
import { GitHubService, GitHubOrganization, GitHubRepository } from '@/lib/github';
import { getGitHubOAuthError, handleGitHubAPIError, GitHubOAuthError } from '@/lib/github/errors';

type WizardStepType = 'github' | 'organizations' | 'repositories' | 'complete';

interface OnboardingWizardProps {
  onComplete: (data: {
    githubToken: string;
    selectedOrganizations: string[];
    selectedRepositories: string[];
  }) => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<WizardStepType>('github');
  const [githubToken, setGitHubToken] = useState<string>('');
  const [githubUser, setGitHubUser] = useState<any>(null);
  const [organizations, setOrganizations] = useState<GitHubOrganization[]>([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [selectedRepositories, setSelectedRepositories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GitHubOAuthError | null>(null);

  // Check for OAuth callback
  useEffect(() => {
    const step = searchParams.get('step');
    const errorCode = searchParams.get('error');
    
    if (errorCode) {
      const errorInfo = getGitHubOAuthError(errorCode);
      setError(errorInfo);
      return;
    }

    if (step === 'organizations') {
      // OAuth callback completed, fetch the actual GitHub data
      fetchGitHubData();
    }
  }, [searchParams]);

  const fetchGitHubData = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, get the GitHub token
      const tokenResponse = await fetch('/api/user/github/token');
      if (!tokenResponse.ok) {
        throw new Error('Failed to fetch GitHub token');
      }
      const { token } = await tokenResponse.json();

      // Get GitHub user data
      const userData = await GitHubService.getUser(token);
      
      // Set the token and user data
      setGitHubToken(token);
      setGitHubUser(userData);

      // Fetch organizations
      const orgs = await GitHubService.getUserOrganizations(token);
      setOrganizations(orgs);
      setCurrentStep('organizations');
    } catch (error) {
      console.error('Failed to fetch GitHub data:', error);
      const errorInfo = handleGitHubAPIError(error);
      setError(errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubConnected = async (token: string, user: any) => {
    setGitHubToken(token);
    setGitHubUser(user);
    setLoading(true);
    setError(null);

    try {
      // Fetch organizations
      const orgs = await GitHubService.getUserOrganizations(token);
      setOrganizations(orgs);
      setCurrentStep('organizations');
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      const errorInfo = handleGitHubAPIError(error);
      setError(errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationsSelected = async (orgs: string[]) => {
    setSelectedOrganizations(orgs);
    setLoading(true);
    setError(null);

    try {
      // Fetch repositories for selected organizations
      const allRepos: GitHubRepository[] = [];
      
      for (const org of orgs) {
        try {
          const orgRepos = await GitHubService.getOrganizationRepositories(githubToken, org);
          allRepos.push(...orgRepos);
        } catch (error) {
          console.error(`Failed to fetch repos for ${org}:`, error);
        }
      }

      // Also fetch user's personal repositories
      try {
        const userRepos = await GitHubService.getUserRepositories(githubToken);
        allRepos.push(...userRepos);
      } catch (error) {
        console.error('Failed to fetch user repositories:', error);
      }

      setRepositories(allRepos);
      setCurrentStep('repositories');
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
      const errorInfo = handleGitHubAPIError(error);
      setError(errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const handleRepositoriesSelected = (repos: string[]) => {
    setSelectedRepositories(repos);
    setCurrentStep('complete');
    
    // Complete the onboarding
    onComplete({
      githubToken,
      selectedOrganizations,
      selectedRepositories: repos,
    });
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'organizations':
        setCurrentStep('github');
        break;
      case 'repositories':
        setCurrentStep('organizations');
        break;
    }
  };

  const handleError = (errorMessage: string) => {
    const errorInfo = handleGitHubAPIError({ message: errorMessage });
    setError(errorInfo);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'github':
        return (
          <GitHubConnectionStep
            onConnected={handleGitHubConnected}
            onError={handleError}
          />
        );

      case 'organizations':
        return (
          <OrganizationSelectionStep
            organizations={organizations}
            onOrganizationsSelected={handleOrganizationsSelected}
            onBack={handleBack}
          />
        );

      case 'repositories':
        return (
          <RepositorySelectionStep
            repositories={repositories}
            onRepositoriesSelected={handleRepositoriesSelected}
            onBack={handleBack}
          />
        );

      case 'complete':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Setup Complete!</h3>
            <p className="text-muted-foreground">
              Your GitHub integration is ready. We'll start analyzing your selected repositories.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'github':
        return 'Connect to GitHub';
      case 'organizations':
        return 'Select Organizations';
      case 'repositories':
        return 'Select Repositories';
      case 'complete':
        return 'Setup Complete';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'github':
        return 'Connect your GitHub account to get started with code analysis.';
      case 'organizations':
        return 'Choose which organizations you want to analyze.';
      case 'repositories':
        return 'Select the repositories you want to include in your analysis.';
      case 'complete':
        return 'Your setup is complete and analysis is starting.';
      default:
        return '';
    }
  };

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 font-medium mb-2">Error</div>
          <div className="text-red-700 mb-4">{error.userMessage}</div>
          <button
            onClick={() => {
              setError(null);
              setCurrentStep('github');
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            {error.action === 'login' ? 'Go to Login' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <WizardStep
      title={getStepTitle()}
      description={getStepDescription()}
      loading={loading}
      showBack={currentStep !== 'github'}
      showNext={false}
      onBack={handleBack}
    >
      {renderCurrentStep()}
    </WizardStep>
  );
} 