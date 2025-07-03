"use client";

import React, { useState, type JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Clock, HelpCircle, Ban, ArrowUpCircle } from "lucide-react";

type TaskStatus = "In Progress" | "Backlog" | "Todo" | "Canceled" | "Done";

type Task = {
  id: string;
  tag: string;
  title: string;
  status: TaskStatus;
  priority: string;
};

const tasks: Task[] = [
  {
    id: "TASK-8782",
    tag: "Documentation",
    title: "You can't compress the program without quantifying the open-source SSD ...",
    status: "In Progress",
    priority: "Medium",
  },
  {
    id: "TASK-7878",
    tag: "Documentation",
    title: "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-7839",
    tag: "Bug",
    title: "We need to bypass the neural TCP card!",
    status: "Todo",
    priority: "High",
  },
  {
    id: "TASK-5562",
    tag: "Feature",
    title: "The SAS interface is down, bypass the open-source pixel so we can back u...",
    status: "Backlog",
    priority: "Medium",
  },
  {
    id: "TASK-8686",
    tag: "Feature",
    title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
    status: "Canceled",
    priority: "Medium",
  },
  {
    id: "TASK-1280",
    tag: "Bug",
    title: "Use the digital TLS panel, then you can transmit the haptic system!",
    status: "Done",
    priority: "High",
  },
  {
    id: "TASK-7262",
    tag: "Feature",
    title: "The UTF8 application is down, parse the neural bandwidth so we can back ...",
    status: "Done",
    priority: "High",
  },
  {
    id: "TASK-1138",
    tag: "Feature",
    title: "Generating the driver won't do anything, we need to quantify the 1080p SM...",
    status: "In Progress",
    priority: "Medium",
  },
  {
    id: "TASK-7184",
    tag: "Feature",
    title: "We need to program the back-end THX pixel!",
    status: "Todo",
    priority: "Low",
  },
  {
    id: "TASK-5160",
    tag: "Documentation",
    title: "Calculating the bus won't do anything, we need to navigate the back-end J...",
    status: "In Progress",
    priority: "High",
  },
];

const statusIcons: Record<TaskStatus, JSX.Element> = {
  "In Progress": <Clock className="w-4 h-4 text-yellow-500" />,
  "Backlog": <HelpCircle className="w-4 h-4 text-muted-foreground" />,
  "Todo": <Clock className="w-4 h-4 text-muted-foreground" />,
  "Canceled": <Ban className="w-4 h-4 text-muted-foreground" />,
  "Done": <BadgeCheck className="w-4 h-4 text-green-500" />,
};

export function TaskList() {
  const [input, setInput] = useState("");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-4">Hi Tom, how can I help you today?</h1>
      <Card>
        <CardHeader>
          <CardTitle>Start a new task</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="mb-6">
            <div className="relative w-full">
              <Textarea
                placeholder="Type your message here."
                value={input}
                onChange={e => setInput(e.target.value)}
                className="resize-none min-h-[44px] pr-12"
              />
              <Button
                type="submit"
                size="icon"
                variant={input ? "default" : "secondary"}
                className={`absolute right-2 top-1/2 -translate-y-1/2 shadow ${input ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                disabled={!input}
                tabIndex={-1}
              >
                <ArrowUpCircle className="w-5 h-5" />
              </Button>
            </div>
          </form>
          <div className="border-b mb-4" />
          <div className="mb-2 text-muted-foreground text-sm font-semibold">Recent Tasks</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm table-auto">
              <colgroup>
                <col style={{ width: '8rem' }} />
                <col />
                <col style={{ width: '10rem' }} />
                <col style={{ width: '7rem' }} />
              </colgroup>
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="text-left font-semibold py-2 px-2 whitespace-nowrap">Task</th>
                  <th className="text-left font-semibold py-2 px-2">Title</th>
                  <th className="text-left font-semibold py-2 px-2 whitespace-nowrap">Status</th>
                  <th className="text-center font-semibold py-2 px-2 whitespace-nowrap">Priority</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, idx) => (
                  <tr key={idx} className="border-b hover:bg-accent transition">
                    <td className="py-2 px-2 whitespace-nowrap text-muted-foreground align-middle">{task.id}</td>
                    <td className="py-2 px-2 align-middle break-words">{task.title}</td>
                    <td className="py-2 px-2 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-2">
                        {statusIcons[task.status]}
                        <span>{task.status}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap align-middle text-center font-medium">{task.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 