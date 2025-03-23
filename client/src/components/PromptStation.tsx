import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GlobeIcon, RotateCwIcon } from "lucide-react";

interface PromptStationProps {
  searchPrompt: string;
  onSearchPromptChange: (prompt: string) => void;
  suggestedQueries: string[];
  onSelectSuggestion: (query: string) => void;
  onSearch: () => void;
  isSearching: boolean;
}

export function PromptStation({
  searchPrompt,
  onSearchPromptChange,
  suggestedQueries,
  onSelectSuggestion,
  onSearch,
  isSearching
}: PromptStationProps) {
  return (
    <div className="mt-2">
      {/* Display list of suggested queries */}
      {suggestedQueries.length > 0 && (
        <div className="mb-3">
          <Label className="text-xs text-gray-600 mb-1">Suggested searches:</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {suggestedQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => onSelectSuggestion(query)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded truncate max-w-full"
                title={query}
              >
                {query.length > 30 ? query.substring(0, 27) + '...' : query}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <Textarea
        id="searchPrompt"
        className="w-full p-2 border border-gray-300 rounded font-mono text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all min-h-[80px]"
        placeholder="Edit search query..."
        value={searchPrompt}
        onChange={(e) => onSearchPromptChange(e.target.value)}
      />
      <Button
        onClick={onSearch}
        disabled={isSearching || !searchPrompt.trim()}
        className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1 rounded transition-colors flex items-center justify-center"
        size="sm"
      >
        {isSearching ? (
          <>
            <RotateCwIcon size={12} className="mr-1 animate-spin" />
            <span>Searching...</span>
          </>
        ) : (
          <>
            <GlobeIcon size={12} className="mr-1" />
            <span>Execute Web Search</span>
          </>
        )}
      </Button>
    </div>
  );
}

// Compact version for the sidebar
export function CompactPromptStation({
  searchPrompt,
  onSearchPromptChange,
  suggestedQueries,
  onSelectSuggestion,
  onSearch,
  isSearching
}: PromptStationProps) {
  return (
    <div className="mt-2">
      {/* Display list of suggested queries in compact view */}
      {suggestedQueries.length > 0 && (
        <div className="mb-2">
          <Label className="text-xs text-gray-600">Suggestions:</Label>
          <div className="flex flex-col gap-1 mb-2 mt-1">
            {suggestedQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => onSelectSuggestion(query)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-left truncate"
                title={query}
              >
                {query.length > 25 ? query.substring(0, 22) + '...' : query}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <Textarea
        id="searchPromptCompact"
        className="w-full p-2 text-xs border border-gray-300 rounded resize-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all min-h-[60px]"
        placeholder="Edit search query..."
        value={searchPrompt}
        onChange={(e) => onSearchPromptChange(e.target.value)}
      />
      <Button
        onClick={onSearch}
        disabled={isSearching || !searchPrompt.trim()}
        className="w-full mt-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 rounded transition-colors flex items-center justify-center"
        size="sm"
      >
        {isSearching ? "Searching..." : "Execute Search"}
      </Button>
    </div>
  );
}