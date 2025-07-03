"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  FolderOpen, 
  CheckSquare, 
  DollarSign, 
  Map, 
  TrendingUp, 
  Settings, 
  Home,
  Users,
  Calendar,
  Bell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Kanban', href: '/kanban', icon: BarChart3 },
  { name: 'Roadmap', href: '/roadmap', icon: Map },
  { name: 'Code Graph', href: '/codegraph', icon: FolderOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const teams = [
  { name: 'Acme Inc', icon: Home },
  { name: 'Acme Corp.', icon: BarChart3 },
  { name: 'Evil Corp.', icon: Settings },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(teams[0])
  const { user } = useAuth()
  const [showTeams, setShowTeams] = useState(false)

  return (
    <div className={cn(
      "flex h-full flex-col bg-background border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Team Switcher */}
      <div className="relative border-b px-4 py-3">
        <button
          className="flex items-center w-full space-x-3 focus:outline-none"
          onClick={() => setShowTeams(!showTeams)}
        >
          <span className="flex items-center">
            {(() => { const Icon = selectedTeam.icon; return <Icon className="h-6 w-6 mr-2" /> })()}
            {!isCollapsed && (
              <span className="font-semibold text-foreground">{selectedTeam.name}</span>
            )}
          </span>
          {!isCollapsed && <ChevronRight className={cn("h-4 w-4 ml-auto transition-transform", showTeams && "rotate-90")} />}
        </button>
        {showTeams && !isCollapsed && (
          <div className="absolute left-0 top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-50">
            <div className="p-2">
              {teams.map((team) => {
                const TeamIcon = team.icon;
                return (
                  <button
                    key={team.name}
                    className={cn(
                      "flex items-center w-full px-3 py-2 rounded-md text-sm hover:bg-accent",
                      selectedTeam.name === team.name && "bg-accent"
                    )}
                    onClick={() => {
                      setSelectedTeam(team);
                      setShowTeams(false);
                    }}
                  >
                    <TeamIcon className="h-4 w-4 mr-2" />
                    {team.name}
                  </button>
                );
              })}
              <button className="flex items-center w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent">
                + Add team
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-foreground">Hive</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className={cn(
                "h-4 w-4 transition-colors",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
              )} />
              {!isCollapsed && (
                <span className="ml-3">{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      {!isCollapsed && user && (
        <div className="p-4 border-t flex items-center space-x-3">
          <img
            src={user.avatar || '/default-avatar.png'}
            alt="avatar"
            className="h-10 w-10 rounded-full border"
          />
          <div className="flex flex-col">
            <span className="font-medium text-foreground text-sm">{user.name || user.ownerAlias}</span>
            <span className="text-xs text-muted-foreground">{user.role}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground">
            © 2024 Hive. All rights reserved.
          </div>
        </div>
      )}
    </div>
  )
} 