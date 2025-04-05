import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  segments 
}: MultiSubgraphInputProps) {
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
  // Generate a new unique ID
  const generateId = () => `sg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
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

  // Create a new segment from current selection
  const createSegment = () => {
    if (!selection || !textAreaRef.current) return;
    
    const { start, end } = selection;
    const segmentText = text.substring(start, end);
    
    if (segmentText.trim().length === 0) return;
    
    const newSegment: TextSegment = {
      id: generateId(),
      text: segmentText,
      name: `Subgraph ${segments.length + 1}`,
      color: getNextColor()
    };
    
    onSegmentsChange([...segments, newSegment]);
    setSelection(null);
  };

  // Remove a segment
  const removeSegment = (id: string) => {
    onSegmentsChange(segments.filter(s => s.id !== id));
  };

  // Update segment name
  const updateSegmentName = (id: string, name: string) => {
    onSegmentsChange(
      segments.map(s => (s.id === id ? { ...s, name } : s))
    );
  };

  // Move segment up in the list
  const moveSegmentUp = (index: number) => {
    if (index <= 0) return;
    
    const newSegments = [...segments];
    [newSegments[index - 1], newSegments[index]] = [newSegments[index], newSegments[index - 1]];
    onSegmentsChange(newSegments);
  };

  // Move segment down in the list
  const moveSegmentDown = (index: number) => {
    if (index >= segments.length - 1) return;
    
    const newSegments = [...segments];
    [newSegments[index], newSegments[index + 1]] = [newSegments[index + 1], newSegments[index]];
    onSegmentsChange(newSegments);
  };
  
  // Render the text with highlighted segments
  const renderHighlightedText = () => {
    if (segments.length === 0) return text;
    
    // Sort segments by their appearance in the text
    const sortedSegments = [...segments].sort((a, b) => {
      const aStart = text.indexOf(a.text);
      const bStart = text.indexOf(b.text);
      return aStart - bStart;
    });
    
    let lastIndex = 0;
    let result = [];
    
    for (const segment of sortedSegments) {
      const startIndex = text.indexOf(segment.text, lastIndex);
      
      if (startIndex !== -1) {
        // Add text before this segment
        if (startIndex > lastIndex) {
          result.push(text.substring(lastIndex, startIndex));
        }
        
        // Add highlighted segment
        result.push(
          <span 
            key={segment.id} 
            style={{ 
              backgroundColor: segment.color + '33', // Add transparency
              borderBottom: `2px solid ${segment.color}`,
              padding: '0 2px'
            }}
            title={segment.name}
          >
            {segment.text}
          </span>
        );
        
        lastIndex = startIndex + segment.text.length;
      }
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }
    
    return result;
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar for text selection and segment creation */}
      <div className="flex justify-between items-center p-2 bg-gray-50 border border-gray-200 rounded-md mb-1">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                disabled={!selection}
                onClick={createSegment}
                className="flex items-center"
              >
                <HighlighterIcon size={16} className="mr-1" />
                Create Subgraph
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Select text and click here to create a new subgraph segment
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex items-center gap-1">
          <InfoIcon size={16} className="text-gray-500" />
          <span className="text-xs text-gray-500">
            Select text to create multiple subgraphs
          </span>
        </div>
      </div>
      
      {/* Text area for input */}
      <div className="relative">
        <textarea
          ref={textAreaRef}
          className="w-full min-h-[150px] p-3 border border-gray-300 rounded font-mono text-sm resize-none 
            focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleTextSelect}
          placeholder="Enter your text here to generate a property graph..."
        />
        
        {/* Text preview with highlighting (absolute positioned over the textarea when not focused) */}
        {textAreaRef.current !== document.activeElement && segments.length > 0 && (
          <div 
            className="absolute top-0 left-0 w-full h-full p-3 font-mono text-sm pointer-events-none 
              overflow-auto whitespace-pre-wrap"
          >
            {renderHighlightedText()}
          </div>
        )}
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