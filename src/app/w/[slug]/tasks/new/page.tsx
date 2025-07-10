'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRef, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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

export default function TaskChatPage() {
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const userName = session?.user?.name || "there";

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

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[80vh] md:h-[90vh]">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">Hey, {userName}</h1>
          <p className="text-muted-foreground text-lg mb-6">Welcome to Hive Chat. How can I help you today?</p>
          <Button size="lg" className="text-lg px-8 py-4" onClick={() => setStarted(true)}>
            Start Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
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
  );
} 