'use client';

import { StreamChat } from 'stream-chat';

let chatClient: StreamChat | null = null;

export const getStreamChatClient = () => {
  if (!chatClient) {
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || 'demo-api-key';
    
    chatClient = StreamChat.getInstance(apiKey);
  }
  
  return chatClient;
};

export const connectUser = async (userId: string, userToken: string, userData: any) => {
  const client = getStreamChatClient();
  
  if (client.userID === userId) {
    return client;
  }
  
  await client.connectUser(
    {
      id: userId,
      name: userData.username || userData.name,
      image: userData.avatar_url || userData.image,
      ...userData,
    },
    userToken
  );
  
  return client;
};

export const disconnectUser = async () => {
  const client = getStreamChatClient();
  await client.disconnectUser();
};

export default getStreamChatClient;