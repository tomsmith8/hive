"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowRight, CheckCircle } from "lucide-react";

interface OnboardingWorkspaceClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id: string;
    github?: {
      username?: string;
      publicRepos?: number;
      followers?: number;
    };
  };
}

export function OnboardingWorkspaceClient({ user }: OnboardingWorkspaceClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Workspace name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (formData.slug.length < 3) newErrors.slug = "Slug must be at least 3 characters";
    if (!/^[a-z0-9-]+$/.test(formData.slug)) newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          slug: formData.slug.trim(),
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create workspace");
      
      // Redirect to dashboard after successful creation
      router.push("/dashboard");
    } catch (err: any) {
      setApiError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-primary rounded-full">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Create Your Workspace</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Welcome to Hive! Let&apos;s set up your workspace to get started.
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="border-0 shadow-xl bg-card text-card-foreground">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., My Company, Product Team, Personal Projects"
                  value={formData.name}
                  onChange={e => handleNameChange(e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                  disabled={loading}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                <p className="text-xs text-muted-foreground">
                  Choose a name that represents your team or organization.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Workspace URL</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">hive.app/</span>
                  <Input
                    id="slug"
                    placeholder="my-workspace"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                    className={errors.slug ? "border-destructive flex-1" : "flex-1"}
                    disabled={loading}
                  />
                </div>
                {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                <p className="text-xs text-muted-foreground">
                  This will be your workspace&apos;s unique URL. Only lowercase letters, numbers, and hyphens allowed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this workspace will be used for..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  disabled={loading}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Help your team understand the purpose of this workspace.
                </p>
              </div>

              {apiError && (
                <div className="p-3 border border-destructive bg-destructive/10 rounded-md">
                  <p className="text-sm text-destructive">{apiError}</p>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading || !formData.name || !formData.slug} 
                className="w-full h-12 text-base font-medium"
              >
                {loading ? (
                  "Creating Workspace..."
                ) : (
                  <>
                    Create Workspace
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 