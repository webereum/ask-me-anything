'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import { useAuth as useAppAuth } from '@/lib/auth/auth-context';
import { Loader2, Mail, User } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
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

  if (isSignedIn || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="mt-2 text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription className="text-gray-400">
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <SignInButton mode="modal">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white">
                  <Mail className="w-4 h-4 mr-2" />
                  Sign In with Email
                </Button>
              </SignInButton>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full bg-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-2 text-gray-400">Or</span>
                </div>
              </div>
              
              <SignUpButton mode="modal">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  <User className="w-4 h-4 mr-2" />
                  Create New Account
                </Button>
              </SignUpButton>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-400">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-cyan-400 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-cyan-400 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}