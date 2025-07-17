import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { db } from "@/lib/db";
import { ChatRole, ChatStatus, ArtifactType } from "@prisma/client";

interface ArtifactRequest {
  type: ArtifactType;
  content?: Record<string, unknown>;
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
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      taskId,
      message,
      contextTags = [],
      sourceWebsocketID,
      workspaceUUID,
      artifacts = [],
    } = body;

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Validate task exists and user has access (if taskId provided)
    if (taskId) {
      const task = await db.task.findFirst({
        where: {
          id: taskId,
          deleted: false,
        },
        include: {
          feature: {
            include: {
              product: {
                include: {
                  workspace: {
                    include: {
                      members: {
                        where: { userId },
                      },
                    },
                  },
                },
              },
            },
          },
          userStory: {
            include: {
              feature: {
                include: {
                  product: {
                    include: {
                      workspace: {
                        include: {
                          members: {
                            where: { userId },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      // Check if user has access to the workspace containing this task
      const workspace =
        task.feature?.product?.workspace ||
        task.userStory?.feature?.product?.workspace;

      if (
        !workspace ||
        (workspace.ownerId !== userId && workspace.members.length === 0)
      ) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Create the chat message
    const chatMessage = await db.chatMessage.create({
      data: {
        taskId,
        message,
        role: ChatRole.USER,
        contextTags: JSON.stringify(contextTags),
        status: ChatStatus.SENT,
        sourceWebsocketID,
        workspaceUUID,
        artifacts: {
          create: artifacts.map((artifact: ArtifactRequest) => ({
            type: artifact.type,
            content: artifact.content,
          })),
        },
      },
      include: {
        artifacts: true,
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: chatMessage.id,
          taskId: chatMessage.taskId,
          message: chatMessage.message,
          role: chatMessage.role,
          timestamp: chatMessage.timestamp,
          contextTags: JSON.parse(chatMessage.contextTags as string),
          status: chatMessage.status,
          sourceWebsocketID: chatMessage.sourceWebsocketID,
          workspaceUUID: chatMessage.workspaceUUID,
          artifacts: chatMessage.artifacts,
          task: chatMessage.task,
          createdAt: chatMessage.createdAt,
          updatedAt: chatMessage.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating chat message:", error);
    return NextResponse.json(
      { error: "Failed to create chat message" },
      { status: 500 }
    );
  }
}
