import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ChatRole, ChatStatus, ArtifactType } from "@prisma/client";

interface ArtifactRequest {
  type: ArtifactType;
  content?: Record<string, unknown>;
}

// TODO: Implement real-time connection management
// const connections = new Map<string, Response>();

export async function POST(request: NextRequest) {
  try {
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

    // Validate task exists (if taskId provided)
    if (taskId) {
      const task = await db.task.findFirst({
        where: {
          id: taskId,
          deleted: false,
        },
      });

      if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
    }

    // Create the chat message
    const chatMessage = await db.chatMessage.create({
      data: {
        taskId,
        message,
        role: ChatRole.ASSISTANT,
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

    // Prepare the message data for real-time broadcast
    const messageData = {
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
    };

    // TODO: Implement real-time broadcasting via WebSocket or SSE
    // For now, we just store the message in the database
    // The frontend can poll for new messages or use a WebSocket library
    console.log(
      "Chat message created and ready for broadcast:",
      messageData.id
    );

    return NextResponse.json(
      {
        success: true,
        data: messageData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating chat response:", error);
    return NextResponse.json(
      { error: "Failed to create chat response" },
      { status: 500 }
    );
  }
}

// GET endpoint for Server-Sent Events connection (simplified for now)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceUUID = searchParams.get("workspace");

  // TODO: Implement proper SSE/WebSocket connection
  // For now, return a simple response indicating the endpoint is available
  return NextResponse.json({
    message: "Real-time endpoint available",
    workspaceUUID,
    timestamp: new Date().toISOString(),
  });
}
