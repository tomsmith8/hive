import { NextRequest, NextResponse } from "next/server";
import { authOptions, getGithubUsernameAndPAT } from "@/lib/auth/nextauth";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/db";
import { EncryptionService } from "@/lib/encryption";
import { validateWorkspaceAccess } from "@/services/workspace";
import { QUICK_ASK_SYSTEM_PROMPT } from "@/lib/constants/prompt";
import { askTools } from "@/lib/ai/askTools";
import { streamText, hasToolCall, ModelMessage } from "ai";
import { getModel, getApiKeyForProvider } from "aieo";

export const runtime = "nodejs";

type Provider = "anthropic" | "google" | "openai" | "claude_code";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log("❌ Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const question = searchParams.get("question");
    const workspaceSlug = searchParams.get("workspace");

    // console.log("📝 Question:", question);
    // console.log("🏢 Workspace:", workspaceSlug);

    if (!question) {
      return NextResponse.json({ error: "Missing required parameter: question" }, { status: 400 });
    }
    if (!workspaceSlug) {
      return NextResponse.json({ error: "Missing required parameter: workspace" }, { status: 400 });
    }

    const workspaceAccess = await validateWorkspaceAccess(workspaceSlug, session.user.id);
    if (!workspaceAccess.hasAccess) {
      return NextResponse.json({ error: "Workspace not found or access denied" }, { status: 403 });
    }

    const swarm = await db.swarm.findFirst({
      where: { workspaceId: workspaceAccess.workspace?.id },
    });
    if (!swarm) {
      return NextResponse.json({ error: "Swarm not found for this workspace" }, { status: 404 });
    }
    if (!swarm.swarmUrl) {
      return NextResponse.json({ error: "Swarm URL not configured" }, { status: 404 });
    }

    const encryptionService: EncryptionService = EncryptionService.getInstance();
    const decryptedSwarmApiKey = encryptionService.decryptField("swarmApiKey", swarm.swarmApiKey || "");

    const swarmUrlObj = new URL(swarm.swarmUrl);
    let baseSwarmUrl = `https://${swarmUrlObj.hostname}:3355`;
    if (swarm.swarmUrl.includes("localhost")) {
      baseSwarmUrl = `http://localhost:3355`;
    }

    // Get repository URL from swarm
    const repoUrl = swarm.repositoryUrl;
    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL not configured for this swarm" }, { status: 404 });
    }

    // Get GitHub PAT for the workspace
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceAccess.workspace?.id },
      select: { slug: true },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const githubProfile = await getGithubUsernameAndPAT(session.user.id, workspace.slug);
    const pat = githubProfile?.token;

    if (!pat) {
      return NextResponse.json({ error: "GitHub PAT not found for this user" }, { status: 404 });
    }

    const provider: Provider = "anthropic";
    const apiKey = getApiKeyForProvider(provider);
    const model = await getModel(provider, apiKey, workspaceSlug);
    const tools = askTools(baseSwarmUrl, decryptedSwarmApiKey, repoUrl, pat, apiKey);

    const messages: ModelMessage[] = [
      { role: "system", content: QUICK_ASK_SYSTEM_PROMPT },
      { role: "user", content: question },
    ];

    console.log("🤖 Creating generateText with:", {
      model: model?.modelId,
      toolsCount: Object.keys(tools).length,
      messagesCount: messages.length,
      question: question,
    });

    try {
      const result = streamText({
        model,
        tools,
        messages,
        stopWhen: hasToolCall("final_answer"),
        onStepFinish: (sf) => logStep(sf.content),
      });

      return result.toUIMessageStreamResponse();

      // const { steps, text } = await generateText({
      //   model,
      //   tools,
      //   messages,
      //   stopWhen: hasToolCall("final_answer"),
      //   onStepFinish: (sf) => logStep(sf.content),
      // });

      // let final = "";
      // steps.reverse();
      // for (const step of steps) {
      //   const final_answer = step.content.find((c) => {
      //     return c.type === "tool-result" && c.toolName === "final_answer";
      //   });
      //   if (final_answer) {
      //     final = (final_answer as unknown as { output: string }).output;
      //   }
      // }

      // // If no final_answer tool result found, check if it's in the text output
      // if (!final && text) {
      //   const functionCallMatch = text.match(/<parameter name="answer">([\s\S]*?)<\/parameter>/);
      //   if (functionCallMatch) {
      //     final = functionCallMatch[1].trim();
      //   } else {
      //     // Fallback to using the raw text if no tool call found
      //     final = text;
      //   }
      // }

      // console.log("🤖 Result:", final);

      // return NextResponse.json({ result: final }, { status: 200 });
    } catch (streamError) {
      console.error("❌ Error in streamText:", streamError);
      return NextResponse.json({ error: "Failed to create stream" }, { status: 500 });
    }
  } catch (error) {
    console.error("Quick Ask API error:", error);
    return NextResponse.json({ error: "Failed to process quick ask" }, { status: 500 });
  }
}

function logStep(contents: unknown) {
  if (!Array.isArray(contents)) return;
  for (const content of contents) {
    if (content.type === "tool-call") {
      console.log("TOOL CALL:", content.toolName, ":", content.input);
    }
    if (content.type === "tool-result") {
      console.log("TOOL RESULT:", content.toolName, ":", content.output);
    }
  }
}
