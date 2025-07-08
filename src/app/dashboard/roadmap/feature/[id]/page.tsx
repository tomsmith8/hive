"use client";

import { useRouter, useParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Trash2, Users, FileText, Sparkles, ArrowLeft } from "lucide-react";
import { UserStoriesTab } from "@/components/roadmap/UserStoriesTab";
import { RequirementsTab } from "@/components/roadmap/RequirementsTab";
// import { EditFeatureDialog } from "@/components/roadmap/EditFeatureDialog";
import React, { useState } from "react";
import type { Feature } from "@/components/roadmap/RoadmapContent";

// TODO: Replace with real feature fetching logic
const mockFeature: Feature = {
  id: "1",
  title: "User Authentication",
  brief: "Implement secure user authentication system with multiple providers",
  status: "in-progress",
  priority: "high",
  userStories: [],
  requirements: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function FeatureDetailPage() {
  const router = useRouter();
  const params = useParams();
  const featureId = params.id as string;
  // TODO: Fetch feature by id
  const feature: Feature = mockFeature; // Replace with real fetch
  const [activeTab, setActiveTab] = useState<string>("overview");

  const getStatusColor = (status: Feature["status"]): string => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "on-hold":
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: Feature["priority"]): string => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Button variant="ghost" onClick={() => router.push("/dashboard/roadmap")}
        className="mb-4 flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Roadmap
      </Button>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{feature.title}</h1>
          <p className="mt-2 text-muted-foreground">{feature.brief}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        <Badge variant="secondary" className={getStatusColor(feature.status)}>
          {feature.status.charAt(0).toUpperCase() + feature.status.slice(1).replace("-", " ")}
        </Badge>
        <Badge variant="outline" className={getPriorityColor(feature.priority)}>
          {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)} Priority
        </Badge>
      </div>
      <Separator className="mb-4" />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="user-stories">User Stories</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        <div className="flex-1 overflow-hidden">
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Feature Brief</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.brief}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <Badge variant="secondary" className={getStatusColor(feature.status)}>
                    {feature.status.charAt(0).toUpperCase() + feature.status.slice(1).replace("-", " ")}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Priority</h4>
                  <Badge variant="outline" className={getPriorityColor(feature.priority)}>
                    {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)} Priority
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">User Stories</h4>
                  <p className="text-2xl font-bold text-primary">{feature.userStories.length}</p>
                  <p className="text-sm text-muted-foreground">Stories defined</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <p className="text-2xl font-bold text-primary">{feature.requirements.length}</p>
                  <p className="text-sm text-muted-foreground">Requirements documented</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Created:</span> {feature.createdAt.toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {feature.updatedAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="user-stories" className="mt-4 flex-1 overflow-hidden">
            {/* TODO: Pass correct props for feature/user stories */}
            <UserStoriesTab feature={feature} onUpdateFeature={() => {}} />
          </TabsContent>
          <TabsContent value="requirements" className="mt-4 flex-1 overflow-hidden">
            {/* TODO: Pass correct props for feature/requirements */}
            <RequirementsTab feature={feature} onUpdateFeature={() => {}} />
          </TabsContent>
          <TabsContent value="architecture" className="mt-4 flex-1 overflow-hidden">
            {/* TODO: Add architecture content here (no summary/diagram for now) */}
            <div className="text-muted-foreground">Architecture content coming soon.</div>
          </TabsContent>
          <TabsContent value="tasks" className="mt-4 flex-1 overflow-hidden">
            {/* TODO: Show tasks related to this feature only */}
            <div className="text-muted-foreground">Feature-specific tasks will be shown here.</div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
} 