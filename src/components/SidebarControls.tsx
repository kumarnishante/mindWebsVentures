import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, Settings, Palette, Eye, EyeOff } from 'lucide-react';
import { useWeatherStore } from '@/lib/store';
import { ColorRule } from '@/lib/store';

export function SidebarControls() {
  const {
    polygons,
    updatePolygon,
    deletePolygon,
    dataSources,
    sidebarOpen,
    setSidebarOpen
  } = useWeatherStore();
  
  const [editingRule, setEditingRule] = useState<{ polygonId: string; ruleId: string } | null>(null);
  const [newRuleColor, setNewRuleColor] = useState('#3b82f6');

  const addColorRule = (polygonId: string) => {
    const polygon = polygons.find(p => p.id === polygonId);
    if (!polygon) return;

    const newRule: ColorRule = {
      id: Date.now().toString(),
      operator: '>',
      value: 20,
      color: newRuleColor
    };

    updatePolygon(polygonId, {
      colorRules: [...polygon.colorRules, newRule]
    });
  };

  const updateColorRule = (polygonId: string, ruleId: string, updates: Partial<ColorRule>) => {
    const polygon = polygons.find(p => p.id === polygonId);
    if (!polygon) return;

    const updatedRules = polygon.colorRules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );

    updatePolygon(polygonId, { colorRules: updatedRules });
  };

  const deleteColorRule = (polygonId: string, ruleId: string) => {
    const polygon = polygons.find(p => p.id === polygonId);
    if (!polygon) return;

    const updatedRules = polygon.colorRules.filter(rule => rule.id !== ruleId);
    updatePolygon(polygonId, { colorRules: updatedRules });
  };

  if (!sidebarOpen) {
    return (
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-10">
        <Button
          onClick={() => setSidebarOpen(true)}
          size="sm"
          className="rounded-full w-12 h-12 shadow-elevation"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-glass bg-gradient-surface backdrop-blur-sm">
      <div className="p-4 border-b border-glass bg-glass backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Controls</h2>
          <Button
            onClick={() => setSidebarOpen(false)}
            variant="ghost"
            size="sm"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-4 space-y-4">
          {polygons.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Draw polygons on the map to configure data sources and color rules.
                </p>
              </CardContent>
            </Card>
          ) : (
            polygons.map((polygon) => (
              <Card key={polygon.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{polygon.name}</CardTitle>
                    <Button
                      onClick={() => deletePolygon(polygon.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Current value display */}
                  {polygon.currentValue !== undefined && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: polygon.currentColor }}
                      />
                      <span className="text-sm font-medium">
                        {polygon.currentValue.toFixed(1)}°C
                      </span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Data source selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Source</label>
                    <Select
                      value={polygon.dataSource}
                      onValueChange={(value) => updatePolygon(polygon.id, { dataSource: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dataSources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Color rules */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Color Rules</label>
                      <Button
                        onClick={() => addColorRule(polygon.id)}
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {polygon.colorRules.map((rule) => (
                        <div key={rule.id} className="flex items-center gap-2 p-2 border border-border rounded-md">
                          {/* Operator */}
                          <Select
                            value={rule.operator}
                            onValueChange={(value) => 
                              updateColorRule(polygon.id, rule.id, { operator: value as ColorRule['operator'] })
                            }
                          >
                            <SelectTrigger className="w-16">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="=">=</SelectItem>
                              <SelectItem value="<">&lt;</SelectItem>
                              <SelectItem value=">">&gt;</SelectItem>
                              <SelectItem value="<=">&le;</SelectItem>
                              <SelectItem value=">=">&ge;</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Value */}
                          <Input
                            type="number"
                            value={rule.value}
                            onChange={(e) => 
                              updateColorRule(polygon.id, rule.id, { value: Number(e.target.value) })
                            }
                            className="w-16"
                          />

                          {/* Color picker */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-8 h-8 p-0"
                                style={{ backgroundColor: rule.color }}
                              >
                                <span className="sr-only">Pick color</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3">
                              <HexColorPicker
                                color={rule.color}
                                onChange={(color) => 
                                  updateColorRule(polygon.id, rule.id, { color })
                                }
                              />
                            </PopoverContent>
                          </Popover>

                          {/* Delete rule */}
                          <Button
                            onClick={() => deleteColorRule(polygon.id, rule.id)}
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {polygon.colorRules.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No color rules defined
                      </p>
                    )}
                  </div>

                  {/* Polygon info */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Points: {polygon.coordinates.length}</div>
                    <div>
                      Center: {polygon.coordinates.length > 0 && (
                        `${(polygon.coordinates.reduce((sum, coord) => sum + coord[0], 0) / polygon.coordinates.length).toFixed(4)}, ${(polygon.coordinates.reduce((sum, coord) => sum + coord[1], 0) / polygon.coordinates.length).toFixed(4)}`
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Legend */}
          {polygons.some(p => p.colorRules.length > 0) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Temperature Legend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-weather-cold" />
                    <span>Cold (&lt; 0°C)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-weather-cool" />
                    <span>Cool (0-15°C)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-weather-warm" />
                    <span>Warm (15-25°C)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-weather-hot" />
                    <span>Hot (&gt; 25°C)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}