import { NextRequest, NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = auth();
    
    console.log('Stream token request for user:', userId);
    
    if (!userId) {
      console.log('No user found in auth');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Stream Chat with server-side credentials
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_API_SECRET;

    console.log('Stream API Key:', apiKey ? 'Present' : 'Missing');
    console.log('Stream API Secret:', apiSecret ? 'Present' : 'Missing');

    if (!apiKey || !apiSecret) {
      console.log('Stream credentials missing');
      return NextResponse.json({ error: 'Stream credentials not configured' }, { status: 500 });
    }

    console.log('Creating Stream client...');
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    
    // Generate a token for the user
    console.log('Generating token for user:', userId);
    const token = serverClient.createToken(userId);
    
    console.log('Token generated successfully');
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating Stream token:', error);
    return NextResponse.json({ error: 'Failed to generate token', details: error.message }, { status: 500 });
  }
}