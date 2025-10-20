'use client';

import { MessageSquare, Users, Shield, Zap, Heart, Star } from 'lucide-react';
import { GlassmorphicCard3D } from '@/components/glassmorphic-card-3d';
import { Badge } from '@/components/ui/badge';

export default function AboutPage() {
  const features = [
    {
      icon: MessageSquare,
      title: 'Ask Me Anything',
      description: 'Submit questions anonymously and get thoughtful answers from our community.',
    },
    {
      icon: Users,
      title: 'Live Chat',
      description: 'Connect with others in real-time through our interactive chat platform.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your privacy matters. We protect your data and respect your anonymity.',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Get instant notifications and updates as conversations happen.',
    },
  ];

  const stats = [
    { label: 'Questions Answered', value: '1,000+' },
    { label: 'Active Users', value: '500+' },
    { label: 'Chat Messages', value: '10,000+' },
    { label: 'Community Rating', value: '4.9/5' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 pt-20">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            About Our Platform
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            We're building a community where curiosity meets connection. Ask questions, share knowledge, 
            and engage in meaningful conversations with people from around the world.
          </p>
        </div>

        {/* Mission Statement */}
        <GlassmorphicCard3D>
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-4xl mx-auto">
              To create a safe, inclusive, and engaging platform where people can freely ask questions, 
              share knowledge, and build meaningful connections. We believe that every question deserves 
              an answer and every voice deserves to be heard.
            </p>
          </div>
        </GlassmorphicCard3D>

        {/* Features Grid */}
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
            What Makes Us Special
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <GlassmorphicCard3D key={index}>
                <div className="p-6 space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </div>
              </GlassmorphicCard3D>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
            Our Community Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <GlassmorphicCard3D key={index}>
                <div className="p-6 text-center space-y-2">
                  <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-white/70 text-sm">{stat.label}</p>
                </div>
              </GlassmorphicCard3D>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <GlassmorphicCard3D>
          <div className="p-8 space-y-6">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Privacy & Safety</h3>
                <p className="text-white/70 text-sm">
                  We prioritize user privacy and maintain a safe environment for all community members.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Inclusivity</h3>
                <p className="text-white/70 text-sm">
                  Everyone is welcome here, regardless of background, experience, or perspective.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">Quality</h3>
                <p className="text-white/70 text-sm">
                  We strive for high-quality interactions and meaningful conversations.
                </p>
              </div>
            </div>
          </div>
        </GlassmorphicCard3D>

        {/* Team Section */}
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
            Built with ❤️
          </h2>
          <GlassmorphicCard3D>
            <div className="p-8 text-center space-y-4">
              <p className="text-white/80 text-lg leading-relaxed max-w-3xl mx-auto">
                This platform is built by a passionate team of developers and designers who believe 
                in the power of community and open communication. We're constantly working to improve 
                the experience and add new features based on your feedback.
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  Next.js 14
                </Badge>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  TypeScript
                </Badge>
                <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                  Supabase
                </Badge>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  Tailwind CSS
                </Badge>
              </div>
            </div>
          </GlassmorphicCard3D>
        </div>

        {/* Contact Section */}
        <GlassmorphicCard3D>
          <div className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Get in Touch</h2>
            <p className="text-white/70">
              Have questions, suggestions, or feedback? We'd love to hear from you!
            </p>
            <div className="flex justify-center gap-4 text-sm text-white/60">
              <span>📧 hello@askme.com</span>
              <span>•</span>
              <span>🐦 @askmeplatform</span>
              <span>•</span>
              <span>💬 Join our chat</span>
            </div>
          </div>
        </GlassmorphicCard3D>
      </div>
    </div>
  );
}