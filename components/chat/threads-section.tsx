'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Heart, 
  Send, 
  Search, 
  Filter,
  Plus,
  MoreVertical,
  Pin,
  Flag,
  Edit,
  Trash2,
  Reply,
  TrendingUp,
  Clock,
  Users,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface Thread {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  tags: string[];
  room_id: string;
}

export interface ThreadComment {
  id: string;
  thread_id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
  likes_count: number;
  parent_id?: string;
  replies?: ThreadComment[];
}

interface ThreadsSectionProps {
  roomId: string;
  currentUserId?: string;
  onCreateThread?: (thread: Omit<Thread, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'views_count'>) => Promise<Thread>;
  onLikeThread?: (threadId: string) => Promise<void>;
  onCommentThread?: (threadId: string, content: string, parentId?: string) => Promise<ThreadComment>;
  onDeleteThread?: (threadId: string) => Promise<void>;
  onEditThread?: (threadId: string, updates: Partial<Thread>) => Promise<void>;
  className?: string;
}

interface CreateThreadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (thread: { title: string; content: string; tags: string[] }) => void;
}

function CreateThreadDialog({ isOpen, onClose, onSubmit }: CreateThreadDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    
    onSubmit({ title: title.trim(), content: content.trim(), tags });
    
    // Reset form
    setTitle('');
    setContent('');
    setTags([]);
    setTagInput('');
    onClose();
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Thread</DialogTitle>
          <DialogDescription>
            Start a new discussion topic in this room
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter thread title..."
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to discuss?"
              rows={6}
              maxLength={2000}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tags (optional)</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                maxLength={20}
              />
              <Button onClick={addTag} disabled={!tagInput.trim() || tags.length >= 5}>
                Add
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    #{tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim()}>
            Create Thread
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ThreadItemProps {
  thread: Thread;
  currentUserId?: string;
  onLike: (threadId: string) => void;
  onComment: (threadId: string) => void;
  onEdit?: (threadId: string) => void;
  onDelete?: (threadId: string) => void;
  onPin?: (threadId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function ThreadItem({ 
  thread, 
  currentUserId, 
  onLike, 
  onComment, 
  onEdit, 
  onDelete, 
  onPin,
  isExpanded,
  onToggleExpand
}: ThreadItemProps) {
  const isAuthor = currentUserId === thread.author.id;

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src={thread.author.avatar_url} />
            <AvatarFallback>
              {thread.author.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{thread.title}</h3>
              {thread.is_pinned && (
                <Pin className="h-4 w-4 text-primary" />
              )}
              {thread.is_locked && (
                <Badge variant="secondary" className="text-xs">Locked</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{thread.author.username}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isAuthor && (
              <>
                <DropdownMenuItem onClick={() => onEdit?.(thread.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Thread
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPin?.(thread.id)}>
                  <Pin className="h-4 w-4 mr-2" />
                  {thread.is_pinned ? 'Unpin' : 'Pin'} Thread
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete?.(thread.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Thread
                </DropdownMenuItem>
              </>
            )}
            
            {!isAuthor && (
              <DropdownMenuItem>
                <Flag className="h-4 w-4 mr-2" />
                Report Thread
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags */}
      {thread.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {thread.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Content preview */}
      <div className="text-sm text-muted-foreground">
        {isExpanded ? (
          <div className="whitespace-pre-wrap">{thread.content}</div>
        ) : (
          <div className="line-clamp-2">{thread.content}</div>
        )}
      </div>

      {/* Stats and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{thread.likes_count}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{thread.comments_count}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{thread.views_count}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(thread.id)}
            className="h-8 px-3"
          >
            <Heart className="h-4 w-4 mr-1" />
            Like
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment(thread.id)}
            className="h-8 px-3"
          >
            <Reply className="h-4 w-4 mr-1" />
            Reply
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="h-8 px-3"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ThreadsSection({
  roomId,
  currentUserId,
  onCreateThread,
  onLikeThread,
  onCommentThread,
  onDeleteThread,
  onEditThread,
  className
}: ThreadsSectionProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockThreads: Thread[] = [
      {
        id: '1',
        title: 'Welcome to the chat room!',
        content: 'This is our first discussion thread. Feel free to introduce yourself and share what brings you here. We\'re excited to have you as part of our community!',
        author: {
          id: 'user1',
          username: 'moderator',
          avatar_url: undefined,
        },
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        likes_count: 12,
        comments_count: 8,
        views_count: 45,
        is_pinned: true,
        is_locked: false,
        tags: ['welcome', 'introduction'],
        room_id: roomId,
      },
      {
        id: '2',
        title: 'Best practices for secure messaging',
        content: 'Let\'s discuss the security features available in this chat platform and how to use them effectively.',
        author: {
          id: 'user2',
          username: 'security_expert',
          avatar_url: undefined,
        },
        created_at: new Date(Date.now() - 43200000).toISOString(),
        updated_at: new Date(Date.now() - 43200000).toISOString(),
        likes_count: 7,
        comments_count: 15,
        views_count: 32,
        is_pinned: false,
        is_locked: false,
        tags: ['security', 'tips'],
        room_id: roomId,
      },
    ];

    setThreads(mockThreads);
  }, [roomId]);

  // Filter and sort threads
  const filteredThreads = threads
    .filter(thread => 
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.likes_count - a.likes_count;
        case 'trending':
          return (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count);
        case 'recent':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  // Separate pinned threads
  const pinnedThreads = filteredThreads.filter(t => t.is_pinned);
  const regularThreads = filteredThreads.filter(t => !t.is_pinned);

  const handleCreateThread = async (threadData: { title: string; content: string; tags: string[] }) => {
    if (!onCreateThread) return;

    setIsLoading(true);
    try {
      const newThread = await onCreateThread({
        ...threadData,
        author: {
          id: currentUserId || 'anonymous',
          username: 'You',
        },
        is_pinned: false,
        is_locked: false,
        room_id: roomId,
      });
      
      setThreads(prev => [newThread, ...prev]);
    } catch (error) {
      console.error('Failed to create thread:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeThread = async (threadId: string) => {
    if (!onLikeThread) return;

    try {
      await onLikeThread(threadId);
      setThreads(prev => prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, likes_count: thread.likes_count + 1 }
          : thread
      ));
    } catch (error) {
      console.error('Failed to like thread:', error);
    }
  };

  const toggleThreadExpansion = (threadId: string) => {
    setExpandedThreads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(threadId)) {
        newSet.delete(threadId);
      } else {
        newSet.add(threadId);
      }
      return newSet;
    });
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Discussion Threads</h2>
          <Badge variant="secondary">{threads.length}</Badge>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New Thread
        </Button>
      </div>

      {/* Search and filters */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search threads..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            {[
              { key: 'recent', label: 'Recent', icon: Clock },
              { key: 'popular', label: 'Popular', icon: Heart },
              { key: 'trending', label: 'Trending', icon: TrendingUp },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={sortBy === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy(key as any)}
              >
                <Icon className="h-4 w-4 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Threads list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Pinned threads */}
          {pinnedThreads.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Pin className="h-4 w-4" />
                Pinned Threads
              </div>
              
              {pinnedThreads.map((thread) => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  currentUserId={currentUserId}
                  onLike={handleLikeThread}
                  onComment={() => {}}
                  isExpanded={expandedThreads.has(thread.id)}
                  onToggleExpand={() => toggleThreadExpansion(thread.id)}
                />
              ))}
              
              {regularThreads.length > 0 && <Separator />}
            </div>
          )}

          {/* Regular threads */}
          {regularThreads.length > 0 ? (
            <div className="space-y-3">
              {regularThreads.map((thread) => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  currentUserId={currentUserId}
                  onLike={handleLikeThread}
                  onComment={() => {}}
                  isExpanded={expandedThreads.has(thread.id)}
                  onToggleExpand={() => toggleThreadExpansion(thread.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2" />
              <p>No threads found</p>
              {searchQuery && (
                <p className="text-sm mt-1">Try a different search term</p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Create thread dialog */}
      <CreateThreadDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateThread}
      />
    </div>
  );
}

export default ThreadsSection;