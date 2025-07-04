'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ThemeSettings() {
  const themes = [
    {
      id: 'light' as const,
      name: 'Light',
      description: 'Light theme for bright environments',
      icon: Sun,
    },
    {
      id: 'system' as const,
      name: 'System',
      description: 'Follows your system preference',
      icon: Monitor,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="w-5 h-5" />
          Theme Settings
        </CardTitle>
        <CardDescription>
          Choose your preferred theme for the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            
            return (
              <Button
                key={themeOption.id}
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <Icon className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{themeOption.name}</div>
                  <div className="text-sm opacity-70">{themeOption.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 