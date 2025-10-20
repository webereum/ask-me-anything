'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassmorphicCard3D } from '@/components/glassmorphic-card-3d';
import {
  Bell,
  MessageCircle,
  Heart,
  UserPlus,
  Settings,
  Check,
  X,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Globe,
  Shield,
  Clock,
  Filter,
  MoreHorizontal
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'like' | 'follow' | 'comment' | 'mention' | 'system';
  title: string;
  message: string;
  avatar?: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'New Message',
    message: 'Sarah Johnson sent you a message in the chat room',
    avatar: '/api/placeholder/40/40',
    timestamp: '2 minutes ago',
    isRead: false,
    actionUrl: '/chat'
  },
  {
    id: '2',
    type: 'like',
    title: 'Post Liked',
    message: 'Alex Chen and 12 others liked your post about web development',
    avatar: '/api/placeholder/40/40',
    timestamp: '1 hour ago',
    isRead: false,
    actionUrl: '/community'
  },
  {
    id: '3',
    type: 'follow',
    title: 'New Follower',
    message: 'Maria Rodriguez started following you',
    avatar: '/api/placeholder/40/40',
    timestamp: '3 hours ago',
    isRead: true,
    actionUrl: '/profile'
  },
  {
    id: '4',
    type: 'comment',
    title: 'New Comment',
    message: 'Someone commented on your Ask Me Anything session',
    avatar: '/api/placeholder/40/40',
    timestamp: '5 hours ago',
    isRead: true,
    actionUrl: '/dashboard'
  },
  {
    id: '5',
    type: 'system',
    title: 'Security Alert',
    message: 'New login detected from a different device',
    timestamp: '1 day ago',
    isRead: true,
    actionUrl: '/settings'
  }
];

const notificationSettings = {
  pushNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
  soundEnabled: true,
  vibrationEnabled: true,
  showPreviews: true,
  quietHours: false,
  quietStart: '22:00',
  quietEnd: '08:00'
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [settings, setSettings] = useState(notificationSettings);
  const [filter, setFilter] = useState<'all' | 'unread' | 'messages' | 'social'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-400" />;
      case 'like':
        return <Heart className="h-5 w-5 text-red-400" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-400" />;
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-purple-400" />;
      case 'system':
        return <Shield className="h-5 w-5 text-orange-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'messages':
        return notification.type === 'message' || notification.type === 'comment';
      case 'social':
        return notification.type === 'like' || notification.type === 'follow';
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
            Notifications
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Stay updated with all your activities and interactions
          </p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 border-white/20">
            <TabsTrigger 
              value="notifications" 
              className="data-[state=active]:bg-white/20 text-white"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-white/20 text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            {/* Notification Controls */}
            <GlassmorphicCard3D className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Recent Activity
                  </h3>
                  <p className="text-white/60 text-sm">
                    {unreadCount} unread notifications
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark All Read
                  </Button>
                </div>
              </div>
            </GlassmorphicCard3D>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', icon: Bell },
                { key: 'unread', label: 'Unread', icon: Filter },
                { key: 'messages', label: 'Messages', icon: MessageCircle },
                { key: 'social', label: 'Social', icon: Heart }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={filter === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(key as any)}
                  className={filter === key 
                    ? "bg-gradient-to-r from-purple-500 to-blue-500" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                  }
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <GlassmorphicCard3D className="p-8 text-center">
                  <Bell className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No notifications
                  </h3>
                  <p className="text-white/60">
                    You're all caught up! Check back later for new updates.
                  </p>
                </GlassmorphicCard3D>
              ) : (
                filteredNotifications.map((notification) => (
                  <GlassmorphicCard3D 
                    key={notification.id} 
                    className={`p-4 transition-all duration-200 ${
                      !notification.isRead ? 'ring-2 ring-blue-400/30' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {notification.avatar ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={notification.avatar} />
                            <AvatarFallback>
                              {getNotificationIcon(notification.type)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-white/70 text-sm mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-white/50">
                              <Clock className="h-3 w-3" />
                              <span>{notification.timestamp}</span>
                              {!notification.isRead && (
                                <Badge className="bg-blue-500 text-white text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="text-white/70 hover:text-white"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-white/70 hover:text-white"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassmorphicCard3D>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Notification Preferences */}
            <GlassmorphicCard3D className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6">
                Notification Preferences
              </h3>
              
              <div className="space-y-6">
                {/* Push Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">Push Notifications</div>
                      <div className="text-white/60 text-sm">Receive notifications on your device</div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, pushNotifications: checked })
                    }
                  />
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-green-400" />
                    <div>
                      <div className="text-white font-medium">Email Notifications</div>
                      <div className="text-white/60 text-sm">Get updates via email</div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, emailNotifications: checked })
                    }
                  />
                </div>

                {/* Sound */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {settings.soundEnabled ? (
                      <Volume2 className="h-5 w-5 text-purple-400" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <div className="text-white font-medium">Sound</div>
                      <div className="text-white/60 text-sm">Play sound for notifications</div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, soundEnabled: checked })
                    }
                  />
                </div>

                {/* Show Previews */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-orange-400" />
                    <div>
                      <div className="text-white font-medium">Show Previews</div>
                      <div className="text-white/60 text-sm">Display message content in notifications</div>
                    </div>
                  </div>
                  <Switch
                    checked={settings.showPreviews}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, showPreviews: checked })
                    }
                  />
                </div>
              </div>
            </GlassmorphicCard3D>

            {/* Notification Types */}
            <GlassmorphicCard3D className="p-6">
              <h3 className="text-lg font-semibold text-white mb-6">
                Notification Types
              </h3>
              
              <div className="space-y-4">
                {[
                  { type: 'Messages', icon: MessageCircle, color: 'text-blue-400' },
                  { type: 'Likes & Reactions', icon: Heart, color: 'text-red-400' },
                  { type: 'New Followers', icon: UserPlus, color: 'text-green-400' },
                  { type: 'Comments', icon: MessageCircle, color: 'text-purple-400' },
                  { type: 'Security Alerts', icon: Shield, color: 'text-orange-400' }
                ].map(({ type, icon: Icon, color }) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${color}`} />
                      <span className="text-white font-medium">{type}</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </GlassmorphicCard3D>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}