import axios from "axios";
import { generateResponseBasedOnMessage } from "./responses";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, taskId, userId } = await req.json();

    console.log("📨 Received message:", { message, taskId, userId });

    // Simulate processing time
    const delay = 1111;

    setTimeout(async () => {
      try {
        // Generate mock response
        const mockResponse = generateResponseBasedOnMessage(message);

        console.log("🤖 Generated response:", mockResponse.message);

        // Send response back to main app
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000";

        console.log("🔗 Base URL:", baseUrl);

        const responsePayload = {
          taskId: taskId,
          message: mockResponse.message,
          contextTags: mockResponse.contextTags,
          sourceWebsocketID: mockResponse.sourceWebsocketID,
          artifacts: mockResponse.artifacts?.map((artifact) => ({
            type: artifact.type,
            content: artifact.content,
          })),
        };

        await axios.post(`${baseUrl}/api/chat/response`, responsePayload);

        console.log("✅ Response sent back to main app");
      } catch (error) {
        console.error("❌ Error sending response:", error);
      }
    }, delay);

    // Immediately respond to the original request
    return NextResponse.json({
      success: true,
      message: "Message received, response will be generated shortly",
    });
  } catch (error) {
    console.error("❌ Error processing message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
