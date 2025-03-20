import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Graph, ExportFormat, ExportOptions } from "@/types/graph";
import * as d3 from "d3";

interface ExportModalProps {
  graph: Graph | null;
  onExport: (options: ExportOptions) => void;
  onClose: () => void;
  isExporting: boolean;
}

export default function ExportModal({ graph, onExport, onClose, isExporting }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("json");
  const [includeProperties, setIncludeProperties] = useState(true);
  const [includeStyles, setIncludeStyles] = useState(true);
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  const handleExportClick = () => {
    // For PNG format, handle export on client side
    if (format === "png" && svgRef.current && graph) {
      // Create a canvas and draw the SVG to it
      const svg = svgRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        console.error("Could not get canvas context");
        return;
      }
      
      // Set canvas size
      canvas.width = svg.clientWidth || 800;
      canvas.height = svg.clientHeight || 600;
      
      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      
      // Create image and draw to canvas when loaded
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        
        // Convert canvas to PNG and download
        canvas.toBlob(function(blob) {
          if (!blob) {
            console.error("Could not create blob");
            return;
          }
          
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = pngUrl;
          a.download = "graph.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(pngUrl);
          
          onClose();
        }, "image/png");
      };
      
      img.src = url;
    } else {
      // For other formats, let the server handle it
      onExport({
        format,
        includeProperties,
        includeStyles
      });
    }
  };
  
  // Create a hidden SVG for export purposes
  const renderHiddenSVG = () => {
    if (!graph) return null;
    
    // Create and position svg elements for nodes and edges
    return (
      <svg 
        ref={svgRef} 
        width="800" 
        height="600" 
        className="hidden"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      >
        <g>
          {/* Edges */}
          {graph.edges.map(edge => {
            const source = graph.nodes.find(n => n.id === edge.source);
            const target = graph.nodes.find(n => n.id === edge.target);
            
            if (!source || !target) return null;
            
            const sourceX = source.x || 0;
            const sourceY = source.y || 0;
            const targetX = target.x || 0;
            const targetY = target.y || 0;
            
            return (
              <g key={edge.id}>
                <line
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={targetY}
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                />
                <text
                  x={(sourceX + targetX) / 2}
                  y={(sourceY + targetY) / 2 - 6}
                  textAnchor="middle"
                  fontSize="10px"
                  fill="#4B5563"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}
          
          {/* Nodes */}
          {graph.nodes.map(node => (
            <g key={node.id} transform={`translate(${node.x || 0},${node.y || 0})`}>
              <circle
                r="20"
                fill={
                  node.type === 'Person' ? '#3B82F6' :
                  node.type === 'Company' || node.type === 'Organization' ? '#10B981' :
                  node.type === 'Product' ? '#8B5CF6' :
                  node.type === 'Location' ? '#F59E0B' : '#6B7280'
                }
              />
              <text
                textAnchor="middle"
                dy=".3em"
                fill="white"
                fontWeight="bold"
                fontSize="12px"
              >
                {node.label}
              </text>
              <text
                textAnchor="middle"
                dy="35px"
                fill="#1F2937"
                fontSize="11px"
              >
                {node.properties.name || ""}
              </text>
            </g>
          ))}
        </g>
      </svg>
    );
  };
  
  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Graph</DialogTitle>
            <DialogDescription>
              Choose format and options for exporting your graph
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="exportFormat">Format</Label>
              <Select
                value={format}
                onValueChange={(value) => setFormat(value as ExportFormat)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG Image</SelectItem>
                  <SelectItem value="svg">SVG Vector</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                  <SelectItem value="cypher">Cypher Query</SelectItem>
                  <SelectItem value="gremlin">Gremlin Query</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeProperties"
                    checked={includeProperties}
                    onCheckedChange={(checked) => setIncludeProperties(checked === true)}
                  />
                  <Label htmlFor="includeProperties">Include Properties</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeStyles"
                    checked={includeStyles}
                    onCheckedChange={(checked) => setIncludeStyles(checked === true)}
                  />
                  <Label htmlFor="includeStyles">Include Visual Styles</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExportClick} disabled={isExporting || !graph}>
              {isExporting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-download mr-2"></i>
                  <span>Export</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden SVG for PNG export */}
      {renderHiddenSVG()}
    </>
  );
}
