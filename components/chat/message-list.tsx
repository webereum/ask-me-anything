'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/lib/chat/chat-service';
import { MessageBubble } from './message-bubble';
import { MessageTimer } from './message-timer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Reply, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId?: string;
  onDeleteMessage?: (messageId: string) => void;
  onReplyToMessage?: (messageId: string) => void;
  onMessageView?: (messageId: string, viewDuration: number) => void;
}

interface MessageGroupProps {
  messages: ChatMessage[];
  currentUserId?: string;
  onDeleteMessage?: (messageId: string) => void;
  onReplyToMessage?: (messageId: string) => void;
  onMessageView?: (messageId: string, viewDuration: number) => void;
}

function MessageGroup({ 
  messages, 
  currentUserId, 
  onDeleteMessage, 
  onReplyToMessage,
  onMessageView 
}: MessageGroupProps) {
  const firstMessage = messages[0];
  const isOwnMessage = firstMessage.sender_id === currentUserId;
  const sender = firstMessage.sender;

  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isOwnMessage ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar (only for other users) */}
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={sender?.avatar_url} />
          <AvatarFallback>
            {sender?.username?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Messages */}
      <div className={cn(
        "flex flex-col gap-1 max-w-[70%]",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        {/* Sender name and timestamp (only for first message from others) */}
        {!isOwnMessage && (
          <div className="flex items-center gap-2 px-3">
            <span className="text-sm font-medium text-foreground">
              {sender?.username || 'Unknown User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(firstMessage.created_at), { addSuffix: true })}
            </span>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwnMessage={isOwnMessage}
            showTimestamp={isOwnMessage && index === 0}
            onDeleteMessage={onDeleteMessage}
            onReplyToMessage={onReplyToMessage}
            onMessageView={onMessageView}
          />
        ))}
      </div>
    </div>
  );
}

interface MessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showTimestamp?: boolean;
  onDeleteMessage?: (messageId: string) => void;
  onReplyToMessage?: (messageId: string) => void;
  onMessageView?: (messageId: string, viewDuration: number) => void;
}

function MessageItem({ 
  message, 
  isOwnMessage, 
  showTimestamp,
  onDeleteMessage, 
  onReplyToMessage,
  onMessageView 
}: MessageItemProps) {
  const [isExpired, setIsExpired] = useState(false);
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  // Handle message expiration
  useEffect(() => {
    if (message.expires_at) {
      const expirationTime = new Date(message.expires_at).getTime();
      const now = Date.now();
      
      if (now >= expirationTime) {
        setIsExpired(true);
        return;
      }

      const timeout = setTimeout(() => {
        setIsExpired(true);
      }, expirationTime - now);

      return () => clearTimeout(timeout);
    }
  }, [message.expires_at]);

  // Handle message viewing for timed messages
  useEffect(() => {
    if (message.timer_duration && !isOwnMessage && !isExpired) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (!viewStartTime) {
                setViewStartTime(Date.now());
              }
            } else {
              if (viewStartTime) {
                const viewDuration = Date.now() - viewStartTime;
                onMessageView?.(message.id, viewDuration);
                setViewStartTime(null);
              }
            }
          });
        },
        { threshold: 0.5 }
      );

      if (messageRef.current) {
        observer.observe(messageRef.current);
      }

      return () => {
        observer.disconnect();
        if (viewStartTime) {
          const viewDuration = Date.now() - viewStartTime;
          onMessageView?.(message.id, viewDuration);
        }
      };
    }
  }, [message.id, message.timer_duration, isOwnMessage, isExpired, viewStartTime, onMessageView]);

  if (isExpired) {
    return (
      <div className={cn(
        "px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground text-sm italic",
        isOwnMessage ? "bg-primary/10" : "bg-muted/50"
      )}>
        This message has expired
      </div>
    );
  }

  return (
    <div
      ref={messageRef}
      className={cn(
        "group relative",
        isOwnMessage ? "self-end" : "self-start"
      )}
    >
      {/* Reply indicator */}
      {message.reply_to && (
        <div className={cn(
          "mb-1 px-3 py-1 text-xs bg-muted/50 rounded border-l-2",
          isOwnMessage ? "border-primary" : "border-muted-foreground"
        )}>
          <div className="font-medium">
            {message.reply_to.sender?.username}
          </div>
          <div className="text-muted-foreground truncate">
            {message.reply_to.content || 'Media message'}
          </div>
        </div>
      )}

      {/* Message bubble */}
      <div className="flex items-end gap-2">
        <MessageBubble
          message={message}
          isOwnMessage={isOwnMessage}
        />

        {/* Message actions */}
        <div className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "flex items-center gap-1"
        )}>
          {/* Reply button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onReplyToMessage?.(message.id)}
          >
            <Reply className="h-3 w-3" />
          </Button>

          {/* More actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwnMessage && (
                <DropdownMenuItem
                  onClick={() => onDeleteMessage?.(message.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Timer indicator */}
      {message.timer_duration && (
        <MessageTimer
          duration={message.timer_duration}
          expiresAt={message.expires_at}
          isOwnMessage={isOwnMessage}
        />
      )}

      {/* Timestamp for own messages */}
      {showTimestamp && isOwnMessage && (
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </div>
      )}
    </div>
  );
}

export function MessageList({ 
  messages, 
  currentUserId, 
  onDeleteMessage, 
  onReplyToMessage,
  onMessageView 
}: MessageListProps) {
  // Group consecutive messages from the same sender
  const groupedMessages = React.useMemo(() => {
    const groups: ChatMessage[][] = [];
    let currentGroup: ChatMessage[] = [];

    messages.forEach((message, index) => {
      const prevMessage = messages[index - 1];
      const shouldGroup = prevMessage && 
        prevMessage.sender_id === message.sender_id &&
        new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 5 * 60 * 1000; // 5 minutes

      if (shouldGroup && currentGroup.length > 0) {
        currentGroup.push(message);
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [message];
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <div className="text-center">
          <div className="text-lg mb-2">💬</div>
          <div>No messages yet</div>
          <div className="text-sm">Start the conversation!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {groupedMessages.map((group, index) => (
        <MessageGroup
          key={`group-${index}-${group[0].id}`}
          messages={group}
          currentUserId={currentUserId}
          onDeleteMessage={onDeleteMessage}
          onReplyToMessage={onReplyToMessage}
          onMessageView={onMessageView}
        />
      ))}
    </div>
  );
}

export default MessageList;