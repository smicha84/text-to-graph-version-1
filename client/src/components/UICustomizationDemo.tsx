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
  const [customizationSaved, setCustomizationSaved] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  
  // Default positions (before customization)
  const defaultPositions: PanelPositions = {
    'panel1': { x: 0, y: 0, width: 100, height: 200 },
    'panel2': { x: 0, y: 210, width: 49, height: 150 },
    'panel3': { x: 51, y: 210, width: 49, height: 150 },
  };
  
  // Track custom positions for each element with more realistic initial layout
  const [positions, setPositions] = useState<PanelPositions>({
    'panel1': { x: 0, y: 0, width: 64, height: 200 },
    'panel2': { x: 0, y: 0, width: 35, height: 95 },
    'panel3': { x: 0, y: 110, width: 35, height: 95 },
  });
  
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSelectedElement(null);
    setCustomizationSaved(false);
  };
  
  // Simulate saving to localStorage
  const saveLayout = () => {
    try {
      // In a real app, we would save to localStorage or a database
      // This simulates that behavior
      const savedLayout = JSON.stringify(positions);
      console.log('Saved layout configuration:', savedLayout);
      
      // Show success notification
      setCustomizationSaved(true);
      setTimeout(() => setCustomizationSaved(false), 3000); // Reset notification after 3 seconds
    } catch (err) {
      console.error('Failed to save layout:', err);
    }
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
  
  const renderPanels = (positionsToUse: PanelPositions, isActive: boolean = true) => (
    <div className="relative" style={{ minHeight: '400px', opacity: isActive ? 1 : 0.7 }}>
      {/* Sample Panels that can be customized */}
      {(['panel1', 'panel2', 'panel3'] as PanelId[]).map((id) => (
        <div 
          key={id}
          className={`absolute p-3 bg-white rounded-lg border shadow-sm transition-all duration-200
            ${editMode && isActive ? 'cursor-move z-10' : ''}
            ${selectedElement === id && isActive ? 'ring-2 ring-blue-500 z-20' : ''}
            ${id === 'panel1' ? 'bg-white' : id === 'panel2' ? 'bg-gray-50' : 'bg-slate-50'}
          `}
          style={{
            width: `${positionsToUse[id].width}%`,
            height: positionsToUse[id].height,
            left: `${positionsToUse[id].x}px`,
            top: `${positionsToUse[id].y}px`,
          }}
          onClick={() => isActive && selectElement(id)}
        >
          <div className="font-medium text-sm mb-2">{getPanelTitle(id)}</div>
          <div className="text-xs text-gray-500">{getPanelDescription(id)}</div>
          
          {/* Fake content to make panels look more realistic */}
          {id === 'panel1' && (
            <div className="mt-4 w-full h-24 bg-gray-100 rounded-md flex items-center justify-center">
              <div className="text-gray-400 text-xs">Graph Visualization Area</div>
            </div>
          )}
          
          {id === 'panel2' && (
            <div className="mt-4 flex flex-col gap-2">
              <div className="w-full h-5 bg-gray-200 rounded-full"></div>
              <div className="w-3/4 h-5 bg-gray-200 rounded-full"></div>
              <div className="w-1/2 h-5 bg-gray-200 rounded-full"></div>
            </div>
          )}
          
          {id === 'panel3' && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="w-2/5 h-4 bg-gray-200 rounded"></div>
                <div className="w-2/5 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          )}
          
          {/* Resize and move handles - only visible when in edit mode and panel is selected */}
          {editMode && selectedElement === id && isActive && (
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
  );

  return (
    <div className="p-4 border rounded-lg bg-gray-50 relative">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input 
              type="checkbox" 
              checked={showBeforeAfter} 
              onChange={() => setShowBeforeAfter(!showBeforeAfter)}
              className="rounded text-blue-500 focus:ring-blue-500"
            />
            Show Before/After Comparison
          </label>
        </div>

        <div className="flex gap-2">
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
            <button 
              onClick={saveLayout}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-green-500 text-white shadow-sm flex items-center gap-1.5 hover:bg-green-600"
            >
              <Save size={14} />
              Save Layout
            </button>
          )}
          
          {/* Save confirmation notification */}
          {customizationSaved && (
            <div className="absolute top-12 right-2 bg-green-100 border border-green-200 text-green-800 px-3 py-1.5 rounded-md text-xs flex items-center animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              Layout saved successfully!
            </div>
          )}
        </div>
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
      
      {/* Before and After Comparison */}
      {showBeforeAfter ? (
        <div className="space-y-8">
          <div>
            <div className="flex items-center mb-3">
              <div className="w-4 h-4 rounded-full bg-gray-300 flex-shrink-0"></div>
              <div className="ml-2 text-sm font-medium text-gray-500">Default Layout</div>
            </div>
            {renderPanels(defaultPositions, false)}
          </div>
          
          <div className="w-full border-t border-gray-200 my-6"></div>
          
          <div>
            <div className="flex items-center mb-3">
              <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
              <div className="ml-2 text-sm font-medium text-gray-700">Custom Layout</div>
            </div>
            {renderPanels(positions, true)}
          </div>
        </div>
      ) : (
        // Main Customizable Layout
        renderPanels(positions)
      )}
    </div>
  );
}