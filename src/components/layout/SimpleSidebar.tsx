"use client"

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  BarChart3, 
  FolderOpen, 
  CheckSquare, 
  Settings, 
  Home,
  ChevronRight,
  Brain,
  Trophy,
  Workflow
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Kanban', href: '/kanban', icon: BarChart3 },
  { name: 'Code Graph', href: '/codegraph', icon: FolderOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const teams = [
  { name: 'Stakwork', icon: Workflow },
  { name: 'Secondbrain', icon: Brain },
  { name: 'Bounty Platform', icon: Trophy },
]

interface SimpleSidebarProps {
  className?: string
}

export function SimpleSidebar({ className }: SimpleSidebarProps) {
  const pathname = usePathname()
  const [selectedTeam, setSelectedTeam] = useState(teams[0])
  const { user } = useAuth()
  const [showTeams, setShowTeams] = useState(false)

  return (
    <div className={cn("w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen", className)}>
      {/* Header */}
      <div className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center space-x-3 focus:outline-none"
            onClick={() => setShowTeams(!showTeams)}
          >
            <span className="flex items-center">
              {(() => { const Icon = selectedTeam.icon; return <Icon className="h-6 w-6 mr-2" /> })()}
              <span className="font-semibold text-sidebar-foreground">{selectedTeam.name}</span>
            </span>
            <ChevronRight className={cn("h-4 w-4 ml-2 transition-transform", showTeams && "rotate-90")} />
          </button>
        </div>
        
        {/* Team dropdown */}
        {showTeams && (
          <div className="absolute left-0 top-full mt-2 w-full bg-sidebar border rounded-lg shadow-lg z-50">
            <div className="p-2">
              {teams.map((team) => {
                const TeamIcon = team.icon;
                return (
                  <button
                    key={team.name}
                    className={cn(
                      "flex items-center w-full px-3 py-2 rounded-md text-sm hover:bg-sidebar-accent",
                      selectedTeam.name === team.name && "bg-sidebar-accent"
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
              <button className="flex items-center w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent">
                + Add team
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Navigation
          </h3>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {user && (
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center space-x-3">
            <Image
              src={user.avatar || '/default-avatar.png'}
              alt="avatar"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border"
            />
            <div className="flex flex-col">
              <span className="font-medium text-sidebar-foreground text-sm">{user.name || user.ownerAlias}</span>
              <span className="text-xs text-muted-foreground">{user.role}</span>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-sidebar-border p-4">
        <div className="text-xs text-muted-foreground">
          © 2024 Hive. All rights reserved.
        </div>
      </div>
    </div>
  )
} 