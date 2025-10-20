'use client';

import { ReactNode, MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/components/loading-provider';

interface NavigationLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  replace?: boolean;
}

export function NavigationLink({ 
  href, 
  children, 
  className, 
  onClick,
  replace = false 
}: NavigationLinkProps) {
  const router = useRouter();
  const { startNavigation } = useLoading();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Don't intercept if it's a new tab/window
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
      return;
    }

    e.preventDefault();
    
    // Start loading animation
    startNavigation();
    
    // Call custom onClick if provided
    if (onClick) {
      onClick();
    }

    // Navigate after a small delay to show loading state
    setTimeout(() => {
      if (replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    }, 100);
  };

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}