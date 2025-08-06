import { ColorRule } from './store';

export function applyColorRules(value: number, rules: ColorRule[]): string {
  // Sort rules by value for proper precedence
  const sortedRules = [...rules].sort((a, b) => a.value - b.value);
  
  for (const rule of sortedRules) {
    let matches = false;
    
    switch (rule.operator) {
      case '=':
        matches = value === rule.value;
        break;
      case '<':
        matches = value < rule.value;
        break;
      case '>':
        matches = value > rule.value;
        break;
      case '<=':
        matches = value <= rule.value;
        break;
      case '>=':
        matches = value >= rule.value;
        break;
    }
    
    if (matches) {
      return rule.color;
    }
  }
  
  // Default color if no rules match
  return '#94a3b8'; // slate-400
}

export function getDefaultColorRules(): ColorRule[] {
  return [
    { id: '1', operator: '<', value: 0, color: '#3b82f6' }, // blue-500 (cold)
    { id: '2', operator: '>=', value: 0, color: '#10b981' }, // emerald-500 (cool)
    { id: '3', operator: '>=', value: 15, color: '#f59e0b' }, // amber-500 (warm)
    { id: '4', operator: '>=', value: 25, color: '#ef4444' }, // red-500 (hot)
  ];
}

export function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const sum = max + min;
  
  const l = sum / 2;
  
  if (diff === 0) {
    return `hsl(0, 0%, ${Math.round(l * 100)}%)`;
  }
  
  const s = l > 0.5 ? diff / (2 - sum) : diff / sum;
  
  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / diff + 2) / 6;
      break;
    case b:
      h = ((r - g) / diff + 4) / 6;
      break;
    default:
      h = 0;
  }
  
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}