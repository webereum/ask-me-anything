'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, MessageCircle, Plus, Home, User, LogOut, Settings, Users } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useAuth as useAppAuth } from '@/lib/auth/auth-context';
import { SignInButton, SignOutButton, UserButton } from '@clerk/nextjs';

const publicNavItems = [
  { href: '/', label: 'Home', icon: Home, description: 'Go to homepage' },
  { href: '/chat', label: 'Chat', icon: MessageCircle, description: 'Join public chat' },
  { href: '/community', label: 'Community', icon: Users, description: 'Community hub' },
  { href: '/help', label: 'Help', icon: Settings, description: 'Get help and support' },
];

const privateNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: User, description: 'Your dashboard' },
  { href: '/create-ama', label: 'Create AMA', icon: Plus, description: 'Create new AMA session' },
  { href: '/chat', label: 'Chat', icon: MessageCircle, description: 'Join chat rooms' },
  { href: '/community', label: 'Community', icon: Users, description: 'Community hub' },
  { href: '/help', label: 'Help', icon: Settings, description: 'Get help and support' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const { isAuthenticated } = useAppAuth();

  const isActive = (href: string) => pathname === href;
  const navItems = (isSignedIn || isAuthenticated) ? privateNavItems : publicNavItems;

  const closeSheet = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AskMe
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                title={item.description}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoaded && (
              <>
                {isSignedIn || isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8",
                        },
                      }}
                    />
                    <SignOutButton>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 hover:text-white hover:bg-white/10"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </SignOutButton>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <SignInButton mode="modal">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 hover:text-white hover:bg-white/10"
                      >
                        Sign In
                      </Button>
                    </SignInButton>
                    <Link href="/signup">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-white hover:bg-white/10"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-black/95 border-white/10">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      AskMe
                    </span>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 py-6">
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeSheet}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? 'bg-white/10 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <div>
                          <div>{item.label}</div>
                          <div className="text-xs text-gray-400">{item.description}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile Auth */}
                <div className="border-t border-white/10 pt-6">
                  {isLoaded && (
                    <>
                      {isSignedIn || isAuthenticated ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 px-4 py-2">
                            <UserButton 
                              afterSignOutUrl="/"
                              appearance={{
                                elements: {
                                  avatarBox: "w-8 h-8",
                                },
                              }}
                            />
                            <span className="text-white text-sm">Account</span>
                          </div>
                          <SignOutButton>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                              onClick={closeSheet}
                            >
                              <LogOut className="w-4 h-4 mr-3" />
                              Sign Out
                            </Button>
                          </SignOutButton>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <SignInButton mode="modal">
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                              onClick={closeSheet}
                            >
                              Sign In
                            </Button>
                          </SignInButton>
                          <Link href="/signup" onClick={closeSheet}>
                            <Button
                              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                            >
                              Sign Up
                            </Button>
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}