import React, { useState, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiCall, Graph, Node as GraphNode, Edge as GraphEdge } from '@shared/schema';
import { 
  History, 
  Clock, 
  FileText, 
  Check, 
  AlertTriangle,
  X, 
  RefreshCcw,
  Copy,
  Eye,
  Code,
  MessageSquare,
  Terminal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Type guard for checking if an object has the shape of a Graph
function isGraphLike(obj: any): obj is Graph {
  return (
    obj && 
    typeof obj === 'object' && 
    Array.isArray(obj.nodes) && 
    Array.isArray(obj.edges)
  );
}

interface ApiCallHistoryProps {
  calls: ApiCall[];
  onReuse: (call: ApiCall) => void;
  isLoading?: boolean;
}

export default function ApiCallHistory({ calls, onReuse, isLoading = false }: ApiCallHistoryProps) {
  const { toast } = useToast();
  const [expandedCallId, setExpandedCallId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<ApiCall | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState('request');

  const handleToggleExpand = (id: number) => {
    setExpandedCallId(expandedCallId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
            <Check className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
            <X className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50">
            <RefreshCcw className="h-3 w-3 mr-1 animate-spin" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-gray-200 text-gray-700 bg-gray-50">
            {status}
          </Badge>
        );
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: `${label} has been copied to your clipboard.`,
          variant: "default"
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Copy failed",
          description: "Failed to copy to clipboard.",
          variant: "destructive"
        });
      }
    );
  };

  // Truncate long text for table display
  const truncateText = (text: string, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Calculate response time in seconds
  const calculateResponseTime = (requestTime: string, responseTime: string | null) => {
    if (!responseTime) return 'N/A';
    try {
      const request = new Date(requestTime).getTime();
      const response = new Date(responseTime).getTime();
      const diff = (response - request) / 1000; // in seconds
      return diff.toFixed(2) + 's';
    } catch (e) {
      return 'N/A';
    }
  };

  // Open the detailed view modal
  const openDetailView = (call: ApiCall) => {
    setSelectedCall(call);
    setDetailModalOpen(true);
    setActiveDetailTab('request');
  };

  // Format JSON for display
  const formatJSON = (data: unknown): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return 'Error formatting data';
    }
  };
  
  // Safe content for ReactNode to avoid type issues
  const safeContent = (content: unknown): React.ReactNode => {
    if (typeof content === 'string' || typeof content === 'number' || typeof content === 'boolean') {
      return content;
    } else if (content === null || content === undefined) {
      return '';
    } else {
      try {
        return JSON.stringify(content, null, 2);
      } catch (err) {
        console.error('Error converting content to string:', err);
        return 'Error displaying content';
      }
    }
  };
  
  // Type guard for response data
  const isValidResponseData = (data: unknown): data is Graph => {
    return isGraphLike(data as any);
  };
  
  // Safe accessors for typed graph data
  const getGraphNodes = (graph: unknown): GraphNode[] => {
    if (isGraphLike(graph as any)) {
      return (graph as Graph).nodes;
    }
    return [];
  };
  
  const getGraphEdges = (graph: unknown): GraphEdge[] => {
    if (isGraphLike(graph as any)) {
      return (graph as Graph).edges;
    }
    return [];
  };
  
  const getNodeById = (graph: unknown, id: string): GraphNode | undefined => {
    if (isGraphLike(graph as any)) {
      return (graph as Graph).nodes.find(n => n.id === id);
    }
    return undefined;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5" />
          API Call History
        </h3>
      </div>
      
      {calls.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
          <History className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No API calls have been made yet</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Time</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead>Input Text</TableHead>
                <TableHead className="w-[100px]">Response</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map(call => (
                <React.Fragment key={call.id}>
                  <TableRow 
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => handleToggleExpand(call.id)}
                  >
                    <TableCell className="whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        {formatDate(call.requestTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(call.status)}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {truncateText(call.text)}
                    </TableCell>
                    <TableCell>
                      {call.status === 'success' ? (
                        <span className="text-sm text-gray-500">
                          {calculateResponseTime(call.requestTime, call.responseTime)}
                        </span>
                      ) : call.status === 'error' ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-500">Pending...</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (call.status === 'success') {
                            onReuse(call);
                          } else {
                            toast({
                              title: "Cannot reuse",
                              description: "Only successful API calls can be reused.",
                              variant: "destructive"
                            });
                          }
                        }}
                        disabled={call.status !== 'success'}
                        title="Reuse this API call configuration"
                      >
                        <Copy className={`h-4 w-4 ${call.status === 'success' ? 'text-blue-600' : 'text-gray-400'}`} />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Details */}
                  {expandedCallId === call.id && (
                    <TableRow>
                      <TableCell colSpan={5} className="bg-gray-50 p-0">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="input" className="border-b-0">
                            <AccordionTrigger className="px-4 py-2 text-sm">
                              Input Details
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-3">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-medium text-sm mb-1">Text Input</h4>
                                  <div className="bg-white border border-gray-200 rounded p-2 text-sm overflow-auto max-h-32 relative group">
                                    {call.text}
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(call.text, 'Text input');
                                      }}
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm mb-1">System Prompt</h4>
                                  <div className="bg-white border border-gray-200 rounded p-2 font-mono text-xs overflow-auto max-h-32 relative group">
                                    {call.systemPrompt}
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(call.systemPrompt, 'System prompt');
                                      }}
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm mb-1">Extraction Prompt</h4>
                                  <div className="bg-white border border-gray-200 rounded p-2 font-mono text-xs overflow-auto max-h-32 relative group">
                                    {call.extractionPrompt}
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(call.extractionPrompt, 'Extraction prompt');
                                      }}
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm mb-1">Options</h4>
                                  <div className="bg-white border border-gray-200 rounded p-2 font-mono text-xs overflow-auto max-h-32">
                                    {JSON.stringify(call.options, null, 2)}
                                  </div>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          {call.status === 'success' && call.responseData !== null && call.responseData !== undefined && (
                            <AccordionItem value="output" className="border-t">
                              <AccordionTrigger className="px-4 py-2 text-sm">
                                Response Data
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-3">
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-medium text-sm">Graph Structure</h4>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 gap-1 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        try {
                                          const jsonString = JSON.stringify(call.responseData, null, 2) || '{}';
                                          copyToClipboard(jsonString, 'Response JSON');
                                        } catch (err) {
                                          console.error('Error stringifying response data:', err);
                                          copyToClipboard('{}', 'Response JSON (error)');
                                          toast({
                                            title: "Error copying data",
                                            description: "Could not convert response data to JSON",
                                            variant: "destructive"
                                          });
                                        }
                                      }}
                                    >
                                      <Copy className="h-3 w-3" />
                                      Copy JSON
                                    </Button>
                                  </div>
                                  <div className="flex text-sm mb-2 text-gray-600">
                                    <div className="mr-4">
                                      <span className="font-medium">Nodes:</span> {
                                        getGraphNodes(call.responseData).length
                                      }
                                    </div>
                                    <div>
                                      <span className="font-medium">Edges:</span> {
                                        getGraphEdges(call.responseData).length
                                      }
                                    </div>
                                  </div>
                                  <div className="flex justify-end mt-2 gap-2">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      className="gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDetailView(call);
                                      }}
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      Detailed View
                                    </Button>
                                    
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onReuse(call);
                                      }}
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                      Reuse Configuration
                                    </Button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                          
                          {call.status === 'error' && call.errorMessage && (
                            <AccordionItem value="error" className="border-t">
                              <AccordionTrigger className="px-4 py-2 text-sm">
                                Error Details
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-3">
                                <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
                                  {call.errorMessage}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )}
                        </Accordion>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Detailed View Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              API Call Details
              {selectedCall && (
                <Badge variant="outline" className="ml-2">
                  {formatDate(selectedCall.requestTime)}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {selectedCall?.status === 'success' && (
                <span>
                  Processed in {calculateResponseTime(selectedCall.requestTime, selectedCall.responseTime)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCall && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab} className="w-full flex-grow flex flex-col">
                <TabsList className="w-full justify-start px-4 pt-2 border-b rounded-none gap-2">
                  <TabsTrigger value="request" className="gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Request
                  </TabsTrigger>
                  <TabsTrigger value="response" className="gap-1" disabled={selectedCall.status !== 'success'}>
                    <Terminal className="h-4 w-4" />
                    Response
                  </TabsTrigger>
                  <TabsTrigger value="json" className="gap-1" disabled={selectedCall.status !== 'success'}>
                    <Code className="h-4 w-4" />
                    JSON
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="request" className="flex-1 p-0 m-0 overflow-hidden">
                  <ScrollArea className="h-full w-full px-6 py-4">
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Input Text</h3>
                        <div className="bg-white border border-gray-200 rounded-md p-4">
                          {selectedCall.text}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">System Prompt</h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 font-mono text-sm whitespace-pre-wrap">
                          {selectedCall.systemPrompt}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Extraction Prompt</h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 font-mono text-sm whitespace-pre-wrap">
                          {selectedCall.extractionPrompt}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Options</h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 font-mono text-sm whitespace-pre-wrap">
                          {formatJSON(selectedCall.options)}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="response" className="flex-1 p-0 m-0 overflow-hidden">
                  {selectedCall && selectedCall.status === 'success' && selectedCall.responseData && (
                    <ScrollArea className="h-full w-full px-6 py-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">Graph Response</h3>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => {
                                try {
                                  const jsonString = JSON.stringify(selectedCall.responseData, null, 2) || '{}';
                                  copyToClipboard(jsonString, 'Response JSON');
                                } catch (err) {
                                  console.error('Error stringifying response data:', err);
                                  toast({
                                    title: "Error copying data",
                                    description: "Could not convert response data to JSON",
                                    variant: "destructive"
                                  });
                                }
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Copy JSON
                            </Button>
                            
                            <Button 
                              size="sm" 
                              className="gap-1"
                              onClick={() => {
                                onReuse(selectedCall);
                                setDetailModalOpen(false);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Apply Configuration
                            </Button>
                          </div>
                        </div>
                        
                        {isGraphLike(selectedCall.responseData as any) && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-200 rounded-md p-4">
                              <h4 className="font-medium mb-2">Nodes ({getGraphNodes(selectedCall.responseData).length})</h4>
                              <div className="max-h-[400px] overflow-y-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>ID</TableHead>
                                      <TableHead>Label</TableHead>
                                      <TableHead>Type</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {getGraphNodes(selectedCall.responseData).map((node: GraphNode) => (
                                      <TableRow key={node.id}>
                                        <TableCell className="font-mono text-xs">{node.id}</TableCell>
                                        <TableCell>{node.label}</TableCell>
                                        <TableCell>
                                          <Badge variant="outline">{node.type}</Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-md p-4">
                              <h4 className="font-medium mb-2">Edges ({getGraphEdges(selectedCall.responseData).length})</h4>
                              <div className="max-h-[400px] overflow-y-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Source</TableHead>
                                      <TableHead>Relation</TableHead>
                                      <TableHead>Target</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {getGraphEdges(selectedCall.responseData).map((edge: GraphEdge) => {
                                      // Find source and target node labels
                                      const sourceNode = getNodeById(selectedCall.responseData, edge.source);
                                      const targetNode = getNodeById(selectedCall.responseData, edge.target);
                                      
                                      return (
                                        <TableRow key={edge.id}>
                                          <TableCell className="truncate max-w-[100px]">{sourceNode?.label || edge.source}</TableCell>
                                          <TableCell className="truncate max-w-[100px]">{edge.label}</TableCell>
                                          <TableCell className="truncate max-w-[100px]">{targetNode?.label || edge.target}</TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                  
                  {selectedCall.status === 'error' && selectedCall.errorMessage && (
                    <div className="p-6">
                      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Error Response
                        </h3>
                        <p className="whitespace-pre-wrap">{selectedCall.errorMessage}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="json" className="flex-1 p-0 m-0 overflow-hidden">
                  {selectedCall && selectedCall.status === 'success' && selectedCall.responseData && (
                    <div className="h-full relative">
                      <ScrollArea className="h-full w-full">
                        <div className="p-4 font-mono text-sm whitespace-pre bg-gray-50">
                          {safeContent(selectedCall.responseData)}
                        </div>
                      </ScrollArea>
                      <div className="absolute top-2 right-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          className="gap-1"
                          onClick={() => {
                            try {
                              const jsonString = JSON.stringify(selectedCall.responseData, null, 2) || '{}';
                              copyToClipboard(jsonString, 'Response JSON');
                            } catch (err) {
                              console.error('Error stringifying response data:', err);
                              toast({
                                title: "Error copying data",
                                description: "Could not convert response data to JSON",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy JSON
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}