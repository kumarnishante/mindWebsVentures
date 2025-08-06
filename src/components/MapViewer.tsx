import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PenTool } from 'lucide-react';
import { useWeatherStore } from '@/lib/store';
import { fetchWeatherData, calculatePolygonCenter, getTemperatureAtTime, getAverageTemperatureInRange } from '@/lib/weather-api';
import { applyColorRules, getDefaultColorRules } from '@/lib/color-utils';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// MapViewer component using Leaflet instead of Mapbox
export function MapViewer() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const polygonLayers = useRef<L.Polygon[]>([]);
  const drawingMarkers = useRef<L.CircleMarker[]>([]);
  const drawingPolyline = useRef<L.Polyline | null>(null);
  
  const {
    mapCenter,
    setMapCenter,
    polygons,
    isDrawing,
    setIsDrawing,
    addPolygon,
    updatePolygon,
    timeline,
    dataSources,
    setWeatherData
  } = useWeatherStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = L.map(mapContainer.current, {
      center: [mapCenter[0], mapCenter[1]],
      zoom: 14,
      minZoom: 12,
      maxZoom: 16,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Handle map move
    map.current.on('moveend', () => {
      if (map.current) {
        const center = map.current.getCenter();
        setMapCenter([center.lat, center.lng]);
      }
    });

    // Handle drawing clicks
    map.current.on('click', (e: L.LeafletMouseEvent) => {
      console.log('Map clicked, isDrawing:', isDrawing, 'coordinates:', e.latlng);
      if (!isDrawing) return;
      
      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
      const updatedPoints = [...drawingPoints, newPoint];
      setDrawingPoints(updatedPoints);
      
      // Complete polygon if we have 3+ points and click near the first point
      if (updatedPoints.length >= 3) {
        const firstPoint = updatedPoints[0];
        const distance = Math.sqrt(
          Math.pow(newPoint[0] - firstPoint[0], 2) + 
          Math.pow(newPoint[1] - firstPoint[1], 2)
        );
        
        if (distance < 0.001 || updatedPoints.length >= 12) {
          completePolygon(updatedPoints);
        }
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [mapCenter, isDrawing]);

  // Update polygons on map
  useEffect(() => {
    if (!map.current) return;

    // Remove existing polygon layers
    polygonLayers.current.forEach(layer => {
      map.current?.removeLayer(layer);
    });
    polygonLayers.current = [];

    // Add polygons
    polygons.forEach(polygon => {
      const leafletPolygon = L.polygon(
        polygon.coordinates.map(coord => [coord[0], coord[1]]), 
        {
          fillColor: polygon.currentColor || '#94a3b8',
          color: polygon.currentColor || '#94a3b8',
          fillOpacity: 0.6,
          opacity: 0.8,
          weight: 2
        }
      );

      leafletPolygon.bindPopup(`
        <div class="p-2">
          <h4 class="font-semibold">${polygon.name}</h4>
          ${polygon.currentValue !== undefined ? `<p>Temperature: ${polygon.currentValue.toFixed(1)}°C</p>` : ''}
        </div>
      `);

      leafletPolygon.addTo(map.current!);
      polygonLayers.current.push(leafletPolygon);
    });
  }, [polygons]);

  // Update drawing points visualization
  useEffect(() => {
    if (!map.current) return;

    // Remove existing drawing markers and polyline
    drawingMarkers.current.forEach(marker => {
      map.current?.removeLayer(marker);
    });
    drawingMarkers.current = [];

    if (drawingPolyline.current) {
      map.current.removeLayer(drawingPolyline.current);
      drawingPolyline.current = null;
    }

    if (drawingPoints.length === 0) return;

    // Add drawing points as markers
    drawingPoints.forEach((point, index) => {
      const marker = L.circleMarker([point[0], point[1]], {
        radius: 6,
        fillColor: '#3b82f6',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1
      });
      
      marker.addTo(map.current!);
      drawingMarkers.current.push(marker);
    });

    // Add line between points if we have 2 or more
    if (drawingPoints.length >= 2) {
      drawingPolyline.current = L.polyline(
        drawingPoints.map(point => [point[0], point[1]]),
        {
          color: '#3b82f6',
          weight: 2,
          dashArray: '5, 5'
        }
      );
      
      drawingPolyline.current.addTo(map.current!);
    }
  }, [drawingPoints]);

  const startDrawing = () => {
    setIsDrawing(true);
    setDrawingPoints([]);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setDrawingPoints([]);
    
    // Clean up drawing layers
    drawingMarkers.current.forEach(marker => {
      map.current?.removeLayer(marker);
    });
    drawingMarkers.current = [];

    if (drawingPolyline.current) {
      map.current?.removeLayer(drawingPolyline.current);
      drawingPolyline.current = null;
    }
  };

  const completePolygon = async (points: [number, number][]) => {
    console.log('Completing polygon with points:', points);
    if (points.length < 3) return;

    const polygonName = `Polygon ${polygons.length + 1}`;
    const defaultDataSource = dataSources[0];
    
    // Create polygon with default color rules
    const newPolygon = {
      name: polygonName,
      coordinates: points,
      dataSource: defaultDataSource,
      colorRules: getDefaultColorRules()
    };
    
    const polygonId = addPolygon(newPolygon);
    console.log('Added polygon with ID:', polygonId);
    
    // Fetch initial weather data
    const center = calculatePolygonCenter(points);
    try {
      const data = await fetchWeatherData(
        center[0], 
        center[1], 
        timeline.selectedHour, 
        timeline.selectedHour
      );
      
      setWeatherData(polygonId, data);
      
      // Apply color based on current temperature
      let temperature: number | null = null;
      if (timeline.mode === 'single') {
        temperature = getTemperatureAtTime(data, timeline.selectedHour);
      } else if (timeline.startHour && timeline.endHour) {
        temperature = getAverageTemperatureInRange(data, timeline.startHour, timeline.endHour);
      }
      
      if (temperature !== null) {
        const color = applyColorRules(temperature, newPolygon.colorRules);
        updatePolygon(polygonId, { currentColor: color, currentValue: temperature });
      }
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    }
    
    setIsDrawing(false);
    setDrawingPoints([]);
    cancelDrawing();
  };

  return (
    <Card className="overflow-hidden bg-gradient-surface border-glass backdrop-blur-sm shadow-glass">
      {/* Map controls */}
      <div className="p-4 border-b border-glass bg-glass backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Interactive Map</h3>
          <div className="flex items-center gap-2">
            {!isDrawing ? (
              <Button onClick={startDrawing} size="sm" className="gap-2">
                <PenTool className="h-4 w-4" />
                Draw Polygon
              </Button>
            ) : (
              <>
                <Button onClick={cancelDrawing} variant="outline" size="sm">
                  Cancel
                </Button>
                <span className="text-sm text-muted-foreground">
                  Click {drawingPoints.length < 3 ? `${3 - drawingPoints.length} more` : 'near start'} to complete
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Map container */}
      <div className="relative">
        <div ref={mapContainer} className={`h-96 w-full ${isDrawing ? 'cursor-crosshair' : ''}`} />
        
        {/* Polygon count indicator */}
        {polygons.length > 0 && (
          <div className="absolute top-4 left-4 bg-glass backdrop-blur-sm border border-glass rounded-lg px-3 py-2">
            <span className="text-sm font-medium">
              {polygons.length} polygon{polygons.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}