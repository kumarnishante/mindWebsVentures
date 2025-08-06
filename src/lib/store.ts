import { create } from 'zustand';
import { addDays, subDays, startOfDay, addHours } from 'date-fns';

export interface ColorRule {
  id: string;
  operator: '=' | '<' | '>' | '<=' | '>=';
  value: number;
  color: string;
}

export interface Polygon {
  id: string;
  name: string;
  coordinates: [number, number][];
  dataSource: string;
  colorRules: ColorRule[];
  currentColor?: string;
  currentValue?: number;
}

export interface TimelineState {
  mode: 'single' | 'range';
  selectedHour: Date;
  startHour?: Date;
  endHour?: Date;
}

export interface WeatherDataStore {
  // Timeline state
  timeline: TimelineState;
  setTimelineMode: (mode: 'single' | 'range') => void;
  setSelectedHour: (hour: Date) => void;
  setTimeRange: (start: Date, end: Date) => void;
  
  // Map state
  mapCenter: [number, number];
  setMapCenter: (center: [number, number]) => void;
  
  // Polygon state
  polygons: Polygon[];
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  addPolygon: (polygon: Omit<Polygon, 'id'>) => string;
  updatePolygon: (id: string, updates: Partial<Polygon>) => void;
  deletePolygon: (id: string) => void;
  
  // Data sources
  dataSources: string[];
  
  // Weather data cache
  weatherData: Record<string, any>;
  setWeatherData: (polygonId: string, data: any) => void;
  
  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const today = new Date();
const startOfToday = startOfDay(today);

export const useWeatherStore = create<WeatherDataStore>((set, get) => ({
  // Timeline state
  timeline: {
    mode: 'single',
    selectedHour: addHours(startOfToday, new Date().getHours()),
  },
  
  setTimelineMode: (mode) => set((state) => ({
    timeline: { ...state.timeline, mode }
  })),
  
  setSelectedHour: (hour) => set((state) => ({
    timeline: { ...state.timeline, selectedHour: hour }
  })),
  
  setTimeRange: (start, end) => set((state) => ({
    timeline: { ...state.timeline, startHour: start, endHour: end }
  })),
  
  // Map state
  mapCenter: [40.7128, -74.0060], // NYC default
  setMapCenter: (center) => set({ mapCenter: center }),
  
  // Polygon state
  polygons: [],
  isDrawing: false,
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),
  
  addPolygon: (polygon) => {
    const newPolygon = { ...polygon, id: Date.now().toString() };
    set((state) => ({
      polygons: [...state.polygons, newPolygon]
    }));
    return newPolygon.id;
  },
  
  updatePolygon: (id, updates) => set((state) => ({
    polygons: state.polygons.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  
  deletePolygon: (id) => set((state) => ({
    polygons: state.polygons.filter(p => p.id !== id)
  })),
  
  // Data sources
  dataSources: ['Open-Meteo'],
  
  // Weather data cache
  weatherData: {},
  setWeatherData: (polygonId, data) => set((state) => ({
    weatherData: { ...state.weatherData, [polygonId]: data }
  })),
  
  // UI state
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));