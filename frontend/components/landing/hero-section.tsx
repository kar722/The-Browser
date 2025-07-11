"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

// At the top of the file, add the type definition
type DataPoint = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
};

// Generate points in a circular pattern with randomness
const generateCirclePoints = (centerX: number, centerY: number, radius: number, count: number): DataPoint[] => {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const randomRadius = radius * (0.8 + Math.random() * 0.4); // 80-120% of radius
    const randomAngle = angle + (Math.random() * 0.2 - 0.1); // ±0.1 radian variance
    return {
      x: centerX + Math.cos(randomAngle) * randomRadius,
      y: centerY + Math.sin(randomAngle) * randomRadius,
      scale: Math.random() * 0.4 + 0.4,
      opacity: Math.random() * 0.4 + 0.3,
    };
  });
};

// Generate a unibrow pattern at a given position
const generateUnibrowPattern = (startX: number, startY: number, width: number = 30, height: number = 2): DataPoint[] => {
  const points: DataPoint[] = [];
  const pointCount = 12; // Fewer points for more natural look
  
  for (let i = 0; i < pointCount; i++) {
    const progress = i / (pointCount - 1);
    const x = startX + progress * width;
    // Create natural curve using sine wave with some randomness
    const baseY = startY + Math.sin(progress * Math.PI) * height;
    const y = baseY + (Math.random() - 0.5) * 0.8; // Add slight vertical randomness
    
    points.push({
      x,
      y,
      scale: Math.random() * 0.3 + 0.3,
      opacity: Math.random() * 0.4 + 0.4,
    });
  }
  return points;
};

// Generate multiple unibrow patterns across the grid
const generateUnibrowPatterns = (): DataPoint[] => {
  const patterns: DataPoint[] = [];
  // Generate 5 unibrow patterns at different locations
  const locations = [
    { x: 15, y: 20 },
    { x: 55, y: 25 },
    { x: 35, y: 75 },
    { x: 70, y: 65 },
    { x: 20, y: 45 },
  ];

  locations.forEach(loc => {
    const width = 15 + Math.random() * 10; // Random width between 15-25
    const height = 1.5 + Math.random() * 1; // Random height between 1.5-2.5
    patterns.push(...generateUnibrowPattern(loc.x, loc.y, width, height));
  });

  return patterns;
};

// Generate random points within bounds
const generateRandomPoints = (count: number, bounds: { minX: number; maxX: number; minY: number; maxY: number }): DataPoint[] => {
  return Array.from({ length: count }, () => ({
    x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
    scale: Math.random() * 0.3 + 0.2,
    opacity: Math.random() * 0.3 + 0.2,
  }));
};

const DataPoint = ({ x, y, scale, opacity, delay = 0 }: DataPoint & { delay?: number }) => (
  <motion.circle
    cx={x}
    cy={y}
    r={0.4}
    initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
    animate={{
      scale: [scale, scale * 1.5, scale],
      opacity: [opacity, opacity * 1.5, opacity],
      x: x,
      y: y,
    }}
    transition={{
      scale: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
      opacity: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
      x: {
        duration: 3,
        ease: "easeInOut",
      },
      y: {
        duration: 3,
        ease: "easeInOut",
      },
      delay,
    }}
    className="fill-primary"
  />
);

const GridLines = () => (
  <g className="stroke-primary/10">
    {/* Vertical lines */}
    {Array.from({ length: 20 }, (_, i) => (
      <motion.line
        key={`v-${i}`}
        x1={i * 5}
        y1="0"
        x2={i * 5}
        y2="100"
        strokeWidth="0.1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: i * 0.05 }}
      />
    ))}
    {/* Horizontal lines */}
    {Array.from({ length: 20 }, (_, i) => (
      <motion.line
        key={`h-${i}`}
        x1="0"
        y1={i * 5}
        x2="100"
        y2={i * 5}
        strokeWidth="0.1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: i * 0.05 }}
      />
    ))}
  </g>
);

const BasketballElements = () => (
  <g className="stroke-primary/20" fill="none">
    {/* Main basketball circle */}
    <motion.circle
      cx="50"
      cy="50"
      r="20"
      strokeWidth="0.2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    />
    {/* Basketball seams */}
    <motion.path
      d="M 30,50 h 40"
      strokeWidth="0.2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, delay: 0.5 }}
    />
    <motion.path
      d="M 50,30 v 40"
      strokeWidth="0.2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, delay: 0.5 }}
    />
    {/* Curved seams */}
    <motion.path
      d="M 35,35 Q 50,45 65,35"
      strokeWidth="0.2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, delay: 0.7 }}
    />
    <motion.path
      d="M 35,65 Q 50,55 65,65"
      strokeWidth="0.2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, delay: 0.7 }}
    />
    {/* Additional curved lines for basketball texture */}
    <motion.path
      d="M 40,32 Q 50,38 60,32"
      strokeWidth="0.2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, delay: 0.9 }}
    />
    <motion.path
      d="M 40,68 Q 50,62 60,68"
      strokeWidth="0.2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, delay: 0.9 }}
    />
  </g>
);

export function HeroSection() {
  const [points, setPoints] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Initial points generation
    const generateInitialPoints = () => {
      const circlePoints = generateCirclePoints(50, 50, 20, 30);
      const unibrowPatterns = generateUnibrowPatterns();
      const edgePoints = generateRandomPoints(60, { minX: 5, maxX: 95, minY: 5, maxY: 95 });
      return [...circlePoints, ...unibrowPatterns, ...edgePoints];
    };

    setPoints(generateInitialPoints());

    // Regenerate points periodically with crossfade
    const interval = setInterval(() => {
      const newPoints = generateInitialPoints();
      
      // Ensure we maintain the same number of points for smooth transitions
      const maxLength = Math.max(points.length, newPoints.length);
      const normalizedOldPoints = [...points];
      const normalizedNewPoints = [...newPoints];

      // Pad arrays to same length if needed
      while (normalizedOldPoints.length < maxLength) {
        normalizedOldPoints.push({ ...points[0] });
      }
      while (normalizedNewPoints.length < maxLength) {
        normalizedNewPoints.push({ ...newPoints[0] });
      }

      setPoints(normalizedNewPoints);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <svg
          className="w-full h-full opacity-50"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <GridLines />
          <BasketballElements />
          {points.map((point, index) => (
            <DataPoint
              key={index}
              {...point}
              delay={Math.random() * 2}
            />
          ))}
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              The Browser
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-[800px] mx-auto">
              Explore every stat, game, and highlight from Anthony Davis's career — reimagined with AI.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/game-logs">
              <Button size="lg" className="group">
                Explore Anthony Davis' Game Logs
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 