import { createClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  room_type: 'public' | 'private' | 'direct';
  creator_id?: string;
  settings: {
    screenshot_blocking?: boolean;
    message_retention?: string;
    max_members?: number;
  };
  is_active: boolean;
  created_at: string;
  member_count?: number;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content?: string;
  message_type: 'text' | 'image' | 'gif' | 'file';
  media_url?: string;
  media_metadata?: {
    filename?: string;
    size?: number;
    type?: string;
    width?: number;
    height?: number;
  };
  timer_duration?: number;
  expires_at?: string;
  is_deleted: boolean;
  reply_to_id?: string;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    username: string;
    avatar_url?: string;
    is_online: boolean;
  };
  reply_to?: ChatMessage;
  views?: MessageView[];
}

export interface MessageView {
  id: string;
  message_id: string;
  viewer_id: string;
  viewed_at: string;
  view_duration: number;
}

export interface ChatUser {
  id: string;
  auth_user_id?: string;
  username: string;
  is_anonymous: boolean;
  avatar_url?: string;
  is_online: boolean;
  last_seen: string;
  settings: {
    notifications?: boolean;
    sound_enabled?: boolean;
    theme?: 'light' | 'dark' | 'system';
  };
  created_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  is_muted: boolean;
  muted_until?: string;
  user?: ChatUser;
}

export interface TypingIndicator {
  id: string;
  room_id: string;
  user_id: string;
  started_at: string;
  expires_at: string;
  user?: ChatUser;
}

class ChatService {
  private supabase = createClient();

