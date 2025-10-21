'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SignUpButton, useAuth } from '@clerk/nextjs';
import { useAuth as useAppAuth } from '@/lib/auth/auth-context';
import { Loader2, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { isAuthenticated } = useAppAuth();

  useEffect(() => {
    if (isLoaded && (isSignedIn || isAuthenticated)) {
      router.push('/dashboard');
    }
  }, [isSignedIn, isAuthenticated, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Join Us
          </h1>
          <p className="mt-2 text-gray-400">
            Create your account to get started
          </p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Sign Up</CardTitle>
            <CardDescription className="text-gray-400">
              Create your account with Clerk
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Clerk Sign Up Button */}
            <SignUpButton mode="modal">
              <Button 
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-medium"
                size="lg"
              >
                <User className="mr-2 h-4 w-4" />
                Sign Up with Clerk
              </Button>
            </SignUpButton>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            <Separator className="bg-white/10" />

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Want to browse anonymously?{' '}
                <Link 
                  href="/chat" 
                  className="text-purple-400 hover:text-purple-300 font-medium inline-flex items-center"
                >
                  Join Chat
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link 
            href="/" 
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}