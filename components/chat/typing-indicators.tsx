'use client';

import React from 'react';
import { TypingIndicator } from '@/lib/chat/chat-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TypingIndicatorsProps {
  indicators: TypingIndicator[];
  className?: string;
}

interface TypingAnimationProps {
  className?: string;
}

function TypingAnimation({ className }: TypingAnimationProps) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}

export function TypingIndicators({ indicators, className }: TypingIndicatorsProps) {
  if (indicators.length === 0) {
    return null;
  }

  // Group indicators by user to avoid duplicates
  const uniqueIndicators = indicators.reduce((acc, indicator) => {
    if (!acc.find(i => i.user_id === indicator.user_id)) {
      acc.push(indicator);
    }
    return acc;
  }, [] as TypingIndicator[]);

  const renderSingleTyping = (indicator: TypingIndicator) => (
    <div className="flex items-center gap-3 mb-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src={indicator.user?.avatar_url} />
        <AvatarFallback>
          {indicator.user?.username?.charAt(0).toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            {indicator.user?.username || 'Someone'}
          </span>
          <Badge variant="secondary" className="text-xs h-4 px-2">
            typing
          </Badge>
        </div>
        
        <div className="bg-muted rounded-lg px-3 py-2 max-w-[200px]">
          <TypingAnimation />
        </div>
      </div>
    </div>
  );

  const renderMultipleTyping = (indicators: TypingIndicator[]) => {
    const usernames = indicators
      .map(i => i.user?.username || 'Someone')
      .slice(0, 3); // Show max 3 names
    
    const remainingCount = indicators.length - 3;
    
    let typingText = '';
    if (usernames.length === 1) {
      typingText = `${usernames[0]} is typing`;
    } else if (usernames.length === 2) {
      typingText = `${usernames[0]} and ${usernames[1]} are typing`;
    } else if (usernames.length === 3) {
      if (remainingCount > 0) {
        typingText = `${usernames[0]}, ${usernames[1]}, ${usernames[2]} and ${remainingCount} other${remainingCount > 1 ? 's' : ''} are typing`;
      } else {
        typingText = `${usernames[0]}, ${usernames[1]} and ${usernames[2]} are typing`;
      }
    }

    return (
      <div className="flex items-center gap-3 mb-4">
        {/* Show avatars of first few users */}
        <div className="flex -space-x-2">
          {indicators.slice(0, 3).map((indicator, index) => (
            <Avatar key={indicator.user_id} className="h-6 w-6 border-2 border-background">
              <AvatarImage src={indicator.user?.avatar_url} />
              <AvatarFallback className="text-xs">
                {indicator.user?.username?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          ))}
          {remainingCount > 0 && (
            <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
              <span className="text-xs font-medium">+{remainingCount}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col">
          <div className="text-sm text-muted-foreground mb-1">
            {typingText}
          </div>
          
          <div className="bg-muted rounded-lg px-3 py-2">
            <TypingAnimation />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("transition-all duration-300 ease-in-out", className)}>
      {uniqueIndicators.length === 1 
        ? renderSingleTyping(uniqueIndicators[0])
        : renderMultipleTyping(uniqueIndicators)
      }
    </div>
  );
}

export default TypingIndicators;