import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/nextauth';
import { db } from '@/lib/db';
import { validateUserWorkspaceAccess } from '@/lib/auth/workspace-resolver';
import { SwarmWizardStep, StepStatus } from '@prisma/client';
import { WizardProgressRequest, WizardProgressResponse } from '@/types/wizard';

// Valid wizard step order for validation
const WIZARD_STEP_ORDER: SwarmWizardStep[] = [
  'WELCOME',
  'REPOSITORY_SELECT',
  'PROJECT_NAME',
  'GRAPH_INFRASTRUCTURE',
  'INGEST_CODE',
  'ADD_SERVICES',
  'ENVIRONMENT_SETUP',
  'REVIEW_POOL_ENVIRONMENT',
  'STAKWORK_SETUP'
];

// Valid step status transitions
const VALID_STATUS_TRANSITIONS: Record<StepStatus, StepStatus[]> = {
  PENDING: ['STARTED', 'PROCESSING'],
  STARTED: ['PROCESSING', 'COMPLETED', 'FAILED'],
  PROCESSING: ['COMPLETED', 'FAILED'],
  COMPLETED: ['STARTED'], // Can go back to restart a step
  FAILED: ['STARTED', 'PROCESSING']
};

function validateStepTransition(currentStep: SwarmWizardStep, newStep: SwarmWizardStep): boolean {
  const currentIndex = WIZARD_STEP_ORDER.indexOf(currentStep);
  const newIndex = WIZARD_STEP_ORDER.indexOf(newStep);
  
  // Allow staying on the same step or moving to next step
  // Also allow moving backward (for editing previous steps)
  return newIndex >= 0 && currentIndex >= 0;
}

function validateStatusTransition(currentStatus: StepStatus, newStatus: StepStatus): boolean {
  return VALID_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || currentStatus === newStatus;
}

export async function PUT(request: NextRequest) {
  try {
    // Get session and validate user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
      } as WizardProgressResponse, { status: 401 });
    }

    // Parse request body
    const body: WizardProgressRequest = await request.json();
    const { workspaceSlug, wizardStep, stepStatus, wizardData } = body;
    
    // Convert types to Prisma enums if provided
    const prismaWizardStep = wizardStep as SwarmWizardStep | undefined;
    const prismaStepStatus = stepStatus as StepStatus | undefined;

    if (!workspaceSlug) {
      return NextResponse.json({
        success: false,
        message: 'Workspace slug is required',
      } as WizardProgressResponse, { status: 400 });
    }

    // Validate workspace access
    const validatedSlug = await validateUserWorkspaceAccess(session, workspaceSlug);
    if (!validatedSlug) {
      return NextResponse.json({
        success: false,
        message: 'Access denied to workspace',
      } as WizardProgressResponse, { status: 403 });
    }

    // Get workspace
    const workspace = await db.workspace.findFirst({
      where: {
        slug: workspaceSlug,
        deleted: false,
      },
      select: {
        id: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({
        success: false,
        message: 'Workspace not found',
      } as WizardProgressResponse, { status: 404 });
    }

    // Get current swarm state
    const currentSwarm = await db.swarm.findFirst({
      where: {
        workspaceId: workspace.id,
      },
      select: {
        id: true,
        wizardStep: true,
        stepStatus: true,
        wizardData: true,
      },
    });

    if (!currentSwarm) {
      return NextResponse.json({
        success: false,
        message: 'No swarm found for workspace',
      } as WizardProgressResponse, { status: 404 });
    }

    // Validate step transition if wizardStep is provided
    if (prismaWizardStep && !validateStepTransition(currentSwarm.wizardStep, prismaWizardStep)) {
      return NextResponse.json({
        success: false,
        message: `Invalid wizard step transition from ${currentSwarm.wizardStep} to ${prismaWizardStep}`,
      } as WizardProgressResponse, { status: 400 });
    }

    // Validate status transition if stepStatus is provided
    if (prismaStepStatus && !validateStatusTransition(currentSwarm.stepStatus, prismaStepStatus)) {
      return NextResponse.json({
        success: false,
        message: `Invalid step status transition from ${currentSwarm.stepStatus} to ${prismaStepStatus}`,
      } as WizardProgressResponse, { status: 400 });
    }

    // Prepare update data
    const updateData: {
      wizardStep?: SwarmWizardStep;
      stepStatus?: StepStatus;
      wizardData?: Record<string, unknown>;
    } = {};

    if (prismaWizardStep) updateData.wizardStep = prismaWizardStep;
    if (prismaStepStatus) updateData.stepStatus = prismaStepStatus;
    if (wizardData) updateData.wizardData = wizardData;

    // Update swarm
    const updatedSwarm = await db.swarm.update({
      where: {
        id: currentSwarm.id,
      },
      data: updateData,
      select: {
        wizardStep: true,
        stepStatus: true,
        wizardData: true,
      },
    });

    // Parse wizard data if it's a string
    let parsedWizardData: Record<string, unknown> = {};
    if (typeof updatedSwarm.wizardData === 'string') {
      try {
        parsedWizardData = JSON.parse(updatedSwarm.wizardData);
      } catch (error) {
        console.warn('Failed to parse wizard data:', error);
        parsedWizardData = {};
      }
    } else if (typeof updatedSwarm.wizardData === 'object' && updatedSwarm.wizardData !== null) {
      parsedWizardData = updatedSwarm.wizardData as Record<string, unknown>;
    }

    return NextResponse.json({
      success: true,
      data: {
        wizardStep: updatedSwarm.wizardStep,
        stepStatus: updatedSwarm.stepStatus,
        wizardData: parsedWizardData,
      },
    } as WizardProgressResponse);

  } catch (error) {
    console.error('Error updating wizard progress:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as WizardProgressResponse, { status: 500 });
  }
}