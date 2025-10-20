import { Suspense } from 'react';
import { QuestionForm } from '@/components/question-form';
import { Toaster } from 'react-hot-toast';
import { MessageSquare, Sparkles, Shield, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="w-full p-4 md:p-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl font-bold text-white">AskMe</h1>
            </div>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                Dashboard
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-4xl space-y-12">
            <div className="text-center space-y-6 animate-float">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-white/80">Anonymous Questions Platform</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-gradient leading-tight">
                Ask Me Anything
              </h1>

              <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
                Have a question? Ask anonymously and get honest answers. Your identity stays private.
              </p>
            </div>

            <Suspense fallback={
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
              </div>
            }>
              <QuestionForm />
            </Suspense>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
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
                  <LinkIcon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Share Everywhere</h3>
                <p className="text-white/60 text-sm">Share your custom link on Instagram, Twitter, or any platform.</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="w-full p-6 text-center">
          <div className="max-w-7xl mx-auto">
            <div className="glass-morphic rounded-xl p-4 inline-block">
              <p className="text-white/50 text-sm">
                Built with Next.js & Supabase
                <span className="mx-2">•</span>
                Secured & Private
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
