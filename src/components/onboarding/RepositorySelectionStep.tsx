import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { GitBranch, Search, Lock, Globe } from 'lucide-react';
import { GitHubRepository } from '@/lib/github';

interface RepositorySelectionStepProps {
  repositories: GitHubRepository[];
  onRepositoriesSelected: (selectedRepos: string[]) => void;
  onBack: () => void;
}

export function RepositorySelectionStep({
  repositories,
  onRepositoriesSelected,
  onBack,
}: RepositorySelectionStepProps) {
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRepositories = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRepoToggle = (repoFullName: string) => {
    setSelectedRepos(prev => 
      prev.includes(repoFullName)
        ? prev.filter(repo => repo !== repoFullName)
        : [...prev, repoFullName]
    );
  };

  const handleContinue = () => {
    onRepositoriesSelected(selectedRepos);
  };

  const handleSelectAll = () => {
    setSelectedRepos(filteredRepositories.map(repo => repo.full_name));
  };

  const handleSelectNone = () => {
    setSelectedRepos([]);
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      'JavaScript': 'bg-yellow-400',
      'TypeScript': 'bg-blue-600',
      'Python': 'bg-green-500',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-500',
      'Java': 'bg-red-500',
      'C++': 'bg-pink-500',
      'C#': 'bg-purple-500',
    };
    return colors[language] || 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <GitBranch className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">Select Repositories</h3>
          <p className="text-muted-foreground">
            Choose which repositories you'd like to analyze for code insights.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectNone}
            >
              Select None
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {selectedRepos.length} of {filteredRepositories.length} repositories selected
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredRepositories.map((repo) => (
            <Card
              key={repo.id}
              className={`cursor-pointer transition-colors ${
                selectedRepos.includes(repo.full_name)
                  ? 'border-green-200 bg-green-50'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => handleRepoToggle(repo.full_name)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedRepos.includes(repo.full_name)}
                    onChange={() => handleRepoToggle(repo.full_name)}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium">{repo.name}</div>
                      {repo.private ? (
                        <Lock className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Globe className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {repo.full_name}
                    </div>
                    
                    {repo.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {repo.description}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2">
                      {repo.language && (
                        <div className="flex items-center space-x-1">
                          <div
                            className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {repo.language}
                          </span>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        Updated {new Date(repo.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRepositories.length === 0 && (
          <div className="text-center py-8">
            <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No repositories found matching your search.' : 'No repositories found.'}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        
        <Button
          onClick={handleContinue}
          disabled={selectedRepos.length === 0}
        >
          Start Analysis with {selectedRepos.length} repository{selectedRepos.length !== 1 ? 'ies' : 'y'}
        </Button>
      </div>
    </div>
  );
} 