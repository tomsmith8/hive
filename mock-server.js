/* eslint-disable @typescript-eslint/no-require-imports */
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3001;

// Enable JSON parsing
app.use(express.json());

// Replicate the enums and types from the main app
const ChatRole = {
  USER: "USER",
  ASSISTANT: "ASSISTANT",
};

const ChatStatus = {
  SENT: "SENT",
  PENDING: "PENDING",
  FAILED: "FAILED",
};

const ArtifactType = {
  CODE: "CODE",
  BROWSER: "BROWSER",
  FORM: "FORM",
};

// Helper function to create artifact
function createArtifact({ id, messageId, type, content }) {
  return {
    id,
    messageId,
    type,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Helper function to create chat message
function createChatMessage({ id, message, role, status, artifacts = [] }) {
  return {
    id,
    message,
    role,
    status,
    contextTags: [],
    sourceWebsocketID: null,
    taskId: null,
    artifacts,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Mock response generators (similar to mockmsgs.ts)
function generateCodeResponse() {
  const messageId = Date.now().toString();

  return createChatMessage({
    id: messageId,
    message:
      "Perfect! I've created the connection leak monitor implementation. Here's what I've built:",
    role: ChatRole.ASSISTANT,
    status: ChatStatus.SENT,
    artifacts: [
      createArtifact({
        id: "550e8400-e29b-41d4-a716-446655440123",
        messageId: messageId,
        type: ArtifactType.CODE,
        content: {
          file: "stakwork/senza-lnd/lib/connection_leak_monitor.rb",
          content: `class ConnectionLeakMonitor
  def initialize(pool_size: 5, threshold: 0.8)
    @pool_size = pool_size
    @threshold = threshold
    @active_connections = 0
    @leaked_connections = []
    @logger = Rails.logger
  end

  def monitor_connection_pool
    current_usage = @active_connections.to_f / @pool_size

    if current_usage > @threshold
      @logger.warn "Connection pool usage at #{(current_usage * 100).round(2)}%"
      detect_leaks
    end

    log_metrics
  end

  def track_connection(connection)
    @active_connections += 1
    @logger.debug "Active connections: #{@active_connections}/#{@pool_size}"
  end

  def release_connection(connection)
    @active_connections -= 1 if @active_connections > 0
    @logger.debug "Active connections: #{@active_connections}/#{@pool_size}"
  end

  private

  def detect_leaks
    @leaked_connections = find_leaked_connections
    @leaked_connections.each do |conn|
      @logger.error "Closing leaked connection: #{conn.object_id}"
      conn.close
    end
  end

  def find_leaked_connections
    # Implementation would check for connections that haven't been 
    # returned to the pool within a reasonable timeframe
    []
  end

  def log_metrics
    usage_percent = (@active_connections.to_f / @pool_size * 100).round(2)
    @logger.info "Pool usage: #{usage_percent}% (#{@active_connections}/#{@pool_size})"
  end
end`,
          change:
            "Create main connection leak monitor class that tracks Aurora Postgres connection pool metrics and detects leaks",
          action: "create",
        },
      }),
      createArtifact({
        id: "550e8400-e29b-41d4-a716-446655440124",
        messageId: messageId,
        type: ArtifactType.CODE,
        content: {
          file: "stakwork/senza-lnd/config/database.json",
          content: `{
  "database": {
    "adapter": "postgresql",
    "host": "aurora-cluster.cluster-xyz.us-east-1.rds.amazonaws.com",
    "port": 5432,
    "database": "senza_lnd_production",
    "pool": {
      "size": 10,
      "timeout": 5000,
      "checkout_timeout": 5000,
      "reaping_frequency": 60
    },
    "leak_detection": {
      "enabled": true,
      "threshold": 0.8,
      "check_interval": 30000,
      "max_connection_age": 300000
    }
  },
  "monitoring": {
    "metrics_enabled": true,
    "alert_threshold": 0.9,
    "log_level": "info",
    "cloudwatch_enabled": true
  }
}`,
          change:
            "Add Aurora Postgres database configuration with connection leak monitoring settings",
          action: "create",
        },
      }),
      // createArtifact({
      //   id: "preview-1",
      //   messageId: messageId,
      //   type: ArtifactType.BROWSER,
      //   content: {
      //     url: "https://community.sphinx.chat",
      //   },
      // }),
    ],
  });
}

function generateFormResponse() {
  const messageId = Date.now().toString();

  return createChatMessage({
    id: messageId,
    message:
      "I'll help you build a connection leak monitor for your Aurora Postgres database. Let me create the necessary files and configuration.",
    role: ChatRole.ASSISTANT,
    status: ChatStatus.SENT,
    artifacts: [
      createArtifact({
        id: "action-confirm",
        messageId: messageId,
        type: ArtifactType.FORM,
        content: {
          actionText:
            "Here's my plan to implement the connection leak monitor:",
          webhook: "https://stakwork.com/api/chat/confirm",
          options: [
            {
              actionType: "button",
              optionLabel: "✓ Confirm Plan",
              optionResponse: "confirmed",
            },
            {
              actionType: "button",
              optionLabel: "✗ Modify Plan",
              optionResponse: "modify",
            },
          ],
        },
      }),
    ],
  });
}

function generateBrowserResponse() {
  const messageId = Date.now().toString();

  return createChatMessage({
    id: messageId,
    message:
      "Here's a live preview of the Sphinx Chat community site where you can see similar implementations:",
    role: ChatRole.ASSISTANT,
    status: ChatStatus.SENT,
    artifacts: [
      createArtifact({
        id: "browser-preview-1",
        messageId: messageId,
        type: ArtifactType.BROWSER,
        content: {
          url: "https://community.sphinx.chat",
        },
      }),
    ],
  });
}

function makeRes(message, artifacts) {
  return createChatMessage({
    id: Date.now().toString(),
    message: message,
    role: ChatRole.ASSISTANT,
    status: ChatStatus.SENT,
    artifacts: artifacts || [],
  });
}

function generateDefaultResponse() {
  return makeRes("Autogenerated response.");
}

function generateConfirmResponse() {
  return makeRes("Ok! Let's move forward with this plan");
}

function generateModifyResponse() {
  return makeRes("What do you want to modify?");
}

// Function to generate responses based on message content
function generateResponseBasedOnMessage(message) {
  const messageText = message.toLowerCase();

  if (messageText.includes("browser")) {
    return generateBrowserResponse();
  } else if (messageText.includes("code")) {
    return generateCodeResponse();
  } else if (messageText.includes("form")) {
    return generateFormResponse();
  } else if (messageText.includes("confirmed")) {
    return generateConfirmResponse();
  } else if (messageText.includes("modify")) {
    return generateModifyResponse();
  } else {
    return generateDefaultResponse();
  }
}

const firsts = {};

// Main chat endpoint that receives messages from Next.js app
app.post("/chat", async (req, res) => {
  try {
    const { message, taskId, userId } = req.body;

    console.log("📨 Received message:", { message, taskId, userId });

    // Simulate some processing time (1-3 seconds)
    const delay = firsts[taskId] ? 11 : 1111;

    firsts[taskId] = true;

    setTimeout(async () => {
      try {
        // Generate mock response
        const mockResponse = generateResponseBasedOnMessage(message);

        console.log("🤖 Generated response:", mockResponse.message);

        // Send response back to Next.js app
        const nextjsUrl = process.env.NEXTJS_URL || "http://localhost:3000";
        const responsePayload = {
          taskId: taskId,
          message: mockResponse.message,
          contextTags: mockResponse.contextTags,
          sourceWebsocketID: mockResponse.sourceWebsocketID,
          artifacts: mockResponse.artifacts.map((artifact) => ({
            type: artifact.type,
            content: artifact.content,
          })),
        };

        await axios.post(`${nextjsUrl}/api/chat/response`, responsePayload);

        console.log("✅ Response sent back to Next.js app");
      } catch (error) {
        console.error(
          "❌ Error sending response back to Next.js:",
          error.message
        );
      }
    }, delay);

    // Immediately respond to the original request
    res.json({
      success: true,
      message: "Message received, response will be generated shortly",
    });
  } catch (error) {
    console.error("❌ Error processing message:", error);
    res.status(500).json({ error: "Failed to process message" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    server: "mock-chat-server",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Mock Chat Server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to receive messages from Next.js app`);
  console.log(
    `🔄 Will send responses back to Next.js app at ${process.env.NEXTJS_URL || "http://localhost:3000"}`
  );
});

/*

# Test browser artifacts
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me a browser artifact preview", "taskId": "test"}'

# Test code artifacts  
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Generate a code artifact for this", "taskId": "test"}'

# Test form artifacts (default)
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Help me with this task", "taskId": "test"}'
  
*/
