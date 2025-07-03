'use client';

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/AuthProvider'
import { useState } from 'react'
import { SphinxLogin } from '@/components/auth/SphinxLogin'

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-primary"></div>
              <span className="hidden font-bold sm:inline-block">
                Hive Platform
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/projects"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Projects
              </Link>
              <Link
                href="/tasks"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Tasks
              </Link>
              <Link
                href="/bounties"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Bounties
              </Link>
              <Link
                href="/roadmap"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Roadmap
              </Link>
            </nav>
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {user?.ownerAlias || user?.ownerPubKey.slice(0, 10) + '...'}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowLogin(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Login</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowLogin(false)}
              >
                ✕
              </Button>
            </div>
            <SphinxLogin 
              onSuccess={() => setShowLogin(false)}
              onError={(error) => console.error('Login error:', error)}
            />
          </div>
        </div>
      )}
    </>
  )
} 