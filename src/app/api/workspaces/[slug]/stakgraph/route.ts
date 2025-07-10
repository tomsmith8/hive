import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { getWorkspaceBySlug } from "@/services/workspace";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for stakgraph settings
const stakgraphSettingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  repositoryUrl: z.string().url("Invalid repository URL"),
  swarmUrl: z.string().url("Invalid swarm URL"),
  swarmApiKey: z.string().min(1, "Swarm API key is required"),
  poolName: z.string().min(1, "Pool name is required"),
  environmentVariables: z.array(z.object({
    key: z.string(),
    value: z.string()
  })).default([])
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required", error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid user session", error: "INVALID_SESSION" },
        { status: 401 }
      );
    }

    // Get workspace and verify access
    const workspace = await getWorkspaceBySlug(slug, userId);
    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found", error: "WORKSPACE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Get the swarm associated with this workspace
    const swarm = await db.swarm.findUnique({
      where: { workspaceId: workspace.id },
      select: {
        id: true,
        name: true,
        swarmUrl: true,
        poolName: true,
        repositoryName: true,
        repositoryDescription: true,
        repositoryUrl: true,
        swarmApiKey: true,
        environmentVariables: true,
        status: true,
        updatedAt: true
      }
    });

    if (!swarm) {
      return NextResponse.json(
        { success: false, message: "No swarm found for this workspace", error: "SWARM_NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Stakgraph settings retrieved successfully",
      data: {
        name: swarm.repositoryName || "",
        description: swarm.repositoryDescription || "",
        repositoryUrl: swarm.repositoryUrl || "",
        swarmUrl: swarm.swarmUrl || "",
        swarmApiKey: swarm.swarmApiKey || "",
        poolName: swarm.poolName || "",
        environmentVariables: Array.isArray(swarm.environmentVariables) 
          ? swarm.environmentVariables 
          : [],
        status: swarm.status,
        lastUpdated: swarm.updatedAt
      }
    });

  } catch (error) {
    console.error("Error retrieving stakgraph settings:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required", error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid user session", error: "INVALID_SESSION" },
        { status: 401 }
      );
    }

    // Get workspace and verify access
    const workspace = await getWorkspaceBySlug(slug, userId);
    if (!workspace) {
      return NextResponse.json(
        { success: false, message: "Workspace not found", error: "WORKSPACE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = stakgraphSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: "VALIDATION_ERROR",
          details: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const settings = validationResult.data;

    // Check if swarm exists for this workspace
    let swarm = await db.swarm.findUnique({
      where: { workspaceId: workspace.id }
    });

    if (swarm) {
      // Update existing swarm
      swarm = await db.swarm.update({
        where: { workspaceId: workspace.id },
        data: {
          repositoryName: settings.name,
          repositoryDescription: settings.description,
          repositoryUrl: settings.repositoryUrl,
          swarmUrl: settings.swarmUrl,
          swarmApiKey: settings.swarmApiKey,
          poolName: settings.poolName,
          environmentVariables: settings.environmentVariables,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new swarm
      swarm = await db.swarm.create({
        data: {
          name: workspace.name, // Use workspace name for swarm name
          workspaceId: workspace.id,
          repositoryName: settings.name,
          repositoryDescription: settings.description,
          repositoryUrl: settings.repositoryUrl,
          swarmUrl: settings.swarmUrl,
          swarmApiKey: settings.swarmApiKey,
          poolName: settings.poolName,
          environmentVariables: settings.environmentVariables,
          status: "PENDING"
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Stakgraph settings saved successfully",
      data: {
        id: swarm.id,
        name: swarm.repositoryName,
        description: swarm.repositoryDescription,
        repositoryUrl: swarm.repositoryUrl,
        swarmUrl: swarm.swarmUrl,
        poolName: swarm.poolName,
        status: swarm.status,
        updatedAt: swarm.updatedAt
      }
    });

  } catch (error) {
    console.error("Error saving stakgraph settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save stakgraph settings", error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
} 