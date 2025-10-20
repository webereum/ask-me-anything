'use client';

import React, { useState } from 'react';
import {
  MessageInput as StreamMessageInput,
  useChannelActionContext,
  useChannelStateContext,
} from 'stream-chat-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile } from 'lucide-react';
import { toast } from 'sonner';

export const CustomMessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useChannelActionContext();
  const { channel } = useChannelStateContext();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    
    try {
      await sendMessage({ 
        message: { text: message.trim() },
        localMessage: { 
          id: `temp-${Date.now()}`,
          text: message.trim(),
          type: 'regular',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          pinned_at: null,
          status: 'sending'
        }
      });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
      <form onSubmit={handleSendMessage} className="flex items-center gap-3 p-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-12 rounded-full"
            disabled={isLoading}
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 p-1 h-auto"
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full p-2 h-auto"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default CustomMessageInput;