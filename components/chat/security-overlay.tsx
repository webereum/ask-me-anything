'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SecurityOverlayProps {
  isActive: boolean;
  onToggle?: (active: boolean) => void;
  children: React.ReactNode;
  className?: string;
  showControls?: boolean;
  securityLevel?: 'low' | 'medium' | 'high';
}

interface SecurityFeatures {
  preventScreenshot: boolean;
  preventScreenRecording: boolean;
  blurOnFocusLoss: boolean;
  hideFromTaskSwitcher: boolean;
  watermark: boolean;
}

export function SecurityOverlay({ 
  isActive, 
  onToggle, 
  children, 
  className,
  showControls = true,
  securityLevel = 'medium'
}: SecurityOverlayProps) {
  const [isBlurred, setIsBlurred] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [features, setFeatures] = useState<SecurityFeatures>({
    preventScreenshot: false,
    preventScreenRecording: false,
    blurOnFocusLoss: false,
    hideFromTaskSwitcher: false,
    watermark: false,
  });

  const overlayRef = useRef<HTMLDivElement>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout>();

  // Configure security features based on level
  useEffect(() => {
    const configs = {
      low: {
        preventScreenshot: false,
        preventScreenRecording: false,
        blurOnFocusLoss: true,
        hideFromTaskSwitcher: false,
        watermark: false,
      },
      medium: {
        preventScreenshot: true,
        preventScreenRecording: false,
        blurOnFocusLoss: true,
        hideFromTaskSwitcher: true,
        watermark: true,
      },
      high: {
        preventScreenshot: true,
        preventScreenRecording: true,
        blurOnFocusLoss: true,
        hideFromTaskSwitcher: true,
        watermark: true,
      },
    };

    setFeatures(configs[securityLevel]);
  }, [securityLevel]);

  // Handle focus/blur events for security
  useEffect(() => {
    if (!isActive || !features.blurOnFocusLoss) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    const handleFocus = () => setIsBlurred(false);
    const handleBlur = () => setIsBlurred(true);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isActive, features.blurOnFocusLoss]);

  // Prevent screenshots and screen recording
  useEffect(() => {
    if (!isActive) return;

    const preventCapture = () => {
      if (features.preventScreenshot || features.preventScreenRecording) {
        // Show warning
        setShowWarning(true);
        
        // Clear existing timeout
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
        
        // Hide warning after 3 seconds
        warningTimeoutRef.current = setTimeout(() => {
          setShowWarning(false);
        }, 3000);

        // Try to prevent the action (limited browser support)
        try {
          // This is a basic attempt - real screenshot prevention requires native apps
          if (overlayRef.current) {
            overlayRef.current.style.filter = 'blur(20px)';
            setTimeout(() => {
              if (overlayRef.current) {
                overlayRef.current.style.filter = '';
              }
            }, 100);
          }
        } catch (error) {
          console.warn('Screenshot prevention failed:', error);
        }
      }
    };

    // Listen for common screenshot shortcuts
    const handleKeyDown = (event: KeyboardEvent) => {
      const isScreenshotShortcut = 
        (event.key === 'PrintScreen') ||
        (event.ctrlKey && event.shiftKey && event.key === 'S') ||
        (event.metaKey && event.shiftKey && event.key === '3') ||
        (event.metaKey && event.shiftKey && event.key === '4') ||
        (event.metaKey && event.shiftKey && event.key === '5');

      if (isScreenshotShortcut) {
        event.preventDefault();
        preventCapture();
      }
    };

    // Listen for right-click (context menu)
    const handleContextMenu = (event: MouseEvent) => {
      if (features.preventScreenshot) {
        event.preventDefault();
        preventCapture();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [isActive, features]);

  // Hide from task switcher (limited browser support)
  useEffect(() => {
    if (!isActive || !features.hideFromTaskSwitcher) return;

    try {
      // This is experimental and has limited support
      if ('setAppBadge' in navigator) {
        (navigator as any).setAppBadge(0);
      }
    } catch (error) {
      console.warn('Task switcher hiding failed:', error);
    }
  }, [isActive, features.hideFromTaskSwitcher]);

  const getSecurityBadgeColor = () => {
    switch (securityLevel) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div 
      ref={overlayRef}
      className={cn(
        "relative",
        isActive && "select-none", // Prevent text selection
        className
      )}
      style={{
        // Prevent drag and drop
        userSelect: isActive ? 'none' : 'auto',
        WebkitUserSelect: isActive ? 'none' : 'auto',
        MozUserSelect: isActive ? 'none' : 'auto',
        msUserSelect: isActive ? 'none' : 'text',
      }}
    >
      {/* Security warning overlay */}
      {showWarning && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-destructive text-destructive-foreground p-6 rounded-lg shadow-lg max-w-sm mx-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Security Alert</h3>
            <p className="text-sm">
              Screenshot or screen recording attempt detected. This content is protected.
            </p>
          </div>
        </div>
      )}

      {/* Blur overlay when focus is lost */}
      {isBlurred && isActive && (
        <div className="absolute inset-0 z-40 backdrop-blur-lg bg-black/20 flex items-center justify-center">
          <div className="bg-background/90 p-4 rounded-lg shadow-lg text-center">
            <EyeOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Content hidden for security
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click to focus and view
            </p>
          </div>
        </div>
      )}

      {/* Watermark */}
      {isActive && features.watermark && (
        <div className="absolute inset-0 pointer-events-none z-30">
          <div className="absolute top-4 right-4 opacity-20">
            <div className="flex items-center gap-1 text-xs font-mono">
              <Shield className="h-3 w-3" />
              <span>PROTECTED</span>
            </div>
          </div>
          
          {/* Diagonal watermarks */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-xs font-mono opacity-5 transform rotate-45"
                style={{
                  top: `${20 + i * 15}%`,
                  left: `${10 + (i % 2) * 30}%`,
                }}
              >
                SECURE CHAT • PROTECTED CONTENT
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security controls */}
      {showControls && (
        <div className="absolute top-2 left-2 z-20 flex items-center gap-2">
          <Badge className={cn("text-xs", getSecurityBadgeColor())}>
            <Shield className="h-3 w-3 mr-1" />
            {securityLevel.toUpperCase()}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggle?.(!isActive)}
            className="h-6 px-2 text-xs"
          >
            {isActive ? (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Secured
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Unsecured
              </>
            )}
          </Button>
        </div>
      )}

      {/* Main content */}
      <div className={cn(
        "transition-all duration-200",
        isActive && "relative z-10"
      )}>
        {children}
      </div>

      {/* Security features indicator */}
      {isActive && (
        <div className="absolute bottom-2 left-2 z-20">
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
            <Lock className="h-3 w-3" />
            <span>
              {Object.values(features).filter(Boolean).length} security features active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecurityOverlay;