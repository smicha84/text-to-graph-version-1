import React, { useState } from 'react';
import { Edit2, Move, Save } from 'lucide-react';

/**
 * UICustomizationDemo component demonstrates how the global UI element customization
 * would work in practice, with draggable/resizable UI elements.
 */

type PanelId = 'panel1' | 'panel2' | 'panel3';

interface PanelPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

type PanelPositions = Record<PanelId, PanelPosition>;

export default function UICustomizationDemo() {
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<PanelId | null>(null);
  
  // Track custom positions for each element
  const [positions, setPositions] = useState<PanelPositions>({
    'panel1': { x: 0, y: 0, width: 100, height: 100 },
    'panel2': { x: 0, y: 0, width: 100, height: 100 },
    'panel3': { x: 0, y: 0, width: 100, height: 100 },
  });
  
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSelectedElement(null);
  };
  
  const selectElement = (id: PanelId) => {
    if (editMode) {
      setSelectedElement(id === selectedElement ? null : id);
    }
  };
  
  const handleResize = (id: PanelId, change: { width?: number, height?: number }) => {
    if (!editMode) return;
    
    setPositions(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        width: Math.max(50, prev[id].width + (change.width || 0)),
        height: Math.max(50, prev[id].height + (change.height || 0))
      }
    }));
  };
  
  // Panel content helpers
  const getPanelTitle = (id: PanelId): string => {
    switch(id) {
      case 'panel1': return 'Graph Panel';
      case 'panel2': return 'Controls';
      case 'panel3': return 'Properties';
    }
  };
  
  const getPanelDescription = (id: PanelId): string => {
    switch(id) {
      case 'panel1': return 'Main visualization area for the graph.';
      case 'panel2': return 'Tools and controls for manipulating the graph.';
      case 'panel3': return 'Property inspector for selected elements.';
    }
  };
  
  return (
    <div className="p-4 border rounded-lg bg-gray-50 relative">
      {/* Edit Mode Toggle */}
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        <button
          onClick={toggleEditMode}
          className={`px-3 py-1.5 text-xs font-medium rounded-full shadow-sm flex items-center gap-1.5 
          ${editMode 
            ? 'bg-blue-500 text-white hover:bg-blue-600' 
            : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
        >
          <Edit2 size={14} />
          {editMode ? 'Exit Edit Mode' : 'Customize UI'}
        </button>
        
        {editMode && (
          <button className="px-3 py-1.5 text-xs font-medium rounded-full bg-green-500 text-white shadow-sm flex items-center gap-1.5 hover:bg-green-600">
            <Save size={14} />
            Save Layout
          </button>
        )}
      </div>
      
      {/* Customization Instructions */}
      {editMode && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-700">
          <p className="font-medium mb-1">UI Customization Mode</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Click any panel to select it</li>
            <li>Drag from the center to move elements</li>
            <li>Drag from the corners or edges to resize</li>
          </ul>
        </div>
      )}
      
      {/* Sample Panels that can be customized */}
      <div className="flex flex-wrap gap-4">
        {(['panel1', 'panel2', 'panel3'] as PanelId[]).map((id) => (
          <div 
            key={id}
            className={`relative p-3 bg-white rounded-lg border shadow-sm
              ${editMode ? 'cursor-move transition-transform' : ''}
              ${selectedElement === id ? 'ring-2 ring-blue-500' : ''}
            `}
            style={{
              width: `${positions[id].width}%`,
              height: positions[id].height,
              transform: editMode ? `translate(${positions[id].x}px, ${positions[id].y}px)` : undefined
            }}
            onClick={() => selectElement(id)}
          >
            <div className="font-medium text-sm mb-2">{getPanelTitle(id)}</div>
            <div className="text-xs text-gray-500">{getPanelDescription(id)}</div>
            
            {/* Resize and move handles - only visible when in edit mode and panel is selected */}
            {editMode && selectedElement === id && (
              <>
                {/* Center drag handle for moving */}
                <div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                          w-6 h-6 bg-blue-100 border border-blue-300 rounded-full 
                          flex items-center justify-center cursor-move z-10"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const deltaX = moveEvent.clientX - startX;
                      const deltaY = moveEvent.clientY - startY;
                      
                      setPositions(prev => ({
                        ...prev,
                        [id]: {
                          ...prev[id],
                          x: prev[id].x + deltaX,
                          y: prev[id].y + deltaY
                        }
                      }));
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <Move size={12} className="text-blue-500" />
                </div>
                
                {/* Corner resize handles */}
                {['nw', 'ne', 'se', 'sw'].map(corner => {
                  const isTop = corner[0] === 'n';
                  const isLeft = corner[1] === 'w';
                  
                  return (
                    <div 
                      key={corner}
                      className="absolute w-3 h-3 bg-blue-500 rounded-full z-10"
                      style={{
                        top: isTop ? -4 : 'auto',
                        bottom: !isTop ? -4 : 'auto',
                        left: isLeft ? -4 : 'auto',
                        right: !isLeft ? -4 : 'auto',
                        cursor: isTop === isLeft ? 'nwse-resize' : 'nesw-resize'
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = moveEvent.clientX - startX;
                          const deltaY = moveEvent.clientY - startY;
                          
                          handleResize(id, {
                            width: (isLeft ? -1 : 1) * deltaX / 5, // Scale for percentage
                            height: (isTop ? -1 : 1) * deltaY
                          });
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  );
                })}
                
                {/* Edge resize handles */}
                {['n', 'e', 's', 'w'].map(edge => {
                  const isVertical = edge === 'n' || edge === 's';
                  const isStart = edge === 'n' || edge === 'w';
                  
                  // Calculate styles based on edge position
                  const edgeStyles: React.CSSProperties = {
                    width: isVertical ? 20 : 3,
                    height: isVertical ? 3 : 20,
                    cursor: isVertical ? 'ns-resize' : 'ew-resize',
                    marginLeft: isVertical ? '-10px' : '0',
                    marginTop: !isVertical ? '-10px' : '0',
                  };
                  
                  // Position styles
                  if (edge === 'n') {
                    edgeStyles.top = -4;
                    edgeStyles.left = '50%';
                  } else if (edge === 's') {
                    edgeStyles.bottom = -4;
                    edgeStyles.left = '50%';
                  } else if (edge === 'e') {
                    edgeStyles.right = -4;
                    edgeStyles.top = '50%';
                  } else if (edge === 'w') {
                    edgeStyles.left = -4;
                    edgeStyles.top = '50%';
                  }
                  
                  return (
                    <div 
                      key={edge}
                      className="absolute bg-blue-300 rounded-full z-10"
                      style={edgeStyles}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = moveEvent.clientX - startX;
                          const deltaY = moveEvent.clientY - startY;
                          
                          handleResize(id, {
                            width: isVertical ? 0 : (isStart ? -1 : 1) * deltaX / 5, // Scale for percentage
                            height: !isVertical ? 0 : (isStart ? -1 : 1) * deltaY
                          });
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  );
                })}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}