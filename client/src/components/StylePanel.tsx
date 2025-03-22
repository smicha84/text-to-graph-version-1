import { useState, useEffect } from 'react';
import { Node, Edge, NodeStyle, EdgeStyle } from '@/types/graph';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronUp, ChevronDown, Lock } from 'lucide-react';

interface StylePanelProps {
  element: Node | Edge | null;
  onStyleChange: (elementId: string, isNode: boolean, style: NodeStyle | EdgeStyle) => void;
  currentStyle: NodeStyle | EdgeStyle | null;
}

export default function StylePanel({ element, onStyleChange, currentStyle }: StylePanelProps) {
  const isNode = element ? 'type' in element : false;
  
  // Create local state for the style
  const [style, setStyle] = useState<NodeStyle | EdgeStyle>(
    currentStyle || (isNode ? { size: 20 } : { width: 1.5 })
  );
  
  // Collapse states
  const [basicCollapsed, setBasicCollapsed] = useState(false);
  const [advancedCollapsed, setAdvancedCollapsed] = useState(true);
  
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
  
  return (
    <div className="p-4 border-t border-gray-200">
      <h3 className="text-sm font-medium text-gray-800 mb-3">Visual Styling</h3>

      {/* Basic styling section */}
      <div className="mb-3 border border-gray-200 rounded-md">
        <button 
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100"
          onClick={() => setBasicCollapsed(!basicCollapsed)}
        >
          <span>Basic Styling</span>
          {basicCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
        
        {!basicCollapsed && (
          <div className="p-3 space-y-4">
            {/* Color control */}
            <div>
              <Label className="text-xs font-medium">{isNode ? 'Node Color' : 'Edge Color'}</Label>
              <div className="mt-1">
                <Input
                  type="color"
                  value={(style.color as string) || (isNode ? '#4f46e5' : '#9CA3AF')}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="h-8 w-full"
                />
              </div>
            </div>
            
            {/* Size control */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs font-medium">{isNode ? 'Size' : 'Width'}</Label>
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
                <Label className="text-xs font-medium">Pin Node Position</Label>
                <Switch
                  checked={(style as NodeStyle).pinned || false}
                  onCheckedChange={(checked) => handleStyleChange('pinned', checked)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Advanced styling section */}
      <div className="mb-3 border border-gray-200 rounded-md">
        <button 
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100"
          onClick={() => setAdvancedCollapsed(!advancedCollapsed)}
        >
          <span>Advanced Options</span>
          {advancedCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
        
        {!advancedCollapsed && (
          <div className="p-3 space-y-4">
            {/* Label formatting */}
            <div>
              <Label className="text-xs font-medium">Label Formatting</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label className="text-xs text-gray-500">Color</Label>
                  <Input
                    type="color"
                    value={(style.labelColor as string) || '#1F2937'}
                    onChange={(e) => handleStyleChange('labelColor', e.target.value)}
                    className="h-8 w-full mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Size</Label>
                  <Input
                    type="number"
                    value={style.labelSize || 12}
                    onChange={(e) => handleStyleChange('labelSize', Number(e.target.value))}
                    className="h-8 mt-1 text-xs"
                    min={8}
                    max={20}
                  />
                </div>
              </div>
            </div>
            
            {/* Node-specific controls */}
            {isNode && (
              <div>
                <Label className="text-xs font-medium">Border Style</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs text-gray-500">Color</Label>
                    <Input
                      type="color"
                      value={(style as NodeStyle).borderColor || '#000000'}
                      onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                      className="h-8 w-full mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Width</Label>
                    <Input
                      type="number"
                      value={(style as NodeStyle).borderWidth || 0}
                      onChange={(e) => handleStyleChange('borderWidth', Number(e.target.value))}
                      className="h-8 mt-1 text-xs"
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
                    className="h-8 mt-1 text-xs"
                    min={0}
                    max={10}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
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