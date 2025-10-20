import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { MessageSquare, Sparkles, Shield, Link as LinkIcon, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen pt-16">
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-6xl space-y-16">
            {/* Hero Section */}
            <div className="text-center space-y-8 animate-float">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-white/80">Create Your Story • Connect with Audience</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-gradient leading-tight">
                Share Your Story
              </h1>

              <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                Create personalized story pages where your audience can ask questions and engage with you through live chat. 
                Perfect for creators, influencers, and anyone who wants to connect authentically.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                <Link href="/create-ama">
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    Create Your Story
                    <Sparkles className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                
                <Link href="/chat">
                  <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm">
                    Try Live Chat
                    <MessageSquare className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="glass-morphic rounded-2xl p-8 text-center space-y-4 transform hover:scale-105 transition-all duration-300 border-white/10">
                <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Anonymous Questions</h3>
                <p className="text-white/60">Your audience can ask questions anonymously, encouraging honest and open communication.</p>
              </Card>

              <Card className="glass-morphic rounded-2xl p-8 text-center space-y-4 transform hover:scale-105 transition-all duration-300 border-white/10">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Live Chat</h3>
                <p className="text-white/60">Engage with your audience in real-time through our integrated live chat system.</p>
              </Card>

              <Card className="glass-morphic rounded-2xl p-8 text-center space-y-4 transform hover:scale-105 transition-all duration-300 border-white/10">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                  <LinkIcon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Shareable Links</h3>
                <p className="text-white/60">Get a custom link to share on Instagram, Twitter, TikTok, or any social platform.</p>
              </Card>

              <Card className="glass-morphic rounded-2xl p-8 text-center space-y-4 transform hover:scale-105 transition-all duration-300 border-white/10">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Community Building</h3>
                <p className="text-white/60">Build a stronger connection with your audience through interactive storytelling.</p>
              </Card>

              <Card className="glass-morphic rounded-2xl p-8 text-center space-y-4 transform hover:scale-105 transition-all duration-300 border-white/10">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Instant Setup</h3>
                <p className="text-white/60">Create your story page in minutes and start connecting with your audience immediately.</p>
              </Card>

              <Card className="glass-morphic rounded-2xl p-8 text-center space-y-4 transform hover:scale-105 transition-all duration-300 border-white/10">
                <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Rich Media</h3>
                <p className="text-white/60">Share images, GIFs, and rich content to make your stories more engaging.</p>
              </Card>
            </div>

            {/* Call to Action */}
            <div className="text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ready to Connect with Your Audience?
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Join thousands of creators who are already using our platform to build meaningful connections.
              </p>
              <Link href="/create-ama">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <footer className="w-full p-6 text-center">
          <div className="max-w-7xl mx-auto">
            <div className="glass-morphic rounded-xl p-4 inline-block">
              <p className="text-white/50 text-sm">
                Built with Next.js & Stream Chat
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
