'use client';

import { cn } from '@/lib/utils';

interface ShimmerProps {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button';
}

export function Shimmer({ className, variant = 'default' }: ShimmerProps) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer";
  
  const variants = {
    default: "h-4 w-full rounded",
    card: "h-32 w-full rounded-lg",
    text: "h-4 w-3/4 rounded",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 w-24 rounded-md"
  };

  return (
    <div 
      className={cn(
        baseClasses,
        variants[variant],
        className
      )}
    />
  );
}

interface PageShimmerProps {
  type?: 'dashboard' | 'chat' | 'profile' | 'list' | 'form';
}

export function PageShimmer({ type = 'dashboard' }: PageShimmerProps) {
  const renderDashboardShimmer = () => (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Shimmer className="h-8 w-48" />
        <Shimmer variant="button" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Shimmer variant="card" />
            <Shimmer className="h-6 w-3/4" />
            <Shimmer className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderChatShimmer = () => (
    <div className="flex h-screen">
      <div className="w-64 border-r border-gray-200 p-4 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Shimmer variant="avatar" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Shimmer variant="avatar" />
            <Shimmer className="h-6 w-32" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className="max-w-xs space-y-2">
                <Shimmer className="h-4 w-full" />
                <Shimmer className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfileShimmer = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center space-x-6">
        <Shimmer className="h-24 w-24 rounded-full" />
        <div className="space-y-3">
          <Shimmer className="h-8 w-48" />
          <Shimmer className="h-4 w-64" />
          <Shimmer className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Shimmer variant="card" />
            <Shimmer className="h-5 w-3/4" />
            <Shimmer className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderListShimmer = () => (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Shimmer className="h-8 w-32" />
        <Shimmer variant="button" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
          <Shimmer variant="avatar" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-5 w-3/4" />
            <Shimmer className="h-4 w-1/2" />
          </div>
          <Shimmer variant="button" />
        </div>
      ))}
    </div>
  );

  const renderFormShimmer = () => (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Shimmer className="h-8 w-48" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
      <div className="flex space-x-4">
        <Shimmer variant="button" className="w-32" />
        <Shimmer variant="button" className="w-24" />
      </div>
    </div>
  );

  const shimmerComponents = {
    dashboard: renderDashboardShimmer,
    chat: renderChatShimmer,
    profile: renderProfileShimmer,
    list: renderListShimmer,
    form: renderFormShimmer
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse">
      {shimmerComponents[type]()}
    </div>
  );
}

export function NavigationShimmer() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-pulse">
      <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 animate-[loading_2s_ease-in-out_infinite]" />
    </div>
  );
}