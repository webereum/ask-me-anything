'use client';

import React, { useEffect, useState } from 'react';
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
  LoadingIndicator,
} from 'stream-chat-react';
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import { useUser } from '@clerk/nextjs';
import { getStreamChatClient } from '@/lib/stream-chat/client';
import { toast } from 'sonner';

import 'stream-chat-react/dist/css/v2/index.css';

interface StreamChatWrapperProps {
  channelId?: string;
  channelType?: string;
  anonymousUser?: {
    id: string;
    name: string;
  };
}

export const StreamChatWrapper: React.FC<StreamChatWrapperProps> = ({
  channelId = 'general',
  channelType = 'messaging',
  anonymousUser
}) => {
  const { user: clerkUser } = useUser();
  const [client, setClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate user token for authenticated users via API call
  const generateUserToken = async (userId: string): Promise<string> => {
    try {
      console.log('Requesting token for user:', userId);
      
      const response = await fetch('/api/stream-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Token API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token API error:', errorData);
        throw new Error(`Failed to generate token: ${errorData.error || 'Unknown error'}`);
      }

      const { token } = await response.json();
      console.log('Token received successfully');
      return token;
    } catch (error) {
      console.error('Error generating token:', error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Get Stream Chat client
        const chatClient = getStreamChatClient();
        
        let userId: string;
        let userName: string;
        let userToken: string;

        if (clerkUser) {
          // Authenticated user (creator)
          userId = clerkUser.id;
          userName = clerkUser.username || clerkUser.firstName || 'Creator';
          userToken = await generateUserToken(userId);
        } else if (anonymousUser) {
          // Anonymous user
          userId = anonymousUser.id;
          userName = anonymousUser.name;
          // Use development token for anonymous users
          userToken = chatClient.devToken(userId);
        } else {
          setLoading(false);
          return;
        }

        // Connect user
        await chatClient.connectUser(
          {
            id: userId,
            name: userName,
            image: clerkUser?.imageUrl,
            role: clerkUser ? 'creator' : 'user',
          },
          userToken
        );

        setClient(chatClient);

        // Create or get channel
        const chatChannel = chatClient.channel(channelType, channelId, {
          name: `Chat Room - ${channelId}`,
        });

        await chatChannel.create();
        setChannel(chatChannel);
      } catch (error) {
        console.error('Failed to initialize Stream Chat:', error);
        toast.error('Failed to connect to chat');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [clerkUser, anonymousUser, channelId, channelType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingIndicator />
      </div>
    );
  }

  if (!client || !channel) {
    return (
      <div className="flex items-center justify-center h-96 text-center">
        <div>
          <p className="text-white/70 mb-4">Unable to connect to chat</p>
          {!clerkUser && !anonymousUser && (
            <p className="text-white/50 text-sm">Please enter your name to join the chat</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Chat client={client} theme="str-chat__theme-dark">
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default StreamChatWrapper;