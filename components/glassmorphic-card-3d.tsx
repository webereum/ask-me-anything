'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GlassmorphicCard3DProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function GlassmorphicCard3D({ children, title, className = '' }: GlassmorphicCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className={`w-full ${className}`}
    >
      <Card className="glass-morphic border-white/20 overflow-hidden backdrop-blur-xl bg-white/10 shadow-2xl">
        {title && (
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={title ? "pt-6" : "pt-8"}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}
