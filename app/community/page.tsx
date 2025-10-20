'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { GlassmorphicCard3D } from '@/components/glassmorphic-card-3d';
import {
  Heart,
  MessageCircle,
  Share2,
  Users,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Clock,
  Star
} from 'lucide-react';

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
    followers: number;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  timestamp: string;
  tags: string[];
  isLiked: boolean;
}

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    author: {
      name: 'Sarah Johnson',
      avatar: '/api/placeholder/40/40',
      verified: true,
      followers: 1250
    },
    content: 'Just launched my new Ask Me Anything session! Excited to connect with the community and share insights about web development and design. What questions do you have? 🚀',
    image: '/api/placeholder/600/300',
    likes: 124,
    comments: 23,
    shares: 8,
    views: 1420,
    timestamp: '2 hours ago',
    tags: ['webdev', 'design', 'ama'],
    isLiked: false
  },
  {
    id: '2',
    author: {
      name: 'Alex Chen',
      avatar: '/api/placeholder/40/40',
      verified: false,
      followers: 890
    },
    content: 'Amazing discussion in today\'s chat room! The community here is so supportive and knowledgeable. Thanks everyone for the great conversations! 💬',
    likes: 89,
    comments: 15,
    shares: 4,
    views: 756,
    timestamp: '4 hours ago',
    tags: ['community', 'chat', 'discussion'],
    isLiked: true
  },
  {
    id: '3',
    author: {
      name: 'Maria Rodriguez',
      avatar: '/api/placeholder/40/40',
      verified: true,
      followers: 2100
    },
    content: 'Pro tip: Use the timer feature in chats for sensitive information. It\'s a game-changer for privacy! 🔒 What other security features would you like to see?',
    likes: 156,
    comments: 31,
    shares: 12,
    views: 2340,
    timestamp: '6 hours ago',
    tags: ['security', 'privacy', 'tips'],
    isLiked: false
  }
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>(mockPosts);
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('trending');

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post: CommunityPost = {
        id: Date.now().toString(),
        author: {
          name: 'You',
          avatar: '/api/placeholder/40/40',
          verified: false,
          followers: 0
        },
        content: newPost,
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        timestamp: 'Just now',
        tags: [],
        isLiked: false
      };
      setPosts([post, ...posts]);
      setNewPost('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
            Community Hub
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Connect, share, and engage with our vibrant community of creators and thinkers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassmorphicCard3D className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white mb-1">12.5K</div>
            <div className="text-white/60 text-sm">Active Members</div>
          </GlassmorphicCard3D>
          
          <GlassmorphicCard3D className="p-6 text-center">
            <MessageCircle className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white mb-1">3.2K</div>
            <div className="text-white/60 text-sm">Posts Today</div>
          </GlassmorphicCard3D>
          
          <GlassmorphicCard3D className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white mb-1">89%</div>
            <div className="text-white/60 text-sm">Engagement Rate</div>
          </GlassmorphicCard3D>
        </div>

        {/* Create Post */}
        <GlassmorphicCard3D className="p-6 mb-8">
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/api/placeholder/40/40" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share something with the community..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                rows={3}
              />
              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                    <Plus className="h-4 w-4 mr-1" />
                    Image
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                    <Star className="h-4 w-4 mr-1" />
                    Poll
                  </Button>
                </div>
                <Button 
                  onClick={handleCreatePost}
                  disabled={!newPost.trim()}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </GlassmorphicCard3D>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            {['trending', 'recent', 'popular'].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className={selectedFilter === filter 
                  ? "bg-gradient-to-r from-purple-500 to-blue-500" 
                  : "text-white/70 hover:text-white"
                }
              >
                <Filter className="h-4 w-4 mr-1" />
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <GlassmorphicCard3D key={post.id} className="p-6">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{post.author.name}</span>
                      {post.author.verified && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-white/60">
                      <span>{post.author.followers} followers</span>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-white/90 leading-relaxed mb-3">{post.content}</p>
                {post.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={post.image} 
                      alt="Post content" 
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="border-white/20 text-white/70 text-xs"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Stats */}
              <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`text-white/70 hover:text-white ${
                      post.isLiked ? 'text-red-400 hover:text-red-300' : ''
                    }`}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                    {post.likes}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {post.comments}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                    <Share2 className="h-4 w-4 mr-1" />
                    {post.shares}
                  </Button>
                </div>
              </div>
            </GlassmorphicCard3D>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
          >
            Load More Posts
          </Button>
        </div>
      </div>
    </div>
  );
}