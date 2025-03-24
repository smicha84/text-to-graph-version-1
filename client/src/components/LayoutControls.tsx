import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, RotateCw } from "lucide-react";

export interface LayoutSettings {
  nodeRepulsion: number;
  linkDistance: number;
  centerStrength: number;
  collisionRadius: number;
}

interface LayoutControlsProps {
  onSettingsChange: (settings: LayoutSettings) => void;
  onRestart: () => void;
  isLoading: boolean;
}

const DEFAULT_SETTINGS: LayoutSettings = {
  nodeRepulsion: 400,     // Reduced from 500 to avoid excessive repulsion
  linkDistance: 200,      // Increased from 120 to 200 for more spacing between linked nodes
  centerStrength: 0.08,   // Increased from 0.03 for stronger pull to center (prevents drift)
  collisionRadius: 40     // Adequate spacing while allowing tighter formation
};

export default function LayoutControls({ 
  onSettingsChange, 
  onRestart,
  isLoading
}: LayoutControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<LayoutSettings>(DEFAULT_SETTINGS);

  const handleSettingChange = (key: keyof LayoutSettings, value: number[]) => {
    const newSettings = {
      ...settings,
      [key]: value[0]
    };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    onSettingsChange(DEFAULT_SETTINGS);
  };

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="flex flex-row items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
            <CardTitle className="text-sm font-medium">Layout Controls</CardTitle>
            <div>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="p-4 pt-0 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="nodeRepulsion" className="text-xs">Node Repulsion</Label>
                <span className="text-xs text-gray-500">{settings.nodeRepulsion}</span>
              </div>
              <Slider 
                id="nodeRepulsion"
                min={100} 
                max={1500} 
                step={50} 
                value={[settings.nodeRepulsion]} 
                onValueChange={(value) => handleSettingChange('nodeRepulsion', value)}
              />
              <p className="text-xs text-gray-500">Controls how strongly nodes push each other apart</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="linkDistance" className="text-xs">Link Distance</Label>
                <span className="text-xs text-gray-500">{settings.linkDistance}</span>
              </div>
              <Slider 
                id="linkDistance"
                min={50} 
                max={300} 
                step={10}
                value={[settings.linkDistance]} 
                onValueChange={(value) => handleSettingChange('linkDistance', value)}
              />
              <p className="text-xs text-gray-500">Controls the ideal distance between connected nodes</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="centerStrength" className="text-xs">Center Gravity</Label>
                <span className="text-xs text-gray-500">{settings.centerStrength.toFixed(3)}</span>
              </div>
              <Slider 
                id="centerStrength"
                min={0} 
                max={0.1} 
                step={0.005}
                value={[settings.centerStrength]} 
                onValueChange={(value) => handleSettingChange('centerStrength', value)}
              />
              <p className="text-xs text-gray-500">Controls how strongly nodes are pulled toward the center</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="collisionRadius" className="text-xs">Collision Radius</Label>
                <span className="text-xs text-gray-500">{settings.collisionRadius}</span>
              </div>
              <Slider 
                id="collisionRadius"
                min={25} 
                max={100} 
                step={5}
                value={[settings.collisionRadius]} 
                onValueChange={(value) => handleSettingChange('collisionRadius', value)}
              />
              <p className="text-xs text-gray-500">Controls the minimum space between nodes</p>
            </div>

            <div className="flex justify-between pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetSettings}
              >
                Reset Defaults
              </Button>
              <Button 
                variant="default"
                size="sm"
                onClick={onRestart}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <RotateCw size={14} />
                Restart Simulation
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}