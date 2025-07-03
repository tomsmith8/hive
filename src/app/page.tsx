import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            AI-First Product Development
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            Harness AI to solve enterprise codebase challenges, visualize complex systems, and accelerate development through intelligent automation.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/projects">View Projects</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Everything you need to ship faster
          </h2>
          <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            From backlog planning to bounty management, Hive has you covered.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 Backlog Management
              </CardTitle>
              <CardDescription>
                Organize and prioritize your product backlog with AI-powered insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Smart task prioritization</li>
                <li>• AI-powered estimation</li>
                <li>• Sprint planning automation</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🗺️ Roadmap Planning
              </CardTitle>
              <CardDescription>
                Create and visualize product roadmaps with confidence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Interactive roadmap views</li>
                <li>• Dependency tracking</li>
                <li>• Timeline optimization</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💰 Bounty System
              </CardTitle>
              <CardDescription>
                Accelerate delivery with our integrated bounty and reward system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Task-based bounties</li>
                <li>• Automated payments</li>
                <li>• Performance tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 AI Assistant
              </CardTitle>
              <CardDescription>
                Get intelligent suggestions and automation for your workflows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Smart task suggestions</li>
                <li>• Automated reporting</li>
                <li>• Predictive analytics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👥 Team Collaboration
              </CardTitle>
              <CardDescription>
                Work together seamlessly with real-time updates and notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Real-time collaboration</li>
                <li>• Role-based permissions</li>
                <li>• Activity feeds</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Analytics & Insights
              </CardTitle>
              <CardDescription>
                Track progress and get insights to improve your delivery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Performance metrics</li>
                <li>• Velocity tracking</li>
                <li>• Predictive insights</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to transform your product management?
          </h2>
          <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            Join thousands of PMs who are already shipping faster with Hive.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/login">Start Building Today</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/demo">Watch Demo</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