  // Room Management
  async getRooms(userId?: string): Promise<ChatRoom[]> {
    try {
      let query = this.supabase
        .from('chat_rooms')
        .select(`
          *,
          room_members!inner(count)
        `)
        .eq('is_active', true);

      if (userId) {
        // Get rooms user is a member of or public rooms
        query = query.or(`room_type.eq.public,room_members.user_id.eq.${userId}`);
      } else {
        // Only public rooms for non-authenticated users
        query = query.eq('room_type', 'public');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(room => ({
        ...room,
        member_count: room.room_members?.[0]?.count || 0,
      })) || [];
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  }

  async createRoom(roomData: Partial<ChatRoom>, creatorId: string): Promise<ChatRoom> {
    try {
      const { data: room, error: roomError } = await this.supabase
        .from('chat_rooms')
        .insert({
          id: uuidv4(),
          name: roomData.name!,
          description: roomData.description,
          room_type: roomData.room_type || 'public',
          creator_id: creatorId,
          settings: roomData.settings || {},
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as admin member
      await this.joinRoom(room.id, creatorId, 'admin');

      return room;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  async joinRoom(roomId: string, userId: string, role: 'admin' | 'moderator' | 'member' = 'member'): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('room_members')
        .upsert({
          room_id: roomId,
          user_id: userId,
          role: role,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('room_members')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  }

  async getRoomMembers(roomId: string): Promise<RoomMember[]> {
    try {
      const { data, error } = await this.supabase
        .from('room_members')
        .select(`
          *,
          user:chat_users(*)
        `)
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching room members:', error);
      throw error;
    }
  }

  // Message Management
  async getMessages(roomId: string, limit: number = 50, before?: string): Promise<ChatMessage[]> {
    try {
      let query = this.supabase
        .from('chat_messages')
        .select(`
          *,
          sender:chat_users(*),
          reply_to:chat_messages(
            id,
            content,
            message_type,
            sender:chat_users(username, avatar_url)
          ),
          views:message_views(*)
        `)
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter out expired messages
      const now = new Date();
      const validMessages = data?.filter(message => {
        if (message.expires_at) {
          return new Date(message.expires_at) > now;
        }
        return true;
      }) || [];

      return validMessages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async sendMessage(messageData: {
    roomId: string;
    senderId: string;
    content?: string;
    messageType?: 'text' | 'image' | 'gif' | 'file';
    mediaUrl?: string;
    mediaMetadata?: any;
    timerDuration?: number;
    replyToId?: string;
  }): Promise<ChatMessage> {
    try {
      const messageId = uuidv4();
      const now = new Date().toISOString();

      const { data: message, error } = await this.supabase
        .from('chat_messages')
        .insert({
          id: messageId,
          room_id: messageData.roomId,
          sender_id: messageData.senderId,
          content: messageData.content,
          message_type: messageData.messageType || 'text',
          media_url: messageData.mediaUrl,
          media_metadata: messageData.mediaMetadata || {},
          timer_duration: messageData.timerDuration,
          reply_to_id: messageData.replyToId,
          created_at: now,
          updated_at: now,
        })
        .select(`
          *,
          sender:chat_users(*),
          reply_to:chat_messages(
            id,
            content,
            message_type,
            sender:chat_users(username, avatar_url)
          )
        `)
        .single();

      if (error) throw error;
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  async markMessageAsViewed(messageId: string, viewerId: string, viewDuration: number = 0): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('message_views')
        .upsert({
          message_id: messageId,
          viewer_id: viewerId,
          view_duration: viewDuration,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as viewed:', error);
      throw error;
    }
  }

  // Typing Indicators
  async setTypingIndicator(roomId: string, userId: string): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + 10000).toISOString(); // 10 seconds

      const { error } = await this.supabase
        .from('typing_indicators')
        .upsert({
          room_id: roomId,
          user_id: userId,
          expires_at: expiresAt,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting typing indicator:', error);
      throw error;
    }
  }

  async removeTypingIndicator(roomId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('typing_indicators')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing typing indicator:', error);
      throw error;
    }
  }

  async getTypingIndicators(roomId: string): Promise<TypingIndicator[]> {
    try {
      const { data, error } = await this.supabase
        .from('typing_indicators')
        .select(`
          *,
          user:chat_users(*)
        `)
        .eq('room_id', roomId)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching typing indicators:', error);
      throw error;
    }
  }

  // User Management
  async updateUserStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('chat_users')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<ChatUser | null> {
    try {
      const { data, error } = await this.supabase
        .from('chat_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  // Real-time subscriptions
  subscribeToRoom(roomId: string, callbacks: {
    onMessage?: (message: ChatMessage) => void;
    onMessageDeleted?: (messageId: string) => void;
    onUserJoined?: (member: RoomMember) => void;
    onUserLeft?: (userId: string) => void;
    onTyping?: (indicators: TypingIndicator[]) => void;
  }) {
    const messageSubscription = this.supabase
      .channel(`room-messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          if (callbacks.onMessage) {
            // Fetch complete message with relations
            const { data } = await this.supabase
              .from('chat_messages')
              .select(`
                *,
                sender:chat_users(*),
                reply_to:chat_messages(
                  id,
                  content,
                  message_type,
                  sender:chat_users(username, avatar_url)
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              callbacks.onMessage(data);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.new.is_deleted && callbacks.onMessageDeleted) {
            callbacks.onMessageDeleted(payload.new.id);
          }
        }
      )
      .subscribe();

    const memberSubscription = this.supabase
      .channel(`room-members-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_members',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          if (callbacks.onUserJoined) {
            const { data } = await this.supabase
              .from('room_members')
              .select(`
                *,
                user:chat_users(*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              callbacks.onUserJoined(data);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'room_members',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (callbacks.onUserLeft) {
            callbacks.onUserLeft(payload.old.user_id);
          }
        }
      )
      .subscribe();

    const typingSubscription = this.supabase
      .channel(`room-typing-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `room_id=eq.${roomId}`,
        },
        async () => {
          if (callbacks.onTyping) {
            const indicators = await this.getTypingIndicators(roomId);
            callbacks.onTyping(indicators);
          }
        }
      )
      .subscribe();

    return () => {
      messageSubscription.unsubscribe();
      memberSubscription.unsubscribe();
      typingSubscription.unsubscribe();
    };
  }

  // Cleanup expired messages and typing indicators
  async cleanupExpiredContent(): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Mark expired messages as deleted
      await this.supabase
        .from('chat_messages')
        .update({ is_deleted: true })
        .lt('expires_at', now)
        .eq('is_deleted', false);

      // Remove expired typing indicators
      await this.supabase
        .from('typing_indicators')
        .delete()
        .lt('expires_at', now);
    } catch (error) {
      console.error('Error cleaning up expired content:', error);
    }
  }
}

export const chatService = new ChatService();
export default chatService;