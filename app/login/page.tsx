'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Github, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { GlassmorphicCard3D } from '@/components/glassmorphic-card-3d';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SignInButton, useAuth } from '@clerk/nextjs';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'nextauth' | 'clerk'>('nextauth');
  const router = useRouter();
  const { isSignedIn } = useAuth();

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email');
      return false;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return false;
    }
    return true;
  };

  const handleNextAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid credentials');
      } else {
        toast.success('Login successful!');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      toast.error('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20">
      <Toaster position="bottom-center" />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Welcome Back
          </h1>
          <p className="text-white/70 text-lg">Sign in to your account</p>
        </div>

        <GlassmorphicCard3D>
          <div className="p-6 space-y-6">
            {/* Authentication Method Selection */}
            <div className="flex space-x-2 mb-4">
              <Button
                type="button"
                variant={authMethod === 'nextauth' ? 'default' : 'outline'}
                className={`flex-1 ${authMethod === 'nextauth' ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}`}
                onClick={() => setAuthMethod('nextauth')}
              >
                Custom Email
              </Button>
              <Button
                type="button"
                variant={authMethod === 'clerk' ? 'default' : 'outline'}
                className={`flex-1 ${authMethod === 'clerk' ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}`}
                onClick={() => setAuthMethod('clerk')}
              >
                Clerk Auth
              </Button>
            </div>

            {authMethod === 'clerk' ? (
              <div className="space-y-4">
                {!isSignedIn && (
                  <SignInButton mode="modal">
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                      Sign In with Clerk
                    </Button>
                  </SignInButton>
                )}
                <Button
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Continue with Google
                </Button>
              </div>
            ) : (
              <>
                {/* Social Login Options */}
                <div className="space-y-3">
                  <Button
                    onClick={handleGoogleSignIn}
                    variant="outline"
                    className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    Continue with Google
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-900 px-2 text-white/50">Or continue with email</span>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleNextAuthSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-white/50" />
                    ) : (
                      <Eye className="w-4 h-4 text-white/50" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-white/70">
                    Remember me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-cyan-400 hover:text-cyan-300 p-0 h-auto"
                  onClick={() => toast.info('Password reset functionality coming soon!')}
                >
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : null}
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            </>
            )}

            <div className="text-center">
              <p className="text-white/70 text-sm">
                Don't have an account?{' '}
                <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </GlassmorphicCard3D>
      </div>
    </div>
  );
}