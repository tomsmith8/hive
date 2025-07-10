"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { useEnvironmentVars } from "@/hooks/useEnvironmentVars";
import { EnvironmentVariable } from "@/types/wizard";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useWorkspace } from "@/hooks/useWorkspace";

interface StakgraphSettings {
  name: string;
  description: string;
  repositoryUrl: string;
  swarmUrl: string;
  swarmApiKey: string;
  poolName: string;
  environmentVariables: EnvironmentVariable[];
  status?: string;
  lastUpdated?: string;
}

export default function StakgraphPage() {
  const { slug } = useWorkspace();
  const [formData, setFormData] = useState<StakgraphSettings>({
    name: "",
    description: "",
    repositoryUrl: "",
    swarmUrl: "",
    swarmApiKey: "",
    poolName: "",
    environmentVariables: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Environment variable state using shared hook
  const {
    envVars,
    handleEnvChange,
    handleAddEnv,
    handleRemoveEnv,
    setEnvVars,
  } = useEnvironmentVars();

  const { toast } = useToast();

  // Load existing settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!slug) return;
      
      try {
        setInitialLoading(true);
        const response = await fetch(`/api/workspaces/${slug}/stakgraph`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const settings = result.data;
            setFormData({
              name: settings.name || "",
              description: settings.description || "",
              repositoryUrl: settings.repositoryUrl || "",
              swarmUrl: settings.swarmUrl || "",
              swarmApiKey: settings.swarmApiKey || "",
              poolName: settings.poolName || "",
              environmentVariables: settings.environmentVariables || [],
              status: settings.status,
              lastUpdated: settings.lastUpdated
            });
            
            // Also update the environment variables hook
            if (settings.environmentVariables && Array.isArray(settings.environmentVariables)) {
              setEnvVars(settings.environmentVariables.map((env: EnvironmentVariable) => ({
                key: env.key,
                value: env.value,
                show: false
              })));
            }
          }
        } else if (response.status === 404) {
          // No swarm found - this is expected for workspaces without swarms
          console.log("No swarm found for this workspace yet");
        } else {
          console.error("Failed to load stakgraph settings");
        }
      } catch (error) {
        console.error("Error loading stakgraph settings:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadSettings();
  }, [slug, setEnvVars]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!slug) {
      toast({
        title: "Error",
        description: "Workspace not found",
        variant: "destructive",
      });
      return;
    }
    
    // Reset previous states
    setErrors({});
    setSaved(false);
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.repositoryUrl.trim()) {
      newErrors.repositoryUrl = "Repository URL is required";
    } else if (!isValidUrl(formData.repositoryUrl.trim())) {
      newErrors.repositoryUrl = "Please enter a valid URL";
    }
    
    if (!formData.swarmUrl.trim()) {
      newErrors.swarmUrl = "Swarm URL is required";
    } else if (!isValidUrl(formData.swarmUrl.trim())) {
      newErrors.swarmUrl = "Please enter a valid URL";
    }
    
    if (!formData.swarmApiKey.trim()) {
      newErrors.swarmApiKey = "Swarm API Key is required";
    }
    
    if (!formData.poolName.trim()) {
      newErrors.poolName = "Pool Name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        repositoryUrl: formData.repositoryUrl.trim(),
        swarmUrl: formData.swarmUrl.trim(),
        swarmApiKey: formData.swarmApiKey.trim(),
        poolName: formData.poolName.trim(),
        environmentVariables: envVars.map(env => ({
          key: env.key,
          value: env.value
        }))
      };

      const response = await fetch(`/api/workspaces/${slug}/stakgraph`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSaved(true);
        toast({
          title: "Configuration saved",
          description: "Your Stakgraph settings have been saved successfully!",
          variant: "default",
        });
        
        // Update form data with response data
        if (result.data) {
          setFormData(prev => ({
            ...prev,
            status: result.data.status,
            lastUpdated: result.data.updatedAt
          }));
        }
      } else {
        // Handle validation errors
        if (result.error === "VALIDATION_ERROR" && result.details) {
          setErrors(result.details);
        } else {
          setErrors({ general: result.message || "Failed to save configuration. Please try again." });
        }
        
        toast({
          title: "Error",
          description: result.message || "Failed to save configuration",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to save configuration:", error);
      setErrors({ general: "Failed to save configuration. Please try again." });
      toast({
        title: "Error",
        description: "Network error occurred while saving",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    // Clear saved state when user modifies the form
    if (saved) {
      setSaved(false);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          {/* <Network className="w-8 h-8 text-primary" /> */}
          <div>
            <h1 className="text-3xl font-bold">Stakgraph Configuration</h1>
            <p className="text-muted-foreground">
              Configure your settings for Stakgraph integration
            </p>
          </div>
        </div>
        <Card className="max-w-2xl">
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading settings...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {/* <Network className="w-8 h-8 text-primary" /> */}
        <div>
          <h1 className="text-3xl font-bold">Stakgraph Configuration</h1>
          <p className="text-muted-foreground">
            Configure your settings for Stakgraph integration
          </p>
          {/* Removed Swarm Status and Last updated */}
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Stakgraph Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{errors.general}</p>
              </div>
            )}

            {saved && (
              <div className="p-3 rounded-md bg-green-50 border border-green-200">
                <p className="text-sm text-green-700">Configuration saved successfully!</p>
              </div>
            )}

            {/* Section 1: Name & Description */}
            <div className="space-y-2 mb-4">
              <h3 className="text-lg font-semibold mb-2">Project Info</h3>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Project Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Short description of the project"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={errors.description ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            {/* Section 2: Code (Repository URL) */}
            <div className="space-y-2 mb-4">
              <h3 className="text-lg font-semibold mb-2">Repository</h3>
              <Label htmlFor="repositoryUrl">Repository URL</Label>
              <Input
                id="repositoryUrl"
                type="url"
                placeholder="https://github.com/username/repository"
                value={formData.repositoryUrl}
                onChange={(e) => handleInputChange("repositoryUrl", e.target.value)}
                className={errors.repositoryUrl ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.repositoryUrl && (
                <p className="text-sm text-destructive">{errors.repositoryUrl}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The URL of the repository containing your project code
              </p>
            </div>

            {/* Section 3: Swarm */}
            <div className="space-y-2 mb-4">
              <h3 className="text-lg font-semibold mb-2">Swarm</h3>
              <Label htmlFor="swarmUrl">Swarm URL</Label>
              <Input
                id="swarmUrl"
                type="url"
                placeholder="https://your-swarm-instance.sphinx.chat/api"
                value={formData.swarmUrl}
                onChange={(e) => handleInputChange("swarmUrl", e.target.value)}
                className={errors.swarmUrl ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.swarmUrl && (
                <p className="text-sm text-destructive">{errors.swarmUrl}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The base URL of your Swarm instance
              </p>

              <Label htmlFor="swarmApiKey">Swarm API Key</Label>
              <Input
                id="swarmApiKey"
                type="text"
                placeholder="e.g. {{SWARM_123456_API_KEY}}"
                value={formData.swarmApiKey}
                onChange={(e) => handleInputChange("swarmApiKey", e.target.value)}
                className={errors.swarmApiKey ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.swarmApiKey && (
                <p className="text-sm text-destructive">{errors.swarmApiKey}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Your API key for authenticating with the Swarm service
              </p>
            </div>

            {/* Section 4: ENV */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-2">Environment</h3>
              <Label htmlFor="poolName">Pool Name</Label>
              <Input
                id="poolName"
                placeholder="Enter the pool name"
                value={formData.poolName}
                onChange={(e) => handleInputChange("poolName", e.target.value)}
                className={errors.poolName ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.poolName && (
                <p className="text-sm text-destructive">{errors.poolName}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The name of the pool to use for your Stakgraph configuration
              </p>

              <h4 className="text-md font-medium mt-2">Environment Variables</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Add any ENV variables your Stakgraph integration needs. These will be included in your configuration.
              </p>
              <div className="space-y-2">
                {envVars.map((pair, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      placeholder="KEY"
                      value={pair.key}
                      onChange={(e) => handleEnvChange(idx, 'key', e.target.value)}
                      className="w-1/3"
                      disabled={loading}
                    />
                    <div className="relative w-1/2 flex items-center">
                      <Input
                        placeholder="VALUE"
                        type={pair.show ? 'text' : 'password'}
                        value={pair.value}
                        onChange={(e) => handleEnvChange(idx, 'value', e.target.value)}
                        className="pr-10"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                        onClick={() => handleEnvChange(idx, 'show', !pair.show)}
                        tabIndex={-1}
                        disabled={loading}
                      >
                        {pair.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRemoveEnv(idx)}
                      className="px-2"
                      disabled={envVars.length === 1 || loading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={handleAddEnv} className="mt-2" disabled={loading}>
                  Add Variable
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 