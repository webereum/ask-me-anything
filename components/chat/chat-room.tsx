'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { chatService, ChatMessage, ChatRoom, TypingIndicator, RoomMember } from '@/lib/chat/chat-service';
import { socketClient } from '@/lib/chat/socket-client';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { RoomHeader } from './room-header';
import { RoomSidebar } from './room-sidebar';
import { TypingIndicators } from './typing-indicators';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface ChatRoomProps {
  room: ChatRoom;
  onLeaveRoom?: () => void;
}

export function ChatRoom({ room, onLeaveRoom }: ChatRoomProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto' 
    });
  }, []);

  // Load initial messages and room data
  useEffect(() => {
    const loadRoomData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Join room if not already a member
        await chatService.joinRoom(room.id, user.id);

        // Load messages and members
        const [messagesData, membersData] = await Promise.all([
          chatService.getMessages(room.id, 50),
          chatService.getRoomMembers(room.id),
        ]);

        setMessages(messagesData);
        setMembers(membersData);
        setHasMoreMessages(messagesData.length === 50);

        // Connect to Socket.io
        await socketClient.connect();
        await socketClient.joinRoom(room.id, user.id);
        setIsConnected(true);

        // Set up real-time subscriptions
        const unsubscribe = chatService.subscribeToRoom(room.id, {
          onMessage: (message) => {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === message.id)) return prev;
              return [...prev, message];
            });
            
            // Auto-scroll if user is near bottom
            if (messageListRef.current) {
              const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
              const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
              if (isNearBottom) {
                setTimeout(() => scrollToBottom(), 100);
              }
            }

            // Show notification if message is from another user
            if (message.sender_id !== user.id && 'Notification' in window) {
              if (Notification.permission === 'granted') {
                new Notification(`${message.sender?.username || 'Someone'}`, {
                  body: message.content || 'Sent a media file',
                  icon: message.sender?.avatar_url,
                  tag: `chat-${room.id}`,
                });
              }
            }
          },
          onMessageDeleted: (messageId) => {
            setMessages(prev => prev.filter(m => m.id !== messageId));
          },
          onUserJoined: (member) => {
            setMembers(prev => {
              if (prev.some(m => m.user_id === member.user_id)) return prev;
              return [...prev, member];
            });
            toast.success(`${member.user?.username} joined the room`);
          },
          onUserLeft: (userId) => {
            setMembers(prev => prev.filter(m => m.user_id !== userId));
            const leftUser = members.find(m => m.user_id === userId);
            if (leftUser) {
              toast.info(`${leftUser.user?.username} left the room`);
            }
          },
          onTyping: (indicators) => {
            setTypingIndicators(indicators.filter(i => i.user_id !== user.id));
          },
        });

        unsubscribeRef.current = unsubscribe;

        // Initial scroll to bottom
        setTimeout(() => scrollToBottom(false), 100);
      } catch (error) {
        console.error('Error loading room data:', error);
        toast.error('Failed to load chat room');
      } finally {
        setIsLoading(false);
      }
    };

    loadRoomData();

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (user) {
        socketClient.leaveRoom(room.id, user.id);
        chatService.removeTypingIndicator(room.id, user.id);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [room.id, user, scrollToBottom, members]);

  // Load more messages
  const loadMoreMessages = async () => {
    if (!hasMoreMessages || isLoadingMore || messages.length === 0) return;

    try {
      setIsLoadingMore(true);
      const oldestMessage = messages[0];
      const olderMessages = await chatService.getMessages(
        room.id,
        20,
        oldestMessage.created_at
      );

      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
      } else {
        setMessages(prev => [...olderMessages, ...prev]);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
      toast.error('Failed to load more messages');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Send message
  const handleSendMessage = async (messageData: {
    content?: string;
    messageType?: 'text' | 'image' | 'gif' | 'file';
    mediaUrl?: string;
    mediaMetadata?: any;
    timerDuration?: number;
    replyToId?: string;
  }) => {
    if (!user) return;

    try {
      const message = await chatService.sendMessage({
        roomId: room.id,
        senderId: user.id,
        ...messageData,
      });

      // Emit via Socket.io for real-time delivery
      socketClient.sendMessage(message);

      // Remove typing indicator
      await chatService.removeTypingIndicator(room.id, user.id);
      socketClient.stopTyping(room.id, user.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Handle typing
  const handleTyping = useCallback(async () => {
    if (!user) return;

    try {
      await chatService.setTypingIndicator(room.id, user.id);
      socketClient.startTyping(room.id, user.id);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(async () => {
        await chatService.removeTypingIndicator(room.id, user.id);
        socketClient.stopTyping(room.id, user.id);
      }, 3000);
    } catch (error) {
      console.error('Error setting typing indicator:', error);
    }
  }, [room.id, user]);

  // Handle message deletion
  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return;

    try {
      await chatService.deleteMessage(messageId, user.id);
      socketClient.deleteMessage(messageId, room.id, user.id);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  // Leave room
  const handleLeaveRoom = async () => {
    if (!user) return;

    try {
      await chatService.leaveRoom(room.id, user.id);
      socketClient.leaveRoom(room.id, user.id);
      onLeaveRoom?.();
      toast.success('Left the room');
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error('Failed to leave room');
    }
  };

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading chat room...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex h-full bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Room Header */}
        <RoomHeader
          room={room}
          memberCount={members.length}
          isConnected={isConnected}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          onLeaveRoom={handleLeaveRoom}
        />

        {/* Messages Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Load More Button */}
          {hasMoreMessages && (
            <div className="p-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMoreMessages}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more messages'
                )}
              </Button>
            </div>
          )}

          {/* Message List */}
          <div
            ref={messageListRef}
            className="flex-1 overflow-y-auto px-4 pb-4"
          >
            <MessageList
              messages={messages}
              currentUserId={user?.id}
              onDeleteMessage={handleDeleteMessage}
              onReplyToMessage={(messageId) => {
                // Handle reply functionality
                console.log('Reply to message:', messageId);
              }}
            />
            
            {/* Typing Indicators */}
            <TypingIndicators indicators={typingIndicators} />
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <MessageInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            disabled={!isConnected}
            roomSettings={room.settings}
          />
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 border-l bg-muted/30">
          <RoomSidebar
            room={room}
            members={members}
            currentUserId={user?.id}
            onClose={() => setShowSidebar(false)}
          />
        </div>
      )}
    </div>
  );
}

export default ChatRoom;