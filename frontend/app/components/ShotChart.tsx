'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import { useTheme } from 'next-themes';

// Dynamically import the entire Konva Stage component
const Stage = dynamic(() => import('react-konva').then((mod) => mod.Stage), {
  ssr: false,
  loading: () => <div>Loading shot chart...</div>
});

// Import other Konva components normally since they'll only be used after Stage loads
import { Layer, Image as KonvaImage, Circle, Group, Text, Tag, Label } from 'react-konva';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Shot {
  x: number;
  y: number;
  shot_type: 'make' | 'miss';
  quarter: string;
  time_remaining: string;
  shot_description: string;
  score_situation: string;
  distance: number;
}

interface ShotChartProps {
  gameDate: string;
  width?: number;
  height?: number;
}

const ShotChart = ({ gameDate, width = 500, height = 470 }: ShotChartProps) => {
  const [shots, setShots] = useState<Shot[]>([]);
  const [courtImage, setCourtImage] = useState<HTMLImageElement | null>(null);
  const [hoveredShot, setHoveredShot] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();

  // Load court image
  useEffect(() => {
    const image = new Image();
    if (resolvedTheme === 'dark') {
      image.src = '/THEBROWSER-COURT-BLACK.png';
    } else {
      image.src = '/THEBROWSER-COURT-WHITE.png';
    }
    image.onload = () => setCourtImage(image);
  }, [resolvedTheme]);

  // Fetch shots data
  useEffect(() => {
    const fetchShots = async () => {
      try {
        const { data, error } = await supabase
          .from('shots')
          .select('x, y, shot_type, quarter, time_remaining, shot_description, score_situation, distance')
          .eq('game_date', gameDate);

        if (error) throw error;
        setShots(data || []);
      } catch (error) {
        console.error('Error fetching shots:', error);
      }
    };

    if (gameDate) {
      fetchShots();
    }
  }, [gameDate]);

  // Transform coordinates to match court dimensions
  const transformCoordinates = (shot: Shot) => ({
    x: shot.x * (width / 500),
    y: shot.y * (height / 470)
  });

  // Calculate tooltip position to ensure it stays within bounds
  const getTooltipPosition = (x: number, y: number) => {
    const tooltipWidth = 220;
    const tooltipHeight = 100;
    const padding = 20;
    const pointerOffset = 15; // Consistent offset for the pointer

    // Always try to position tooltip above the point first
    let tooltipY = y - tooltipHeight - pointerOffset;
    let pointerDirection = 'bottom';

    // If tooltip would go above the chart, position it below the point
    if (tooltipY < padding) {
      tooltipY = y + pointerOffset;
      pointerDirection = 'top';
    }

    // Center the tooltip horizontally relative to the point
    let tooltipX = x - (tooltipWidth / 2);

    // Ensure tooltip stays within horizontal bounds
    if (tooltipX < padding) {
      tooltipX = padding;
    } else if (tooltipX + tooltipWidth > width - padding) {
      tooltipX = width - tooltipWidth - padding;
    }

    return { x: tooltipX, y: tooltipY, pointerDirection };
  };

  if (!courtImage) {
    return <div>Loading court...</div>;
  }

  return (
    <div className="relative" style={{ width, height }}>
      <Stage width={width} height={height}>
        {/* Background Layer */}
        <Layer>
          <KonvaImage
            image={courtImage}
            width={width}
            height={height}
          />
          {shots.map((shot, i) => {
            const { x, y } = transformCoordinates(shot);
            const isHovered = hoveredShot === i;
            
            return (
              <Circle
                key={i}
                x={x}
                y={y}
                radius={isHovered ? 7 : 5}
                fill={shot.shot_type === 'make' ? '#4CAF50' : '#F44336'}
                stroke="#000"
                strokeWidth={1}
                onMouseEnter={() => setHoveredShot(i)}
                onMouseLeave={() => setHoveredShot(null)}
              />
            );
          })}
        </Layer>

        {/* Tooltip Layer */}
        <Layer>
          {hoveredShot !== null && shots[hoveredShot] && (() => {
            const shot = shots[hoveredShot];
            const { x, y } = transformCoordinates(shot);
            const { x: tooltipX, y: tooltipY, pointerDirection } = getTooltipPosition(x, y);

            return (
              <Label
                x={tooltipX}
                y={tooltipY}
              >
                <Tag
                  fill="rgba(0, 0, 0, 0.85)"
                  cornerRadius={6}
                  pointerDirection={pointerDirection}
                  pointerWidth={15}
                  pointerHeight={15}
                  lineJoin="round"
                  shadowColor="black"
                  shadowBlur={10}
                  shadowOpacity={0.2}
                  shadowOffset={{ x: 2, y: 2 }}
                  pointerAtEnds={true}
                />
                <Text
                  text={`${shot.quarter} - ${shot.time_remaining}\n${shot.shot_description}\n${shot.score_situation}\nDistance: ${shot.distance} ft`}
                  padding={12}
                  fill="white"
                  fontSize={13}
                  fontFamily="system-ui"
                  lineHeight={1.4}
                  align="center"
                />
              </Label>
            );
          })()}
        </Layer>
      </Stage>
    </div>
  );
};

export default ShotChart; 