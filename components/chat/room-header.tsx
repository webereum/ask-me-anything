'use client';

import React from 'react';
import { ChatRoom } from '@/lib/chat/chat-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Settings, 
  MoreVertical, 
  LogOut, 
  Shield,
  Wifi,
  WifiOff,
  Hash,
  Lock,
  Globe
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

interface RoomHeaderProps {
  room: ChatRoom;
  memberCount: number;
  isConnected: boolean;
  onToggleSidebar: () => void;
  onLeaveRoom: () => void;
  onRoomSettings?: () => void;
}

export function RoomHeader({ 
  room, 
  memberCount, 
  isConnected,
  onToggleSidebar, 
  onLeaveRoom,
  onRoomSettings 
}: RoomHeaderProps) {
  const getRoomIcon = () => {
    switch (room.room_type) {
      case 'private':
        return <Lock className="h-4 w-4" />;
      case 'direct':
        return <Users className="h-4 w-4" />;
      case 'public':
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const getRoomTypeLabel = () => {
    switch (room.room_type) {
      case 'private':
        return 'Private Room';
      case 'direct':
        return 'Direct Message';
      case 'public':
      default:
        return 'Public Room';
    }
  };

  const getConnectionStatus = () => {
    if (isConnected) {
      return {
        icon: <Wifi className="h-3 w-3 text-green-500" />,
        text: 'Connected',
        className: 'text-green-600 dark:text-green-400'
      };
    } else {
      return {
        icon: <WifiOff className="h-3 w-3 text-red-500" />,
        text: 'Disconnected',
        className: 'text-red-600 dark:text-red-400'
      };
    }
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left side - Room info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Room avatar/icon */}
        <div className="flex-shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10">
              {getRoomIcon()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Room details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-lg truncate">
              {room.name}
            </h2>
            
            {/* Room type badge */}
            <Badge variant="outline" className="text-xs">
              {getRoomTypeLabel()}
            </Badge>

            {/* Security features */}
            {room.settings?.screenshot_blocking && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Protected
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Screenshot blocking enabled</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Room description and status */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {room.description && (
              <span className="truncate max-w-[200px]">
                {room.description}
              </span>
            )}
            
            {/* Member count */}
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
            </div>

            {/* Connection status */}
            <div className={cn("flex items-center gap-1", connectionStatus.className)}>
              {connectionStatus.icon}
              <span className="text-xs">{connectionStatus.text}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Members sidebar toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
              >
                <Users className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle member list</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Room menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Room settings (if user has permission) */}
            {onRoomSettings && (
              <>
                <DropdownMenuItem onClick={onRoomSettings}>
                  <Settings className="h-4 w-4 mr-2" />
                  Room Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Room info */}
            <DropdownMenuItem disabled>
              <div className="flex flex-col gap-1">
                <div className="font-medium">Room Information</div>
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(room.created_at).toLocaleDateString()}
                </div>
                {room.settings?.max_members && (
                  <div className="text-xs text-muted-foreground">
                    Max members: {room.settings.max_members}
                  </div>
                )}
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Leave room */}
            <DropdownMenuItem 
              onClick={onLeaveRoom}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave Room
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default RoomHeader;