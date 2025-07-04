"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Github, 
  Code, 
  TrendingUp, 
  BarChart3, 
  CheckCircle, 
  ArrowRight, 
  Search,
  GitBranch,
  Star,
  Eye
} from "lucide-react";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  default_branch: string;
  updated_at: string;
}

interface CodeGraphWizardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    github?: {
      username?: string;
      publicRepos?: number;
      followers?: number;
    };
  };
}

export function CodeGraphWizard({ user }: CodeGraphWizardProps) {
  const [step, setStep] = useState(1);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedRepoName, setParsedRepoName] = useState("");

  // Fetch repositories when component mounts
  useEffect(() => {
    if (user.github?.username) {
      fetchRepositories();
    }
  }, [user.github?.username]);

  // Parse repository name using regex when selected
  useEffect(() => {
    if (selectedRepo) {
      parseRepositoryName(selectedRepo.name);
    }
  }, [selectedRepo]);

  const fetchRepositories = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/github/repositories");
      if (response.ok) {
        const data = await response.json();
        setRepositories(data.repositories || []);
      } else {
        // Fallback to mock data for testing
        setRepositories([
          {
            id: 1,
            name: "my-awesome-project",
            full_name: "user/my-awesome-project",
            description: "A really cool project with amazing features",
            private: false,
            fork: false,
            stargazers_count: 42,
            watchers_count: 15,
            language: "TypeScript",
            default_branch: "main",
            updated_at: "2024-01-15T10:30:00Z",
          },
          {
            id: 2,
            name: "api_v2_backend",
            full_name: "user/api_v2_backend",
            description: "Backend API service with modern architecture",
            private: true,
            fork: false,
            stargazers_count: 8,
            watchers_count: 3,
            language: "Python",
            default_branch: "develop",
            updated_at: "2024-01-14T15:45:00Z",
          },
          {
            id: 3,
            name: "ReactComponentLibrary",
            full_name: "user/ReactComponentLibrary",
            description: "Reusable React components for modern web apps",
            private: false,
            fork: true,
            stargazers_count: 156,
            watchers_count: 23,
            language: "JavaScript",
            default_branch: "master",
            updated_at: "2024-01-13T09:20:00Z",
          },
          {
            id: 4,
            name: "data-science-toolkit",
            full_name: "user/data-science-toolkit",
            description: "Collection of data science utilities and tools",
            private: false,
            fork: false,
            stargazers_count: 89,
            watchers_count: 12,
            language: "Python",
            default_branch: "main",
            updated_at: "2024-01-12T14:10:00Z",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch repositories:", error);
      // Fallback to mock data for testing
      setRepositories([
        {
          id: 1,
          name: "my-awesome-project",
          full_name: "user/my-awesome-project",
          description: "A really cool project with amazing features",
          private: false,
          fork: false,
          stargazers_count: 42,
          watchers_count: 15,
          language: "TypeScript",
          default_branch: "main",
          updated_at: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          name: "api_v2_backend",
          full_name: "user/api_v2_backend",
          description: "Backend API service with modern architecture",
          private: true,
          fork: false,
          stargazers_count: 8,
          watchers_count: 3,
          language: "Python",
          default_branch: "develop",
          updated_at: "2024-01-14T15:45:00Z",
        },
        {
          id: 3,
          name: "ReactComponentLibrary",
          full_name: "user/ReactComponentLibrary",
          description: "Reusable React components for modern web apps",
          private: false,
          fork: true,
          stargazers_count: 156,
          watchers_count: 23,
          language: "JavaScript",
          default_branch: "master",
          updated_at: "2024-01-13T09:20:00Z",
        },
        {
          id: 4,
          name: "data-science-toolkit",
          full_name: "user/data-science-toolkit",
          description: "Collection of data science utilities and tools",
          private: false,
          fork: false,
          stargazers_count: 89,
          watchers_count: 12,
          language: "Python",
          default_branch: "main",
          updated_at: "2024-01-12T14:10:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const parseRepositoryName = (repoName: string) => {
    // If the repoName looks like a GitHub URL, extract the repo name
    const urlMatch = repoName.match(/github\.com\/[^/]+\/([^/?#]+)/i);
    let parsedName = repoName;
    if (urlMatch) {
      parsedName = urlMatch[1];
    }
    // Split camelCase and PascalCase into words, then capitalize
    parsedName = parsedName
      .replace(/[-_]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (l) => l.toUpperCase());
    setParsedRepoName(parsedName);
  };

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep1 = () => (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Github className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Welcome to Code Graph</CardTitle>
        <CardDescription className="text-lg">
          Let&apos;s start by selecting a repository to analyze
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            We&apos;ll help you visualize dependencies, relationships, and collaboration patterns in your codebase.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Repository Mapping</span>
              </div>
              <p className="text-xs text-gray-600">
                Visualize connections between your repositories
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Dependency Analysis</span>
              </div>
              <p className="text-xs text-gray-600">
                Track dependencies and their relationships
              </p>
            </div>
            
            <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-violet-50">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Collaboration Insights</span>
              </div>
              <p className="text-xs text-gray-600">
                Understand team collaboration patterns
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleNext} className="px-8 py-3">
            Get Started
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="w-5 h-5" />
          Select Repository
        </CardTitle>
        <CardDescription>
          Choose a repository to analyze with Code Graph
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Repository List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading repositories...</p>
            </div>
          ) : filteredRepositories.length === 0 ? (
            <div className="text-center py-8">
              <Github className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">No repositories found</p>
            </div>
          ) : (
            filteredRepositories.map((repo) => (
              <div
                key={repo.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedRepo?.id === repo.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleRepoSelect(repo)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{repo.name}</h3>
                      {repo.private && (
                        <Badge variant="secondary" className="text-xs">
                          Private
                        </Badge>
                      )}
                      {repo.fork && (
                        <Badge variant="outline" className="text-xs">
                          Fork
                        </Badge>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-sm text-gray-600 mb-2">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {repo.watchers_count}
                      </span>
                    </div>
                  </div>
                  {selectedRepo?.id === repo.id && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!selectedRepo}
            className="px-8"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Repository Selected!</CardTitle>
        <CardDescription>
          Here&apos;s what we found about your repository
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedRepo && (
          <div className="space-y-6">
            {/* Repository Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Github className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedRepo.full_name}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Repository Name</Label>
                  <p className="text-lg font-mono bg-white px-3 py-2 rounded border">
                    {selectedRepo.name}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Parsed Name</Label>
                  <p className="text-lg font-semibold text-blue-600 bg-white px-3 py-2 rounded border">
                    {parsedRepoName}
                  </p>
                </div>
              </div>

              {selectedRepo.description && (
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <p className="text-gray-600 bg-white px-3 py-2 rounded border">
                    {selectedRepo.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedRepo.stargazers_count}</div>
                  <div className="text-sm text-gray-600">Stars</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedRepo.watchers_count}</div>
                  <div className="text-sm text-gray-600">Watchers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedRepo.language || "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">Language</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedRepo.private ? "Private" : "Public"}
                  </div>
                  <div className="text-sm text-gray-600">Visibility</div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-3">What&apos;s Next?</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-bold">1</span>
                  </div>
                  <span>Analyze repository structure and dependencies</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-bold">2</span>
                  </div>
                  <span>Generate interactive code graph visualization</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-bold">3</span>
                  </div>
                  <span>Identify collaboration patterns and insights</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button className="px-8 bg-green-600 hover:bg-green-700">
            Start Analysis
            <Code className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    step > stepNumber ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
} 