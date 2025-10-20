import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@/lib/supabase/server';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const supabase = await createClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error || !data.user) {
            return null;
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email,
            image: data.user.user_metadata?.avatar_url,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      
      if (account?.provider === 'google') {
        // Sync Google user with Supabase
        try {
          const supabase = await createClient();
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: account.id_token!,
          });
          
          if (!error && data.user) {
            token.id = data.user.id;
          }
        } catch (error) {
          console.error('Google auth sync error:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const supabase = await createClient();
          
          // Check if user exists in chat_users table
          const { data: existingUser } = await supabase
            .from('chat_users')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();

          if (!existingUser) {
            // Create chat user profile
            await supabase
              .from('chat_users')
              .insert({
                auth_user_id: user.id,
                username: user.name || user.email?.split('@')[0] || 'User',
                is_anonymous: false,
                avatar_url: user.image,
              });
          }
        } catch (error) {
          console.error('Error creating chat user:', error);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};