'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Timer, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageTimerProps {
  duration: number; // Timer duration in seconds (-1 for view once)
  expiresAt?: string; // ISO string of expiration time
  isOwnMessage: boolean;
  onExpired?: () => void;
}

export function MessageTimer({ 
  duration, 
  expiresAt, 
  isOwnMessage,
  onExpired 
}: MessageTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt || duration === 0) return;

    const updateTimer = () => {
      const now = Date.now();
      const expiration = new Date(expiresAt).getTime();
      const remaining = Math.max(0, expiration - now);
      
      if (remaining === 0) {
        setIsExpired(true);
        setTimeLeft(0);
        setProgress(0);
        onExpired?.();
        return;
      }

      setTimeLeft(Math.ceil(remaining / 1000));
      
      // Calculate progress (assuming message was created with full duration)
      if (duration > 0) {
        const totalDuration = duration * 1000; // Convert to milliseconds
        const elapsed = totalDuration - remaining;
        const progressPercent = Math.min(100, (elapsed / totalDuration) * 100);
        setProgress(100 - progressPercent);
      }
    };

    // Initial update
    updateTimer();

    // Set up interval for updates
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [duration, expiresAt, onExpired]);

  // Don't show timer for messages without expiration
  if (duration === 0 || !expiresAt) {
    return null;
  }

  // View once messages
  if (duration === -1) {
    return (
      <div className={cn(
        "flex items-center gap-1 mt-1",
        isOwnMessage ? "justify-end" : "justify-start"
      )}>
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs h-5 px-2",
            isExpired && "bg-destructive/10 text-destructive border-destructive/20"
          )}
        >
          <Eye className="h-3 w-3 mr-1" />
          {isExpired ? 'Viewed' : 'View once'}
        </Badge>
      </div>
    );
  }

  // Timed messages
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  return (
    <div className={cn(
      "flex flex-col gap-1 mt-1 min-w-[120px]",
      isOwnMessage ? "items-end" : "items-start"
    )}>
      {/* Timer badge */}
      <Badge 
        variant="outline" 
        className={cn(
          "text-xs h-5 px-2 transition-colors",
          isExpired 
            ? "bg-destructive/10 text-destructive border-destructive/20"
            : timeLeft <= 10 
              ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
        )}
      >
        <Timer className="h-3 w-3 mr-1" />
        {isExpired ? 'Expired' : formatTime(timeLeft)}
      </Badge>

      {/* Progress bar */}
      {!isExpired && duration > 0 && (
        <div className="w-full">
          <Progress 
            value={progress} 
            className={cn(
              "h-1 transition-all duration-1000",
              timeLeft <= 10 && "bg-orange-200 dark:bg-orange-900/40"
            )}
          />
        </div>
      )}

      {/* Warning for low time */}
      {!isExpired && timeLeft <= 10 && timeLeft > 0 && (
        <div className="text-xs text-orange-600 dark:text-orange-400 font-medium animate-pulse">
          Message disappearing soon!
        </div>
      )}
    </div>
  );
}

export default MessageTimer;