'use client';

import React, { useState } from 'react';
import { ChatRoom, RoomMember } from '@/lib/chat/chat-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  X, 
  Search, 
  Crown, 
  Shield, 
  User, 
  MoreVertical,
  UserMinus,
  MessageSquare,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface RoomSidebarProps {
  room: ChatRoom;
  members: RoomMember[];
  currentUserId?: string;
  onClose: () => void;
  onKickMember?: (memberId: string) => void;
  onPromoteMember?: (memberId: string, role: 'admin' | 'moderator') => void;
  onMuteMember?: (memberId: string, duration?: number) => void;
  onDirectMessage?: (userId: string) => void;
}

interface MemberItemProps {
  member: RoomMember;
  currentUserId?: string;
  isCurrentUserAdmin?: boolean;
  onKickMember?: (memberId: string) => void;
  onPromoteMember?: (memberId: string, role: 'admin' | 'moderator') => void;
  onMuteMember?: (memberId: string, duration?: number) => void;
  onDirectMessage?: (userId: string) => void;
}

function MemberItem({ 
  member, 
  currentUserId, 
  isCurrentUserAdmin,
  onKickMember,
  onPromoteMember,
  onMuteMember,
  onDirectMessage
}: MemberItemProps) {
  const isCurrentUser = member.user_id === currentUserId;
  const user = member.user;

  const getRoleIcon = () => {
    switch (member.role) {
      case 'admin':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getRoleLabel = () => {
    switch (member.role) {
      case 'admin':
        return 'Admin';
      case 'moderator':
        return 'Moderator';
      default:
        return 'Member';
    }
  };

  const getOnlineStatus = () => {
    if (!user) return 'Unknown';
    
    if (user.is_online) {
      return 'Online';
    } else {
      return `Last seen ${formatDistanceToNow(new Date(user.last_seen), { addSuffix: true })}`;
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg group">
      {/* Avatar with online indicator */}
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatar_url} />
          <AvatarFallback>
            {user?.username?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        {/* Online indicator */}
        <div className={cn(
          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
          user?.is_online ? "bg-green-500" : "bg-gray-400"
        )} />
      </div>

      {/* Member info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">
            {user?.username || 'Unknown User'}
            {isCurrentUser && (
              <span className="text-muted-foreground ml-1">(You)</span>
            )}
          </span>
          
          {/* Role badge */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs h-5 px-2">
                  {getRoleIcon()}
                  <span className="ml-1">{getRoleLabel()}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Role: {getRoleLabel()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Muted indicator */}
          {member.is_muted && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="destructive" className="text-xs h-5 px-2">
                    <VolumeX className="h-3 w-3" />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Muted {member.muted_until 
                      ? `until ${new Date(member.muted_until).toLocaleString()}`
                      : 'permanently'
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="text-sm text-muted-foreground truncate">
          {getOnlineStatus()}
        </div>
      </div>

      {/* Member actions */}
      {!isCurrentUser && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Direct message */}
              <DropdownMenuItem onClick={() => onDirectMessage?.(member.user_id)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </DropdownMenuItem>

              {/* Admin actions */}
              {isCurrentUserAdmin && member.role !== 'admin' && (
                <>
                  <DropdownMenuSeparator />
                  
                  {/* Promote/Demote */}
                  {member.role === 'member' && (
                    <>
                      <DropdownMenuItem onClick={() => onPromoteMember?.(member.user_id, 'moderator')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Make Moderator
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onPromoteMember?.(member.user_id, 'admin')}>
                        <Crown className="h-4 w-4 mr-2" />
                        Make Admin
                      </DropdownMenuItem>
                    </>
                  )}

                  {member.role === 'moderator' && (
                    <DropdownMenuItem onClick={() => onPromoteMember?.(member.user_id, 'admin')}>
                      <Crown className="h-4 w-4 mr-2" />
                      Make Admin
                    </DropdownMenuItem>
                  )}

                  {/* Mute/Unmute */}
                  {member.is_muted ? (
                    <DropdownMenuItem onClick={() => onMuteMember?.(member.user_id, 0)}>
                      <Volume2 className="h-4 w-4 mr-2" />
                      Unmute
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => onMuteMember?.(member.user_id, 300)}>
                        <VolumeX className="h-4 w-4 mr-2" />
                        Mute for 5 minutes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onMuteMember?.(member.user_id, 3600)}>
                        <VolumeX className="h-4 w-4 mr-2" />
                        Mute for 1 hour
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onMuteMember?.(member.user_id, -1)}>
                        <VolumeX className="h-4 w-4 mr-2" />
                        Mute permanently
                      </DropdownMenuItem>
                    </>
                  )}

                  {/* Kick */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onKickMember?.(member.user_id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Kick from Room
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

export function RoomSidebar({ 
  room, 
  members, 
  currentUserId,
  onClose,
  onKickMember,
  onPromoteMember,
  onMuteMember,
  onDirectMessage
}: RoomSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter members based on search query
  const filteredMembers = members.filter(member => 
    member.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group members by role
  const groupedMembers = {
    admin: filteredMembers.filter(m => m.role === 'admin'),
    moderator: filteredMembers.filter(m => m.role === 'moderator'),
    member: filteredMembers.filter(m => m.role === 'member'),
  };

  // Check if current user is admin
  const currentUserMember = members.find(m => m.user_id === currentUserId);
  const isCurrentUserAdmin = currentUserMember?.role === 'admin';

  const renderMemberGroup = (title: string, members: RoomMember[], icon: React.ReactNode) => {
    if (members.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
          {icon}
          <span>{title}</span>
          <Badge variant="secondary" className="text-xs">
            {members.length}
          </Badge>
        </div>
        
        <div className="space-y-1">
          {members.map(member => (
            <MemberItem
              key={member.id}
              member={member}
              currentUserId={currentUserId}
              isCurrentUserAdmin={isCurrentUserAdmin}
              onKickMember={onKickMember}
              onPromoteMember={onPromoteMember}
              onMuteMember={onMuteMember}
              onDirectMessage={onDirectMessage}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Room Members</h3>
          <Badge variant="secondary">
            {members.length}
          </Badge>
        </div>
        
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Members list */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredMembers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {searchQuery ? 'No members found' : 'No members in this room'}
            </div>
          ) : (
            <>
              {renderMemberGroup(
                'Administrators', 
                groupedMembers.admin, 
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
              
              {renderMemberGroup(
                'Moderators', 
                groupedMembers.moderator, 
                <Shield className="h-4 w-4 text-blue-500" />
              )}
              
              {renderMemberGroup(
                'Members', 
                groupedMembers.member, 
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Room info footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="text-sm text-muted-foreground space-y-1">
          <div>Room: {room.name}</div>
          <div>Type: {room.room_type}</div>
          <div>Created: {new Date(room.created_at).toLocaleDateString()}</div>
          {room.settings?.max_members && (
            <div>Max members: {room.settings.max_members}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomSidebar;