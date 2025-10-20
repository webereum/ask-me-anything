'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import PushNotificationService, { NotificationTemplates } from '@/lib/push-notifications';
import { useToast } from '@/hooks/use-toast';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  isLoading: boolean;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendNotification: (payload: any) => Promise<void>;
  sendMessageNotification: (senderName: string, roomName: string, message: string, userIds: string[]) => Promise<void>;
  sendDirectMessageNotification: (senderName: string, message: string, userIds: string[]) => Promise<void>;
  sendThreadNotification: (userName: string, threadTitle: string, type: 'reply' | 'like', userIds: string[]) => Promise<void>;
  sendRoomInviteNotification: (inviterName: string, roomName: string, userIds: string[]) => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [pushService] = useState(() => PushNotificationService.getInstance());

  useEffect(() => {
    checkSupport();
    checkSubscriptionStatus();
  }, [user]);

  const checkSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!isSupported || !user) return;

    try {
      const subscribed = await pushService.isSubscribed();
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in this browser.',
        variant: 'destructive',
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Initialize push service
      const initialized = await pushService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize push service');
      }

      // Subscribe to notifications
      const subscription = await pushService.subscribe(user.id);
      if (subscription) {
        setIsSubscribed(true);
        setPermission('granted');
        
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive push notifications.',
        });

        // Send welcome notification
        await pushService.sendNotification({
          title: 'Welcome to Live Chat!',
          body: 'You will now receive notifications for new messages.',
          icon: '/icons/icon-192x192.png',
        });

        return true;
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast({
        title: 'Subscription Failed',
        description: error instanceof Error ? error.message : 'Failed to enable notifications.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user, pushService, toast]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);

    try {
      const success = await pushService.unsubscribe(user.id);
      if (success) {
        setIsSubscribed(false);
        toast({
          title: 'Notifications Disabled',
          description: 'You will no longer receive push notifications.',
        });
        return true;
      } else {
        throw new Error('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      toast({
        title: 'Unsubscribe Failed',
        description: 'Failed to disable notifications.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, pushService, toast]);

  const sendNotification = useCallback(async (payload: any): Promise<void> => {
    try {
      await pushService.sendNotification(payload);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, [pushService]);

  const sendServerNotification = useCallback(async (
    userIds: string[],
    title: string,
    message: string,
    type: string,
    additionalData: any = {}
  ): Promise<void> => {
    try {
      const response = await fetch('/api/push-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds,
          title,
          message,
          type,
          data: additionalData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending server notification:', error);
    }
  }, []);

  const sendMessageNotification = useCallback(async (
    senderName: string,
    roomName: string,
    message: string,
    userIds: string[]
  ): Promise<void> => {
    const template = NotificationTemplates.newMessage(senderName, roomName, message);
    await sendServerNotification(
      userIds,
      template.title,
      template.body,
      'message',
      {
        roomName,
        senderName,
        ...template.data,
      }
    );
  }, [sendServerNotification]);

  const sendDirectMessageNotification = useCallback(async (
    senderName: string,
    message: string,
    userIds: string[]
  ): Promise<void> => {
    const template = NotificationTemplates.directMessage(senderName, message);
    await sendServerNotification(
      userIds,
      template.title,
      template.body,
      'direct_message',
      {
        senderName,
        ...template.data,
      }
    );
  }, [sendServerNotification]);

  const sendThreadNotification = useCallback(async (
    userName: string,
    threadTitle: string,
    type: 'reply' | 'like',
    userIds: string[]
  ): Promise<void> => {
    const template = type === 'reply' 
      ? NotificationTemplates.threadReply(userName, threadTitle)
      : NotificationTemplates.threadLike(userName, threadTitle);
    
    await sendServerNotification(
      userIds,
      template.title,
      template.body,
      `thread_${type}`,
      {
        userName,
        threadTitle,
        ...template.data,
      }
    );
  }, [sendServerNotification]);

  const sendRoomInviteNotification = useCallback(async (
    inviterName: string,
    roomName: string,
    userIds: string[]
  ): Promise<void> => {
    const template = NotificationTemplates.roomInvite(inviterName, roomName);
    await sendServerNotification(
      userIds,
      template.title,
      template.body,
      'room_invite',
      {
        inviterName,
        roomName,
        ...template.data,
      }
    );
  }, [sendServerNotification]);

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    subscribe,
    unsubscribe,
    sendNotification,
    sendMessageNotification,
    sendDirectMessageNotification,
    sendThreadNotification,
    sendRoomInviteNotification,
  };
}