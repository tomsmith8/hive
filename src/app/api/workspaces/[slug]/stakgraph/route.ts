import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { getWorkspaceBySlug } from "@/services/workspace";
import { db } from "@/lib/db";
import { z } from "zod";
import { PoolManagerService } from "@/services/pool-manager";
import { ServiceConfig } from "@/types";
import { config } from "@/lib/env";
import { saveOrUpdateSwarm, select as swarmSelect } from "@/services/swarm/db";
import type { SwarmSelectResult } from "@/types/swarm";
import { SwarmStatus } from "@prisma/client";

// Validation schema for stakgraph settings
const stakgraphSettingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  repositoryUrl: z.string().url("Invalid repository URL"),
  swarmUrl: z.string().url("Invalid swarm URL"),
  swarmSecretAlias: z.string().min(1, "Swarm API key is required"),
  poolName: z.string().min(1, "Pool name is required"),
  environmentVariables: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    )
    .default([]),
  services: z
    .array(
      z.object({
        name: z.string().min(1, "Service name is required"),
        port: z.preprocess(
          (val) => Number(val),
          z.number().int().min(1, "Port is required")
        ),
        scripts: z.object({
          start: z.string().min(1, "Start script is required"),
          install: z.string().optional(),
          build: z.string().optional(),
          test: z.string().optional(),
        }),
      })
    )
    .default([]),
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
        {
          success: false,
          message: "Authentication required",
          error: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user session",
          error: "INVALID_SESSION",
        },
        { status: 401 }
      );
    }

    // Get workspace and verify access
    const workspace = await getWorkspaceBySlug(slug, userId);
    if (!workspace) {
      return NextResponse.json(
        {
          success: false,
          message: "Workspace not found",
          error: "WORKSPACE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // Get the swarm associated with this workspace
    const swarm = (await db.swarm.findUnique({
      where: { workspaceId: workspace.id },
      select: swarmSelect,
    })) as SwarmSelectResult | null;

    if (!swarm) {
      return NextResponse.json(
        {
          success: false,
          message: "No swarm found for this workspace",
          error: "SWARM_NOT_FOUND",
        },
        { status: 200 }
      );
    }

    const user = await db.user.findUnique({
      where: {
        email: session?.user?.email || "",
      },
    });

    const poolApiKey = user?.poolApiKey;

    // Fetch environment variables from Pool Manager using poolName and poolApiKey
    let environmentVariables: Array<{ key: string; value: string }> = [];
    if (swarm.poolName && poolApiKey) {
      try {
        const poolManager = new PoolManagerService(
          config as unknown as ServiceConfig
        );
        environmentVariables = await poolManager.getPoolEnvVars(
          swarm.poolName,
          poolApiKey
        );
      } catch (err) {
        console.error("Failed to fetch env vars from Pool Manager:", err);
        // Optionally, you can return an error or fallback to empty array
      }
    }

    return NextResponse.json({
      success: true,
      message: "Stakgraph settings retrieved successfully",
      data: {
        name: swarm.repositoryName || "",
        description: swarm.repositoryDescription || "",
        repositoryUrl: swarm.repositoryUrl || "",
        swarmUrl: swarm.swarmUrl || "",
        swarmSecretAlias: swarm.swarmSecretAlias || "",
        poolName: swarm.poolName || "",
        environmentVariables,
        services:
          typeof swarm.services === "string"
            ? JSON.parse(swarm.services)
            : swarm.services || [],
        status: swarm.status,
        lastUpdated: swarm.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error retrieving stakgraph settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      },
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
        {
          success: false,
          message: "Authentication required",
          error: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user session",
          error: "INVALID_SESSION",
        },
        { status: 401 }
      );
    }

    // Get workspace and verify access
    const workspace = await getWorkspaceBySlug(slug, userId);
    if (!workspace) {
      return NextResponse.json(
        {
          success: false,
          message: "Workspace not found",
          error: "WORKSPACE_NOT_FOUND",
        },
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
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const settings = validationResult.data;

    // Save or update Swarm using shared service
    const swarm = await saveOrUpdateSwarm({
      workspaceId: workspace.id,
      name: workspace.name, // Use workspace name for swarm name
      repositoryName: settings.name,
      repositoryDescription: settings.description,
      repositoryUrl: settings.repositoryUrl,
      swarmUrl: settings.swarmUrl,
      status: SwarmStatus.ACTIVE, // auto active
      swarmSecretAlias: settings.swarmSecretAlias,
      poolName: settings.poolName,
      services: settings.services,
    });

    const user = await db.user.findUnique({
      where: {
        email: session?.user?.email || "",
      },
    });

    const poolApiKey = user?.poolApiKey;

    // After updating/creating the swarm, update environment variables in Pool Manager if poolName, poolApiKey, and environmentVariables are present
    if (
      settings.poolName &&
      poolApiKey &&
      Array.isArray(settings.environmentVariables)
    ) {
      try {
        const poolManager = new PoolManagerService(
          config as unknown as ServiceConfig
        );
        // Fetch current env vars from Pool Manager
        const currentEnvVars = await poolManager.getPoolEnvVars(
          settings.poolName,
          poolApiKey
        );
        // Always send all vars, with correct masked/changed status
        await poolManager.updatePoolEnvVars(
          settings.poolName,
          poolApiKey,
          settings.environmentVariables,
          currentEnvVars
        );
      } catch (err) {
        console.error("Failed to update env vars in Pool Manager:", err);
        // Optionally, return error or continue
      }
    }

    const typedSwarm = swarm as SwarmSelectResult & { poolApiKey?: string };
    return NextResponse.json({
      success: true,
      message: "Stakgraph settings saved successfully",
      data: {
        id: typedSwarm.id,
        name: typedSwarm.repositoryName,
        description: typedSwarm.repositoryDescription,
        repositoryUrl: typedSwarm.repositoryUrl,
        swarmUrl: typedSwarm.swarmUrl,
        poolName: typedSwarm.poolName,
        poolApiKey: typedSwarm.poolApiKey || "",
        swarmSecretAlias: typedSwarm.swarmSecretAlias || "",
        services:
          typeof typedSwarm.services === "string"
            ? JSON.parse(typedSwarm.services)
            : typedSwarm.services || [],
        status: typedSwarm.status,
        updatedAt: typedSwarm.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error saving stakgraph settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save stakgraph settings",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
