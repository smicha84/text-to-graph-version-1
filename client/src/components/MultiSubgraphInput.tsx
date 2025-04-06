import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Graph } from "@/types/graph";
import { 
  PlusCircleIcon, 
  MinusCircleIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  InfoIcon,
  HighlighterIcon
} from "lucide-react";

export interface TextSegment {
  id: string;
  text: string;
  name: string;
  color: string;
}

interface MultiSubgraphInputProps {
  text: string;
  onChange: (text: string) => void;
  onSegmentsChange: (segments: TextSegment[]) => void;
  segments: TextSegment[];
  graph?: Graph | null;
}

// Color palette for subgraph highlighting
const COLORS = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#84cc16", // lime-500
];

export default function MultiSubgraphInput({ 
  text, 
  onChange, 
  onSegmentsChange,
  segments,
  graph = null
}: MultiSubgraphInputProps) {
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Function to get the highest subgraph ID from the existing graph
  const getHighestSubgraphIdFromGraph = (): number => {
    if (!graph) return 0;
    
    const subgraphIdRegex = /^sg(\d+)$/;
    const allSubgraphIds: number[] = [];
    
    // Collect all subgraph IDs from nodes
    graph.nodes.forEach(node => {
      if (node.subgraphIds) {
        node.subgraphIds.forEach(id => {
          const match = id.match(subgraphIdRegex);
          if (match) {
            const numericId = parseInt(match[1], 10);
            if (!isNaN(numericId)) {
              allSubgraphIds.push(numericId);
            }
          }
        });
      }
    });
    
    // Collect all subgraph IDs from edges
    graph.edges.forEach(edge => {
      if (edge.subgraphIds) {
        edge.subgraphIds.forEach(id => {
          const match = id.match(subgraphIdRegex);
          if (match) {
            const numericId = parseInt(match[1], 10);
            if (!isNaN(numericId)) {
              allSubgraphIds.push(numericId);
            }
          }
        });
      }
    });
    
    // Return the highest ID, or 0 if no subgraph IDs were found
    return allSubgraphIds.length > 0 ? Math.max(...allSubgraphIds) : 0;
  };
  
  // Generate a sequential ID that follows a proper sequence
  const generateId = () => {
    // Get the highest subgraph ID from the graph (if available)
    const highestGraphId = getHighestSubgraphIdFromGraph();
    
    // Get the highest subgraph ID from the current segments
    const highestSegmentId = segments.length > 0 
      ? Math.max(...segments.map(s => {
          const match = s.id.match(/^sg(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        }))
      : 0;
    
    // Use the highest ID from either source as the base
    const baseId = Math.max(highestGraphId, highestSegmentId);
    
    // Return the next ID in sequence
    return `sg${baseId + 1}`;
  };
  
  // Get the next available color from the palette
  const getNextColor = useCallback(() => {
    const usedColors = new Set(segments.map(s => s.color));
    return COLORS.find(c => !usedColors.has(c)) || COLORS[segments.length % COLORS.length];
  }, [segments]);

  // Handler for text selection
  const handleTextSelect = () => {
    if (!textAreaRef.current) return;
    
    const start = textAreaRef.current.selectionStart;
    const end = textAreaRef.current.selectionEnd;
    
    if (start !== end) {
      setSelection({ start, end });
    } else {
      setSelection(null);
    }
  };

  // Create a new segment from current selection and remove it from the text
  const createSegment = () => {
    if (!selection || !textAreaRef.current) return;
    
    const { start, end } = selection;
    const segmentText = text.substring(start, end);
    
    if (segmentText.trim().length === 0) return;
    
    // Generate a more descriptive name by using the first few words
    let segmentName = segmentText.trim().split(' ').slice(0, 3).join(' ');
    if (segmentName.length > 30) {
      segmentName = segmentName.substring(0, 30) + '...';
    } else if (segmentText.length > segmentName.length) {
      segmentName += '...';
    }
    
    // Get the highest ID considering both existing segments and the graph
    const highestGraphId = getHighestSubgraphIdFromGraph();
    
    const existingIds = segments.map(s => {
      const match = s.id.match(/^sg(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    }).filter(id => id > 0);
    
    const maxSegmentId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const nextId = Math.max(highestGraphId, maxSegmentId) + 1;
    
    // Log the ID calculation for verification
    console.log('Creating new segment:');
    console.log('Highest graph ID:', highestGraphId);
    console.log('Existing segment IDs:', existingIds);
    console.log('Max segment ID:', maxSegmentId);
    console.log('Next ID to use:', nextId);
    
    // Create a temporary new segment
    const tempSegment: TextSegment = {
      id: 'temp', // Will be replaced by reindexSegments
      text: segmentText,
      name: `Subgraph ${nextId}: ${segmentName}`,
      color: getNextColor()
    };
    
    // Remove the selected text from the main text area
    const newText = text.substring(0, start) + text.substring(end);
    onChange(newText);
    
    // Add the new segment and reindex everything
    onSegmentsChange(reindexSegments([...segments, tempSegment]));
    setSelection(null);
  };

  // Remove a segment and reindex remaining segments for consistent IDs
  const removeSegment = (id: string) => {
    // First filter out the segment to remove
    const filteredSegments = segments.filter(s => s.id !== id);
    
    // Then reindex to maintain consistent IDs
    onSegmentsChange(reindexSegments(filteredSegments));
  };

  // Update segment name while preserving ID structure
  const updateSegmentName = (id: string, name: string) => {
    const updatedSegments = segments.map(s => 
      s.id === id ? { ...s, name } : s
    );
    
    // Don't reindex here - we want to preserve the IDs when just changing names
    onSegmentsChange(updatedSegments);
  };

  // Helper to reindex segments with consistent IDs and names - placed before it's used
  const reindexSegments = (segmentsToReindex: TextSegment[]) => {
    console.log('--- REINDEX SEGMENTS START ---');
    console.log('Input segments:', segmentsToReindex.map(s => ({ id: s.id, name: s.name })));
    
    // First, get the highest ID from the graph (if available)
    const highestGraphId = getHighestSubgraphIdFromGraph();
    console.log('Highest graph ID:', highestGraphId);
    
    // Extract all existing numbers from segment IDs
    const existingIds = segmentsToReindex
      .map(s => {
        // Handle the temporary ID from createSegment
        if (s.id === 'temp') return 0;
        
        const match = s.id.match(/^sg(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(id => id > 0);
    
    // Add the highest graph ID to the existing IDs to reserve it
    if (highestGraphId > 0) {
      existingIds.push(highestGraphId);
    }
    
    console.log('Existing numeric IDs (including graph IDs):', existingIds);
    
    // Find the highest existing ID
    const maxExistingId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    console.log('Max existing ID:', maxExistingId);
    
    // Sort segments to keep any pre-numbered ones first
    const sortedSegments = [...segmentsToReindex].sort((a, b) => {
      const aMatch = a.id.match(/^sg(\d+)$/);
      const bMatch = b.id.match(/^sg(\d+)$/);
      
      const aNum = aMatch ? parseInt(aMatch[1], 10) : 0;
      const bNum = bMatch ? parseInt(bMatch[1], 10) : 0;
      
      // Sort temp IDs to the end
      if (a.id === 'temp') return 1;
      if (b.id === 'temp') return -1;
      
      // Then sort by numeric ID
      return aNum - bNum;
    });
    
    console.log('Sorted segments:', sortedSegments.map(s => ({ id: s.id, name: s.name })));
    
    // Now assign IDs keeping existing IDs when possible
    // Start from the highest ID from the graph + 1 if we have temp segments
    let nextId = hasTemporarySegments(sortedSegments) ? maxExistingId + 1 : 1;
    
    const result = sortedSegments.map((segment) => {
      let newId = segment.id;
      
      // If it's a temp ID or needs reassignment
      if (segment.id === 'temp') {
        // Find the next available ID number
        while (existingIds.includes(nextId)) {
          nextId++;
        }
        
        newId = `sg${nextId}`;
        console.log(`Assigning new ID ${newId} to temp segment`);
        existingIds.push(nextId);
        nextId++;
      }
      
      // Extract the numeric part from the ID for use in the name
      const idMatch = newId.match(/^sg(\d+)$/);
      const idNumber = idMatch ? parseInt(idMatch[1], 10) : 0;
      
      // Update the segment name to reflect the correct ID number if it starts with "Subgraph X:"
      let newName = segment.name;
      if (segment.name.match(/^Subgraph \d+:/)) {
        // Extract the content after "Subgraph X:" to preserve it
        const contentPart = segment.name.split(':').slice(1).join(':').trim();
        newName = `Subgraph ${idNumber}: ${contentPart}`;
        
        if (segment.name !== newName) {
          console.log(`Renaming from "${segment.name}" to "${newName}"`);
        }
      }
      
      return {
        ...segment,
        id: newId,
        name: newName
      };
    });
    
    console.log('Final result:', result.map(s => ({ id: s.id, name: s.name })));
    console.log('--- REINDEX SEGMENTS END ---');
    
    return result;
  };
  
  // Helper function to check if there are any temporary segments
  const hasTemporarySegments = (segments: TextSegment[]): boolean => {
    return segments.some(s => s.id === 'temp');
  };

  // Move segment up in the list
  const moveSegmentUp = (index: number) => {
    if (index <= 0) return;
    
    const newSegments = [...segments];
    [newSegments[index - 1], newSegments[index]] = [newSegments[index], newSegments[index - 1]];
    
    // Reindex to maintain consistent IDs
    onSegmentsChange(reindexSegments(newSegments));
  };

  // Move segment down in the list
  const moveSegmentDown = (index: number) => {
    if (index >= segments.length - 1) return;
    
    const newSegments = [...segments];
    [newSegments[index], newSegments[index + 1]] = [newSegments[index + 1], newSegments[index]];
    
    // Reindex to maintain consistent IDs
    onSegmentsChange(reindexSegments(newSegments));
  };
  
  // We no longer need to render highlighted text since we're removing segments from the main text

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar for text selection and segment creation */}
      <div className="flex justify-between items-center p-2 bg-gray-50 border border-gray-200 rounded-md mb-1">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                type="button" 
                variant={selection ? "default" : "outline"} 
                size="sm"
                disabled={!selection}
                onClick={createSegment}
                className={`flex items-center ${selection ? 'bg-primary hover:bg-primary/90 text-white' : ''}`}
              >
                <HighlighterIcon size={16} className="mr-1" />
                Create Subgraph
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Select text to create a subgraph - selected text will be removed from the main input
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex items-center gap-1">
          <InfoIcon size={16} className="text-gray-500" />
          <span className="text-xs text-gray-500">
            Select text and click 'Create Subgraph' to cut it into a separate segment
          </span>
        </div>
      </div>
      
      {/* Text area for input */}
      <div className="relative">
        <textarea
          ref={textAreaRef}
          className={`w-full min-h-[150px] p-3 border rounded font-mono text-sm resize-none 
            outline-none transition-all ${selection ? 'border-primary ring-2 ring-primary/30' : 'border-gray-300'} 
            focus:ring-2 focus:ring-primary focus:border-primary`}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleTextSelect}
          placeholder="Enter your text here to generate a property graph..."
        />
        
        {/* No overlay needed since we're removing text instead of highlighting it */}
      </div>
      
      {/* Segments list */}
      {segments.length > 0 && (
        <div className="border border-gray-200 rounded-md p-2 mt-2">
          <div className="flex justify-between items-center mb-2">
            <Label className="font-medium text-sm">Subgraph Segments</Label>
            <span className="text-xs text-gray-500">{segments.length} segment(s)</span>
          </div>
          
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-2">
              {segments.map((segment, index) => (
                <div 
                  key={segment.id} 
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: segment.color }}
                  />
                  
                  <Input
                    className="flex-1 h-8 text-sm"
                    value={segment.name}
                    onChange={(e) => updateSegmentName(segment.id, e.target.value)}
                    placeholder="Segment name"
                  />
                  
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => moveSegmentUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUpIcon size={14} />
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => moveSegmentDown(index)}
                      disabled={index === segments.length - 1}
                    >
                      <ArrowDownIcon size={14} />
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeSegment(segment.id)}
                    >
                      <TrashIcon size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}