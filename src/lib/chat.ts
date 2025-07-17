// Import Prisma types for consistency
import {
  ChatRole as PrismaChatRole,
  ChatStatus as PrismaChatStatus,
  ArtifactType as PrismaArtifactType,
  ContextTagType as PrismaContextTagType,
} from "@prisma/client";

// Re-export Prisma enums for consistency
export type ChatRole = PrismaChatRole;
export type ChatStatus = PrismaChatStatus;
export type ContextTagType = PrismaContextTagType;
export type ArtifactType = PrismaArtifactType;

export type BountyCardStatus =
  | "DRAFT"
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "COMPLETED"
  | "PAID";

export interface ContextTag {
  type: ContextTagType;
  id: string;
}

export interface Option {
  action_type: "button" | "chat";
  option_label: string;
  option_response: string;
  webhook: string;
}

export interface CodeContent {
  content: string; // the code
  language?: string;
  file?: string;
  change?: string;
  action?: string;
}

export interface BrowserContent {
  url: string;
}

export interface FormContent {
  actionText: string;
  options: Option[];
}

// Frontend-friendly interface that matches API responses
export interface Artifact {
  id: string;
  messageId: string;
  message_id?: string; // for backward compatibility
  type: ArtifactType;
  content?: FormContent | CodeContent | BrowserContent;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Frontend-friendly interface with string dates and optional fields
export interface ChatMessage {
  id: string;
  taskId?: string | null;
  message: string;
  role: ChatRole;
  timestamp: string | Date;
  contextTags?: ContextTag[];
  status: ChatStatus;
  sourceWebsocketID?: string | null;
  workspaceUUID?: string | null;
  artifacts?: Artifact[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Utility functions to convert between Prisma and frontend types
import {
  ChatMessage as PrismaChatMessage,
  Artifact as PrismaArtifact,
  Prisma,
} from "@prisma/client";

export function prismaChatMessageToFrontend(
  prismaMessage: PrismaChatMessage & { artifacts?: PrismaArtifact[] }
): ChatMessage {
  return {
    id: prismaMessage.id,
    taskId: prismaMessage.taskId,
    message: prismaMessage.message,
    role: prismaMessage.role,
    timestamp: prismaMessage.timestamp.toISOString(),
    contextTags: Array.isArray(prismaMessage.contextTags)
      ? (prismaMessage.contextTags as unknown as ContextTag[])
      : [],
    status: prismaMessage.status,
    sourceWebsocketID: prismaMessage.sourceWebsocketID,
    workspaceUUID: prismaMessage.workspaceUUID,
    artifacts: prismaMessage.artifacts?.map((artifact) => ({
      id: artifact.id,
      messageId: artifact.messageId,
      type: artifact.type,
      content: artifact.content as unknown as
        | FormContent
        | CodeContent
        | BrowserContent,
      createdAt: artifact.createdAt.toISOString(),
      updatedAt: artifact.updatedAt.toISOString(),
    })),
    createdAt: prismaMessage.createdAt.toISOString(),
    updatedAt: prismaMessage.updatedAt.toISOString(),
  };
}

export function frontendChatMessageToPrisma(
  frontendMessage: Omit<
    ChatMessage,
    "id" | "createdAt" | "updatedAt" | "artifacts"
  >
): Omit<PrismaChatMessage, "id" | "createdAt" | "updatedAt"> {
  return {
    taskId: frontendMessage.taskId || null,
    message: frontendMessage.message,
    role: frontendMessage.role,
    timestamp:
      typeof frontendMessage.timestamp === "string"
        ? new Date(frontendMessage.timestamp)
        : frontendMessage.timestamp,
    contextTags: (frontendMessage.contextTags ||
      []) as unknown as Prisma.JsonValue,
    status: frontendMessage.status,
    sourceWebsocketID: frontendMessage.sourceWebsocketID || null,
    workspaceUUID: frontendMessage.workspaceUUID || null,
  };
}
