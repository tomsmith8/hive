"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChatMessage as ChatMessageType, Option } from "@/lib/chat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface ChatAreaProps {
  messages: ChatMessageType[];
  onSend: (message: string) => Promise<void>;
  onArtifactAction: (
    messageId: string,
    action: Option,
    webhook: string
  ) => Promise<void>;
  inputDisabled?: boolean;
  isLoading?: boolean;
  hasNonFormArtifacts?: boolean;
}

export function ChatArea({
  messages,
  onSend,
  onArtifactAction,
  inputDisabled = false,
  isLoading = false,
  hasNonFormArtifacts = false,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <motion.div
      className="flex flex-col bg-background rounded-xl border shadow-sm overflow-hidden max-w-2xl"
      layout
      initial={{ width: "100%" }}
      animate={{ width: hasNonFormArtifacts ? "35%" : "100%" }}
      transition={{
        duration: 0.6,
        ease: [0.4, 0.0, 0.2, 1],
      }}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-muted/40">
        {messages
          .filter((msg) => !msg.replyId) // Hide messages that are replies
          .map((msg) => {
            // Find if this message has been replied to
            const replyMessage = messages.find((m) => m.replyId === msg.id);

            return (
              <ChatMessage
                key={msg.id}
                message={msg}
                replyMessage={replyMessage}
                onArtifactAction={onArtifactAction}
              />
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <ChatInput
        onSend={onSend}
        disabled={inputDisabled}
        isLoading={isLoading}
      />
    </motion.div>
  );
}
