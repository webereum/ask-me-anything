import { createClient } from './supabase/client';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private vapidPublicKey: string;
  private supabase = createClient();

  constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission;
  }

  async subscribe(userId: string): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        throw new Error('Service worker not registered');
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Check if already subscribed
      let subscription = await this.registration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
        });
      }

      if (subscription) {
        this.subscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
          },
        };

        // Save subscription to database
        await this.saveSubscription(userId, this.subscription);
        return this.subscription;
      }

      return null;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribe(userId: string): Promise<boolean> {
    try {
      if (!this.registration) {
        return false;
      }

      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscription(userId);
        this.subscription = null;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  async isSubscribed(): Promise<boolean> {
    try {
      if (!this.registration) {
        return false;
      }

      const subscription = await this.registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      if (!this.registration) {
        throw new Error('Service worker not registered');
      }

      if (Notification.permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      // Send notification through service worker
      await this.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-72x72.png',
        tag: payload.tag,
        data: payload.data,
        actions: payload.actions,
        requireInteraction: payload.requireInteraction,
        silent: payload.silent,
        vibrate: [200, 100, 200],
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  private async saveSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh_key: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
          created_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to save subscription:', error);
      throw error;
    }
  }

  private async removeSubscription(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to remove subscription:', error);
      throw error;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

// Notification templates for different message types
export const NotificationTemplates = {
  newMessage: (senderName: string, roomName: string, preview: string): NotificationPayload => ({
    title: `${senderName} in ${roomName}`,
    body: preview,
    icon: '/icons/message-icon.png',
    tag: `message-${roomName}`,
    data: {
      type: 'message',
      roomName,
      senderName,
    },
    actions: [
      {
        action: 'reply',
        title: 'Reply',
        icon: '/icons/reply-icon.png',
      },
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view-icon.png',
      },
    ],
  }),

  directMessage: (senderName: string, preview: string): NotificationPayload => ({
    title: `Direct message from ${senderName}`,
    body: preview,
    icon: '/icons/dm-icon.png',
    tag: `dm-${senderName}`,
    data: {
      type: 'direct_message',
      senderName,
    },
    requireInteraction: true,
    actions: [
      {
        action: 'reply',
        title: 'Reply',
        icon: '/icons/reply-icon.png',
      },
    ],
  }),

  threadReply: (userName: string, threadTitle: string): NotificationPayload => ({
    title: `New reply in "${threadTitle}"`,
    body: `${userName} replied to your thread`,
    icon: '/icons/thread-icon.png',
    tag: `thread-${threadTitle}`,
    data: {
      type: 'thread_reply',
      userName,
      threadTitle,
    },
  }),

  threadLike: (userName: string, threadTitle: string): NotificationPayload => ({
    title: `Thread liked`,
    body: `${userName} liked your thread "${threadTitle}"`,
    icon: '/icons/like-icon.png',
    tag: `like-${threadTitle}`,
    data: {
      type: 'thread_like',
      userName,
      threadTitle,
    },
  }),

  roomInvite: (inviterName: string, roomName: string): NotificationPayload => ({
    title: `Room invitation`,
    body: `${inviterName} invited you to join "${roomName}"`,
    icon: '/icons/invite-icon.png',
    tag: `invite-${roomName}`,
    data: {
      type: 'room_invite',
      inviterName,
      roomName,
    },
    requireInteraction: true,
    actions: [
      {
        action: 'accept',
        title: 'Accept',
        icon: '/icons/accept-icon.png',
      },
      {
        action: 'decline',
        title: 'Decline',
        icon: '/icons/decline-icon.png',
      },
    ],
  }),
};

export default PushNotificationService;