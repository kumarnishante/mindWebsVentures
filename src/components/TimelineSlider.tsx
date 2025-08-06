import React, { useState, useCallback, useMemo } from 'react';
import { addDays, subDays, startOfDay, addHours, format, isSameHour } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { Clock, Calendar } from 'lucide-react';
import { useWeatherStore } from '@/lib/store';

export function TimelineSlider() {
  const { timeline, setTimelineMode, setSelectedHour, setTimeRange } = useWeatherStore();
  
  // Generate 30-day timeline (15 days before/after today)
  const timelineData = useMemo(() => {
    const today = startOfDay(new Date());
    const start = subDays(today, 15);
    const end = addDays(today, 15);
    
    const hours = [];
    let current = start;
    
    while (current <= end) {
      hours.push(current);
      current = addHours(current, 1);
    }
    
    return hours;
  }, []);
  
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  
  const getTimelinePosition = (date: Date) => {
    const index = timelineData.findIndex(hour => isSameHour(hour, date));
    return (index / (timelineData.length - 1)) * 100;
  };
  
  const getDateFromPosition = (position: number) => {
    const index = Math.round((position / 100) * (timelineData.length - 1));
    return timelineData[Math.max(0, Math.min(index, timelineData.length - 1))];
  };
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    const date = getDateFromPosition(position);
    
    if (timeline.mode === 'single') {
      setSelectedHour(date);
    } else {
      setDragStart(position);
      setDragEnd(position);
      setTimeRange(date, date);
    }
  }, [timeline.mode, setSelectedHour, setTimeRange]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (timeline.mode === 'range' && dragStart !== null) {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = ((e.clientX - rect.left) / rect.width) * 100;
      setDragEnd(position);
      
      const startPos = Math.min(dragStart, position);
      const endPos = Math.max(dragStart, position);
      const startDate = getDateFromPosition(startPos);
      const endDate = getDateFromPosition(endPos);
      
      setTimeRange(startDate, endDate);
    }
  }, [timeline.mode, dragStart, setTimeRange]);
  
  const handleMouseUp = useCallback(() => {
    setDragStart(null);
    setDragEnd(null);
  }, []);
  
  const currentPosition = timeline.selectedHour ? getTimelinePosition(timeline.selectedHour) : 0;
  const rangeStartPos = timeline.startHour ? getTimelinePosition(timeline.startHour) : 0;
  const rangeEndPos = timeline.endHour ? getTimelinePosition(timeline.endHour) : 0;
  
  return (
    <Card className="p-6 bg-gradient-surface border-glass backdrop-blur-sm shadow-glass">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Timeline Control</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <Toggle
              pressed={timeline.mode === 'single'}
              onPressedChange={() => setTimelineMode('single')}
              variant="outline"
              size="sm"
            >
              Single
            </Toggle>
            <Toggle
              pressed={timeline.mode === 'range'}
              onPressedChange={() => setTimelineMode('range')}
              variant="outline"
              size="sm"
            >
              Range
            </Toggle>
          </div>
        </div>
        
        {/* Current selection display */}
        <div className="text-sm text-muted-foreground">
          {timeline.mode === 'single' && timeline.selectedHour && (
            <span>Selected: {format(timeline.selectedHour, 'MMM dd, yyyy HH:mm')}</span>
          )}
          {timeline.mode === 'range' && timeline.startHour && timeline.endHour && (
            <span>
              Range: {format(timeline.startHour, 'MMM dd HH:mm')} - {format(timeline.endHour, 'MMM dd HH:mm')}
            </span>
          )}
        </div>
        
        {/* Timeline slider */}
        <div className="relative">
          {/* Track */}
          <div
            className="relative h-3 bg-muted rounded-full cursor-pointer transition-smooth"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Range highlight */}
            {timeline.mode === 'range' && timeline.startHour && timeline.endHour && (
              <div
                className="absolute h-full bg-primary/30 rounded-full transition-smooth"
                style={{
                  left: `${Math.min(rangeStartPos, rangeEndPos)}%`,
                  width: `${Math.abs(rangeEndPos - rangeStartPos)}%`,
                }}
              />
            )}
            
            {/* Single position thumb */}
            {timeline.mode === 'single' && (
              <div
                className="absolute top-1/2 w-6 h-6 bg-primary border-2 border-background rounded-full shadow-elevation transform -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing transition-spring hover:scale-110"
                style={{ left: `${currentPosition}%` }}
              />
            )}
            
            {/* Range thumbs */}
            {timeline.mode === 'range' && (
              <>
                <div
                  className="absolute top-1/2 w-6 h-6 bg-primary border-2 border-background rounded-full shadow-elevation transform -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing transition-spring hover:scale-110"
                  style={{ left: `${rangeStartPos}%` }}
                />
                <div
                  className="absolute top-1/2 w-6 h-6 bg-primary border-2 border-background rounded-full shadow-elevation transform -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing transition-spring hover:scale-110"
                  style={{ left: `${rangeEndPos}%` }}
                />
              </>
            )}
          </div>
          
          {/* Time markers */}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{format(timelineData[0], 'MMM dd')}</span>
            <span>{format(new Date(), 'MMM dd')} (Today)</span>
            <span>{format(timelineData[timelineData.length - 1], 'MMM dd')}</span>
          </div>
        </div>
        
        {/* Quick time buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedHour(addHours(startOfDay(new Date()), new Date().getHours()))}
          >
            Now
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedHour(addHours(startOfDay(new Date()), 12))}
          >
            Today Noon
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedHour(startOfDay(subDays(new Date(), 1)))}
          >
            Yesterday
          </Button>
        </div>
      </div>
    </Card>
  );
}