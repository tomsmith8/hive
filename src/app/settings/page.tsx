"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Save, Loader2, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { MultiInput } from "@/components/ui/multi-input"
import { PasswordInput } from "@/components/ui/password-input"

const settingsSchema = z.object({
  repositories: z.array(z.string().url("Please enter a valid repository URL")).min(1, "At least one repository is required"),
  swarmUrl: z.string().url("Please enter a valid Swarm URL"),
  swarmApiKey: z.string().min(1, "Swarm API key is required"),
  poolName: z.string().min(1, "Pool name is required"),
  username: z.string().min(1, "Username is required"),
  githubPat: z.string().min(1, "GitHub Personal Access Token is required"),
})

type SettingsForm = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      repositories: [],
      swarmUrl: "",
      swarmApiKey: "",
      poolName: "",
      username: "",
      githubPat: "",
    },
  })

  useEffect(() => {
    setTimeout(() => setIsLoadingSettings(false), 500);
  }, []);

  const onSubmit = async (data: SettingsForm) => {
    setIsLoading(true)
    setIsSaved(false)
    
    setTimeout(() => {
      setIsSaved(true);
      setIsLoading(false);
      setTimeout(() => setIsSaved(false), 3000);
    }, 1000);
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your code graph and development environment settings.
          </p>
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isSaved ? (
            <CheckCircle className="mr-2 h-4 w-4" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Saving..." : isSaved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {isLoadingSettings ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading settings...</span>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Code Graph Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Code Graph Configuration</CardTitle>
              <CardDescription>
                Configure repositories and settings for code analysis and visualization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Repositories */}
              <FormField
                control={form.control}
                name="repositories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repositories</FormLabel>
                    <FormControl>
                      <MultiInput
                        values={field.value}
                        onChange={field.onChange}
                        placeholder="https://github.com/username/repository"
                        maxItems={20}
                      />
                    </FormControl>
                    <FormDescription>
                      Add GitHub repository URLs to analyze. You can add up to 20 repositories.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Swarm Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="swarmUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Swarm URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://swarm.example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The URL of your Swarm instance for distributed processing.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="swarmApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Swarm API Key</FormLabel>
                      <FormControl>
                        <PasswordInput
                          placeholder="Enter your Swarm API key"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Swarm API key for authentication.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pool Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="poolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pool Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="my-code-pool"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Name of the processing pool for your code analysis tasks.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your-username"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your username for the code graph system.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* GitHub Configuration */}
              <FormField
                control={form.control}
                name="githubPat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Personal Access Token</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your GitHub Personal Access Token for repository access. 
                      <a 
                        href="https://github.com/settings/tokens" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline ml-1"
                      >
                        Generate a new token
                      </a>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Environment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Information</CardTitle>
              <CardDescription>
                Current environment and system information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Environment:</span> Development
                </div>
                <div>
                  <span className="font-medium">Version:</span> 1.0.0
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <span className="text-green-600 ml-1">Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
        )}
    </div>
  )
} 