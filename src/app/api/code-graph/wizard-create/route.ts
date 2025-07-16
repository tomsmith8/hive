import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/nextauth';
import { db } from '@/lib/db';
import { validateUserWorkspaceAccess } from '@/lib/auth/workspace-resolver';
import { SwarmStatus, SwarmWizardStep, StepStatus } from '@prisma/client';
import { WizardProgressResponse } from '@/types/wizard';

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { workspaceSlug, wizardStep, stepStatus, wizardData } = body;
    
    // Convert types to Prisma enums
    const prismaWizardStep = wizardStep as SwarmWizardStep;
    const prismaStepStatus = stepStatus as StepStatus;

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
        name: true,
        slug: true,
      },
    });

    if (!workspace) {
      return NextResponse.json({
        success: false,
        message: 'Workspace not found',
      } as WizardProgressResponse, { status: 404 });
    }

    // Check if swarm already exists
    const existingSwarm = await db.swarm.findFirst({
      where: {
        workspaceId: workspace.id,
      },
    });

    if (existingSwarm) {
      return NextResponse.json({
        success: false,
        message: 'Swarm already exists for this workspace',
      } as WizardProgressResponse, { status: 409 });
    }

    // Create new swarm with provided data
    const newSwarm = await db.swarm.create({
      data: {
        workspaceId: workspace.id,
        name: `${workspace.slug}`,
        status: SwarmStatus.PENDING,
        wizardStep: prismaWizardStep,
        stepStatus: prismaStepStatus,
        wizardData: wizardData || {},
        environmentVariables: [],
        services: [],
      },
      select: {
        id: true,
        wizardStep: true,
        stepStatus: true,
        wizardData: true,
      },
    });

    // Parse wizard data if it's a string
    let parsedWizardData: Record<string, unknown> = {};
    if (typeof newSwarm.wizardData === 'string') {
      try {
        parsedWizardData = JSON.parse(newSwarm.wizardData);
      } catch (error) {
        console.warn('Failed to parse wizard data:', error);
        parsedWizardData = {};
      }
    } else if (typeof newSwarm.wizardData === 'object' && newSwarm.wizardData !== null) {
      parsedWizardData = newSwarm.wizardData as Record<string, unknown>;
    }

    return NextResponse.json({
      success: true,
      data: {
        wizardStep: newSwarm.wizardStep,
        stepStatus: newSwarm.stepStatus,
        wizardData: parsedWizardData,
      },
    } as WizardProgressResponse);

  } catch (error) {
    console.error('Error creating swarm:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as WizardProgressResponse, { status: 500 });
  }
}