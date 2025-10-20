'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassmorphicCard3D } from '@/components/glassmorphic-card-3d';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import toast, { Toaster } from 'react-hot-toast';
import {
  MessageSquare,
  Clock,
  MapPin,
  Monitor,
  ExternalLink,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Question {
  id: string;
  question_text: string;
  source_identifier: string;
  ip_address: string;
  user_agent: string;
  referrer: string;
  created_at: string;
  is_answered: boolean;
  answer_text: string | null;
  answered_at: string | null;
}

export default function DashboardPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  const fetchQuestions = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();

    const supabase = createClient();
    const channel = supabase
      .channel('questions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
        },
        () => {
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAnswer = async (questionId: string) => {
    if (!answerText.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('questions')
        .update({
          is_answered: true,
          answer_text: answerText,
          answered_at: new Date().toISOString(),
        })
        .eq('id', questionId);

      if (error) throw error;

      toast.success('Answer saved successfully!');
      setAnsweringId(null);
      setAnswerText('');
      fetchQuestions();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save answer');
    }
  };

  const stats = {
    total: questions.length,
    answered: questions.filter(q => q.is_answered).length,
    unanswered: questions.filter(q => !q.is_answered).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
          <p className="text-white/70 text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Toaster position="bottom-center" />

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-white/70 text-lg">Manage and answer your questions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassmorphicCard3D>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/70">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-medium">Total Questions</span>
              </div>
              <p className="text-4xl font-bold text-white">{stats.total}</p>
            </div>
          </GlassmorphicCard3D>

          <GlassmorphicCard3D>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Answered</span>
              </div>
              <p className="text-4xl font-bold text-white">{stats.answered}</p>
            </div>
          </GlassmorphicCard3D>

          <GlassmorphicCard3D>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-yellow-400">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <p className="text-4xl font-bold text-white">{stats.unanswered}</p>
            </div>
          </GlassmorphicCard3D>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Recent Questions</h2>
          <Button
            onClick={fetchQuestions}
            variant="outline"
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="space-y-6">
          {questions.length === 0 ? (
            <GlassmorphicCard3D>
              <div className="text-center py-12 space-y-4">
                <MessageSquare className="w-16 h-16 text-white/30 mx-auto" />
                <h3 className="text-xl font-semibold text-white">No questions yet</h3>
                <p className="text-white/60">Questions will appear here when users submit them</p>
              </div>
            </GlassmorphicCard3D>
          ) : (
            questions.map((question) => (
              <GlassmorphicCard3D key={question.id}>
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={question.is_answered ? "default" : "secondary"}
                          className={question.is_answered
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                          }
                        >
                          {question.is_answered ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Answered</>
                          ) : (
                            <><Clock className="w-3 h-3 mr-1" /> Pending</>
                          )}
                        </Badge>
                        <Badge variant="outline" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {question.source_identifier}
                        </Badge>
                      </div>

                      <p className="text-white text-lg leading-relaxed">
                        {question.question_text}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-white/50">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                        </div>
                        {question.referrer && question.referrer !== 'direct' && (
                          <div className="flex items-center gap-1">
                            <ExternalLink className="w-4 h-4" />
                            {new URL(question.referrer).hostname}
                          </div>
                        )}
                        {question.user_agent && (
                          <div className="flex items-center gap-1">
                            <Monitor className="w-4 h-4" />
                            {question.user_agent.includes('Mobile') ? 'Mobile' : 'Desktop'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {question.is_answered && question.answer_text && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-300 mb-2">Your Answer:</p>
                      <p className="text-white/90">{question.answer_text}</p>
                    </div>
                  )}

                  {!question.is_answered && (
                    <div className="space-y-3">
                      {answeringId === question.id ? (
                        <>
                          <Textarea
                            placeholder="Type your answer..."
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50"
                            rows={4}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAnswer(question.id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Save Answer
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setAnsweringId(null);
                                setAnswerText('');
                              }}
                              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <Button
                          onClick={() => setAnsweringId(question.id)}
                          variant="outline"
                          className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                        >
                          Answer Question
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </GlassmorphicCard3D>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
