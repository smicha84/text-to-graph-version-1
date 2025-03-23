import React, { useState } from 'react';
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
import { ApiCall, Graph } from '@shared/schema';
import { 
  History, 
  Clock, 
  FileText, 
  Check, 
  AlertTriangle,
  X, 
  RefreshCcw,
  Copy,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiCallHistoryProps {
  calls: ApiCall[];
  onReuse: (call: ApiCall) => void;
  isLoading?: boolean;
}

export default function ApiCallHistory({ calls, onReuse, isLoading = false }: ApiCallHistoryProps) {
  const { toast } = useToast();
  const [expandedCallId, setExpandedCallId] = useState<number | null>(null);

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
                          
                          {call.status === 'success' && call.responseData && (
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
                                        copyToClipboard(JSON.stringify(call.responseData, null, 2), 'Response JSON');
                                      }}
                                    >
                                      <Copy className="h-3 w-3" />
                                      Copy JSON
                                    </Button>
                                  </div>
                                  <div className="flex text-sm mb-2 text-gray-600">
                                    <div className="mr-4">
                                      <span className="font-medium">Nodes:</span> {(call.responseData as Graph)?.nodes?.length || 0}
                                    </div>
                                    <div>
                                      <span className="font-medium">Edges:</span> {(call.responseData as Graph)?.edges?.length || 0}
                                    </div>
                                  </div>
                                  <div className="text-right mt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onReuse(call);
                                      }}
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                      View & Reuse Configuration
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
    </div>
  );
}