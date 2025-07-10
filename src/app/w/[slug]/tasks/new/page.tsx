'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useRef, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const DUMMY_MESSAGES = [
  {
    id: 1,
    user: { name: "Alice", avatar: "", fallback: "A" },
    text: "Hey! Ready to kick off this task?",
    self: false,
  },
  {
    id: 2,
    user: { name: "You", avatar: "", fallback: "Y" },
    text: "Yep, let's get started. I'll set up the initial structure.",
    self: true,
  },
  {
    id: 3,
    user: { name: "Alice", avatar: "", fallback: "A" },
    text: "Awesome! Ping me if you need anything.",
    self: false,
  },
];

function TaskStartInput({ onStart }: { onStart: (task: string) => void }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault();
      onStart(value.trim());
    }
  };

  const hasText = value.trim().length > 0;

  const handleClick = () => {
    if (hasText) {
      onStart(value.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-[80vh] md:h-[90vh] bg-background">
      <h1 className="text-4xl font-bold text-foreground mb-10 text-center">What do you want to do?</h1>
      <Card className="relative w-full max-w-2xl p-0 bg-card rounded-3xl shadow-sm border-0 group">
        <Textarea
          ref={textareaRef}
          placeholder="Describe a task"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="resize-none min-h-[180px] text-lg bg-transparent border-0 focus:ring-0 focus-visible:ring-0 px-8 pt-8 pb-16 rounded-3xl shadow-none"
          autoFocus
        />
        <Button
          type="button"
          variant="default"
          size="icon"
          className="absolute bottom-6 right-8 z-10 rounded-full shadow-lg transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-ring/60"
          style={{ width: 32, height: 32 }}
          disabled={!hasText}
          onClick={handleClick}
          tabIndex={0}
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      </Card>
    </div>
  );
}

export default function TaskChatPage() {
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const userName = session?.user?.name || "there";

  useEffect(() => {
    if (started) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, started]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [
      ...msgs,
      {
        id: msgs.length + 1,
        user: { name: "You", avatar: "", fallback: "Y" },
        text: input,
        self: true,
      },
    ]);
    setInput("");
  };

  const handleStart = (task: string) => {
    setStarted(true);
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        user: { name: "You", avatar: "", fallback: "Y" },
        text: task,
        self: true,
      },
    ]);
  };

  return (
    <AnimatePresence mode="wait">
      {!started ? (
        <motion.div
          key="start"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
        >
          <TaskStartInput onStart={handleStart} />
        </motion.div>
      ) : (
        <motion.div
          key="chat"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
        >
          <div className="flex flex-col h-[80vh] md:h-[90vh] w-full max-w-full bg-background rounded-xl border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-background/80 backdrop-blur sticky top-0 z-10">
              <h2 className="text-2xl font-semibold">Hive</h2>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-muted/40">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-3 ${msg.self ? "justify-end" : "justify-start"}`}
                >
                  {!msg.self && (
                    <Avatar>
                      <AvatarImage src={msg.user.avatar} alt={msg.user.name} />
                      <AvatarFallback>{msg.user.fallback}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`px-4 py-2 rounded-xl text-sm max-w-xs shadow-sm ${
                      msg.self
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-background text-foreground rounded-bl-none border"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.self && (
                    <Avatar>
                      <AvatarImage src={msg.user.avatar} alt={msg.user.name} />
                      <AvatarFallback>{msg.user.fallback}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="flex gap-2 px-6 py-4 border-t bg-background sticky bottom-0 z-10"
            >
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" disabled={!input.trim()}>
                Send
              </Button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 