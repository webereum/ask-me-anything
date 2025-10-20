'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Timer, 
  Eye, 
  Clock, 
  Zap, 
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimerOption {
  id: string;
  label: string;
  description: string;
  duration: number; // in seconds, -1 for view once, 0 for no timer
  icon: React.ReactNode;
  color: string;
  isViewOnce?: boolean;
}

interface MessageTimerSelectorProps {
  selectedTimer?: TimerOption | null;
  onTimerSelect: (timer: TimerOption | null) => void;
  disabled?: boolean;
  className?: string;
}

const TIMER_OPTIONS: TimerOption[] = [
  {
    id: 'view-once',
    label: 'View Once',
    description: 'Message disappears after being viewed',
    duration: -1,
    icon: <Eye className="h-4 w-4" />,
    color: 'text-purple-500',
    isViewOnce: true,
  },
  {
    id: '1-second',
    label: '1 Second',
    description: 'Message disappears after 1 second',
    duration: 1,
    icon: <Zap className="h-4 w-4" />,
    color: 'text-red-500',
  },
  {
    id: '5-seconds',
    label: '5 Seconds',
    description: 'Message disappears after 5 seconds',
    duration: 5,
    icon: <Timer className="h-4 w-4" />,
    color: 'text-orange-500',
  },
  {
    id: '10-seconds',
    label: '10 Seconds',
    description: 'Message disappears after 10 seconds',
    duration: 10,
    icon: <Timer className="h-4 w-4" />,
    color: 'text-yellow-500',
  },
  {
    id: '30-seconds',
    label: '30 Seconds',
    description: 'Message disappears after 30 seconds',
    duration: 30,
    icon: <Clock className="h-4 w-4" />,
    color: 'text-blue-500',
  },
  {
    id: '1-minute',
    label: '1 Minute',
    description: 'Message disappears after 1 minute',
    duration: 60,
    icon: <Clock className="h-4 w-4" />,
    color: 'text-green-500',
  },
  {
    id: '5-minutes',
    label: '5 Minutes',
    description: 'Message disappears after 5 minutes',
    duration: 300,
    icon: <Clock className="h-4 w-4" />,
    color: 'text-teal-500',
  },
  {
    id: '1-hour',
    label: '1 Hour',
    description: 'Message disappears after 1 hour',
    duration: 3600,
    icon: <Clock className="h-4 w-4" />,
    color: 'text-indigo-500',
  },
  {
    id: '1-day',
    label: '1 Day',
    description: 'Message disappears after 1 day',
    duration: 86400,
    icon: <Clock className="h-4 w-4" />,
    color: 'text-gray-500',
  },
];

interface TimerOptionItemProps {
  option: TimerOption;
  isSelected: boolean;
  onSelect: () => void;
}

function TimerOptionItem({ option, isSelected, onSelect }: TimerOptionItemProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
        "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
        isSelected && "bg-primary/10 border border-primary/20"
      )}
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0", option.color)}>
        {option.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{option.label}</span>
          {isSelected && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {option.description}
        </p>
      </div>

      {/* Special indicators */}
      {option.isViewOnce && (
        <Badge variant="secondary" className="text-xs">
          <Eye className="h-3 w-3 mr-1" />
          Once
        </Badge>
      )}
      
      {option.duration > 0 && option.duration <= 10 && (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Fast
        </Badge>
      )}
    </button>
  );
}

export function MessageTimerSelector({ 
  selectedTimer, 
  onTimerSelect, 
  disabled = false,
  className 
}: MessageTimerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTimerSelect = (timer: TimerOption) => {
    onTimerSelect(timer);
    setIsOpen(false);
  };

  const handleClearTimer = () => {
    onTimerSelect(null);
    setIsOpen(false);
  };

  const getTriggerContent = () => {
    if (selectedTimer) {
      return (
        <div className="flex items-center gap-2">
          <div className={selectedTimer.color}>
            {selectedTimer.icon}
          </div>
          <span className="text-sm font-medium">
            {selectedTimer.label}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Timer
        </span>
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={selectedTimer ? "secondary" : "ghost"}
          size="sm"
          disabled={disabled}
          className={cn(
            "h-9 px-3 transition-all duration-200",
            selectedTimer && "border border-primary/20",
            className
          )}
        >
          {getTriggerContent()}
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-80 p-0" 
        align="start"
        side="top"
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Message Timer</h3>
            </div>
            
            {selectedTimer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearTimer}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Description */}
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">
                  Disappearing Messages
                </p>
                <p>
                  Messages will automatically disappear after the selected time. 
                  Recipients will be notified that the message has a timer.
                </p>
              </div>
            </div>
          </div>

          {/* Timer options */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {TIMER_OPTIONS.map((option) => (
              <TimerOptionItem
                key={option.id}
                option={option}
                isSelected={selectedTimer?.id === option.id}
                onSelect={() => handleTimerSelect(option)}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground text-center">
              <p>
                Timer starts when the message is sent. 
                View once messages disappear after being opened.
              </p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default MessageTimerSelector;