'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Settings, 
  Search, 
  MoreVertical,
  Phone,
  Video,
  Info
} from 'lucide-react';
import { StreamChatWrapper } from '@/components/chat/stream-chat-wrapper';
import { useAuth } from '@/lib/auth/auth-context';

export default function ChatPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeUsers] = useState(42);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="p-8 bg-black/20 backdrop-blur-sm border-white/10">
          <p className="text-white text-center">Please log in to access the chat</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Live Chat</h1>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              <Users className="w-3 h-3 mr-1" />
              {activeUsers} online
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
              <Info className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="flex-1 bg-black/20 backdrop-blur-sm border-white/10 overflow-hidden">
          <StreamChatWrapper channelId="general" channelType="messaging" />
        </Card>
      </div>
    </div>
  );
}