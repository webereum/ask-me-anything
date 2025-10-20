import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Required for Next.js 14 App Router with dynamic routes
export async function generateStaticParams() {
  return [];
}