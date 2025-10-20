'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { NavigationLink } from '@/components/navigation-link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth/auth-context';
import {
  MessageSquare,
  LayoutDashboard,
  MessageCircle,
  UserPlus,
  LogIn,
  Settings,
  Home,
  Menu,
  X,
  Sparkles,
  Users,
  Bell,
  HelpCircle,
  User,
  LogOut,
  Plus
} from 'lucide-react';

// Public links that appear in the main navbar
const publicNavigationItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
    description: 'Ask questions anonymously'
  },
  {
    name: 'Community',
    href: '/community',
    icon: Users,
    description: 'Connect with others'
  },
  {
    name: 'Help',
    href: '/help',
    icon: HelpCircle,
    description: 'Get support'
  },
  {
    name: 'About',
    href: '/about',
    icon: Sparkles,
    description: 'Learn more about us'
  }
];

// Private/authenticated links that appear in the sidebar
const privateNavigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Manage your questions',
    requiresAuth: true
  },
  {
    name: 'Live Chat',
    href: '/chat',
    icon: MessageCircle,
    description: 'Real-time messaging',
    requiresAuth: true
  },
  {
    name: 'Threads',
    href: '/threads',
    icon: MessageSquare,
    description: 'Community discussions',
    requiresAuth: false
  },
  {
    name: 'Create AMA',
    href: '/create-ama',
    icon: Plus,
    description: 'Start your own AMA page',
    requiresAuth: true
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    description: 'Stay updated',
    requiresAuth: true
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Account settings',
    requiresAuth: true
  }
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavigationLink href="/" className="flex items-center space-x-2">
            <div className="relative">
              <MessageSquare className="h-8 w-8 text-cyan-400" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-purple-400" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AskMe
            </span>
          </NavigationLink>

          {/* Desktop Public Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {publicNavigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavigationLink
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavigationLink>
              );
            })}
          </nav>

          {/* Desktop Auth Buttons and Sidebar Trigger */}
          <div className="hidden md:flex items-center space-x-2">
            {!isLoading && (
              <>
                {!isAuthenticated ? (
                  <>
                    <NavigationLink href="/login">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </NavigationLink>
                    <NavigationLink href="/signup">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Sign Up
                      </Button>
                    </NavigationLink>
                  </>
                ) : (
                  <>
                    <span className="text-white/70 text-sm">
                      Welcome, {user?.username || 'User'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="text-white/70 hover:text-white hover:bg-white/5"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                )}
                {/* Sidebar trigger for authenticated users */}
                {isAuthenticated && (
                  <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/70 hover:text-white hover:bg-white/5"
                      >
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80 bg-black/95 border-white/10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-6 w-6 text-cyan-400" />
                          <span className="text-lg font-bold text-white">AskMe</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsOpen(false)}
                          className="text-white/70 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Sidebar Navigation */}
                      <nav className="space-y-2">
                        {privateNavigationItems
                          .filter(item => !item.requiresAuth || isAuthenticated)
                          .map((item) => {
                            const Icon = item.icon;
                            return (
                              <NavigationLink
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                                  isActive(item.href)
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                                <div>
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-xs text-white/50">{item.description}</div>
                                </div>
                              </NavigationLink>
                            );
                          })}
                      </nav>
                    </SheetContent>
                  </Sheet>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-white/70 hover:text-white hover:bg-white/5"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-black/95 border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-6 w-6 text-cyan-400" />
                  <span className="text-lg font-bold text-white">AskMe</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Public Navigation */}
              <nav className="space-y-2 mb-6">
                <div className="text-white/50 text-xs uppercase tracking-wider font-semibold mb-2">
                  Public Pages
                </div>
                {publicNavigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavigationLink
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-white/10 text-white'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-white/50">{item.description}</div>
                      </div>
                    </NavigationLink>
                  );
                })}
              </nav>

              {/* Mobile Private Navigation (if authenticated) */}
              {isAuthenticated && (
                <nav className="space-y-2 mb-6">
                  <div className="text-white/50 text-xs uppercase tracking-wider font-semibold mb-2">
                    Your Account
                  </div>
                  {privateNavigationItems
                    .filter(item => !item.requiresAuth || isAuthenticated)
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavigationLink
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                            isActive(item.href)
                              ? 'bg-white/10 text-white'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-white/50">{item.description}</div>
                          </div>
                        </NavigationLink>
                      );
                    })}
                </nav>
              )}

              {/* Mobile Auth Buttons */}
              <div className="space-y-2 pt-4 border-t border-white/10">
                {!isLoading && (
                  <>
                    {!isAuthenticated ? (
                      <>
                        <NavigationLink href="/login" onClick={() => setIsOpen(false)}>
                          <Button
                            variant="outline"
                            className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10"
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            Sign In
                          </Button>
                        </NavigationLink>
                        <NavigationLink href="/signup" onClick={() => setIsOpen(false)}>
                          <Button
                            variant="default"
                            className="w-full justify-start bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Sign Up
                          </Button>
                        </NavigationLink>
                      </>
                    ) : (
                      <>
                        <div className="px-3 py-2 text-white/70 text-sm">
                          Welcome, {user?.username || 'User'}
                        </div>
                        <Button
                          variant="ghost"
                          onClick={handleSignOut}
                          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}