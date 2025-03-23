import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GlobeIcon, SearchIcon, RotateCwIcon } from "lucide-react";

interface PromptStationProps {
  searchPrompt: string;
  onSearchPromptChange: (prompt: string) => void;
  suggestedQueries: string[];
  onSelectSuggestion: (query: string) => void;
  onSearch: () => void;
  isSearching: boolean;
}

// Full-sized Prompt Station for expanded view
export function PromptStation({
  searchPrompt,
  onSearchPromptChange,
  suggestedQueries,
  onSelectSuggestion,
  onSearch,
  isSearching
}: PromptStationProps) {
  return (
    <div className="w-full space-y-3">
      <Textarea
        value={searchPrompt}
        onChange={(e) => onSearchPromptChange(e.target.value)}
        placeholder="Enter search query for web search..."
        className="w-full h-24 resize-none text-sm"
      />
      
      <div className="flex justify-between">
        <p className="text-xs text-gray-500">
          {searchPrompt ? searchPrompt.length : 0} characters
        </p>
        <Button 
          onClick={onSearch}
          disabled={isSearching || !searchPrompt.trim()} 
          className="bg-primary hover:bg-primary/90"
          size="sm"
        >
          {isSearching ? (
            <>
              <RotateCwIcon size={14} className="mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <GlobeIcon size={14} className="mr-2" />
              Search Web
            </>
          )}
        </Button>
      </div>
      
      {suggestedQueries.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Suggested queries:</p>
          <ScrollArea className="h-32 w-full rounded-md border">
            <div className="p-2 space-y-2">
              {suggestedQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectSuggestion(query)}
                  className="w-full justify-start text-left text-xs font-normal truncate hover:bg-gray-100"
                >
                  <SearchIcon size={10} className="mr-2 flex-shrink-0" />
                  <span className="truncate">{query}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// Compact version for collapsed sidebar view
export function CompactPromptStation({
  searchPrompt,
  onSearchPromptChange,
  suggestedQueries,
  onSelectSuggestion,
  onSearch,
  isSearching
}: PromptStationProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex space-x-1">
        <Input
          value={searchPrompt}
          onChange={(e) => onSearchPromptChange(e.target.value)}
          placeholder="Web search..."
          className="h-7 text-xs"
        />
        <Button 
          onClick={onSearch}
          disabled={isSearching || !searchPrompt.trim()} 
          size="icon"
          className="h-7 w-7 p-0"
        >
          {isSearching ? 
            <RotateCwIcon size={12} className="animate-spin" /> : 
            <SearchIcon size={12} />
          }
        </Button>
      </div>
      
      {suggestedQueries.length > 0 && (
        <ScrollArea className="h-20 w-full rounded-md border text-xs">
          <div className="p-1 space-y-1">
            {suggestedQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => onSelectSuggestion(query)}
                className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded truncate block"
              >
                {query.length > 25 ? query.substring(0, 25) + "..." : query}
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}