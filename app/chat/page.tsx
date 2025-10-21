'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Settings, 
  Search, 
  MoreVertical,
  Phone,
  Video,
  Info,
  MessageCircle
} from 'lucide-react';
import { StreamChatWrapper } from '@/components/chat/stream-chat-wrapper';
import { useAuth, useUser } from '@clerk/nextjs';

export default function ChatPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [activeUsers] = useState(42);
  const [anonymousUser, setAnonymousUser] = useState<{id: string, name: string} | null>(null);
  const [userName, setUserName] = useState('');

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="p-8 bg-black/20 backdrop-blur-sm border-white/10">
          <p className="text-white text-center">Loading...</p>
        </Card>
      </div>
    );
  }

  // Handle anonymous user setup
  const handleAnonymousJoin = () => {
    if (userName.trim()) {
      const anonymousId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setAnonymousUser({
        id: anonymousId,
        name: userName.trim()
      });
    }
  };

  // Show name input for anonymous users
  if (!isSignedIn && !anonymousUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="p-8 bg-black/20 backdrop-blur-sm border-white/10 text-center space-y-6 max-w-md w-full mx-4">
          <div className="space-y-2">
            <MessageCircle className="w-12 h-12 text-purple-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Join Anonymous Chat</h2>
            <p className="text-white/70">Enter your name to start chatting with creators</p>
          </div>
          
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your name..."
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              onKeyPress={(e) => e.key === 'Enter' && handleAnonymousJoin()}
            />
            <Button 
              onClick={handleAnonymousJoin}
              disabled={!userName.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              Join Chat
            </Button>
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <p className="text-white/50 text-sm mb-2">Are you a creator?</p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/login'}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Login as Creator
            </Button>
          </div>
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
            {/* User status indicator */}
            <Badge variant="outline" className="border-white/20 text-white/70">
              {isSignedIn ? `Creator: ${user?.firstName || 'User'}` : `Guest: ${anonymousUser?.name}`}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
              <Search className="w-4 h-4" />
            </Button>
            {isSignedIn && (
              <>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                  <Video className="w-4 h-4" />
                </Button>
              </>
            )}
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
          <StreamChatWrapper 
            channelId="general" 
            channelType="messaging" 
            anonymousUser={anonymousUser}
          />
        </Card>
      </div>
    </div>
  );
}