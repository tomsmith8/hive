import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { ArrowRight, Sparkles, Users, Zap, Shield, Bell, TrendingUp, LogIn } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/nextauth";
import { handleWorkspaceRedirect } from "@/lib/auth/workspace-resolver";

export default async function HomePage() {
  // Check if user is authenticated and handle workspace redirection
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    // User is authenticated - redirect them to their appropriate workspace
    await handleWorkspaceRedirect(session);
    // This redirect prevents the rest of the page from rendering
    return null;
  }

  // User is not authenticated - show landing page
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Navigation */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                Hive
              </h1>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-4 w-[400px]">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 hover:bg-accent rounded-md">
                            <h4 className="font-medium">Analytics</h4>
                            <p className="text-sm text-muted-foreground">Real-time insights</p>
                          </div>
                          <div className="p-2 hover:bg-accent rounded-md">
                            <h4 className="font-medium">Collaboration</h4>
                            <p className="text-sm text-muted-foreground">Team workflows</p>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuLink href="#docs" className="px-4 py-2 hover:bg-accent rounded-md">
                      Documentation
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
              
              <Link href="/auth/signin">
                <Button variant="outline" className="flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mx-auto mb-6 text-base px-4 py-2 flex items-center gap-2 w-fit">
            <Sparkles className="w-4 h-4" />
            Product Management, Simplified
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            &ldquo;You can just do things&rdquo;
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
           Move fast. Stay focused. Communicate clearly. Hive cuts the clutter so you can ship, scale, and lead with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/signin">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-card/50 dark:bg-card/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to lead and deliver</h2>
            <p className="text-xl text-muted-foreground">Visual, vocal, and never repetitive—tools for modern product managers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-card text-card-foreground">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-blue-100 dark:bg-blue-900">
                  <Zap className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Visual Workflows</h3>
                <p className="text-muted-foreground">Map out missions, objectives, and priorities—no Kanbans, just clarity.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-card text-card-foreground">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-green-100 dark:bg-green-900">
                  <Users className="w-8 h-8 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Voice-First Assistant</h3>
                <p className="text-muted-foreground">AI that helps you run meetings, set priorities, and never repeat yourself.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-card text-card-foreground">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto bg-purple-100 dark:bg-purple-900">
                  <Shield className="w-8 h-8 text-purple-600 dark:text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Agency & Empowerment</h3>
                <p className="text-muted-foreground">&ldquo;You can just do things&rdquo;—empower your team to move without friction.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* PM Highlights Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-300 mb-2">1,200+</div>
              <div className="text-muted-foreground">Visual Workflows Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-300 mb-2">8,000+</div>
              <div className="text-muted-foreground">Objectives Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-300 mb-2">2,500+</div>
              <div className="text-muted-foreground">Meetings Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-300 mb-2">3,400+</div>
              <div className="text-muted-foreground">PMs Empowered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t text-card-foreground">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-300" />
            <span className="text-lg font-semibold">Hive</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Empowering product managers to lead with clarity, agency, and simplicity.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Support</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
