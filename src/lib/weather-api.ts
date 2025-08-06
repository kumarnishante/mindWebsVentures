import { format } from 'date-fns';

export interface WeatherData {
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  startDate: Date,
  endDate: Date
): Promise<WeatherData> {
  const baseUrl = 'https://archive-api.open-meteo.com/v1/archive';
  
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
    hourly: 'temperature_2m',
    timezone: 'auto'
  });

  const response = await fetch(`${baseUrl}?${params}`);
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }
  
  return response.json();
}

export function calculatePolygonCenter(coordinates: [number, number][]): [number, number] {
  const sumLat = coordinates.reduce((sum, [lat]) => sum + lat, 0);
  const sumLng = coordinates.reduce((sum, [, lng]) => sum + lng, 0);
  
  return [sumLat / coordinates.length, sumLng / coordinates.length];
}

export function getTemperatureAtTime(data: WeatherData, targetTime: Date): number | null {
  const targetTimeStr = targetTime.toISOString();
  const index = data.hourly.time.findIndex(time => 
    new Date(time).getTime() === targetTime.getTime()
  );
  
  if (index === -1) return null;
  return data.hourly.temperature_2m[index];
}

export function getAverageTemperatureInRange(
  data: WeatherData, 
  startTime: Date, 
  endTime: Date
): number | null {
  const temperatures = data.hourly.time
    .map((time, index) => ({ time: new Date(time), temp: data.hourly.temperature_2m[index] }))
    .filter(({ time }) => time >= startTime && time <= endTime)
    .map(({ temp }) => temp);
  
  if (temperatures.length === 0) return null;
  
  return temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
}