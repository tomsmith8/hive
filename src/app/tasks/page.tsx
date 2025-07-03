import React from "react";
import { TaskList } from "@/components/TaskList";

export default function TasksPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <TaskList />
    </div>
  );
} 