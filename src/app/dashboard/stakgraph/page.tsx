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

export default function StakgraphPage() {
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous states
    setErrors({});
    setSaved(false);
    
    // Validation
    const newErrors: Record<string, string> = {};
    
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

            {saved && (
              <div className="p-3 rounded-md bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-400">
                  Configuration saved successfully!
                </p>
              </div>
            )}

            <div className="space-y-2">
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
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
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
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-semibold">Environment Variables</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Add any ENV variables your Stakgraph integration needs. These will be included in your configuration.
              </p>
              {/* Inline the EnvironmentSetupStep's variable section only (not the full card/buttons) */}
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
                {loading ? "Saving..." : "Save Configuration"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setFormData({ swarmUrl: "", swarmApiKey: "", poolName: "" });
                  setErrors({});
                  setSaved(false);
                  setEnvVars([{ key: '', value: '', show: false }]);
                }}
                disabled={loading}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 