import { useState, useEffect } from 'react';
import { Node, Edge, NodeStyle, EdgeStyle } from '@/types/graph';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PaintBucketIcon, TextIcon, ArrowsOutIcon, LockIcon } from 'lucide-react';

interface StylePanelProps {
  element: Node | Edge | null;
  onStyleChange: (elementId: string, isNode: boolean, style: NodeStyle | EdgeStyle) => void;
  currentStyle: NodeStyle | EdgeStyle | null;
}

const DEFAULT_COLORS = [
  "#4f46e5", // indigo-600
  "#0891b2", // cyan-600
  "#0d9488", // teal-600
  "#16a34a", // green-600
  "#ca8a04", // yellow-600
  "#ea580c", // orange-600
  "#dc2626", // red-600
  "#d946ef", // fuchsia-600
  "#c026d3", // purple-600
  "#7c3aed", // violet-600
  "#2563eb", // blue-600
  "#0284c7", // sky-600
  "#059669", // emerald-600
  "#65a30d", // lime-600
  "#e11d48", // rose-600
];

export default function StylePanel({ element, onStyleChange, currentStyle }: StylePanelProps) {
  const isNode = element ? 'type' in element : false;
  
  // Create local state for the style
  const [style, setStyle] = useState<NodeStyle | EdgeStyle>(
    currentStyle || (isNode ? { size: 20 } : { width: 1.5 })
  );
  
  // Update local state when currentStyle changes
  useEffect(() => {
    if (currentStyle) {
      setStyle(currentStyle);
    } else {
      // Reset to defaults if no current style
      setStyle(isNode ? { size: 20 } : { width: 1.5 });
    }
  }, [currentStyle, isNode]);
  
  if (!element) return null;
  
  // Handle style property changes
  const handleStyleChange = (property: string, value: any) => {
    const newStyle = { ...style, [property]: value };
    setStyle(newStyle);
    onStyleChange(element.id, isNode, newStyle);
  };
  
  // Handle color picker selection
  const handleColorPick = (property: 'color' | 'borderColor' | 'labelColor', color: string) => {
    handleStyleChange(property, color);
  };
  
  return (
    <div className="p-4 border-t border-gray-200">
      <h3 className="text-sm font-medium text-gray-800 mb-3">Visual Styling</h3>

      <Tabs defaultValue="basic">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          {/* Color picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium flex items-center">
                <PaintBucketIcon className="h-3 w-3 mr-1" />
                {isNode ? 'Node Color' : 'Edge Color'}
              </Label>
              <div className="flex items-center space-x-1">
                <Input
                  type="text"
                  value={(style.color as string) || ''}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="h-6 w-20 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1 mt-1">
              {DEFAULT_COLORS.slice(0, 10).map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full ${
                    style.color === color ? 'ring-2 ring-offset-1 ring-gray-600' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorPick('color', color)}
                />
              ))}
            </div>
          </div>
          
          {/* Size control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium flex items-center">
                <ArrowsOutIcon className="h-3 w-3 mr-1" />
                {isNode ? 'Size' : 'Width'}
              </Label>
              <span className="text-xs text-gray-500">
                {isNode ? (style as NodeStyle).size || 20 : (style as EdgeStyle).width || 1.5}
              </span>
            </div>
            <Slider
              value={[isNode ? (style as NodeStyle).size || 20 : (style as EdgeStyle).width || 1.5]}
              min={isNode ? 5 : 0.5}
              max={isNode ? 40 : 5}
              step={isNode ? 1 : 0.1}
              onValueChange={(value) => handleStyleChange(isNode ? 'size' : 'width', value[0])}
              className="w-full"
            />
          </div>
          
          {/* Pin control (only for nodes) */}
          {isNode && (
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium flex items-center">
                <LockClosedIcon className="h-3 w-3 mr-1" />
                Pin Node Position
              </Label>
              <Switch
                checked={(style as NodeStyle).pinned || false}
                onCheckedChange={(checked) => handleStyleChange('pinned', checked)}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          {/* Label formatting */}
          <div>
            <div className="flex items-center mb-2">
              <Label className="text-xs font-medium flex items-center">
                <TextIcon className="h-3 w-3 mr-1" />
                Label Formatting
              </Label>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-500">Color</Label>
                <div className="flex mt-1 space-x-1">
                  {DEFAULT_COLORS.slice(0, 5).map((color) => (
                    <button
                      key={color}
                      className={`w-4 h-4 rounded-full ${
                        style.labelColor === color ? 'ring-1 ring-offset-1 ring-gray-600' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorPick('labelColor', color)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Size</Label>
                <Input
                  type="number"
                  value={style.labelSize || 12}
                  onChange={(e) => handleStyleChange('labelSize', Number(e.target.value))}
                  className="h-6 mt-1 text-xs"
                  min={8}
                  max={20}
                />
              </div>
            </div>
          </div>
          
          {/* Node-specific controls */}
          {isNode && (
            <div>
              <div className="flex items-center mb-2">
                <Label className="text-xs font-medium">Border Style</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-gray-500">Color</Label>
                  <Input
                    type="text"
                    value={(style as NodeStyle).borderColor || ''}
                    onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                    className="h-6 mt-1 text-xs"
                    placeholder="#000000"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Width</Label>
                  <Input
                    type="number"
                    value={(style as NodeStyle).borderWidth || 0}
                    onChange={(e) => handleStyleChange('borderWidth', Number(e.target.value))}
                    className="h-6 mt-1 text-xs"
                    min={0}
                    max={5}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Edge-specific controls */}
          {!isNode && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium">Dashed Line</Label>
                <Switch
                  checked={(style as EdgeStyle).dashed || false}
                  onCheckedChange={(checked) => handleStyleChange('dashed', checked)}
                />
              </div>
              
              <div className="mt-2">
                <Label className="text-xs text-gray-500">Arrow Size</Label>
                <Input
                  type="number"
                  value={(style as EdgeStyle).arrowSize || 5}
                  onChange={(e) => handleStyleChange('arrowSize', Number(e.target.value))}
                  className="h-6 mt-1 text-xs"
                  min={0}
                  max={10}
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Separator className="my-4" />
      
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            const defaultStyle = isNode ? { size: 20 } : { width: 1.5 };
            setStyle(defaultStyle);
            onStyleChange(element.id, isNode, defaultStyle);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}