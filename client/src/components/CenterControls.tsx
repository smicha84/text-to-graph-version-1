import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export interface CenterPoint {
  x: number;
  y: number;
}

interface CenterControlsProps {
  defaultCenter: CenterPoint;
  onCenterChange: (center: CenterPoint) => void;
}

export default function CenterControls({ defaultCenter, onCenterChange }: CenterControlsProps) {
  const [centerX, setCenterX] = useState(defaultCenter.x.toString());
  const [centerY, setCenterY] = useState(defaultCenter.y.toString());
  
  const handleApply = () => {
    const x = parseInt(centerX);
    const y = parseInt(centerY);
    
    if (!isNaN(x) && !isNaN(y)) {
      onCenterChange({ x, y });
    }
  };
  
  return (
    <div className="p-4 border rounded-md mb-4 bg-white">
      <h3 className="text-md font-medium mb-3">Custom Center Point</h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <Label htmlFor="center-x">Center X</Label>
          <Input 
            id="center-x"
            type="number" 
            value={centerX} 
            onChange={(e) => setCenterX(e.target.value)}
            placeholder="X coordinate" 
          />
        </div>
        <div>
          <Label htmlFor="center-y">Center Y</Label>
          <Input 
            id="center-y"
            type="number" 
            value={centerY} 
            onChange={(e) => setCenterY(e.target.value)}
            placeholder="Y coordinate" 
          />
        </div>
      </div>
      <Button onClick={handleApply} className="w-full">
        Apply Center Point
      </Button>
    </div>
  );
}