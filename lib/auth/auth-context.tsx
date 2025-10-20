'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { useSession } from 'next-auth/react';
import { createClient } from '@/lib/supabase/client';

interface User {
  id: string;
  email?: string;
  username: string;
  avatar_url?: string;
  is_anonymous: boolean;
  is_online: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  createAnonymousUser: (username?: string) => Promise<User>;
  updateUserStatus: (isOnline: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  authProvider?: 'clerk' | 'nextauth';
}

export function AuthProvider({ children, authProvider = 'clerk' }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Clerk hooks
  const { user: clerkUser, isLoaded: clerkLoaded } = useClerkUser();
  
  // NextAuth hooks
  const { data: session, status: sessionStatus } = useSession();
  
  const supabase = createClient();

  // Generate random username for anonymous users
  const generateAnonymousUsername = () => {
    const adjectives = ['Cool', 'Swift', 'Bright', 'Clever', 'Quick', 'Smart', 'Bold', 'Calm'];
    const nouns = ['Fox', 'Eagle', 'Wolf', 'Lion', 'Tiger', 'Bear', 'Hawk', 'Owl'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    return `${adjective}${noun}${number}`;
  };

  // Create or get chat user from database
  const syncChatUser = async (authUserId?: string, userData?: any) => {
    try {
      let chatUser;
      
      if (authUserId) {
        // Authenticated user
        const { data: existingUser } = await supabase
          .from('chat_users')
          .select('*')
          .eq('auth_user_id', authUserId)
          .single();

        if (existingUser) {
          chatUser = existingUser;
        } else {
          // Create new chat user
          const { data: newUser, error } = await supabase
            .from('chat_users')
            .insert({
              auth_user_id: authUserId,
              username: userData?.username || userData?.name || userData?.email?.split('@')[0] || 'User',
              is_anonymous: false,
              avatar_url: userData?.avatar_url || userData?.image,
              is_online: true,
            })
            .select()
            .single();

          if (error) throw error;
          chatUser = newUser;
        }
      }

      if (chatUser) {
        setUser({
          id: chatUser.id,
          email: userData?.email,
          username: chatUser.username,
          avatar_url: chatUser.avatar_url,
          is_anonymous: chatUser.is_anonymous,
          is_online: chatUser.is_online,
        });
      }
    } catch (error) {
      console.error('Error syncing chat user:', error);
    }
  };

  // Create anonymous user
  const createAnonymousUser = async (username?: string): Promise<User> => {
    try {
      const anonymousUsername = username || generateAnonymousUsername();
      
      const { data: newUser, error } = await supabase
        .from('chat_users')
        .insert({
          username: anonymousUsername,
          is_anonymous: true,
          is_online: true,
        })
        .select()
        .single();

      if (error) throw error;

      const anonymousUser: User = {
        id: newUser.id,
        username: newUser.username,
        avatar_url: newUser.avatar_url,
        is_anonymous: true,
        is_online: true,
      };

      setUser(anonymousUser);
      
      // Store anonymous user in localStorage
      localStorage.setItem('anonymous_user', JSON.stringify(anonymousUser));
      
      return anonymousUser;
    } catch (error) {
      console.error('Error creating anonymous user:', error);
      throw error;
    }
  };

  // Update user online status
  const updateUserStatus = async (isOnline: boolean) => {
    if (!user) return;

    try {
      await supabase
        .from('chat_users')
        .update({ 
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        })
        .eq('id', user.id);

      setUser(prev => prev ? { ...prev, is_online: isOnline } : null);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      if (user) {
        await updateUserStatus(false);
      }

      if (authProvider === 'clerk' && clerkUser) {
        // Clerk sign out is handled by Clerk components
      } else if (authProvider === 'nextauth') {
        const { signOut: nextAuthSignOut } = await import('next-auth/react');
        await nextAuthSignOut();
      }

      // Clear anonymous user from localStorage
      localStorage.removeItem('anonymous_user');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Effect to handle authentication state changes
  useEffect(() => {
    const handleAuth = async () => {
      setIsLoading(true);

      try {
        if (authProvider === 'clerk' && clerkLoaded) {
          if (clerkUser) {
            await syncChatUser(clerkUser.id, {
              username: clerkUser.username,
              name: clerkUser.fullName,
              email: clerkUser.primaryEmailAddress?.emailAddress,
              avatar_url: clerkUser.imageUrl,
            });
          } else {
            // Check for anonymous user in localStorage
            const storedAnonymousUser = localStorage.getItem('anonymous_user');
            if (storedAnonymousUser) {
              const anonymousUser = JSON.parse(storedAnonymousUser);
              setUser(anonymousUser);
            } else {
              setUser(null);
            }
          }
        } else if (authProvider === 'nextauth' && sessionStatus !== 'loading') {
          if (session?.user) {
            await syncChatUser((session.user as any).id, {
              name: session.user.name,
              email: session.user.email,
              avatar_url: session.user.image,
            });
          } else {
            // Check for anonymous user in localStorage
            const storedAnonymousUser = localStorage.getItem('anonymous_user');
            if (storedAnonymousUser) {
              const anonymousUser = JSON.parse(storedAnonymousUser);
              setUser(anonymousUser);
            } else {
              setUser(null);
            }
          }
        }
      } catch (error) {
        console.error('Auth handling error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [clerkUser, clerkLoaded, session, sessionStatus, authProvider]);

  // Handle page visibility for online status
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (user && !user.is_anonymous) {
        updateUserStatus(!document.hidden);
      }
    };

    const handleBeforeUnload = () => {
      if (user && !user.is_anonymous) {
        updateUserStatus(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    createAnonymousUser,
    updateUserStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}