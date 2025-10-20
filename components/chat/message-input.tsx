'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mediaService, GifSearchResult } from '@/lib/chat/media-service';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Smile, 
  Timer, 
  X,
  Search,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Image from 'next/image';

interface MessageInputProps {
  onSendMessage: (messageData: {
    content?: string;
    messageType?: 'text' | 'image' | 'gif' | 'file';
    mediaUrl?: string;
    mediaMetadata?: any;
    timerDuration?: number;
    replyToId?: string;
  }) => void;
  onTyping: () => void;
  disabled?: boolean;
  roomSettings?: {
    screenshot_blocking?: boolean;
    message_retention?: string;
    max_members?: number;
  };
  replyToMessage?: {
    id: string;
    content?: string;
    sender: { username: string };
  } | null;
  onCancelReply?: () => void;
}

const TIMER_OPTIONS = [
  { label: 'No timer', value: 0 },
  { label: 'View once', value: -1 },
  { label: '1 second', value: 1 },
  { label: '10 seconds', value: 10 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '1 hour', value: 3600 },
];

export function MessageInput({ 
  onSendMessage, 
  onTyping, 
  disabled = false,
  roomSettings,
  replyToMessage,
  onCancelReply
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedTimer, setSelectedTimer] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearchQuery, setGifSearchQuery] = useState('');
  const [gifs, setGifs] = useState<GifSearchResult[]>([]);
  const [isSearchingGifs, setIsSearchingGifs] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, []);

  // Handle typing with debounce
  const handleTyping = useCallback(() => {
    onTyping();
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing indicator after 3 seconds
    }, 3000);
  }, [onTyping]);

  // Handle message change
  const handleMessageChange = (value: string) => {
    setMessage(value);
    adjustTextareaHeight();
    
    if (value.trim()) {
      handleTyping();
    }
  };

  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      try {
        // Use media service validation
        return true; // mediaService will validate in upload
      } catch (error) {
        toast.error(`Invalid file: ${file.name}`);
        return false;
      }
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle file upload and send
  const uploadAndSendFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const uploadResult = await mediaService.uploadFile(file, 'current-user-id');
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Determine message type
      let messageType: 'image' | 'gif' | 'file' = 'file';
      if (mediaService.isImageFile(file)) {
        messageType = file.type === 'image/gif' ? 'gif' : 'image';
      }

      // Send message
      await onSendMessage({
        content: message.trim() || undefined,
        messageType,
        mediaUrl: uploadResult.url,
        mediaMetadata: {
          filename: uploadResult.filename,
          size: uploadResult.size,
          type: uploadResult.type,
          width: uploadResult.width,
          height: uploadResult.height,
        },
        timerDuration: selectedTimer > 0 ? selectedTimer : undefined,
        replyToId: replyToMessage?.id,
      });

      // Reset form
      setMessage('');
      setSelectedTimer(0);
      onCancelReply?.();
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Search GIFs
  const searchGifs = async (query: string) => {
    if (!query.trim()) {
      // Load trending GIFs
      try {
        setIsSearchingGifs(true);
        const trendingGifs = await mediaService.getTrendingGifs(20);
        setGifs(trendingGifs);
      } catch (error) {
        console.error('Error loading trending GIFs:', error);
        toast.error('Failed to load GIFs');
      } finally {
        setIsSearchingGifs(false);
      }
      return;
    }

    try {
      setIsSearchingGifs(true);
      const searchResults = await mediaService.searchGifs(query, 20);
      setGifs(searchResults);
    } catch (error) {
      console.error('Error searching GIFs:', error);
      toast.error('Failed to search GIFs');
    } finally {
      setIsSearchingGifs(false);
    }
  };

  // Handle GIF selection
  const handleGifSelect = async (gif: GifSearchResult) => {
    try {
      await onSendMessage({
        content: message.trim() || undefined,
        messageType: 'gif',
        mediaUrl: gif.url,
        mediaMetadata: {
          filename: `${gif.title}.gif`,
          width: gif.width,
          height: gif.height,
          type: 'image/gif',
        },
        timerDuration: selectedTimer > 0 ? selectedTimer : undefined,
        replyToId: replyToMessage?.id,
      });

      // Reset form
      setMessage('');
      setSelectedTimer(0);
      setShowGifPicker(false);
      onCancelReply?.();
      
    } catch (error) {
      console.error('Error sending GIF:', error);
      toast.error('Failed to send GIF');
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!message.trim() && selectedFiles.length === 0) return;

    try {
      if (selectedFiles.length > 0) {
        // Upload and send files
        for (const file of selectedFiles) {
          await uploadAndSendFile(file);
        }
        setSelectedFiles([]);
      } else {
        // Send text message
        await onSendMessage({
          content: message.trim(),
          messageType: 'text',
          timerDuration: selectedTimer > 0 ? selectedTimer : undefined,
          replyToId: replyToMessage?.id,
        });

        // Reset form
        setMessage('');
        setSelectedTimer(0);
        onCancelReply?.();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = mediaService.handleDrop(e.nativeEvent);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    const files = mediaService.handlePaste(e.nativeEvent);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  return (
    <div className="p-4 space-y-3">
      {/* Reply indicator */}
      {replyToMessage && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <div className="flex-1 text-sm">
            <div className="font-medium">Replying to {replyToMessage.sender.username}</div>
            <div className="text-muted-foreground truncate">
              {replyToMessage.content || 'Media message'}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-2 p-2"
            >
              <span className="text-sm">
                {mediaService.getFileIcon(file.type)} {file.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Uploading... {uploadProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main input area */}
      <div 
        className="flex items-end gap-2"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Attachment button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={disabled}>
              <Paperclip className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Upload Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="h-4 w-4 mr-2" />
              Upload File
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowGifPicker(true)}>
              <Smile className="h-4 w-4 mr-2" />
              Send GIF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onPaste={handlePaste}
            placeholder="Type a message..."
            disabled={disabled}
            className="min-h-[40px] max-h-[120px] resize-none pr-20"
            rows={1}
          />
          
          {/* Timer selector */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            {selectedTimer > 0 && (
              <Badge variant="outline" className="text-xs">
                ⏱️ {selectedTimer === -1 ? 'Once' : `${selectedTimer}s`}
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Timer className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {TIMER_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSelectedTimer(option.value)}
                    className={cn(
                      selectedTimer === option.value && "bg-accent"
                    )}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Send button */}
        <Button 
          onClick={handleSendMessage}
          disabled={disabled || (!message.trim() && selectedFiles.length === 0) || isUploading}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.txt"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* GIF Picker Popover */}
      <Popover open={showGifPicker} onOpenChange={setShowGifPicker}>
        <PopoverTrigger asChild>
          <div />
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <div className="p-3 border-b">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={gifSearchQuery}
                onChange={(e) => {
                  setGifSearchQuery(e.target.value);
                  searchGifs(e.target.value);
                }}
                placeholder="Search GIFs..."
                className="border-0 focus-visible:ring-0"
              />
            </div>
          </div>
          
          <ScrollArea className="h-64">
            {isSearchingGifs ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-2">
                {gifs.map((gif) => (
                  <button
                    key={gif.id}
                    onClick={() => handleGifSelect(gif)}
                    className="relative aspect-square rounded overflow-hidden hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={gif.preview_url}
                      alt={gif.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default MessageInput;