"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Monitor,
  RefreshCw,
  ExternalLink,
  Circle,
  Square,
  Target,
} from "lucide-react";
import { Artifact, BrowserContent } from "@/lib/chat";
import { useStaktrak } from "@/hooks/useStaktrak";

export function BrowserArtifactPanel({
  artifacts,
  ide,
}: {
  artifacts: Artifact[];
  ide?: boolean;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get the current artifact and its content
  const activeArtifact = artifacts[activeTab];
  const activeContent = activeArtifact?.content as BrowserContent;

  // Use staktrak hook with all the functions
  const {
    currentUrl,
    iframeRef,
    isSetup,
    isRecording,
    isAssertionMode,
    startRecording,
    stopRecording,
    enableAssertionMode,
    disableAssertionMode,
  } = useStaktrak(activeContent?.url);

  // Use currentUrl from staktrak hook, fallback to content.url
  const displayUrl = currentUrl || activeContent?.url;

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleTabOut = (url: string) => {
    window.open(url, "_blank");
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleAssertionToggle = () => {
    if (isAssertionMode) {
      disableAssertionMode();
    } else {
      enableAssertionMode();
    }
  };

  if (artifacts.length === 0) return null;

  return (
    <div className="h-full flex flex-col">
      {artifacts.length > 1 && (
        <div className="border-b bg-muted/20">
          <div className="flex overflow-x-auto">
            {artifacts.map((artifact, index) => (
              <button
                key={artifact.id}
                onClick={() => setActiveTab(index)}
                className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === index
                    ? "border-primary text-primary bg-background"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Preview {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {artifacts.map((artifact, index) => {
          const content = artifact.content as BrowserContent;
          const isActive = activeTab === index;
          // For the active tab, use the tracked URL, for others use original URL
          const tabUrl = isActive ? displayUrl : content.url;

          return (
            <div
              key={artifact.id}
              className={`h-full flex flex-col ${isActive ? "block" : "hidden"}`}
            >
              {!ide && (
                <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
                  <div className="flex items-center gap-2 min-w-0">
                    <Monitor className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {tabUrl}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isSetup && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleAssertionToggle}
                          className={`h-8 w-8 p-0 ${
                            isAssertionMode
                              ? "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                          title={
                            isAssertionMode
                              ? "Disable assertion mode"
                              : "Enable assertion mode"
                          }
                        >
                          <Target className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRecordToggle}
                          className={`h-8 w-8 p-0 ${
                            isRecording
                              ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }`}
                          title={
                            isRecording ? "Stop recording" : "Start recording"
                          }
                        >
                          {isRecording ? (
                            <Square className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTabOut(tabUrl)}
                      className="h-8 w-8 p-0"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefresh}
                      className="h-8 w-8 p-0"
                      title="Refresh"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <iframe
                  key={`${artifact.id}-${refreshKey}`}
                  ref={isActive ? iframeRef : undefined}
                  src={tabUrl}
                  className="w-full h-full border-0"
                  title={`Live Preview ${index + 1}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
