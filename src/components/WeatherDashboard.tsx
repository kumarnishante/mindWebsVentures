import React, { useEffect } from 'react';
import { TimelineSlider } from './TimelineSlider';
import { MapViewer } from './MapViewer';
import { SidebarControls } from './SidebarControls';
import { useWeatherStore } from '@/lib/store';
import { fetchWeatherData, calculatePolygonCenter, getTemperatureAtTime, getAverageTemperatureInRange } from '@/lib/weather-api';
import { applyColorRules } from '@/lib/color-utils';

export function WeatherDashboard() {
  const {
    polygons,
    timeline,
    updatePolygon,
    setWeatherData,
    weatherData
  } = useWeatherStore();

  // Update polygon colors when timeline changes
  useEffect(() => {
    const updatePolygonColors = async () => {
      for (const polygon of polygons) {
        const center = calculatePolygonCenter(polygon.coordinates);
        
        try {
          // Determine date range for API call
          let startDate = timeline.selectedHour;
          let endDate = timeline.selectedHour;
          
          if (timeline.mode === 'range' && timeline.startHour && timeline.endHour) {
            startDate = timeline.startHour;
            endDate = timeline.endHour;
          }
          
          // Fetch weather data
          const data = await fetchWeatherData(center[0], center[1], startDate, endDate);
          setWeatherData(polygon.id, data);
          
          // Calculate temperature value
          let temperature: number | null = null;
          if (timeline.mode === 'single') {
            temperature = getTemperatureAtTime(data, timeline.selectedHour);
          } else if (timeline.startHour && timeline.endHour) {
            temperature = getAverageTemperatureInRange(data, timeline.startHour, timeline.endHour);
          }
          
          // Apply color rules if we have a valid temperature
          if (temperature !== null && polygon.colorRules.length > 0) {
            const color = applyColorRules(temperature, polygon.colorRules);
            updatePolygon(polygon.id, { 
              currentColor: color, 
              currentValue: temperature 
            });
          }
        } catch (error) {
          console.error(`Failed to fetch weather data for polygon ${polygon.id}:`, error);
          // Set a default color on error
          updatePolygon(polygon.id, { 
            currentColor: '#94a3b8',
            currentValue: undefined
          });
        }
      }
    };

    if (polygons.length > 0) {
      updatePolygonColors();
    }
  }, [timeline.selectedHour, timeline.startHour, timeline.endHour, timeline.mode, polygons.length]); // Only re-run when timeline or polygon count changes

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-glass bg-gradient-surface backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Weather Data Visualization
              </h1>
              <p className="text-muted-foreground mt-1">
                Interactive weather monitoring with temporal analysis
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {polygons.length} polygon{polygons.length !== 1 ? 's' : ''} active
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex">
        {/* Main dashboard area */}
        <div className="flex-1 p-4 space-y-4">
          {/* Timeline slider */}
          <TimelineSlider />
          
          {/* Map viewer */}
          <MapViewer />
        </div>
        
        {/* Sidebar */}
        <SidebarControls />
      </div>
    </div>
  );
}