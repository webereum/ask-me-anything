'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, Volume2, VolumeX, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import PushNotificationService from '@/lib/push-notifications';
import { useAuth } from '@/lib/auth/auth-context';

interface NotificationPreferences {
  enabled: boolean;
  messages: boolean;
  directMessages: boolean;
  threads: boolean;
  roomInvites: boolean;
  mentions: boolean;
  sound: boolean;
  vibration: boolean;
  desktop: boolean;
  mobile: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const defaultPreferences: NotificationPreferences = {
  enabled: false,
  messages: true,
  directMessages: true,
  threads: true,
  roomInvites: true,
  mentions: true,
  sound: true,
  vibration: true,
  desktop: true,
  mobile: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

export default function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const pushService = PushNotificationService.getInstance();

  useEffect(() => {
    checkNotificationStatus();
    loadPreferences();
  }, [user]);

  const checkNotificationStatus = async () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      const subscribed = await pushService.isSubscribed();
      setIsSubscribed(subscribed);
    }
  };

  const loadPreferences = () => {
    if (user) {
      const saved = localStorage.getItem(`notification-preferences-${user.id}`);
      if (saved) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(saved) });
      }
    }
  };

  const savePreferences = (newPreferences: NotificationPreferences) => {
    if (user) {
      localStorage.setItem(
        `notification-preferences-${user.id}`,
        JSON.stringify(newPreferences)
      );
      setPreferences(newPreferences);
    }
  };

  const handleEnableNotifications = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to enable notifications.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Initialize push service
      const initialized = await pushService.initialize();
      if (!initialized) {
        throw new Error('Push notifications not supported');
      }

      // Subscribe to notifications
      const subscription = await pushService.subscribe(user.id);
      if (subscription) {
        setIsSubscribed(true);
        setPermission('granted');
        
        const newPreferences = { ...preferences, enabled: true };
        savePreferences(newPreferences);

        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive push notifications for new messages.',
        });

        // Send test notification
        await pushService.sendNotification({
          title: 'Notifications Enabled!',
          body: 'You will now receive notifications for new messages.',
          icon: '/icons/icon-192x192.png',
        });
      } else {
        throw new Error('Failed to subscribe to notifications');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast({
        title: 'Failed to Enable Notifications',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const unsubscribed = await pushService.unsubscribe(user.id);
      if (unsubscribed) {
        setIsSubscribed(false);
        
        const newPreferences = { ...preferences, enabled: false };
        savePreferences(newPreferences);

        toast({
          title: 'Notifications Disabled',
          description: 'You will no longer receive push notifications.',
        });
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast({
        title: 'Failed to Disable Notifications',
        description: 'An error occurred while disabling notifications.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    savePreferences(newPreferences);
  };

  const handleQuietHoursChange = (key: keyof NotificationPreferences['quietHours'], value: string | boolean) => {
    const newPreferences = {
      ...preferences,
      quietHours: { ...preferences.quietHours, [key]: value },
    };
    savePreferences(newPreferences);
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { color: 'bg-green-500', text: 'Granted' };
      case 'denied':
        return { color: 'bg-red-500', text: 'Denied' };
      default:
        return { color: 'bg-yellow-500', text: 'Not Set' };
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Notification Settings</h2>
        </div>
        <Badge variant="outline" className={`${permissionStatus.color} text-white`}>
          {permissionStatus.text}
        </Badge>
      </div>

      {/* Main Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {preferences.enabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            <span>Push Notifications</span>
          </CardTitle>
          <CardDescription>
            Receive notifications for new messages and activities even when the app is closed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                {isSubscribed ? 'Notifications are active' : 'Enable to receive push notifications'}
              </p>
            </div>
            <Button
              onClick={preferences.enabled ? handleDisableNotifications : handleEnableNotifications}
              disabled={isLoading}
              variant={preferences.enabled ? 'destructive' : 'default'}
            >
              {isLoading ? 'Loading...' : preferences.enabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      {preferences.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>
              Choose which types of notifications you want to receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Chat Messages</Label>
                <p className="text-sm text-muted-foreground">New messages in chat rooms</p>
              </div>
              <Switch
                checked={preferences.messages}
                onCheckedChange={(checked) => handlePreferenceChange('messages', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Direct Messages</Label>
                <p className="text-sm text-muted-foreground">Private messages sent directly to you</p>
              </div>
              <Switch
                checked={preferences.directMessages}
                onCheckedChange={(checked) => handlePreferenceChange('directMessages', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Thread Activity</Label>
                <p className="text-sm text-muted-foreground">Replies and likes on your threads</p>
              </div>
              <Switch
                checked={preferences.threads}
                onCheckedChange={(checked) => handlePreferenceChange('threads', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Room Invites</Label>
                <p className="text-sm text-muted-foreground">Invitations to join chat rooms</p>
              </div>
              <Switch
                checked={preferences.roomInvites}
                onCheckedChange={(checked) => handlePreferenceChange('roomInvites', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Mentions</Label>
                <p className="text-sm text-muted-foreground">When someone mentions you in a message</p>
              </div>
              <Switch
                checked={preferences.mentions}
                onCheckedChange={(checked) => handlePreferenceChange('mentions', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Behavior */}
      {preferences.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Notification Behavior</span>
            </CardTitle>
            <CardDescription>
              Customize how notifications are delivered.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {preferences.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <div className="space-y-1">
                  <Label>Sound</Label>
                  <p className="text-sm text-muted-foreground">Play notification sounds</p>
                </div>
              </div>
              <Switch
                checked={preferences.sound}
                onCheckedChange={(checked) => handlePreferenceChange('sound', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4" />
                <div className="space-y-1">
                  <Label>Vibration</Label>
                  <p className="text-sm text-muted-foreground">Vibrate on mobile devices</p>
                </div>
              </div>
              <Switch
                checked={preferences.vibration}
                onCheckedChange={(checked) => handlePreferenceChange('vibration', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <div className="space-y-1">
                  <Label>Desktop Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show notifications on desktop</p>
                </div>
              </div>
              <Switch
                checked={preferences.desktop}
                onCheckedChange={(checked) => handlePreferenceChange('desktop', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiet Hours */}
      {preferences.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Quiet Hours</CardTitle>
            <CardDescription>
              Set times when you don't want to receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">
                  Disable notifications during specified hours
                </p>
              </div>
              <Switch
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) => handleQuietHoursChange('enabled', checked)}
              />
            </div>

            {preferences.quietHours.enabled && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiet-start">Start Time</Label>
                    <input
                      id="quiet-start"
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiet-end">End Time</Label>
                    <input
                      id="quiet-end"
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Browser Support Info */}
      {!('Notification' in window) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-yellow-800">
              <BellOff className="h-5 w-5" />
              <p className="font-medium">Notifications Not Supported</p>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}