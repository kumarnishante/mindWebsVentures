export const WEATHER_CONFIG = {
  API_BASE_URL: 'https://archive-api.open-meteo.com/v1/archive',
  DEFAULT_TIMEZONE: 'auto',
  MAX_POLYGON_POINTS: 12,
  MIN_POLYGON_POINTS: 3,
  MAP_ZOOM_LEVELS: {
    MIN: 12,
    MAX: 16,
    DEFAULT: 14
  }
};

export const DATA_SOURCES = [
  'Open-Meteo',
  // Add more data sources here in the future
];

export const TEMPERATURE_THRESHOLDS = {
  COLD: 0,
  COOL: 15,
  WARM: 25,
  HOT: 35
};

export const DEFAULT_MAP_CENTER: [number, number] = [40.7128, -74.0060]; // NYC

export const TIMELINE_CONFIG = {
  DAYS_BEFORE: 15,
  DAYS_AFTER: 15,
  TOTAL_HOURS: 30 * 24, // 30 days * 24 hours
};