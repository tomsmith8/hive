import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { db } from "@/lib/db";
import { TaskStatus, Priority, WorkflowStatus } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid user session" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const includeLatestMessage = searchParams.get("includeLatestMessage") === "true";

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId query parameter is required" },
        { status: 400 },
      );
    }

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          error:
            "Invalid pagination parameters. Page must be >= 1, limit must be 1-100",
        },
        { status: 400 },
      );
    }

    // Verify workspace exists and user has access
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        deleted: false,
      },
      select: {
        id: true,
        ownerId: true,
        members: {
          where: {
            userId: userId,
          },
          select: {
            role: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    // Check if user is workspace owner or member
    const isOwner = workspace.ownerId === userId;
    const isMember = workspace.members.length > 0;

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get tasks for the workspace with pagination
    const skip = (page - 1) * limit;

    const [tasks, totalCount] = await Promise.all([
      db.task.findMany({
        where: {
          workspaceId,
          deleted: false,
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          workflowStatus: true,
          sourceType: true,
          stakworkProjectId: true,
          createdAt: true,
          updatedAt: true,
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          repository: {
            select: {
              id: true,
              name: true,
              repositoryUrl: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              githubAuth: {
                select: {
                  githubUsername: true,
                },
              },
            },
          },
          _count: {
            select: {
              chatMessages: true,
            },
          },
          ...(includeLatestMessage && {
            chatMessages: {
              orderBy: {
                timestamp: "desc",
              },
              take: 1,
              select: {
                id: true,
                timestamp: true,
                artifacts: {
                  select: {
                    id: true,
                    type: true,
                  },
                },
              },
            },
          }),
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.task.count({
        where: {
          workspaceId,
          deleted: false,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    // Process tasks to add hasActionArtifact flag
    const processedTasks = tasks.map((task: any) => {
      let hasActionArtifact = false;
      
      // Only check for action artifacts if the workflow is pending or in_progress
      if (includeLatestMessage && 
          task.chatMessages && 
          task.chatMessages.length > 0 &&
          (task.workflowStatus === WorkflowStatus.PENDING || task.workflowStatus === WorkflowStatus.IN_PROGRESS)) {
        const latestMessage = task.chatMessages[0];
        hasActionArtifact = latestMessage.artifacts?.some(
          (artifact: any) => artifact.type === 'FORM'
        ) || false;
      }

      // Return task with hasActionArtifact flag, removing chatMessages array to keep response clean
      const { chatMessages, ...taskWithoutMessages } = task;
      return {
        ...taskWithoutMessages,
        hasActionArtifact,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: includeLatestMessage ? processedTasks : tasks,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid user session" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      workspaceSlug,
      status,
      priority,
      assigneeId,
      repositoryId,
      estimatedHours,
      actualHours,
    } = body;

    // Validate required fields
    if (!title || !workspaceSlug) {
      return NextResponse.json(
        { error: "Missing required fields: title, workspaceId" },
        { status: 400 },
      );
    }

    // Verify workspace exists and user has access
    const workspace = await db.workspace.findFirst({
      where: {
        slug: workspaceSlug,
        deleted: false,
      },
      select: {
        id: true,
        ownerId: true,
        members: {
          where: {
            userId: userId,
          },
          select: {
            role: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    const workspaceId = workspace.id;
    
    // Verify that the user exists in the database
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    // Check if user is workspace owner or member
    const isOwner = workspace.ownerId === userId;
    const isMember = workspace.members.length > 0;

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Validate and convert status if provided
    let taskStatus: TaskStatus = TaskStatus.TODO; // default
    if (status) {
      // Handle frontend sending "active" status - map to IN_PROGRESS
      if (status === "active") {
        taskStatus = TaskStatus.IN_PROGRESS;
      } else if (Object.values(TaskStatus).includes(status as TaskStatus)) {
        taskStatus = status as TaskStatus;
      } else {
        return NextResponse.json(
          {
            error: `Invalid status. Must be one of: ${Object.values(TaskStatus).join(", ")}`,
          },
          { status: 400 },
        );
      }
    }

    // Validate priority if provided
    let taskPriority: Priority = Priority.MEDIUM; // default
    if (priority && Object.values(Priority).includes(priority as Priority)) {
      taskPriority = priority as Priority;
    } else if (priority) {
      return NextResponse.json(
        {
          error: `Invalid priority. Must be one of: ${Object.values(Priority).join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validate assignee exists if provided
    if (assigneeId) {
      const assignee = await db.user.findFirst({
        where: {
          id: assigneeId,
          deleted: false,
        },
      });

      if (!assignee) {
        return NextResponse.json(
          { error: "Assignee not found" },
          { status: 400 },
        );
      }
    }

    // Validate repository exists and belongs to workspace if provided
    if (repositoryId) {
      const repository = await db.repository.findFirst({
        where: {
          id: repositoryId,
        },
      });

      if (!repository || repository.workspaceId !== workspaceId) {
        return NextResponse.json(
          {
            error: "Repository not found or does not belong to this workspace",
          },
          { status: 400 },
        );
      }
    }

    // Create the task
    const task = await db.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        workspaceId,
        status: taskStatus,
        priority: taskPriority,
        assigneeId: assigneeId || null,
        repositoryId: repositoryId || null,
        estimatedHours: estimatedHours || null,
        actualHours: actualHours || null,
        createdById: userId,
        updatedById: userId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        repository: {
          select: {
            id: true,
            name: true,
            repositoryUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            githubAuth: {
              select: {
                githubUsername: true,
              },
            },
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: task,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
