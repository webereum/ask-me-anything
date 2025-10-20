'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth, useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GlassmorphicCard3D } from '@/components/glassmorphic-card-3d';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import toast from 'react-hot-toast';
import { User, Link, Save, Eye, Share2, ArrowLeft } from 'lucide-react';

export default function CreateAMAPage() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  
  const router = useRouter();
  const { data: session } = useSession();
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();

  // Determine current user and authentication state
  const currentUser = session?.user || user;
  const currentUserId = (session?.user as any)?.id || userId;
  const isAuthenticated = !!session || isSignedIn;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Pre-fill form with user data
    if (currentUser) {
      const userAny = currentUser as any;
      setDisplayName(userAny.name || userAny.firstName + ' ' + (userAny.lastName || '') || '');
      
      // Generate username suggestion
      const namePart = (userAny.name || userAny.firstName || '').toLowerCase().replace(/\s+/g, '');
      const randomNum = Math.floor(Math.random() * 1000);
      setUsername(`${namePart}${randomNum}`);
    }

    checkExistingProfile();
  }, [isAuthenticated, currentUser, currentUserId, router]);

  const checkExistingProfile = async () => {
    if (!currentUserId) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', currentUserId)
        .single();

      if (data) {
        setExistingProfile(data);
        setUsername(data.username);
        setDisplayName(data.display_name);
        setBio(data.bio || '');
      }
    } catch (error) {
      console.log('No existing profile found');
    } finally {
      setIsLoading(false);
    }
  };

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) return false;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', usernameToCheck.toLowerCase())
        .neq('user_id', currentUserId);

      return !data || data.length === 0;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!username || username.length < 3) {
      toast.error('Username must be at least 3 characters long');
      setIsSubmitting(false);
      return;
    }

    if (!displayName) {
      toast.error('Display name is required');
      setIsSubmitting(false);
      return;
    }

    // Check username availability (skip if updating existing profile with same username)
    if (!existingProfile || existingProfile.username !== username.toLowerCase()) {
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        toast.error('Username is already taken. Please choose another one.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const supabase = createClient();
      
      const profileData = {
        user_id: currentUserId,
        username: username.toLowerCase(),
        display_name: displayName,
        bio: bio || null,
        avatar_url: (currentUser as any)?.image || (currentUser as any)?.imageUrl || null,
        email: (currentUser as any)?.email || (currentUser as any)?.emailAddresses?.[0]?.emailAddress || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let result;
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('user_profiles')
          .update({
            username: profileData.username,
            display_name: profileData.display_name,
            bio: profileData.bio,
            avatar_url: profileData.avatar_url,
            updated_at: profileData.updated_at,
          })
          .eq('user_id', currentUserId);
      } else {
        // Create new profile
        result = await supabase
          .from('user_profiles')
          .insert([profileData]);
      }

      if (result.error) throw result.error;

      toast.success(existingProfile ? 'Profile updated successfully!' : 'AMA page created successfully!', {
        icon: '🎉',
        style: {
          background: 'rgba(16, 185, 129, 0.9)',
          color: '#fff',
          backdropFilter: 'blur(10px)',
        },
      });

      // Redirect to the user's AMA page
      router.push(`/u/${username.toLowerCase()}`);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save profile. Please try again.', {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="absolute top-8 left-8 text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            {existingProfile ? 'Edit Your AMA Page' : 'Create Your AMA Page'}
          </h1>
          <p className="text-white/70 text-lg">
            {existingProfile ? 'Update your profile information' : 'Set up your personalized Ask Me Anything page'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <GlassmorphicCard3D title="Profile Setup" className="h-fit">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Preview */}
              <div className="flex justify-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={(currentUser as any)?.image || (currentUser as any)?.imageUrl || ''}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white text-2xl">
                    {displayName.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/90 text-sm font-medium">
                  Username *
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="your-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                    disabled={isSubmitting}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400 pl-10"
                    maxLength={30}
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                </div>
                <p className="text-xs text-white/60">
                  Your AMA page will be available at: /u/{username || 'your-username'}
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-white/90 text-sm font-medium">
                  Display Name *
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400"
                  maxLength={50}
                  required
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white/90 text-sm font-medium">
                  Bio (Optional)
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell people a bit about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={isSubmitting}
                  className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400 resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-white/60">
                  {bio.length}/200 characters
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !username || !displayName}
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {existingProfile ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    {existingProfile ? 'Update Profile' : 'Create AMA Page'}
                  </div>
                )}
              </Button>
            </form>
          </GlassmorphicCard3D>

          {/* Preview */}
          <GlassmorphicCard3D title="Preview" className="h-fit">
            <div className="space-y-6">
              {/* Profile Preview */}
              <div className="text-center space-y-4">
                <Avatar className="w-20 h-20 mx-auto">
                  <AvatarImage
                    src={(currentUser as any)?.image || (currentUser as any)?.imageUrl || ''}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white text-xl">
                    {displayName.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {displayName || 'Your Display Name'}
                  </h3>
                  <p className="text-white/60">@{username || 'your-username'}</p>
                </div>

                {bio && (
                  <p className="text-white/80 text-sm max-w-sm mx-auto">
                    {bio}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  disabled={!username}
                  onClick={() => username && router.push(`/u/${username.toLowerCase()}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview AMA Page
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  disabled={!username}
                  onClick={() => {
                    if (username) {
                      navigator.clipboard.writeText(`${window.location.origin}/u/${username.toLowerCase()}`);
                      toast.success('Link copied to clipboard!');
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Copy Share Link
                </Button>
              </div>

              {/* Features */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-medium mb-3">Your AMA page will include:</h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    Anonymous question submission
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    Public Q&A display
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    Easy sharing capabilities
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    Mobile-friendly design
                  </li>
                </ul>
              </div>
            </div>
          </GlassmorphicCard3D>
        </div>
      </div>
    </div>
  );
}