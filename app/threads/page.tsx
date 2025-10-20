'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal, Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GlassmorphicCard3D } from '@/components/glassmorphic-card-3d';
import { toast } from 'sonner';
import { useAuth, useUser } from '@clerk/nextjs';
import { useSession } from 'next-auth/react';

interface Thread {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    username: string;
  };
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  tags: string[];
}

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    username: string;
  };
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

export default function ThreadsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [newThread, setNewThread] = useState({ title: '', content: '', tags: '' });
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  
  const { isSignedIn: clerkSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const { data: session } = useSession();
  
  const isAuthenticated = clerkSignedIn || !!session;
  const currentUser = clerkUser || session?.user;

  // Mock data
  useEffect(() => {
    const mockThreads: Thread[] = [
      {
        id: '1',
        title: 'Best practices for React development',
        content: 'What are some essential best practices every React developer should follow? I\'m looking for both beginner and advanced tips.',
        author: {
          name: 'John Doe',
          username: 'johndoe',
          avatar: '/avatars/john.jpg'
        },
        likes: 24,
        comments: 8,
        isLiked: false,
        createdAt: '2024-01-15T10:30:00Z',
        tags: ['react', 'javascript', 'frontend']
      },
      {
        id: '2',
        title: 'Career advice for junior developers',
        content: 'I just graduated and started my first job as a developer. Any advice on how to grow quickly and make a good impression?',
        author: {
          name: 'Sarah Wilson',
          username: 'sarahw',
          avatar: '/avatars/sarah.jpg'
        },
        likes: 18,
        comments: 12,
        isLiked: true,
        createdAt: '2024-01-14T15:45:00Z',
        tags: ['career', 'advice', 'junior']
      },
      {
        id: '3',
        title: 'TypeScript vs JavaScript in 2024',
        content: 'Is it worth learning TypeScript for new projects? What are the main benefits and drawbacks?',
        author: {
          name: 'Mike Chen',
          username: 'mikechen',
          avatar: '/avatars/mike.jpg'
        },
        likes: 31,
        comments: 15,
        isLiked: false,
        createdAt: '2024-01-13T09:20:00Z',
        tags: ['typescript', 'javascript', 'comparison']
      }
    ];
    setThreads(mockThreads);
  }, []);

  const handleCreateThread = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to create a thread');
      return;
    }

    if (!newThread.title.trim() || !newThread.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const thread: Thread = {
      id: Date.now().toString(),
      title: newThread.title,
      content: newThread.content,
      author: {
        name: (currentUser as any)?.name || 'Anonymous',
        username: (currentUser as any)?.username || 'anonymous',
        avatar: (currentUser as any)?.imageUrl || (currentUser as any)?.image
      },
      likes: 0,
      comments: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      tags: newThread.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    setThreads(prev => [thread, ...prev]);
    setNewThread({ title: '', content: '', tags: '' });
    setIsCreateDialogOpen(false);
    toast.success('Thread created successfully!');
  };

  const handleLikeThread = (threadId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like threads');
      return;
    }

    setThreads(prev => prev.map(thread => 
      thread.id === threadId 
        ? { 
            ...thread, 
            isLiked: !thread.isLiked,
            likes: thread.isLiked ? thread.likes - 1 : thread.likes + 1
          }
        : thread
    ));
  };

  const handleAddComment = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: {
        name: (currentUser as any)?.name || 'Anonymous',
        username: (currentUser as any)?.username || 'anonymous',
        avatar: (currentUser as any)?.imageUrl || (currentUser as any)?.image
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
    
    // Update thread comment count
    if (selectedThread) {
      setThreads(prev => prev.map(thread => 
        thread.id === selectedThread.id 
          ? { ...thread, comments: thread.comments + 1 }
          : thread
      ));
    }
    
    toast.success('Comment added!');
  };

  const openCommentsDialog = (thread: Thread) => {
    setSelectedThread(thread);
    // Mock comments for the selected thread
    const mockComments: Comment[] = [
      {
        id: '1',
        content: 'Great question! I\'d love to hear more perspectives on this.',
        author: {
          name: 'Alice Johnson',
          username: 'alicej',
          avatar: '/avatars/alice.jpg'
        },
        createdAt: '2024-01-15T11:00:00Z',
        likes: 3,
        isLiked: false
      }
    ];
    setComments(mockComments);
    setIsCommentsDialogOpen(true);
  };

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         thread.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterTag === 'all' || thread.tags.includes(filterTag);
    return matchesSearch && matchesFilter;
  });

  const allTags = Array.from(new Set(threads.flatMap(thread => thread.tags)));

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Community Threads
          </h1>
          <p className="text-white/70 text-lg mb-6">
            Share knowledge, ask questions, and connect with the community
          </p>
        </div>

        {/* Search and Filters */}
        <GlassmorphicCard3D className="mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <Input
                  placeholder="Search threads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 pl-10"
                />
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Thread
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900/95 border-white/20 text-white">
                  <DialogHeader>
                    <DialogTitle>Create New Thread</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-white/70">Title</label>
                      <Input
                        placeholder="Enter thread title..."
                        value={newThread.title}
                        onChange={(e) => setNewThread(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white/70">Content</label>
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={newThread.content}
                        onChange={(e) => setNewThread(prev => ({ ...prev, content: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-white/70">Tags (comma-separated)</label>
                      <Input
                        placeholder="react, javascript, frontend..."
                        value={newThread.tags}
                        onChange={(e) => setNewThread(prev => ({ ...prev, tags: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <Button 
                      onClick={handleCreateThread}
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                    >
                      Create Thread
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterTag === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTag('all')}
                className={filterTag === 'all' ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}
              >
                All
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={filterTag === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterTag(tag)}
                  className={filterTag === tag ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </GlassmorphicCard3D>

        {/* Threads List */}
        <div className="space-y-4">
          {filteredThreads.map(thread => (
            <GlassmorphicCard3D key={thread.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={thread.author.avatar} />
                      <AvatarFallback>{thread.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{thread.author.name}</p>
                      <p className="text-sm text-white/50">@{thread.author.username}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/50">
                    {new Date(thread.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">{thread.title}</h3>
                <p className="text-white/70 mb-4">{thread.content}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {thread.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-white/10 text-white/80">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikeThread(thread.id)}
                    className={`text-white/70 hover:text-white ${thread.isLiked ? 'text-red-400' : ''}`}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${thread.isLiked ? 'fill-current' : ''}`} />
                    {thread.likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openCommentsDialog(thread)}
                    className="text-white/70 hover:text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {thread.comments}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.info('Share functionality coming soon!')}
                    className="text-white/70 hover:text-white"
                  >
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </GlassmorphicCard3D>
          ))}
        </div>

        {/* Comments Dialog */}
        <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
          <DialogContent className="bg-gray-900/95 border-white/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedThread?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Thread Content */}
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-white/70">{selectedThread?.content}</p>
              </div>

              {/* Comments */}
              <div className="space-y-3">
                {comments.map(comment => (
                  <div key={comment.id} className="flex space-x-3 p-3 bg-white/5 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.author.avatar} />
                      <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-white text-sm">{comment.author.name}</p>
                        <p className="text-xs text-white/50">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-white/70 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="space-y-3">
                <Textarea
                  placeholder={isAuthenticated ? "Add a comment..." : "Please sign in to comment"}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!isAuthenticated}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
                <Button 
                  onClick={handleAddComment}
                  disabled={!isAuthenticated || !newComment.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                >
                  Add Comment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}