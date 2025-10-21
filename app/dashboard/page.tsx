'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth, SignOutButton, useUser } from '@clerk/nextjs';
import { useAuth as useAppAuth } from '@/lib/auth/auth-context';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Toaster } from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  MessageSquare,
  Users, 
  TrendingUp, 
  Clock, 
  Settings, 
  Plus,
  BarChart3,
  Eye,
  Heart,
  Share2,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Download,
  Filter,
  Search,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  LogOut,
  RefreshCw,
  MapPin,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Question {
  id: string;
  content: string;
  created_at: string;
  is_answered: boolean;
  answer?: string;
  answered_at?: string;
  creator_profile_id: string;
  likes_count: number;
  views_count: number;
  is_anonymous: boolean;
  tags: string[];
  status: 'pending' | 'answered' | 'archived';
}

interface CreatorProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  social_links: Record<string, string>;
  is_verified: boolean;
  created_at: string;
  total_questions: number;
  answered_questions: number;
  total_views: number;
  total_likes: number;
}

export default function DashboardPage() {
  const { isSignedIn, userId } = useAuth();
  const { user: clerkUser } = useUser();
  const { user, isAuthenticated } = useAppAuth();
  const router = useRouter();

  // Define currentUserId and currentUser
  const currentUserId = userId;
  const currentUser = clerkUser;

  // State variables
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState({
    totalQuestions: 0,
    answeredQuestions: 0,
    pendingQuestions: 0,
    totalViews: 0,
    thisWeekQuestions: 0,
    responseRate: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    answered: 0,
    pending: 0,
    thisWeek: 0,
    responseRate: 0
  });

  const fetchQuestions = async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching questions:', error);
        toast.error('Failed to fetch questions');
        return;
      }

      const formattedQuestions: Question[] = data.map(q => ({
        id: q.id,
        question: q.question_text,
        answer: q.answer_text,
        status: q.is_answered ? 'answered' : 'pending',
        created_at: q.created_at,
        source: q.source_identifier,
        referrer: q.referrer,
        user_agent: q.user_agent,
        user_id: q.user_id
      }));

      setQuestions(formattedQuestions);
      calculateStats(formattedQuestions);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (questions: Question[]) => {
    const total = questions.length;
    const answered = questions.filter(q => q.status === 'answered').length;
    const pending = total - answered;
    const responseRate = total > 0 ? Math.round((answered / total) * 100) : 0;
    
    // Calculate this week's questions
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = questions.filter(q => new Date(q.created_at) > oneWeekAgo).length;
    
    setUserStats({
      totalQuestions: total,
      answeredQuestions: answered,
      pendingQuestions: pending,
      totalViews: total * 3, // Simulated view count
      thisWeekQuestions: thisWeek,
      responseRate
    });
  };

  useEffect(() => {
    if (currentUserId) {
      fetchQuestions();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!isAuthenticated || !currentUserId) {
      router.push('/login');
      return;
    }

    fetchQuestions();

    // Set up real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel('questions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: `user_id=eq.${currentUserId}`
        },
        () => {
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId]);

  const handleAnswer = async (questionId: string) => {
    const answerText = answers[questionId];
    if (!answerText?.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('questions')
        .update({
          answer_text: answerText,
          is_answered: true,
          answered_at: new Date().toISOString()
        })
        .eq('id', questionId)
        .eq('user_id', currentUserId);

      if (error) {
        console.error('Error saving answer:', error);
        toast.error('Failed to save answer');
        return;
      }

      toast.success('Answer saved successfully!');
      setAnswers(prev => ({ ...prev, [questionId]: '' }));
      fetchQuestions();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save answer');
    }
  };

  // Show loading or redirect if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, trend, trendValue }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: 'up' | 'down';
    trendValue?: string;
  }) => (
    <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-medium">{title}</p>
            <p className="text-white text-2xl font-bold">{value}</p>
            {trend && trendValue && (
              <div className={`flex items-center mt-1 text-sm ${
                trend === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${trend === 'down' ? 'rotate-180' : ''}`} />
                {trendValue}
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 text-white/50" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={(currentUser as any)?.image || (currentUser as any)?.imageUrl} />
              <AvatarFallback className="bg-white/10 text-white">
                {(currentUser as any)?.name?.[0] || (currentUser as any)?.firstName?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {(currentUser as any)?.name || (currentUser as any)?.firstName || 'User'}!
              </h1>
              <p className="text-white/70">Manage your Ask Me Anything dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => router.push('/chat')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <SignOutButton>
              <Button
                variant="outline"
                className="bg-white/5 hover:bg-white/10 text-white border-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20 text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-white/20 text-white">
              <MessageSquare className="h-4 w-4 mr-2" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/20 text-white">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Questions"
                value={userStats.totalQuestions}
                icon={MessageSquare}
                trend="up"
                trendValue={`+${userStats.thisWeekQuestions} this week`}
              />
              <StatCard
                title="Answered"
                value={userStats.answeredQuestions}
                icon={CheckCircle}
                trend="up"
                trendValue={`${userStats.responseRate}% response rate`}
              />
              <StatCard
                title="Pending"
                value={userStats.pendingQuestions}
                icon={Clock}
              />
              <StatCard
                title="Total Views"
                value={userStats.totalViews}
                icon={Eye}
                trend="up"
                trendValue="+12% this month"
              />
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Recent Questions
                </CardTitle>
                <CardDescription className="text-white/70">
                  Your latest questions and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-white/50" />
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70">No questions yet</p>
                    <p className="text-white/50 text-sm">Share your Ask Me Anything link to start receiving questions!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.slice(0, 5).map((question) => (
                      <div key={question.id} className="flex items-start space-x-4 p-4 bg-white/5 rounded-lg">
                        <div className="flex-shrink-0">
                          {question.status === 'answered' ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {question.question}
                          </p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-white/50">
                            <span>{formatDistanceToNow(new Date(question.created_at))} ago</span>
                            <span>from {question.source}</span>
                          </div>
                        </div>
                        <Badge variant={question.status === 'answered' ? 'default' : 'secondary'}>
                          {question.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">All Questions</h2>
              <Button
                onClick={fetchQuestions}
                disabled={loading}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-white/50" />
              </div>
            ) : questions.length === 0 ? (
              <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">No questions yet</h3>
                  <p className="text-white/70 mb-6">Share your Ask Me Anything link to start receiving questions!</p>
                  <Button
                    onClick={() => router.push('/create-ama')}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create AMA Link
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <GlassmorphicCard3D key={question.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={question.status === 'answered' ? 'default' : 'secondary'}>
                              {question.status === 'answered' ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {question.status}
                            </Badge>
                            <span className="text-white/50 text-sm">
                              {formatDistanceToNow(new Date(question.created_at))} ago
                            </span>
                          </div>
                          <h3 className="text-white font-medium text-lg mb-2">
                            {question.question}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-white/50">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {question.source}
                            </div>
                            {question.referrer && (
                              <div className="flex items-center">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                {new URL(question.referrer).hostname}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {question.status === 'answered' && question.answer ? (
                        <div className="bg-white/5 rounded-lg p-4">
                          <h4 className="text-white/80 font-medium mb-2">Your Answer:</h4>
                          <p className="text-white">{question.answer}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Type your answer..."
                            value={answers[question.id] || ''}
                            onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            rows={4}
                          />
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleAnswer(question.id)}
                              disabled={!answers[question.id]?.trim()}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Save Answer
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setAnswers(prev => ({ ...prev, [question.id]: '' }))}
                              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                            >
                              Clear
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassmorphicCard3D>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Settings
                </CardTitle>
                <CardDescription className="text-white/70">
                  Manage your account and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={(currentUser as any)?.image || (currentUser as any)?.imageUrl} />
                    <AvatarFallback className="bg-white/10 text-white text-xl">
                      {(currentUser as any)?.name?.[0] || (currentUser as any)?.firstName?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-white font-medium">
                      {(currentUser as any)?.name || `${(currentUser as any)?.firstName} ${(currentUser as any)?.lastName}` || 'User'}
                    </h3>
                    <p className="text-white/70">{(currentUser as any)?.email}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/20">
                  <h4 className="text-white font-medium mb-4">Quick Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => router.push('/')}
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20 justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New AMA
                    </Button>
                    <Button
                      onClick={() => router.push('/chat')}
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20 justify-start"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Join Chat
                    </Button>
                    <Button
                      onClick={() => router.push('/threads')}
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20 justify-start"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Community Threads
                    </Button>
                    <SignOutButton>
                      <Button
                        variant="outline"
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 justify-start"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </SignOutButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
