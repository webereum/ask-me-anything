'use client';

import React from 'react';
import {
  MessageList as StreamMessageList,
  useChannelStateContext,
  useComponentContext,
  MessageSimple,
  useChatContext,
} from 'stream-chat-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export const CustomMessageList: React.FC = () => {
  return (
    <div className="flex-1 overflow-hidden str-chat__list--messaging">
      <StreamMessageList
        Message={CustomMessage}
      />
    </div>
  );
};

const CustomMessage: React.FC<any> = (props) => {
  const { message } = props;
  const { client } = useChatContext();
  
  const isOwn = message.user?.id === client.userID;
  const timestamp = message.created_at ? new Date(message.created_at) : new Date();

  return (
    <div className={`flex gap-3 p-4 hover:bg-white/5 transition-colors ${
      isOwn ? 'flex-row-reverse' : 'flex-row'
    }`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={message.user?.image} />
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
          {message.user?.name?.charAt(0) || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-sm font-medium text-white">
            {message.user?.name || 'Anonymous'}
          </span>
          <span className="text-xs text-white/50">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
        </div>
        
        <div className={`rounded-2xl px-4 py-2 max-w-full break-words ${
          isOwn 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
            : 'bg-white/10 text-white border border-white/20'
        }`}>
          {message.text && (
            <p className="text-sm leading-relaxed">{message.text}</p>
          )}
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2">
              {message.attachments.map((attachment: any, index: number) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  {attachment.type === 'image' && (
                    <img 
                      src={attachment.image_url} 
                      alt="Attachment" 
                      className="max-w-full h-auto rounded-lg"
                    />
                  )}
                  {attachment.type === 'file' && (
                    <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                      <span className="text-sm">{attachment.title}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomMessageList;