import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, Users } from 'lucide-react';
import { GitHubOrganization } from '@/lib/github';
import Image from 'next/image';

interface OrganizationSelectionStepProps {
  organizations: GitHubOrganization[];
  onOrganizationsSelected: (selectedOrgs: string[]) => void;
  onBack: () => void;
}

export function OrganizationSelectionStep({
  organizations,
  onOrganizationsSelected,
  onBack,
}: OrganizationSelectionStepProps) {
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);

  const handleOrgToggle = (orgLogin: string) => {
    setSelectedOrgs(prev => 
      prev.includes(orgLogin)
        ? prev.filter(org => org !== orgLogin)
        : [...prev, orgLogin]
    );
  };

  const handleContinue = () => {
    onOrganizationsSelected(selectedOrgs);
  };

  const handleSelectAll = () => {
    setSelectedOrgs(organizations.map(org => org.login));
  };

  const handleSelectNone = () => {
    setSelectedOrgs([]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">Select Organizations</h3>
          <p className="text-muted-foreground">
            Choose which GitHub organizations you&apos;d like to analyze with Hive.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {selectedOrgs.length} of {organizations.length} organizations selected
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

        <div className="space-y-3">
          {organizations.map((org) => (
            <Card
              key={org.id}
              className={`cursor-pointer transition-colors ${
                selectedOrgs.includes(org.login)
                  ? 'border-blue-200 bg-blue-50'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => handleOrgToggle(org.login)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <Checkbox
                    checked={selectedOrgs.includes(org.login)}
                    onChange={() => handleOrgToggle(org.login)}
                  />
                  
                  <div className="flex items-center space-x-3 flex-1">
                    {org.avatar_url && (
                      <Image
                        src={org.avatar_url}
                        alt={org.login}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    
                    <div className="flex-1">
                      <div className="font-medium">{org.name || org.login}</div>
                      <div className="text-sm text-muted-foreground">
                        @{org.login}
                      </div>
                      {org.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {org.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {organizations.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No organizations found. You may not have access to any organizations,
              or you may need to grant additional permissions.
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
          disabled={selectedOrgs.length === 0}
        >
          Continue with {selectedOrgs.length} organization{selectedOrgs.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
} 