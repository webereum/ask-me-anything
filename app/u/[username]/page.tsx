'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { QuestionForm } from '@/components/question-form';
import { GlassmorphicCard3D } from '@/components/glassmorphic-card-3d';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import toast, { Toaster } from 'react-hot-toast';
import {
  MessageSquare,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Share2,
  Copy,
  ExternalLink,
  Heart,
  Eye,
  Sparkles,
  Shield,
  Link as LinkIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  is_public: boolean;
  total_questions: number;
  answered_questions: number;
}

interface PublicQuestion {
  id: string;
  question_text: string;
  answer_text?: string;
  is_answered: boolean;
  created_at: string;
  answered_at?: string;
}

export default function UserAMAPage() {
  const params = useParams();
  const username = params.username as string;
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [publicQuestions, setPublicQuestions] = useState<PublicQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .eq('is_public', true)
        .single();

      if (profileError || !profile) {
        setNotFound(true);
        return;
      }

      setUserProfile(profile);

      // Fetch public answered questions
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, question_text, answer_text, is_answered, created_at, answered_at')
        .eq('user_id', profile.id)
        .eq('is_answered', true)
        .eq('is_public', true)
        .order('answered_at', { ascending: false })
        .limit(20);

      if (!questionsError && questions) {
        setPublicQuestions(questions);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ask ${userProfile?.display_name} Anything`,
          text: `Ask me anything anonymously!`,
          url: url,
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
          <p className="text-white/70 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="bg-white/5 border-white/20 backdrop-blur-sm max-w-md w-full">
          <CardContent className="text-center py-12">
            <User className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <h2 className="text-white text-xl font-semibold mb-2">User Not Found</h2>
            <p className="text-white/70 mb-6">
              The user @{username} doesn't exist or their profile is private.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen pt-16">
        <div className="flex-1 p-4 md:p-8">
          <div className="w-full max-w-4xl mx-auto space-y-8">
            {/* User Profile Header */}
            <div className="text-center space-y-6 animate-float">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24 border-4 border-white/20">
                  <AvatarImage src={userProfile.avatar_url} />
                  <AvatarFallback className="bg-white/10 text-white text-2xl">
                    {userProfile.display_name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                    {userProfile.display_name}
                  </h1>
                  <p className="text-cyan-400 text-lg">@{userProfile.username}</p>
                  {userProfile.bio && (
                    <p className="text-white/70 max-w-2xl mx-auto">
                      {userProfile.bio}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-6 text-sm text-white/60">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDistanceToNow(new Date(userProfile.created_at))} ago</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{userProfile.total_questions} questions</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>{userProfile.answered_questions} answered</span>
                  </div>
                </div>

                <Button
                  onClick={handleShare}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
              </div>
            </div>

            {/* Question Form */}
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Ask {userProfile.display_name} Anything
                </h2>
                <p className="text-white/70">
                  Your question will be submitted anonymously
                </p>
              </div>
              
              <QuestionForm 
                targetUserId={userProfile.id} 
                targetUsername={userProfile.username}
              />
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-morphic rounded-2xl p-6 text-center space-y-3 transform hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">100% Anonymous</h3>
                <p className="text-white/60 text-sm">Your identity is completely protected. Ask anything without fear.</p>
              </div>

              <div className="glass-morphic rounded-2xl p-6 text-center space-y-3 transform hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Instant Submission</h3>
                <p className="text-white/60 text-sm">Submit your question in seconds and get notified when answered.</p>
              </div>

              <div className="glass-morphic rounded-2xl p-6 text-center space-y-3 transform hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Public Answers</h3>
                <p className="text-white/60 text-sm">See previous answers and learn more about {userProfile.display_name}.</p>
              </div>
            </div>

            {/* Public Q&A Section */}
            {publicQuestions.length > 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Previous Questions & Answers
                  </h2>
                  <p className="text-white/70">
                    Public answers from {userProfile.display_name}
                  </p>
                </div>

                <div className="space-y-4">
                  {publicQuestions.map((qa) => (
                    <GlassmorphicCard3D key={qa.id} className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-3">
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Answered
                              </Badge>
                              <span className="text-white/50 text-sm">
                                {formatDistanceToNow(new Date(qa.answered_at!))} ago
                              </span>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <h4 className="text-white/80 font-medium text-sm mb-1">Question:</h4>
                                <p className="text-white text-lg">{qa.question_text}</p>
                              </div>
                              
                              <div className="bg-white/5 rounded-lg p-4">
                                <h4 className="text-white/80 font-medium text-sm mb-2">Answer:</h4>
                                <p className="text-white">{qa.answer_text}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassmorphicCard3D>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="w-full p-6 text-center">
          <div className="max-w-7xl mx-auto">
            <div className="glass-morphic rounded-xl p-4 inline-block">
              <p className="text-white/50 text-sm">
                Ask Me Anything Platform
                <span className="mx-2">•</span>
                Anonymous & Secure
              </p>
            </div>
          </div>
        </footer>
      </div>

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
          },
        }}
      />
    </main>
  );
}