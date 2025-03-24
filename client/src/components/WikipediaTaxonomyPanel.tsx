import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  BuildingIcon, 
  UserIcon, 
  MapPinIcon, 
  FileTextIcon, 
  TagIcon,
  SearchIcon,
  RefreshCwIcon,
  InfoIcon,
  DatabaseIcon,
  ChevronRightIcon,
  NetworkIcon,
  ZapIcon,
  BarChartIcon
} from "lucide-react";
import { Graph, Node } from '@/types/graph';
import { 
  getNodeTypeWikipediaCategories,
  buildNodeTypeTaxonomy,
  buildDeepNodeTypeTaxonomy,
  CategoryHierarchy,
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
  const [deepTaxonomyData, setDeepTaxonomyData] = useState<Record<string, CategoryHierarchy[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepLoading, setIsDeepLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [relatedTypes, setRelatedTypes] = useState<Array<{type: string, commonCategories: string[]}>>([]);
  const [activeTab, setActiveTab] = useState<string>("types");

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
  
  // Load deep taxonomy data for a specific node type
  const loadDeepTaxonomyForType = async (type: string, maxDepth: number = 5) => {
    if (!type) return;
    
    setIsDeepLoading(true);
    setError(null);
    
    try {
      // Switch to the hierarchy tab
      setActiveTab("hierarchy");
      
      // We only need to process one type, so create an array with just that type
      const result = await buildDeepNodeTypeTaxonomy([type], maxDepth);
      
      setDeepTaxonomyData(prev => ({
        ...prev,
        [type]: result[type] || []
      }));
    } catch (err) {
      setError(`Failed to load deep taxonomy for ${type}`);
      console.error('Deep taxonomy loading error:', err);
    } finally {
      setIsDeepLoading(false);
    }
  };
  
  // Recursive component to render the category hierarchy
  const CategoryHierarchyTree = ({ hierarchy, depth = 0 }: { hierarchy: CategoryHierarchy, depth?: number }) => {
    // For indentation, use a fixed pixel-based indentation instead of tailwind classes
    // since we can have arbitrary depth levels
    const indentStyle = { marginLeft: `${depth * 12}px` };
    
    if (hierarchy.parentCategories.length === 0) {
      return (
        <div className="flex items-center py-1" style={indentStyle}>
          <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
          <span>{hierarchy.name}</span>
        </div>
      );
    }
    
    return (
      <div>
        <div className="flex items-center py-1" style={indentStyle}>
          <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
          <span>{hierarchy.name}</span>
          <Badge variant="outline" className="ml-2 text-xs">
            {hierarchy.parentCategories.length} parent{hierarchy.parentCategories.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="border-l-2 border-gray-200 ml-1 pl-4">
          {hierarchy.parentCategories.map((parent, index) => (
            <CategoryHierarchyTree key={`${parent.name}-${index}`} hierarchy={parent} depth={depth + 1} />
          ))}
        </div>
      </div>
    );
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

      <Tabs defaultValue="types" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="types">Node Types</TabsTrigger>
          <TabsTrigger value="hierarchy">Deep Taxonomy</TabsTrigger>
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon size={14} className="text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      These categories are sourced from Wikipedia and show the taxonomic classification of this entity type
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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

        <TabsContent value="hierarchy" className="flex-1">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center">
                  <NetworkIcon size={16} className="mr-2" />
                  Deep Category Hierarchy
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon size={14} className="ml-2 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        This shows a deep recursive hierarchy of parent categories up to 5 levels deep
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h4>
                
                {selectedType && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => loadDeepTaxonomyForType(selectedType, 5)}
                    disabled={isDeepLoading}
                  >
                    <ZapIcon size={14} className={`mr-2 ${isDeepLoading ? 'animate-pulse' : ''}`} />
                    {isDeepLoading ? 'Loading...' : 'Load Deep Hierarchy'}
                  </Button>
                )}
              </div>
              
              {!selectedType ? (
                <div className="text-center text-muted-foreground py-8">
                  Select a node type to explore its deep category hierarchy
                </div>
              ) : !deepTaxonomyData[selectedType] ? (
                <div className="text-center text-muted-foreground py-8">
                  Click "Load Deep Hierarchy" to fetch recursive category data from Wikipedia
                </div>
              ) : deepTaxonomyData[selectedType].length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No deep hierarchy data found for {selectedType}
                </div>
              ) : (
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="mb-3 flex items-center">
                    <BarChartIcon size={16} className="mr-2 text-primary" />
                    <span className="font-medium">Wikipedia Category Hierarchy for {selectedType}</span>
                  </div>
                  
                  <ScrollArea className="max-h-96 pr-4">
                    <Accordion type="multiple" defaultValue={[]} className="text-sm">
                      {deepTaxonomyData[selectedType].map((hierarchy, index) => (
                        <AccordionItem key={`${hierarchy.name}-${index}`} value={`${index}`}>
                          <AccordionTrigger className="py-2 hover:no-underline">
                            <div className="flex items-center">
                              <Badge className="mr-2 bg-primary/20 text-primary hover:bg-primary/30">L0</Badge>
                              {hierarchy.name}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="border-l-2 border-gray-200 pl-4 ml-2 mt-2">
                              {hierarchy.parentCategories.map((parent, pIndex) => (
                                <CategoryHierarchyTree 
                                  key={`${parent.name}-${pIndex}`} 
                                  hierarchy={parent} 
                                  depth={1} 
                                />
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </ScrollArea>
                </div>
              )}
            </div>
          </ScrollArea>
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