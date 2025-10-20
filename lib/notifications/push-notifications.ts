// Push notification service for chat messages

export interface NotificationOptions {
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
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.permission = Notification.permission;
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Initialize the push notification service
   */
  public async initialize(): Promise<boolean> {
    try {
      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service workers are not supported');
        return false;
      }

      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('Notifications are not supported');
        return false;
      }

      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered successfully');

      // Request notification permission
      await this.requestPermission();

      return this.permission === 'granted';
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Request notification permission from user
   */
  public async requestPermission(): Promise<NotificationPermission> {
    try {
      if (this.permission === 'default') {
        this.permission = await Notification.requestPermission();
      }
      return this.permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Check if notifications are enabled
   */
  public isEnabled(): boolean {
    return this.permission === 'granted';
  }

  /**
   * Show a notification
   */
  public async showNotification(options: NotificationOptions): Promise<void> {
    try {
      if (!this.isEnabled()) {
        console.warn('Notifications are not enabled');
        return;
      }

      if (!this.registration) {
        console.warn('Service worker not registered');
        return;
      }

      const notificationOptions: NotificationOptions = {
        icon: '/icons/chat-icon-192.png',
        badge: '/icons/chat-badge-72.png',
        requireInteraction: false,
        silent: false,
        ...options,
      };

      await this.registration.showNotification(options.title, notificationOptions);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  /**
   * Show notification for new chat message
   */
  public async notifyNewMessage(
    senderName: string, 
    message: string, 
    chatId?: string
  ): Promise<void> {
    const options: NotificationOptions = {
      title: `New message from ${senderName}`,
      body: message.length > 100 ? `${message.substring(0, 100)}...` : message,
      tag: `chat-message-${chatId || 'general'}`,
      data: {
        type: 'chat-message',
        sender: senderName,
        chatId: chatId,
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'reply',
          title: 'Reply',
          icon: '/icons/reply-icon.png'
        },
        {
          action: 'view',
          title: 'View Chat',
          icon: '/icons/view-icon.png'
        }
      ],
      requireInteraction: true,
    };

    await this.showNotification(options);
  }

  /**
   * Show notification for user joining chat
   */
  public async notifyUserJoined(username: string): Promise<void> {
    const options: NotificationOptions = {
      title: 'User Joined Chat',
      body: `${username} joined the conversation`,
      tag: 'user-joined',
      data: {
        type: 'user-joined',
        username: username,
        timestamp: Date.now(),
      },
      silent: true,
      requireInteraction: false,
    };

    await this.showNotification(options);
  }

  /**
   * Show notification for typing indicator
   */
  public async notifyUserTyping(username: string): Promise<void> {
    const options: NotificationOptions = {
      title: 'Someone is typing...',
      body: `${username} is typing a message`,
      tag: 'user-typing',
      data: {
        type: 'user-typing',
        username: username,
        timestamp: Date.now(),
      },
      silent: true,
      requireInteraction: false,
    };

    await this.showNotification(options);
  }

  /**
   * Clear all notifications with a specific tag
   */
  public async clearNotifications(tag?: string): Promise<void> {
    try {
      if (!this.registration) return;

      const notifications = await this.registration.getNotifications({ tag });
      notifications.forEach(notification => notification.close());
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  /**
   * Get notification settings from localStorage
   */
  public getSettings(): NotificationSettings {
    const defaultSettings: NotificationSettings = {
      enabled: false,
      newMessages: true,
      userJoined: false,
      userTyping: false,
      sound: true,
      vibrate: true,
    };

    try {
      const stored = localStorage.getItem('chat-notification-settings');
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  /**
   * Save notification settings to localStorage
   */
  public saveSettings(settings: Partial<NotificationSettings>): void {
    try {
      const currentSettings = this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      localStorage.setItem('chat-notification-settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  /**
   * Check if specific notification type is enabled
   */
  public isNotificationTypeEnabled(type: keyof NotificationSettings): boolean {
    const settings = this.getSettings();
    return settings.enabled && settings[type] === true;
  }
}

export interface NotificationSettings {
  enabled: boolean;
  newMessages: boolean;
  userJoined: boolean;
  userTyping: boolean;
  sound: boolean;
  vibrate: boolean;
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();

// Utility functions for easy access
export const initializeNotifications = () => pushNotificationService.initialize();
export const requestNotificationPermission = () => pushNotificationService.requestPermission();
export const notifyNewMessage = (sender: string, message: string, chatId?: string) => 
  pushNotificationService.notifyNewMessage(sender, message, chatId);
export const notifyUserJoined = (username: string) => 
  pushNotificationService.notifyUserJoined(username);
export const clearChatNotifications = (tag?: string) => 
  pushNotificationService.clearNotifications(tag);