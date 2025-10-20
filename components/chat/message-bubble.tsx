'use client';

import React, { useState } from 'react';
import { ChatMessage } from '@/lib/chat/chat-service';
import { mediaService } from '@/lib/chat/media-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);

  const bubbleClasses = cn(
    "relative max-w-sm rounded-lg px-3 py-2 break-words",
    isOwnMessage
      ? "bg-primary text-primary-foreground ml-auto"
      : "bg-muted text-foreground",
    message.message_type !== 'text' && "p-1"
  );

  const renderTextMessage = () => (
    <div className="whitespace-pre-wrap">
      {message.content}
    </div>
  );

  const renderImageMessage = () => (
    <div className="relative">
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
      
      {imageError ? (
        <div className="flex items-center justify-center h-32 bg-muted rounded text-muted-foreground">
          <div className="text-center">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="text-sm">Image failed to load</div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <Image
            src={message.media_url!}
            alt="Shared image"
            width={message.media_metadata?.width || 300}
            height={message.media_metadata?.height || 200}
            className="rounded max-w-sm max-h-64 object-cover"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
          
          {/* Download button */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => {
              const link = document.createElement('a');
              link.href = message.media_url!;
              link.download = message.media_metadata?.filename || 'image';
              link.click();
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Caption */}
      {message.content && (
        <div className="mt-2 px-2 pb-1 text-sm">
          {message.content}
        </div>
      )}
    </div>
  );

  const renderGifMessage = () => (
    <div className="relative">
      <Image
        src={message.media_url!}
        alt="GIF"
        width={message.media_metadata?.width || 300}
        height={message.media_metadata?.height || 200}
        className="rounded max-w-sm max-h-64 object-cover"
        unoptimized // Important for GIFs
      />
      
      {/* GIF badge */}
      <Badge 
        variant="secondary" 
        className="absolute top-2 left-2 text-xs"
      >
        GIF
      </Badge>

      {/* Caption */}
      {message.content && (
        <div className="mt-2 px-2 pb-1 text-sm">
          {message.content}
        </div>
      )}
    </div>
  );

  const renderVideoMessage = () => (
    <div className="relative">
      <video
        src={message.media_url!}
        className="rounded max-w-sm max-h-64 object-cover"
        controls={false}
        muted={videoMuted}
        loop
        playsInline
        onPlay={() => setVideoPlaying(true)}
        onPause={() => setVideoPlaying(false)}
      />
      
      {/* Video controls overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded opacity-0 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const video = document.querySelector('video') as HTMLVideoElement;
              if (videoPlaying) {
                video?.pause();
              } else {
                video?.play();
              }
            }}
          >
            {videoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setVideoMuted(!videoMuted)}
          >
            {videoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Caption */}
      {message.content && (
        <div className="mt-2 px-2 pb-1 text-sm">
          {message.content}
        </div>
      )}
    </div>
  );

  const renderFileMessage = () => (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded border min-w-[200px]">
      {/* File icon */}
      <div className="text-2xl">
        {mediaService.getFileIcon(message.media_metadata?.type || '')}
      </div>
      
      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {message.media_metadata?.filename || 'Unknown file'}
        </div>
        <div className="text-sm text-muted-foreground">
          {message.media_metadata?.size 
            ? mediaService.formatFileSize(message.media_metadata.size)
            : 'Unknown size'
          }
        </div>
      </div>
      
      {/* Download button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const link = document.createElement('a');
          link.href = message.media_url!;
          link.download = message.media_metadata?.filename || 'file';
          link.click();
        }}
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'image':
        return renderImageMessage();
      case 'gif':
        return renderGifMessage();
      case 'file':
        return renderFileMessage();
      case 'text':
      default:
        return renderTextMessage();
    }
  };

  return (
    <div className={bubbleClasses}>
      {renderMessageContent()}
      
      {/* Message status indicators */}
      <div className={cn(
        "flex items-center justify-end gap-1 mt-1",
        message.message_type !== 'text' && "absolute bottom-1 right-1 bg-black/50 rounded px-1"
      )}>
        {/* Timer indicator */}
        {message.timer_duration && (
          <Badge variant="outline" className="text-xs h-4">
            ⏱️ {message.timer_duration}s
          </Badge>
        )}
        
        {/* Timestamp */}
        <span className={cn(
          "text-xs opacity-70",
          message.message_type !== 'text' && "text-white"
        )}>
          {new Date(message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
        
        {/* Read status (for own messages) */}
        {isOwnMessage && (
          <span className={cn(
            "text-xs opacity-70",
            message.message_type !== 'text' && "text-white"
          )}>
            {message.views && message.views.length > 0 ? '✓✓' : '✓'}
          </span>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;