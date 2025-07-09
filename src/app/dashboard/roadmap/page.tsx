import { RoadmapContent } from "@/components/roadmap/RoadmapContent";

export default async function RoadmapPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Roadmap</h1>
          <p className="text-muted-foreground mt-2">
            Plan and track your product features and development roadmap.
          </p>
        </div>
      </div>

      <RoadmapContent />
    </div>
  );
} 