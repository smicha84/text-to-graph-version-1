import React from 'react';
import { Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NODE_COLORS } from '@/lib/graphVisualizer';

/**
 * A component that shows the anatomy of a node in the graph visualization
 * with callouts explaining the purpose of each visual element.
 */
export default function NodeAnatomyChart() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Node Anatomy Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* SVG visualization of a node with labels */}
          <div className="relative mb-6 w-full max-w-lg">
            <svg width="100%" height="400" viewBox="0 0 400 400" className="border border-gray-200 rounded-lg bg-gray-50">
              {/* Base node circle */}
              <g transform="translate(200, 160)">
                {/* Node circle */}
                <circle 
                  r="40" 
                  fill="#4F46E5" 
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeDasharray="5,2"
                />
                
                {/* Web search indicator badge */}
                <circle
                  r="12"
                  cx="36"
                  cy="-36"
                  fill="#2563EB"
                  stroke="#FFF"
                  strokeWidth="1.5"
                />
                
                {/* Web search "W" text in badge */}
                <text
                  x="36"
                  y="-36"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="12px"
                  fontWeight="bold"
                >
                  W
                </text>
                
                {/* Node label (name property as black text) */}
                <text
                  textAnchor="middle"
                  dy=".3em"
                  fill="black"
                  fontWeight="bold"
                  fontSize="14px"
                >
                  John Smith
                </text>
                
                {/* Tooltip (showing on hover) */}
                <foreignObject x="-75" y="-120" width="150" height="80">
                  <div
                    className="bg-white p-2 rounded-md shadow-md text-xs border border-gray-200"
                  >
                    <div className="font-medium">Person (Employee)</div>
                    <div className="text-gray-600">ID: n1</div>
                    <div className="text-gray-600">Properties: 4</div>
                    <div className="text-blue-600">Click to view details</div>
                  </div>
                </foreignObject>
                
                {/* Annotation lines and labels */}
                {/* Circle */}
                <line x1="40" y1="0" x2="120" y2="-20" stroke="#6B7280" strokeWidth="1" strokeDasharray="2,2" />
                <text x="125" y="-20" fontSize="12" fill="#4B5563">
                  <tspan>Color indicates node type</tspan>
                  <tspan x="125" dy="15">(Person, Organization, etc.)</tspan>
                </text>
                
                {/* Internal label */}
                <line x1="0" y1="0" x2="-80" y2="-40" stroke="#6B7280" strokeWidth="1" strokeDasharray="2,2" />
                <text x="-85" y="-40" textAnchor="end" fontSize="12" fill="#4B5563">
                  <tspan>Internal label</tspan>
                  <tspan x="-85" dy="15">(Node type)</tspan>
                </text>
                
                {/* External label */}
                <line x1="0" y1="60" x2="-80" y2="90" stroke="#6B7280" strokeWidth="1" strokeDasharray="2,2" />
                <text x="-85" y="90" textAnchor="end" fontSize="12" fill="#4B5563">
                  <tspan>External label</tspan>
                  <tspan x="-85" dy="15">(Node name property)</tspan>
                </text>
                
                {/* Tooltip */}
                <line x1="0" y1="-80" x2="120" y2="-120" stroke="#6B7280" strokeWidth="1" strokeDasharray="2,2" />
                <text x="125" y="-120" fontSize="12" fill="#4B5563">
                  <tspan>Hover tooltip</tspan>
                  <tspan x="125" dy="15">(Shows on mouseover)</tspan>
                </text>
                
                {/* Web search indicator */}
                <line x1="36" y1="-36" x2="120" y2="-60" stroke="#6B7280" strokeWidth="1" strokeDasharray="2,2" />
                <text x="125" y="-60" fontSize="12" fill="#4B5563">
                  <tspan>Web search indicator</tspan>
                  <tspan x="125" dy="15">(For nodes from web search)</tspan>
                </text>
                
                {/* Border dash pattern */}
                <line x1="20" y1="35" x2="120" y2="70" stroke="#6B7280" strokeWidth="1" strokeDasharray="2,2" />
                <text x="125" y="70" fontSize="12" fill="#4B5563">
                  <tspan>Dashed border</tspan>
                  <tspan x="125" dy="15">(Web search result)</tspan>
                </text>
              </g>
              
              {/* Properties panel representation */}
              <g transform="translate(320, 200)">
                <foreignObject x="0" y="-120" width="160" height="240">
                  <div
                    className="bg-white p-3 rounded-md shadow-md text-sm border border-gray-200"
                  >
                    <h4 className="font-medium text-lg mb-2">Node Properties</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">ID:</span>
                        <span className="ml-2 text-gray-600">n1</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="ml-2 text-gray-600">Person</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Label Detail:</span>
                        <span className="ml-2 text-gray-600">Employee</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <span className="font-medium text-gray-700">Properties:</span>
                        <div className="ml-2 mt-1 space-y-1 text-xs">
                          <div className="flex">
                            <span className="text-blue-600 w-20">name:</span>
                            <span className="text-gray-800">"John Smith"</span>
                          </div>
                          <div className="flex">
                            <span className="text-blue-600 w-20">role:</span>
                            <span className="text-gray-800">"Software Engineer"</span>
                          </div>
                          <div className="flex">
                            <span className="text-blue-600 w-20">joined:</span>
                            <span className="text-gray-800">"2023-05-15"</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </foreignObject>
                <line x1="-70" y1="-20" x2="-10" y2="-20" stroke="#6B7280" strokeWidth="1" strokeDasharray="2,2" />
                <text x="-75" y="-20" textAnchor="end" fontSize="12" fill="#4B5563">
                  <tspan>Properties panel</tspan>
                  <tspan x="-75" dy="15">(Opens on node click)</tspan>
                  <tspan x="-75" dy="15">(In right sidebar)</tspan>
                </text>
              </g>
            </svg>
          </div>
          
          {/* Legend explaining different node types */}
          <div className="border border-gray-200 rounded-lg p-4 w-full max-w-lg">
            <h3 className="text-md font-medium mb-3">Node Types & Colors</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(NODE_COLORS).map(([type, color]) => (
                type !== 'default' && (
                  <div key={type} className="flex items-center">
                    <div 
                      className="w-5 h-5 rounded-full mr-2" 
                      style={{ backgroundColor: color as string }}
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </div>
                )
              ))}
            </div>
          </div>
          
          {/* Additional node elements explanation */}
          <div className="mt-6 w-full max-w-lg space-y-4">
            <h3 className="text-md font-medium">Node Elements Reference</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h4 className="font-medium flex items-center text-sm mb-1">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  Node Circle
                </h4>
                <p className="text-xs text-gray-600">
                  The main circle represents an entity. Its color indicates the entity type.
                  The size can vary based on importance.
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h4 className="font-medium flex items-center text-sm mb-1">
                  <div className="mr-2 text-white bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px]">W</div>
                  Web Search Indicator
                </h4>
                <p className="text-xs text-gray-600">
                  Blue badge with 'W' indicates nodes that came from a web search. Also has dashed border.
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h4 className="font-medium flex items-center text-sm mb-1">
                  <span className="mr-2 text-black font-bold">Aa</span>
                  Node Label
                </h4>
                <p className="text-xs text-gray-600">
                  Black bold text centered on the node shows the entity name from its properties.
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h4 className="font-medium flex items-center text-sm mb-1">
                  <span className="mr-2 p-1 border border-gray-300 rounded text-[10px]">?</span>
                  Tooltip
                </h4>
                <p className="text-xs text-gray-600">
                  Shows basic node information on hover, including ID and property count.
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h4 className="font-medium flex items-center text-sm mb-1">
                  <span className="mr-2 p-1 border border-gray-300 rounded text-[10px] bg-white">{'{}'}</span>
                  Properties Panel
                </h4>
                <p className="text-xs text-gray-600">
                  Opens in right sidebar when clicking a node, showing all node properties and data.
                </p>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-100">
              <strong>Pro Tip:</strong> You can drag nodes to reposition them. The graph will automatically update connections. 
              Double-click a node to pin it in place.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}