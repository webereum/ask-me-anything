'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Pause,
  Play,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QueuedMessage {
  id: string;
  content: string;
  type: 'text' | 'image' | 'gif' | 'file';
  timestamp: number;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'retrying';
  retryCount: number;
  metadata?: any;
  timer?: {
    duration: number;
    isViewOnce: boolean;
  };
}

interface FastMessageProcessorProps {
  onSendMessage: (message: Omit<QueuedMessage, 'id' | 'timestamp' | 'status' | 'retryCount'>) => Promise<boolean>;
  maxQueueSize?: number;
  processingDelay?: number;
  maxRetries?: number;
  className?: string;
}

interface ProcessorStats {
  totalProcessed: number;
  successRate: number;
  averageProcessingTime: number;
  queueSize: number;
}

export function FastMessageProcessor({
  onSendMessage,
  maxQueueSize = 50,
  processingDelay = 100,
  maxRetries = 3,
  className
}: FastMessageProcessorProps) {
  const [queue, setQueue] = useState<QueuedMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<ProcessorStats>({
    totalProcessed: 0,
    successRate: 100,
    averageProcessingTime: 0,
    queueSize: 0,
  });

  const processingRef = useRef(false);
  const statsRef = useRef({
    totalAttempts: 0,
    successfulSends: 0,
    processingTimes: [] as number[],
  });

  // Add message to queue
  const addToQueue = useCallback((message: Omit<QueuedMessage, 'id' | 'timestamp' | 'status' | 'retryCount'>) => {
    if (queue.length >= maxQueueSize) {
      console.warn('Message queue is full');
      return false;
    }

    const queuedMessage: QueuedMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    setQueue(prev => [...prev, queuedMessage]);
    return true;
  }, [queue.length, maxQueueSize]);

  // Update message status in queue
  const updateMessageStatus = useCallback((id: string, status: QueuedMessage['status'], incrementRetry = false) => {
    setQueue(prev => prev.map(msg => 
      msg.id === id 
        ? { 
            ...msg, 
            status, 
            retryCount: incrementRetry ? msg.retryCount + 1 : msg.retryCount 
          }
        : msg
    ));
  }, []);

  // Remove message from queue
  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(msg => msg.id !== id));
  }, []);

  // Process single message
  const processMessage = useCallback(async (message: QueuedMessage): Promise<boolean> => {
    const startTime = Date.now();
    
    try {
      updateMessageStatus(message.id, 'sending');
      
      const success = await onSendMessage({
        content: message.content,
        type: message.type,
        metadata: message.metadata,
        timer: message.timer,
      });

      const processingTime = Date.now() - startTime;
      
      // Update stats
      statsRef.current.totalAttempts++;
      statsRef.current.processingTimes.push(processingTime);
      
      if (success) {
        statsRef.current.successfulSends++;
        updateMessageStatus(message.id, 'sent');
        
        // Remove from queue after a short delay
        setTimeout(() => removeFromQueue(message.id), 1000);
        
        return true;
      } else {
        updateMessageStatus(message.id, 'failed', true);
        return false;
      }
    } catch (error) {
      console.error('Message processing error:', error);
      updateMessageStatus(message.id, 'failed', true);
      return false;
    }
  }, [onSendMessage, updateMessageStatus, removeFromQueue]);

  // Main processing loop
  const processQueue = useCallback(async () => {
    if (processingRef.current || isPaused) return;
    
    processingRef.current = true;
    setIsProcessing(true);

    while (queue.length > 0 && !isPaused) {
      const pendingMessages = queue.filter(msg => 
        msg.status === 'pending' || 
        (msg.status === 'failed' && msg.retryCount < maxRetries)
      );

      if (pendingMessages.length === 0) break;

      const message = pendingMessages[0];
      
      if (message.status === 'failed') {
        updateMessageStatus(message.id, 'retrying');
        await new Promise(resolve => setTimeout(resolve, processingDelay * (message.retryCount + 1)));
      }

      const success = await processMessage(message);
      
      if (!success && message.retryCount >= maxRetries) {
        // Mark as permanently failed
        updateMessageStatus(message.id, 'failed');
        setTimeout(() => removeFromQueue(message.id), 5000);
      }

      // Delay between messages
      if (processingDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, processingDelay));
      }
    }

    processingRef.current = false;
    setIsProcessing(false);
  }, [queue, isPaused, maxRetries, processingDelay, processMessage, updateMessageStatus, removeFromQueue]);

  // Update stats
  useEffect(() => {
    const { totalAttempts, successfulSends, processingTimes } = statsRef.current;
    
    const successRate = totalAttempts > 0 ? (successfulSends / totalAttempts) * 100 : 100;
    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length 
      : 0;

    setStats({
      totalProcessed: successfulSends,
      successRate: Math.round(successRate * 100) / 100,
      averageProcessingTime: Math.round(averageProcessingTime),
      queueSize: queue.length,
    });

    // Keep only last 100 processing times for memory efficiency
    if (processingTimes.length > 100) {
      statsRef.current.processingTimes = processingTimes.slice(-100);
    }
  }, [queue]);

  // Auto-start processing when messages are added
  useEffect(() => {
    if (queue.length > 0 && !processingRef.current && !isPaused) {
      processQueue();
    }
  }, [queue.length, processQueue, isPaused]);

  // Clear failed messages
  const clearFailedMessages = useCallback(() => {
    setQueue(prev => prev.filter(msg => msg.status !== 'failed'));
  }, []);

  // Retry all failed messages
  const retryFailedMessages = useCallback(() => {
    setQueue(prev => prev.map(msg => 
      msg.status === 'failed' 
        ? { ...msg, status: 'pending', retryCount: 0 }
        : msg
    ));
  }, []);

  // Get status icon
  const getStatusIcon = (status: QueuedMessage['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'sending':
        return <Zap className="h-3 w-3 text-blue-500 animate-pulse" />;
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'failed':
        return <XCircle className="h-3 w-3 text-red-500" />;
      case 'retrying':
        return <RotateCcw className="h-3 w-3 text-orange-500 animate-spin" />;
      default:
        return <AlertCircle className="h-3 w-3 text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status: QueuedMessage['status']) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-200 bg-yellow-50';
      case 'sending':
        return 'border-blue-200 bg-blue-50';
      case 'sent':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      case 'retrying':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (queue.length === 0 && !isProcessing) {
    return null;
  }

  return (
    <div className={cn("bg-background border rounded-lg p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Fast Message Processor</h3>
          {isProcessing && (
            <Badge variant="secondary" className="animate-pulse">
              Processing...
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            disabled={queue.length === 0}
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4 mr-1" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            )}
          </Button>

          {queue.some(msg => msg.status === 'failed') && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={retryFailedMessages}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Retry Failed
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFailedMessages}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Clear Failed
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats.queueSize}</div>
          <div className="text-xs text-muted-foreground">In Queue</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.totalProcessed}</div>
          <div className="text-xs text-muted-foreground">Processed</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
          <div className="text-xs text-muted-foreground">Success Rate</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.averageProcessingTime}ms</div>
          <div className="text-xs text-muted-foreground">Avg Time</div>
        </div>
      </div>

      {/* Progress bar */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing messages...</span>
            <span>{queue.filter(m => m.status === 'sent').length} / {queue.length}</span>
          </div>
          <Progress 
            value={(queue.filter(m => m.status === 'sent').length / queue.length) * 100} 
            className="h-2"
          />
        </div>
      )}

      {/* Queue items */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {queue.slice(0, 10).map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-center gap-3 p-2 rounded border text-sm",
              getStatusColor(message.status)
            )}
          >
            {getStatusIcon(message.status)}
            
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium">
                {message.type === 'text' ? message.content : `${message.type.toUpperCase()} message`}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(message.timestamp).toLocaleTimeString()}
                {message.retryCount > 0 && ` • Retry ${message.retryCount}`}
              </div>
            </div>

            <Badge variant="outline" className="text-xs">
              {message.status}
            </Badge>
          </div>
        ))}

        {queue.length > 10 && (
          <div className="text-center text-sm text-muted-foreground py-2">
            ... and {queue.length - 10} more messages
          </div>
        )}
      </div>
    </div>
  );
}

export default FastMessageProcessor;