'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassmorphicCard3D } from './glassmorphic-card-3d';
import toast from 'react-hot-toast';
import { Send, CheckCircle2, Link } from 'lucide-react';

interface QuestionFormProps {
  targetUserId?: string;
  targetUsername?: string;
}

export function QuestionForm({ targetUserId, targetUsername }: QuestionFormProps) {
  const [question, setQuestion] = useState('');
  const [reelUrl, setReelUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();

  const source = searchParams.get('source') || searchParams.get('ref') || 'direct';
  const from = searchParams.get('from') || searchParams.get('utm_source') || 'unknown';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (question.trim().length < 10) {
      toast.error('Please enter at least 10 characters');
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();

      const trackingData = {
        creator_username: targetUsername,
        question_text: question.trim(),
        reel_url: reelUrl.trim() || null,
        source_identifier: `${source}-${from}`,
        user_agent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        user_id: `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('questions')
        .insert([trackingData]);

      if (error) throw error;

      setIsSuccess(true);
      toast.success('Question submitted successfully!', {
        icon: '🎉',
        style: {
          background: 'rgba(16, 185, 129, 0.9)',
          color: '#fff',
          backdropFilter: 'blur(10px)',
        },
      });

      setTimeout(() => {
        setQuestion('');
        setReelUrl('');
        setIsSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit question. Please try again.', {
        style: {
          background: 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          backdropFilter: 'blur(10px)',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassmorphicCard3D 
      title={targetUsername ? `Ask ${targetUsername} Anything` : "Ask Me Anything"} 
      className="max-w-2xl mx-auto"
    >
      {isSuccess ? (
        <div className="text-center py-12 space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="w-20 h-20 text-green-400 animate-bounce" />
          </div>
          <h3 className="text-2xl font-bold text-white">Question Submitted!</h3>
          <p className="text-white/70">
            Thank you for your question. I'll get back to you soon!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question" className="text-white/90 text-lg font-medium">
              Your Question
            </Label>
            <Textarea
              id="question"
              placeholder={targetUsername ? `Ask ${targetUsername} anything... Your question is completely anonymous! 🎭` : "Ask me anything... Your question is completely anonymous! 🎭"}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isSubmitting}
              className="min-h-[160px] bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400 text-lg resize-none rounded-xl transition-all duration-300"
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-white/60">
                {question.length >= 10 ? (
                  <span className="text-green-400">✓ Ready to submit</span>
                ) : (
                  <span>Minimum 10 characters</span>
                )}
              </p>
              <p className="text-sm text-white/60">
                {question.length}/500
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reelUrl" className="text-white/90 text-lg font-medium flex items-center gap-2">
              <Link className="w-4 h-4" />
              Reel URL (Optional)
            </Label>
            <Input
              id="reelUrl"
              type="url"
              placeholder="https://www.instagram.com/reel/... or https://youtube.com/shorts/..."
              value={reelUrl}
              onChange={(e) => setReelUrl(e.target.value)}
              disabled={isSubmitting}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400 text-lg rounded-xl transition-all duration-300"
            />
            <p className="text-xs text-white/60">
              Share a reel or short video related to your question (Instagram, YouTube Shorts, TikTok, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reelUrl" className="text-white/90 text-lg font-medium flex items-center gap-2">
              <Link className="w-4 h-4" />
              Reel URL (Optional)
            </Label>
            <Input
              id="reelUrl"
              type="url"
              placeholder="https://www.instagram.com/reel/... or https://youtube.com/shorts/..."
              value={reelUrl}
              onChange={(e) => setReelUrl(e.target.value)}
              disabled={isSubmitting}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400 text-lg rounded-xl transition-all duration-300"
            />
            <p className="text-xs text-white/60">
              Share a reel or short video related to your question (Instagram, YouTube Shorts, TikTok, etc.)
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || question.trim().length < 10}
            className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white font-semibold py-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg shadow-lg shadow-cyan-500/30"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                Submit Question
              </div>
            )}
          </Button>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-xs text-white/60 text-center leading-relaxed">
              🔒 Your question is completely anonymous. We only track the source link for analytics.
              <br />
              Your identity remains private and secure.
            </p>
          </div>
        </form>
      )}
    </GlassmorphicCard3D>
  );
}
