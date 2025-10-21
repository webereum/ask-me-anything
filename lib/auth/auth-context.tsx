'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';

interface User {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerkAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync chat user with Supabase when Clerk user changes
  const syncChatUser = async (clerkUser: any) => {
    if (!clerkUser) return;

    try {
      const supabase = createClient();
      // Check if chat user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('chat_users')
        .select('*')
        .eq('auth_user_id', clerkUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching chat user:', fetchError);
        return;
      }

      if (!existingUser) {
        // Create new chat user
        const username = clerkUser.username || 
                        clerkUser.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 
                        `user_${clerkUser.id.slice(-8)}`;

        const { error: insertError } = await supabase
          .from('chat_users')
          .insert({
            auth_user_id: clerkUser.id,
            username: username,
            is_anonymous: false,
            avatar_url: clerkUser.imageUrl,
            is_online: true
          });

        if (insertError) {
          console.error('Error creating chat user:', insertError);
        }
      } else {
        // Update existing user's online status and avatar
        const { error: updateError } = await supabase
          .from('chat_users')
          .update({
            is_online: true,
            avatar_url: clerkUser.imageUrl,
            last_seen: new Date().toISOString()
          })
          .eq('auth_user_id', clerkUser.id);

        if (updateError) {
          console.error('Error updating chat user:', updateError);
        }
      }
    } catch (error) {
      console.error('Error syncing chat user:', error);
    }
  };

  const signOut = async () => {
    try {
      // Update chat user status to offline before signing out
      if (user) {
        const supabase = createClient();
        await supabase
          .from('chat_users')
          .update({
            is_online: false,
            last_seen: new Date().toISOString()
          })
          .eq('auth_user_id', user.id);
      }

      // Sign out from Clerk
      await clerkSignOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    if (clerkLoaded) {
      if (clerkUser) {
        // User is authenticated with Clerk
        const userData: User = {
          id: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress,
          name: clerkUser.fullName || clerkUser.firstName || undefined,
          image: clerkUser.imageUrl,
          username: clerkUser.username || undefined
        };
        
        setUser(userData);
        syncChatUser(clerkUser);
      } else {
        // User is not authenticated
        setUser(null);
      }
      setIsLoading(false);
    }
  }, [clerkUser, clerkLoaded]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signOut,
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