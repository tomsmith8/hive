"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Network, Save } from "lucide-react";
import { EnvironmentSetupStep } from "@/components/wizard/EnvironmentSetupStep";
import { useEnvironmentVars } from "@/hooks/useEnvironmentVars";
import { EnvironmentVariable } from "@/types/wizard";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function StakgraphPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    repositoryUrl: "",
    swarmUrl: "",
    swarmApiKey: "",
    poolName: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      // TODO: Implement API call to save configuration
      // For now, include envVars in the saved config
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaved(true);
      toast({
        title: "Configuration saved",
        description: "Your Stakgraph settings have been saved successfully!",
        variant: "success",
      });
      console.log("Stakgraph configuration saved:", { ...formData, envVars });
    } catch (error) {
      console.error("Failed to save configuration:", error);
      setErrors({ general: "Failed to save configuration. Please try again." });
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
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Network className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Stakgraph Configuration</h1>
          <p className="text-muted-foreground">
            Configure your settings for Stakgraph integration
          </p>
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
              <h3 className="text-lg font-semibold mb-2">Code</h3>
              <Label htmlFor="repositoryUrl">Repository URL</Label>
              <Input
                id="repositoryUrl"
                type="url"
                placeholder="https://github.com/your/repo"
                value={formData.repositoryUrl}
                onChange={(e) => handleInputChange("repositoryUrl", e.target.value)}
                className={errors.repositoryUrl ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.repositoryUrl && <p className="text-sm text-destructive">{errors.repositoryUrl}</p>}
              <p className="text-xs text-muted-foreground">
                The URL of your code repository (GitHub, GitLab, etc.)
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

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 