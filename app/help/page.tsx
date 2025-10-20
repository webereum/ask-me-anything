'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { GlassmorphicCard3D } from '@/components/glassmorphic-card-3d';
import {
  HelpCircle,
  Search,
  MessageCircle,
  Mail,
  Phone,
  Book,
  Video,
  FileText,
  Users,
  Shield,
  Settings,
  Zap,
  Clock,
  CheckCircle,
  ExternalLink,
  Send
} from 'lucide-react';

const faqData = [
  {
    category: 'Getting Started',
    questions: [
      {
        question: 'How do I create an Ask Me Anything session?',
        answer: 'To create an AMA session, sign up for an account, go to your dashboard, and click "Create New Session". You can customize your session settings, add a description, and share the link with your audience.'
      },
      {
        question: 'Can I use the platform anonymously?',
        answer: 'Yes! You can ask questions anonymously without creating an account. However, to create your own AMA sessions or access advanced features, you\'ll need to register.'
      },
      {
        question: 'How do I join a chat room?',
        answer: 'Navigate to the Chat section from the main menu. You can join public rooms or create private rooms. For anonymous users, you\'ll be prompted to enter a username.'
      }
    ]
  },
  {
    category: 'Chat Features',
    questions: [
      {
        question: 'How do timer messages work?',
        answer: 'Timer messages automatically delete after a set time (1 second to 1 minute). Select the timer icon when composing a message and choose your preferred duration. This feature is great for sharing sensitive information.'
      },
      {
        question: 'Can I share images and GIFs in chat?',
        answer: 'Yes! Click the attachment icon to share images, or use the GIF button to search and share animated GIFs. All media is automatically scanned for safety.'
      },
      {
        question: 'How do I block screenshots in chat?',
        answer: 'Go to Chat Settings and enable "Block Screenshots". This will prevent other users from taking screenshots or screen recordings in your chat rooms (works on supported devices).'
      }
    ]
  },
  {
    category: 'Privacy & Security',
    questions: [
      {
        question: 'How is my data protected?',
        answer: 'We use end-to-end encryption for all messages, secure authentication, and follow industry best practices. Your personal information is never shared with third parties without consent.'
      },
      {
        question: 'Can I delete my messages?',
        answer: 'Yes, you can delete your own messages at any time. Timer messages are automatically deleted, and you can manually delete regular messages by clicking the delete option.'
      },
      {
        question: 'How do I report inappropriate content?',
        answer: 'Click the report button next to any message or post. Our moderation team reviews all reports within 24 hours and takes appropriate action.'
      }
    ]
  },
  {
    category: 'Account Management',
    questions: [
      {
        question: 'How do I change my password?',
        answer: 'Go to Settings > Account > Security and click "Change Password". You\'ll need to verify your current password before setting a new one.'
      },
      {
        question: 'Can I have multiple AMA pages?',
        answer: 'Yes! Premium users can create multiple AMA pages for different topics or audiences. Each page has its own settings and analytics.'
      },
      {
        question: 'How do I delete my account?',
        answer: 'Go to Settings > Account > Delete Account. This action is permanent and will remove all your data. You\'ll receive a confirmation email before deletion.'
      }
    ]
  }
];

const supportOptions = [
  {
    title: 'Live Chat Support',
    description: 'Get instant help from our support team',
    icon: MessageCircle,
    action: 'Start Chat',
    available: '24/7',
    color: 'text-blue-400'
  },
  {
    title: 'Email Support',
    description: 'Send us a detailed message',
    icon: Mail,
    action: 'Send Email',
    available: 'Response within 24h',
    color: 'text-green-400'
  },
  {
    title: 'Phone Support',
    description: 'Speak directly with our team',
    icon: Phone,
    action: 'Call Now',
    available: 'Mon-Fri 9AM-6PM',
    color: 'text-purple-400'
  },
  {
    title: 'Community Forum',
    description: 'Get help from other users',
    icon: Users,
    action: 'Visit Forum',
    available: 'Always active',
    color: 'text-orange-400'
  }
];

const resources = [
  {
    title: 'User Guide',
    description: 'Complete guide to using all features',
    icon: Book,
    type: 'PDF Guide'
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video instructions',
    icon: Video,
    type: 'Video Series'
  },
  {
    title: 'API Documentation',
    description: 'For developers and integrations',
    icon: FileText,
    type: 'Technical Docs'
  },
  {
    title: 'Best Practices',
    description: 'Tips for effective AMA sessions',
    icon: Zap,
    type: 'Guide'
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', contactForm);
    // Reset form
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
            Help Center
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Find answers to your questions and get the support you need
          </p>
        </div>

        {/* Search */}
        <GlassmorphicCard3D className="p-6 mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
            <Input
              placeholder="Search for help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-lg"
            />
          </div>
        </GlassmorphicCard3D>

        <Tabs defaultValue="faq" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 border-white/20">
            <TabsTrigger value="faq" className="data-[state=active]:bg-white/20 text-white">
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-white/20 text-white">
              <MessageCircle className="h-4 w-4 mr-2" />
              Support
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-white/20 text-white">
              <Book className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-white/20 text-white">
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            {filteredFAQ.length === 0 ? (
              <GlassmorphicCard3D className="p-8 text-center">
                <HelpCircle className="h-12 w-12 text-white/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No results found
                </h3>
                <p className="text-white/60">
                  Try searching with different keywords or browse all categories.
                </p>
              </GlassmorphicCard3D>
            ) : (
              filteredFAQ.map((category) => (
                <GlassmorphicCard3D key={category.category} className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {category.category}
                  </h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((item, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`${category.category}-${index}`}
                        className="border-white/10"
                      >
                        <AccordionTrigger className="text-white hover:text-white/80 text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-white/70 leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </GlassmorphicCard3D>
              ))
            )}
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supportOptions.map((option) => (
                <GlassmorphicCard3D key={option.title} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-white/10`}>
                      <option.icon className={`h-6 w-6 ${option.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {option.title}
                      </h3>
                      <p className="text-white/70 mb-3">
                        {option.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-white/60">
                          <Clock className="h-4 w-4" />
                          <span>{option.available}</span>
                        </div>
                        <Button 
                          size="sm"
                          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                        >
                          {option.action}
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </GlassmorphicCard3D>
              ))}
            </div>

            {/* Status */}
            <GlassmorphicCard3D className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      All Systems Operational
                    </h3>
                    <p className="text-white/60 text-sm">
                      Last updated: 2 minutes ago
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  View Status Page
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </GlassmorphicCard3D>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((resource) => (
                <GlassmorphicCard3D key={resource.title} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-lg bg-white/10">
                      <resource.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {resource.title}
                        </h3>
                        <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
                          {resource.type}
                        </span>
                      </div>
                      <p className="text-white/70 mb-4">
                        {resource.description}
                      </p>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Access Resource
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </GlassmorphicCard3D>
              ))}
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <GlassmorphicCard3D className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                Send us a message
              </h3>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Name
                    </label>
                    <Input
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Subject
                  </label>
                  <Input
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="What can we help you with?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Message
                  </label>
                  <Textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[120px]"
                    placeholder="Please describe your issue or question in detail..."
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </GlassmorphicCard3D>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}