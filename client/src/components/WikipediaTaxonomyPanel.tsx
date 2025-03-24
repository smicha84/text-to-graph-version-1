import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip } from "@/components/ui/tooltip";
import { 
  BuildingIcon, 
  UserIcon, 
  MapPinIcon, 
  FileTextIcon, 
  TagIcon,
  SearchIcon,
  RefreshCwIcon,
  InfoIcon,
  DatabaseIcon
} from "lucide-react";
import { Graph, Node } from '@/types/graph';
import { 
  getNodeTypeWikipediaCategories,
  buildNodeTypeTaxonomy,
  findRelatedNodeTypes
} from '@/lib/wikipediaUtils';
import { NODE_COLORS } from '@/lib/graphVisualizer';

interface WikipediaTaxonomyPanelProps {
  graph: Graph | null;
  onUpdateGraph?: (updatedGraph: Graph) => void;
}

export default function WikipediaTaxonomyPanel({ 
  graph,
  onUpdateGraph
}: WikipediaTaxonomyPanelProps) {
  // State for taxonomy data
  const [taxonomyData, setTaxonomyData] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [relatedTypes, setRelatedTypes] = useState<Array<{type: string, commonCategories: string[]}>>([]);

  // Extract all unique node types from the graph
  const nodeTypes = React.useMemo(() => {
    if (!graph || !graph.nodes) return [];
    
    const types = new Set<string>();
    graph.nodes.forEach(node => {
      if (node.type) {
        types.add(node.type);
      }
    });
    
    return Array.from(types).sort();
  }, [graph]);

  // Get an icon for a node type
  const getNodeTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('person') || lowerType.includes('employee')) {
      return <UserIcon size={16} />;
    } else if (lowerType.includes('organization') || lowerType.includes('company')) {
      return <BuildingIcon size={16} />;
    } else if (lowerType.includes('location') || lowerType.includes('city')) {
      return <MapPinIcon size={16} />;
    } else if (lowerType.includes('document') || lowerType.includes('article')) {
      return <FileTextIcon size={16} />;
    } else {
      return <TagIcon size={16} />;
    }
  };

  // Get color for a node type
  const getNodeTypeColor = (type: string) => {
    return NODE_COLORS[type] || NODE_COLORS.default;
  };

  // Load taxonomy data for all node types
  const loadTaxonomyData = async () => {
    if (nodeTypes.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const taxonomy = await buildNodeTypeTaxonomy(nodeTypes);
      setTaxonomyData(taxonomy);
    } catch (err) {
      setError('Failed to load taxonomy data from Wikipedia');
      console.error('Taxonomy loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a node type
  const handleSelectType = (type: string) => {
    setSelectedType(type);
    
    // Find related node types based on common categories
    if (taxonomyData[type]) {
      const related = findRelatedNodeTypes(type, taxonomyData);
      setRelatedTypes(related);
    } else {
      setRelatedTypes([]);
    }
  };

  // Get Wikipedia categories for a specific type
  const loadCategoriesForType = async (type: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const categories = await getNodeTypeWikipediaCategories(type);
      
      // Update taxonomy data with new categories
      setTaxonomyData(prev => ({
        ...prev,
        [type]: categories
      }));
      
      // Update related types if this is the selected type
      if (selectedType === type) {
        const related = findRelatedNodeTypes(type, {
          ...taxonomyData,
          [type]: categories
        });
        setRelatedTypes(related);
      }
    } catch (err) {
      setError(`Failed to load categories for ${type}`);
      console.error('Category loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <DatabaseIcon size={18} className="mr-2" />
          <h3 className="text-lg font-medium">Wikipedia Taxonomy</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadTaxonomyData} 
          disabled={isLoading || nodeTypes.length === 0}
        >
          <RefreshCwIcon size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading...' : 'Load All'}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-800 border-b border-red-200 text-sm">
          {error}
        </div>
      )}

      <Tabs defaultValue="types" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="types">Node Types</TabsTrigger>
          <TabsTrigger value="relations">Relationships</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {nodeTypes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No node types available in the current graph
                </div>
              ) : (
                nodeTypes.map(type => (
                  <div 
                    key={type}
                    className={`p-3 border rounded-md cursor-pointer hover:bg-muted transition-colors flex items-center justify-between ${
                      selectedType === type ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleSelectType(type)}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded-full mr-3 flex items-center justify-center text-white"
                        style={{ backgroundColor: getNodeTypeColor(type) }}
                      >
                        {getNodeTypeIcon(type)}
                      </div>
                      <span className="font-medium">{type}</span>
                    </div>
                    
                    <div className="flex items-center">
                      {taxonomyData[type] && (
                        <span className="text-xs text-muted-foreground mr-2">
                          {taxonomyData[type].length} categories
                        </span>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          loadCategoriesForType(type);
                        }}
                      >
                        <SearchIcon size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {selectedType && (
            <div className="border-t p-4">
              <h4 className="font-semibold mb-2 flex items-center">
                <span className="mr-2">Wikipedia Categories for {selectedType}</span>
                <Tooltip content="These categories are sourced from Wikipedia and show the taxonomic classification of this entity type">
                  <InfoIcon size={14} className="text-muted-foreground cursor-help" />
                </Tooltip>
              </h4>
              
              <div className="bg-muted p-3 rounded-md max-h-48 overflow-y-auto">
                {taxonomyData[selectedType]?.length ? (
                  <ul className="space-y-1 text-sm">
                    {taxonomyData[selectedType].map(category => (
                      <li key={category} className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        {category}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted-foreground text-center py-4">
                    No category data available. Click "Search" to load from Wikipedia.
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="relations" className="flex-1">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h4 className="font-semibold mb-2">Related Node Types</h4>
              
              {!selectedType ? (
                <div className="text-center text-muted-foreground py-8">
                  Select a node type to see related types based on shared categories
                </div>
              ) : relatedTypes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No related types found. Try loading categories for more types.
                </div>
              ) : (
                <div className="space-y-3">
                  {relatedTypes.map(({ type, commonCategories }) => (
                    <div key={type} className="border rounded-md p-3">
                      <div className="flex items-center mb-2">
                        <div 
                          className="w-6 h-6 rounded-full mr-3 flex items-center justify-center text-white"
                          style={{ backgroundColor: getNodeTypeColor(type) }}
                        >
                          {getNodeTypeIcon(type)}
                        </div>
                        <span className="font-medium">{type}</span>
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div className="text-xs">
                        <span className="text-muted-foreground">Common categories:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {commonCategories.map(category => (
                            <span key={category} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}