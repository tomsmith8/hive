import { useState, useEffect, useRef, useCallback } from 'react';
import { wizardService } from '@/services';
import {
  WizardProgressRequest,
  WizardProgressResponse,
  WizardResetResponse,
  WizardStateResponse,
} from '@/types/wizard';

interface UseWizardOperationsOptions {
  workspaceSlug: string;
  pollInterval?: number;
}

interface UseWizardOperationsReturn {
  loading: boolean;
  error: string | null;
  getWizardState: () => Promise<WizardStateResponse | null>;
  updateWizardProgress: (data: Partial<WizardProgressRequest>) => Promise<WizardProgressResponse | null>;
  resetWizard: () => Promise<WizardResetResponse | null>;
  createSwarm: () => Promise<{ success: boolean; data?: { id: string } } | null>;
  pollSwarm: (swarmId: string) => Promise<{ success: boolean; status: string } | null>;
  startPolling: (swarmId: string, onActive: () => void) => void;
  stopPolling: () => void;
  isPolling: boolean;
}

export function useWizardOperations({ workspaceSlug, pollInterval = 3000 }: UseWizardOperationsOptions): UseWizardOperationsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleError = useCallback((err: unknown) => {
    let message = 'An error occurred';
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'object' && err !== null && 'message' in err) {
      message = String((err as { message?: unknown }).message);
    }
    setError(message);
    console.error('Wizard operation error:', err);
  }, []);

  const getWizardState = useCallback(async (): Promise<WizardStateResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      return await wizardService().getWizardState(workspaceSlug);
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug, handleError]);

  const updateWizardProgress = useCallback(async (data: Partial<WizardProgressRequest>): Promise<WizardProgressResponse | null> => {
    setError(null);
    try {
      return await wizardService().updateWizardProgress({ workspaceSlug, ...data });
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [workspaceSlug, handleError]);

  const resetWizard = useCallback(async (): Promise<WizardResetResponse | null> => {
    setError(null);
    try {
      return await wizardService().resetWizard(workspaceSlug);
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [workspaceSlug, handleError]);

  const createSwarm = useCallback(async (): Promise<{ success: boolean; data?: { id: string } } | null> => {
    setError(null);
    try {
      return await wizardService().createSwarm();
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [handleError]);

  const pollSwarm = useCallback(async (swarmId: string): Promise<{ success: boolean; status: string } | null> => {
    setError(null);
    try {
      return await wizardService().pollSwarm(swarmId);
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [handleError]);

  const startPolling = useCallback((swarmId: string, onActive: () => void) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setIsPolling(true);
    pollIntervalRef.current = setInterval(async () => {
      const result = await pollSwarm(swarmId);
      if (result?.success && result.status === 'ACTIVE') {
        clearInterval(pollIntervalRef.current!);
        pollIntervalRef.current = null;
        setIsPolling(false);
        onActive();
      }
    }, pollInterval);
  }, [pollSwarm, pollInterval]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  return {
    loading,
    error,
    getWizardState,
    updateWizardProgress,
    resetWizard,
    createSwarm,
    pollSwarm,
    startPolling,
    stopPolling,
    isPolling,
  };
} 