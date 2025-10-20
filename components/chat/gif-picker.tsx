'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  X, 
  TrendingUp, 
  Heart, 
  Smile, 
  Zap,
  Coffee,
  Music,
  Camera,
  Gamepad2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mediaService, GifSearchResult } from '@/lib/chat/media-service';

interface GifPickerProps {
  onSelectGif: (gif: GifSearchResult) => void;
  onClose: () => void;
  className?: string;
}

interface CategoryButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function CategoryButton({ icon, label, isActive, onClick }: CategoryButtonProps) {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 whitespace-nowrap",
        isActive && "bg-primary text-primary-foreground"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

interface GifItemProps {
  gif: GifSearchResult;
  onSelect: (gif: GifSearchResult) => void;
}

function GifItem({ gif, onSelect }: GifItemProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div 
      className="relative group cursor-pointer rounded-lg overflow-hidden bg-muted aspect-square"
      onClick={() => onSelect(gif)}
    >
      {isLoading && (
        <Skeleton className="absolute inset-0" />
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <Camera className="h-8 w-8 mx-auto mb-2" />
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      ) : (
        <img
          src={gif.url}
          alt={gif.title}
          className={cn(
            "w-full h-full object-cover transition-all duration-200",
            "group-hover:scale-105 group-hover:brightness-110",
            isLoading && "opacity-0"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}

      {/* Overlay with title */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200">
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-white text-xs font-medium truncate">
            {gif.title}
          </p>
        </div>
      </div>

      {/* Selection indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-primary text-primary-foreground rounded-full p-1">
          <Sparkles className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = [
  { key: 'trending', label: 'Trending', icon: <TrendingUp className="h-4 w-4" /> },
  { key: 'reactions', label: 'Reactions', icon: <Smile className="h-4 w-4" /> },
  { key: 'emotions', label: 'Emotions', icon: <Heart className="h-4 w-4" /> },
  { key: 'actions', label: 'Actions', icon: <Zap className="h-4 w-4" /> },
  { key: 'lifestyle', label: 'Lifestyle', icon: <Coffee className="h-4 w-4" /> },
  { key: 'music', label: 'Music', icon: <Music className="h-4 w-4" /> },
  { key: 'gaming', label: 'Gaming', icon: <Gamepad2 className="h-4 w-4" /> },
];

export function GifPicker({ onSelectGif, onClose, className }: GifPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('trending');
  const [gifs, setGifs] = useState<GifSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load GIFs based on current category or search query
  const loadGifs = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentOffset = reset ? 0 : offset;
      let result: GifSearchResult[];

      if (searchQuery.trim()) {
        result = await mediaService.searchGifs(searchQuery, currentOffset);
      } else {
        result = await mediaService.getTrendingGifs(currentOffset);
      }

      if (reset) {
        setGifs(result);
        setOffset(result.length);
      } else {
        setGifs(prev => [...prev, ...result]);
        setOffset(prev => prev + result.length);
      }

      setHasMore(result.length === 25); // Giphy returns 25 per page
    } catch (err) {
      console.error('Failed to load GIFs:', err);
      setError('Failed to load GIFs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, offset, isLoading]);

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      setGifs([]);
      setOffset(0);
      setHasMore(true);
      loadGifs(true);
    }, 500);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    if (category === activeCategory) return;

    setActiveCategory(category);
    setSearchQuery('');
    setGifs([]);
    setOffset(0);
    setHasMore(true);
    
    // Load category-specific content
    setTimeout(() => loadGifs(true), 100);
  };

  // Handle scroll for infinite loading
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !isLoading) {
      loadGifs();
    }
  }, [hasMore, isLoading, loadGifs]);

  // Initial load
  useEffect(() => {
    loadGifs(true);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Choose a GIF</h3>
        </div>
        
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search for GIFs..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div className="p-4 border-b">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {CATEGORIES.map((category) => (
                <CategoryButton
                  key={category.key}
                  icon={category.icon}
                  label={category.label}
                  isActive={activeCategory === category.key}
                  onClick={() => handleCategoryChange(category.key)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* GIFs Grid */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-full"
          onScrollCapture={handleScroll}
        >
          <div className="p-4">
            {error ? (
              <div className="text-center py-8">
                <div className="text-destructive mb-2">
                  <Camera className="h-8 w-8 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
                <Button variant="outline" onClick={() => loadGifs(true)}>
                  Try Again
                </Button>
              </div>
            ) : gifs.length === 0 && !isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2" />
                <p>No GIFs found</p>
                {searchQuery && (
                  <p className="text-sm mt-1">Try a different search term</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {gifs.map((gif) => (
                  <GifItem
                    key={gif.id}
                    gif={gif}
                    onSelect={onSelectGif}
                  />
                ))}
                
                {/* Loading skeletons */}
                {isLoading && (
                  Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))
                )}
              </div>
            )}

            {/* Load more indicator */}
            {hasMore && gifs.length > 0 && !isLoading && (
              <div className="text-center py-4">
                <Badge variant="outline">
                  Scroll for more GIFs
                </Badge>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Powered by</span>
          <Badge variant="outline" className="text-xs">
            GIPHY
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default GifPicker;