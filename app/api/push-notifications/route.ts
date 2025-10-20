import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

// Configure web-push with VAPID keys only if they are properly set
const vapidEmail = process.env.VAPID_EMAIL;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidEmail && vapidPublicKey && vapidPrivateKey && vapidPublicKey.length > 0 && vapidPrivateKey.length > 0) {
  try {
    webpush.setVapidDetails(
      'mailto:' + vapidEmail,
      vapidPublicKey,
      vapidPrivateKey
    );
  } catch (error) {
    console.warn('Failed to set VAPID details:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userIds, 
      roomId, 
      title, 
      message, 
      type = 'message',
      data = {},
      senderName,
      roomName 
    } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'User IDs are required' },
        { status: 400 }
      );
    }

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Get push subscriptions for the specified users
    const supabase = await createClient();
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds);

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { message: 'No active subscriptions found' },
        { status: 200 }
      );
    }

    // Prepare notification payload
    const notificationPayload = {
      title,
      body: message,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: `${type}-${roomId || Date.now()}`,
      data: {
        type,
        roomId,
        roomName,
        senderName,
        timestamp: Date.now(),
        ...data,
      },
      actions: getNotificationActions(type),
      requireInteraction: type === 'direct_message' || type === 'room_invite',
      vibrate: [200, 100, 200],
    };

    // Send notifications to all subscriptions
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key,
          },
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(notificationPayload),
          {
            TTL: 60 * 60 * 24, // 24 hours
            urgency: type === 'direct_message' ? 'high' : 'normal',
          }
        );

        return { success: true, userId: subscription.user_id };
      } catch (error) {
        console.error(`Failed to send notification to user ${subscription.user_id}:`, error);
        
        // Remove invalid subscriptions
        if (error instanceof Error && (
          error.message.includes('410') || 
          error.message.includes('invalid') ||
          error.message.includes('expired')
        )) {
          const supabaseClient = await createClient();
          await supabaseClient
            .from('push_subscriptions')
            .delete()
            .eq('id', subscription.id);
        }

        return { success: false, userId: subscription.user_id, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    const results = await Promise.all(sendPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      message: `Notifications sent: ${successful} successful, ${failed} failed`,
      results,
      total: subscriptions.length,
      successful,
      failed,
    });

  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's push subscription
    const supabase = await createClient();
    const { data: subscription, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching subscription:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasSubscription: !!subscription,
      subscription: subscription || null,
    });

  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete user's push subscription
    const supabase = await createClient();
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting subscription:', error);
      return NextResponse.json(
        { error: 'Failed to delete subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Subscription deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getNotificationActions(type: string) {
  switch (type) {
    case 'message':
      return [
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
      ];
    
    case 'direct_message':
      return [
        {
          action: 'reply',
          title: 'Reply',
          icon: '/icons/reply-icon.png',
        },
      ];
    
    case 'room_invite':
      return [
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
      ];
    
    case 'thread_reply':
    case 'thread_like':
      return [
        {
          action: 'view',
          title: 'View Thread',
          icon: '/icons/thread-icon.png',
        },
      ];
    
    default:
      return [];
  }
}