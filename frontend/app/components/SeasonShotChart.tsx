'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Label, Text, Tag } from 'react-konva';

const Stage = dynamic(() => import('react-konva').then((mod) => mod.Stage), {
  ssr: false,
  loading: () => <div>Loading shot chart...</div>
});
import { Layer, Image as KonvaImage, Circle } from 'react-konva';

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
  game_date: string;
}

interface SeasonShotChartProps {
  gameDates: string[];
  seasonLabel: string;
  opponent?: string;
  width?: number;
  height?: number;
}

const SeasonShotChart = ({ gameDates, seasonLabel, opponent, width = 600, height = 470 }: SeasonShotChartProps) => {
  const [shots, setShots] = useState<Shot[]>([]);
  const [courtImage, setCourtImage] = useState<HTMLImageElement | null>(null);
  const { resolvedTheme } = useTheme();
  const [hoveredShot, setHoveredShot] = useState<number | null>(null);

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

  // Fetch all shots for the season
  useEffect(() => {
    if (!seasonLabel || !gameDates.length) {
      setShots([]);
      return;
    }

    const fetchShots = async () => {
      try {
        const { data, error } = await supabase
          .from('shots')
          .select('x, y, shot_type, quarter, time_remaining, shot_description, score_situation, distance, game_date')
          .in('game_date', gameDates);

        if (error) throw error;
        setShots(data || []);
      } catch (error) {
        console.error('Error fetching season shots:', error);
        setShots([]);
      }
    };
    fetchShots();
  }, [seasonLabel, gameDates]);

  // Transform coordinates to match court dimensions
  const transformCoordinates = (shot: Shot) => ({
    x: shot.x * (width / 500),
    y: shot.y * (height / 470)
  });

  if (!courtImage) {
    return <div>Loading court...</div>;
  }

  return (
    <div className="relative" style={{ width, height }}>
      <Stage width={width} height={height}>
        <Layer>
          <KonvaImage image={courtImage} width={width} height={height} />
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
                opacity={1}
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
            // Tooltip positioning logic (same as ShotChart)
            const tooltipWidth = 220;
            const tooltipHeight = 100;
            const padding = 20;
            const pointerOffset = 15;
            let tooltipY = y - tooltipHeight - pointerOffset;
            let pointerDirection = 'bottom';
            if (tooltipY < padding) {
              tooltipY = y + pointerOffset;
              pointerDirection = 'top';
            }
            let tooltipX = x - (tooltipWidth / 2);
            if (tooltipX < padding) {
              tooltipX = padding;
            } else if (tooltipX + tooltipWidth > width - padding) {
              tooltipX = width - tooltipWidth - padding;
            }
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

export default SeasonShotChart; 