'use client';

import { SphinxLogin } from '@/components/auth/SphinxLogin';
import { redirect } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Hive Platform
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            AI-first product management assistant
          </p>
        </div>
        
        <SphinxLogin 
          onSuccess={() => {
            // Redirect to dashboard after successful login
            window.location.href = '/dashboard';
          }}
          onError={(error) => {
            console.error('Login error:', error);
          }}
        />
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
} 