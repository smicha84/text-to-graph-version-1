import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { Textarea } from '@/components/ui/textarea';
import { Send, RotateCcw, Loader2, Database, Info, CheckCircle, ChevronDown, ChevronUp, AlertTriangle, PlusCircle } from 'lucide-react';
import { ChatProvider, useChatContext } from '@/contexts/ChatContext';
// We no longer need to import UICustomizationDemo as it's now integrated directly in the Header

interface ShowcaseItemProps {
  title: string;
  description: string;
  complexity: 'Easy' | 'Medium' | 'Hard';
  impact: 'Low' | 'Medium' | 'High';
  beforeImage: React.ReactNode;
  afterImage: React.ReactNode;
  explanation: string;
}

function ShowcaseItem({ title, description, complexity, impact, beforeImage, afterImage, explanation }: ShowcaseItemProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="flex gap-2 mt-2">
          <Badge variant={complexity === 'Easy' ? 'default' : complexity === 'Medium' ? 'secondary' : 'destructive'}>
            {complexity} Complexity
          </Badge>
          <Badge variant={impact === 'High' ? 'default' : impact === 'Medium' ? 'secondary' : 'outline'}>
            {impact} Impact
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">View Details</Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Before</h3>
                <div className="border rounded-md p-4 bg-gray-50 min-h-[200px]">
                  {beforeImage}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">After</h3>
                <div className="border rounded-md p-4 bg-gray-50 min-h-[200px]">
                  {afterImage}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Explanation</h3>
              <div className="border rounded-md p-4 bg-gray-50">
                <p className="text-sm">{explanation}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Mock components for before/after demonstrations
const BeforeCollapsiblePanel = () => (
  <div className="border p-4 rounded-md">
    <div className="bg-gray-100 p-3 rounded mb-3">
      <h3 className="font-medium">Graph Summary</h3>
      <div className="bg-white p-2 border rounded mt-2">
        <p className="text-sm">10 nodes, 15 edges, 4 types</p>
      </div>
    </div>
    <div className="bg-gray-100 p-3 rounded mb-3">
      <h3 className="font-medium">Node Context</h3>
      <div className="bg-white p-2 border rounded mt-2">
        <p className="text-sm">Selected: Person (Employee)</p>
      </div>
    </div>
    <div className="bg-gray-100 p-3 rounded mb-3">
      <h3 className="font-medium">Ontology Patterns</h3>
      <div className="bg-white p-2 border rounded mt-2">
        <p className="text-sm">Person → Works At → Company</p>
      </div>
    </div>
  </div>
);

const AfterCollapsiblePanel = () => {
  const [openSummary, setOpenSummary] = useState(true);
  const [openContext, setOpenContext] = useState(false);
  const [openOntology, setOpenOntology] = useState(false);
  
  return (
    <div className="border p-4 rounded-md">
      <Collapsible open={openSummary} onOpenChange={setOpenSummary} className="mb-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-gray-100 rounded">
          <span className="font-medium">Graph Summary</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${openSummary ? 'rotate-180 transform' : ''}`}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent className="bg-white p-2 border rounded mt-1">
          <p className="text-sm">10 nodes, 15 edges, 4 types</p>
        </CollapsibleContent>
      </Collapsible>
      
      <Collapsible open={openContext} onOpenChange={setOpenContext} className="mb-2">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-gray-100 rounded">
          <span className="font-medium">Node Context</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${openContext ? 'rotate-180 transform' : ''}`}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent className="bg-white p-2 border rounded mt-1">
          <p className="text-sm">Selected: Person (Employee)</p>
        </CollapsibleContent>
      </Collapsible>
      
      <Collapsible open={openOntology} onOpenChange={setOpenOntology}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-gray-100 rounded">
          <span className="font-medium">Ontology Patterns</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${openOntology ? 'rotate-180 transform' : ''}`}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent className="bg-white p-2 border rounded mt-1">
          <p className="text-sm">Person → Works At → Company</p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const BeforeTabPanel = () => (
  <div className="border p-4 rounded-md">
    <div className="flex flex-col space-y-4">
      <div className="bg-gray-100 p-3 rounded">
        <h3 className="font-medium">Graph Summary</h3>
        <div className="bg-white p-2 border rounded mt-2">
          <p className="text-sm">10 nodes, 15 edges, 4 types</p>
        </div>
      </div>
      <div className="bg-gray-100 p-3 rounded">
        <h3 className="font-medium">Node Context</h3>
        <div className="bg-white p-2 border rounded mt-2">
          <p className="text-sm">Selected: Person (Employee)</p>
        </div>
      </div>
      <div className="bg-gray-100 p-3 rounded">
        <h3 className="font-medium">Ontology Patterns</h3>
        <div className="bg-white p-2 border rounded mt-2">
          <p className="text-sm">Person → Works At → Company</p>
        </div>
      </div>
    </div>
  </div>
);

const AfterTabPanel = () => {
  const [activeTab, setActiveTab] = useState("summary");
  
  return (
    <div className="border p-4 rounded-md">
      <div className="w-full">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button 
            className={`py-2 text-sm font-medium rounded-t-md transition-colors ${
              activeTab === "summary" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("summary")}
          >
            Graph Summary
          </button>
          <button 
            className={`py-2 text-sm font-medium rounded-t-md transition-colors ${
              activeTab === "context" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("context")}
          >
            Node Context
          </button>
          <button 
            className={`py-2 text-sm font-medium rounded-t-md transition-colors ${
              activeTab === "ontology" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveTab("ontology")}
          >
            Ontology Patterns
          </button>
        </div>
        
        <div className="bg-gray-50 p-3 rounded min-h-[100px]">
          {activeTab === "summary" && (
            <div className="bg-white p-3 border rounded">
              <h4 className="text-sm font-medium mb-2 text-blue-600">Graph Summary</h4>
              <p className="text-sm">10 nodes, 15 edges, 4 types</p>
              <p className="text-xs text-gray-500 mt-2">Overview of your current graph structure</p>
            </div>
          )}
          
          {activeTab === "context" && (
            <div className="bg-white p-3 border rounded">
              <h4 className="text-sm font-medium mb-2 text-blue-600">Node Context</h4>
              <p className="text-sm">Selected: Person (Employee)</p>
              <p className="text-xs text-gray-500 mt-2">Details about the currently selected node</p>
            </div>
          )}
          
          {activeTab === "ontology" && (
            <div className="bg-white p-3 border rounded">
              <h4 className="text-sm font-medium mb-2 text-blue-600">Ontology Patterns</h4>
              <p className="text-sm">Person → Works At → Company</p>
              <p className="text-xs text-gray-500 mt-2">Common relationship patterns in your graph</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BeforeSidebar = () => (
  <div className="border p-4 rounded-md flex">
    <div className="w-64 bg-gray-100 p-2 rounded">
      <div className="py-2 px-4 hover:bg-gray-200 rounded cursor-pointer">Home</div>
      <div className="py-2 px-4 hover:bg-gray-200 rounded cursor-pointer">Graph View</div>
      <div className="py-2 px-4 hover:bg-gray-200 rounded cursor-pointer">Logs</div>
    </div>
    <div className="flex-1 ml-4 bg-gray-50 p-2 rounded">
      <p className="text-sm">Main content area is limited by fixed sidebar width</p>
    </div>
  </div>
);

const AfterSidebar = () => {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className="border p-4 rounded-md flex">
      <div className={`${expanded ? 'w-64' : 'w-16'} bg-gray-100 p-2 rounded transition-all duration-300`}>
        {expanded ? (
          <>
            <div className="py-2 px-4 hover:bg-gray-200 rounded cursor-pointer">Home</div>
            <div className="py-2 px-4 hover:bg-gray-200 rounded cursor-pointer">Graph View</div>
            <div className="py-2 px-4 hover:bg-gray-200 rounded cursor-pointer">Logs</div>
          </>
        ) : (
          <>
            <div className="py-2 flex justify-center hover:bg-gray-200 rounded cursor-pointer">H</div>
            <div className="py-2 flex justify-center hover:bg-gray-200 rounded cursor-pointer">G</div>
            <div className="py-2 flex justify-center hover:bg-gray-200 rounded cursor-pointer">L</div>
          </>
        )}
        <button 
          className="mt-4 w-full flex justify-center p-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '◀' : '▶'}
        </button>
      </div>
      <div className="flex-1 ml-4 bg-gray-50 p-2 rounded">
        <p className="text-sm">Main content area adapts to sidebar width</p>
      </div>
    </div>
  );
};

const BeforeHoverExpand = () => (
  <div className="border p-4 rounded-md">
    <div className="bg-gray-100 p-3 rounded mb-3">
      <h3 className="font-medium">Node: Person (Employee)</h3>
      <div className="bg-white p-2 border rounded mt-2">
        <p className="text-sm">ID: node123</p>
        <p className="text-sm">Name: John Doe</p>
        <p className="text-sm">Age: 30</p>
        <p className="text-sm">Department: Engineering</p>
        <p className="text-sm">Years of Service: 5</p>
        <p className="text-sm">Skills: JavaScript, TypeScript, React</p>
        <p className="text-sm">Reports To: Jane Smith</p>
        <p className="text-sm">Office Location: Building A, Floor 3</p>
      </div>
    </div>
  </div>
);

const AfterHoverExpand = () => {
  const [hovering, setHovering] = useState(false);
  
  return (
    <div className="border p-4 rounded-md">
      <div 
        className="bg-gray-100 p-3 rounded mb-3"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <h3 className="font-medium">Node: Person (Employee)</h3>
        <div className="bg-white p-2 border rounded mt-2">
          <p className="text-sm">ID: node123</p>
          <p className="text-sm">Name: John Doe</p>
          <p className="text-sm">Age: 30</p>
          {hovering && (
            <div className="animate-fadeIn">
              <p className="text-sm">Department: Engineering</p>
              <p className="text-sm">Years of Service: 5</p>
              <p className="text-sm">Skills: JavaScript, TypeScript, React</p>
              <p className="text-sm">Reports To: Jane Smith</p>
              <p className="text-sm">Office Location: Building A, Floor 3</p>
            </div>
          )}
          {!hovering && (
            <div className="text-xs text-blue-500 cursor-pointer">
              Hover to see more details...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Basic chat interface (before)
const BeforeGraphChat = () => {
  return (
    <div className="border rounded-md overflow-hidden max-w-full" style={{ maxHeight: '300px' }}>
      <div className="bg-gray-200 p-2 flex justify-between items-center">
        <div className="font-medium">Graph Chat</div>
        <button className="px-2 py-1 bg-gray-300 rounded text-xs">Clear</button>
      </div>
      
      <div className="h-32 overflow-y-auto p-2 bg-white">
        <div className="mb-2">
          <div className="font-medium text-xs text-gray-500">User:</div>
          <div className="p-1 bg-blue-50 rounded">What patterns do you see in this graph?</div>
        </div>
        <div className="mb-2">
          <div className="font-medium text-xs text-gray-500">System:</div>
          <div className="p-1 bg-gray-50 rounded">
            I can see several Person nodes connected to Company nodes through 'WORKS_AT' relationships.
            There are also some Department nodes connected to the Company nodes.
          </div>
        </div>
      </div>
      
      <div className="p-2 border-t">
        <div className="flex">
          <input 
            type="text" 
            className="flex-1 p-1 text-sm border rounded-l"
            placeholder="Type your message..." 
          />
          <button className="bg-blue-500 text-white px-2 py-1 rounded-r text-sm">Send</button>
        </div>
      </div>
    </div>
  );
};

// Advanced chat interface with graph analysis (after)
const AfterGraphChat = () => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border rounded-md overflow-hidden shadow-sm max-w-full" style={{ maxHeight: '400px' }}>
      <div className="bg-blue-600 text-white p-2 flex justify-between items-center">
        <div className="flex items-center">
          <Database size={16} className="mr-1" />
          <div className="font-medium">Graph Explorer Chat</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-blue-700 px-2 py-0.5 rounded-full text-xs flex items-center">
            <Database size={12} className="mr-1" />
            <span>Graph Connected</span>
          </div>
          <button className="p-1 hover:bg-blue-500 rounded">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
      
      <div className="h-40 overflow-y-auto p-2 bg-gray-50">
        <div className="p-2 rounded-lg border bg-blue-100 border-blue-300 mb-2">
          <div className="flex items-start">
            <div className="mr-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">U</div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs font-medium">User</div>
                <div className="text-xs text-gray-500">11:30 AM</div>
              </div>
              <div className="text-sm">What patterns do you see in this knowledge graph?</div>
            </div>
          </div>
        </div>
        
        <div className="p-2 rounded-lg border bg-gray-100 border-gray-300 mb-2">
          <div className="flex items-start">
            <div className="mr-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">A</div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs font-medium">Assistant</div>
                <div className="text-xs text-gray-500">11:31 AM</div>
              </div>
              <div className="text-sm">
                I notice several interesting patterns in this knowledge graph:
                
                1. There's a hierarchical organization structure with Departments within Companies
                2. People have direct reporting relationships forming a management tree
                3. There are clusters of expertise based on skills across different departments
              </div>
              
              <div className="mt-2">
                <div 
                  className="flex items-center text-xs font-medium text-blue-600 cursor-pointer"
                  onClick={() => setExpanded(!expanded)}
                >
                  <Database size={12} className="mr-1" />
                  <span>Graph Analysis</span>
                  {expanded ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />}
                </div>
                
                {expanded && (
                  <div className="mt-1 p-2 bg-white border border-blue-200 rounded-md text-xs">
                    <div className="mb-2">
                      <div className="font-medium mb-1 flex items-center">
                        <Info size={12} className="mr-1" />
                        Analysis
                      </div>
                      <div className="text-gray-700">
                        The graph shows a corporate structure with multiple departments and a clear hierarchy.
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="font-medium mb-1 flex items-center">
                        <PlusCircle size={12} className="mr-1" />
                        Suggested Nodes (2)
                      </div>
                      <ul className="ml-4 list-disc">
                        <li className="text-gray-700">
                          Executive Team <span className="text-gray-500">(Department)</span>
                        </li>
                        <li className="text-gray-700">
                          Project Management Office <span className="text-gray-500">(Department)</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-1 h-6 text-xs"
                    >
                      <CheckCircle size={12} className="mr-1" />
                      Apply Changes to Graph
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-2 border-t bg-white">
        <div className="flex space-x-2">
          <Textarea
            placeholder="Type a message about the graph..."
            className="resize-none text-sm"
            rows={2}
          />
          <Button 
            size="sm"
            className="self-end"
          >
            <Send size={14} className="mr-1" />
            Send
          </Button>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          <span className="font-medium">Graph context:</span> 32 nodes, 48 edges
        </div>
      </div>
    </div>
  );
};

const BeforeAppendMode = () => (
  <div className="p-2 rounded-md">
    <div className="bg-white border p-3 rounded">
      <div className="border-b pb-2 mb-3">
        <h3 className="font-medium text-xs">Graph Generation Options</h3>
      </div>
      
      <div className="mb-3">
        <div className="flex items-center mb-1">
          <input
            type="checkbox"
            id="demoAppendMode"
            className="h-4 w-4 text-gray-400 border-gray-300 rounded cursor-not-allowed"
            disabled
          />
          <label htmlFor="demoAppendMode" className="ml-2 text-sm font-medium text-gray-400 cursor-not-allowed">
            Append to Existing Graph
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-400 ml-6">
          Add new nodes and connections to the current graph instead of replacing it
        </p>
      </div>
      
      <div className="mt-4">
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded transition-colors flex items-center justify-center"
        >
          <span>Generate Graph</span>
        </button>
      </div>
    </div>
  </div>
);

const AfterAppendMode = () => (
  <div className="p-2 rounded-md">
    <div className="bg-white border p-3 rounded">
      <div className="border-b pb-2 mb-3">
        <h3 className="font-medium text-xs">Graph Generation Options</h3>
      </div>
      
      <div className="mb-3">
        <div className="flex items-center mb-1">
          <input
            type="checkbox"
            id="demoAppendMode"
            className="h-4 w-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500 cursor-pointer"
            defaultChecked
          />
          <label htmlFor="demoAppendMode" className="ml-2 text-sm font-medium text-blue-800 cursor-pointer">
            Append to Existing Graph
          </label>
        </div>
        <p className="mt-1 text-xs text-blue-700 ml-6">
          Add new nodes and connections to the current graph instead of replacing it
        </p>
      </div>
      
      <div className="mt-4">
        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded transition-colors flex items-center justify-center"
        >
          <span>Append to Graph</span>
        </button>
      </div>
    </div>
  </div>
);

const BeforeFocusMode = () => (
  <div className="p-2 rounded-md">
    <div className="grid grid-cols-3 gap-2">
      <div className="col-span-1 bg-gray-100 p-2 rounded">
        <h3 className="font-medium text-xs">Input</h3>
        <div className="bg-white p-2 border rounded mt-1 h-20">
          <p className="text-xs">Text input area...</p>
        </div>
      </div>
      <div className="col-span-1 bg-gray-100 p-2 rounded">
        <h3 className="font-medium text-xs">Graph</h3>
        <div className="bg-white p-2 border rounded mt-1 h-20">
          <div className="flex items-center justify-center h-full">
            <p className="text-xs">Graph view...</p>
          </div>
        </div>
      </div>
      <div className="col-span-1 bg-gray-100 p-2 rounded">
        <h3 className="font-medium text-xs">Properties</h3>
        <div className="bg-white p-2 border rounded mt-1 h-20">
          <p className="text-xs">Node properties...</p>
        </div>
      </div>
    </div>
  </div>
);

const AfterFocusMode = () => {
  const [focusArea, setFocusArea] = useState<'all' | 'input' | 'graph' | 'properties'>('all');
  
  return (
    <div className="p-2 rounded-md">
      <div className="mb-2 flex flex-wrap justify-end gap-1">
        <Button size="sm" className="text-xs py-1 h-7" variant={focusArea === 'all' ? 'default' : 'outline'} onClick={() => setFocusArea('all')}>
          All Panels
        </Button>
        <Button size="sm" className="text-xs py-1 h-7" variant={focusArea === 'input' ? 'default' : 'outline'} onClick={() => setFocusArea('input')}>
          Focus Input
        </Button>
        <Button size="sm" className="text-xs py-1 h-7" variant={focusArea === 'graph' ? 'default' : 'outline'} onClick={() => setFocusArea('graph')}>
          Focus Graph
        </Button>
        <Button size="sm" className="text-xs py-1 h-7" variant={focusArea === 'properties' ? 'default' : 'outline'} onClick={() => setFocusArea('properties')}>
          Focus Properties
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div 
          className={`${
            focusArea === 'all' 
              ? 'col-span-1' 
              : focusArea === 'input' 
                ? 'col-span-3' 
                : 'hidden'
          } bg-gray-100 p-2 rounded transition-all duration-300`}
        >
          <h3 className="font-medium text-xs">Input</h3>
          <div className="bg-white p-2 border rounded mt-1 h-20">
            <p className="text-xs">Text input area...</p>
          </div>
        </div>
        
        <div 
          className={`${
            focusArea === 'all' 
              ? 'col-span-1' 
              : focusArea === 'graph' 
                ? 'col-span-3' 
                : 'hidden'
          } bg-gray-100 p-2 rounded transition-all duration-300`}
        >
          <h3 className="font-medium text-xs">Graph</h3>
          <div className="bg-white p-2 border rounded mt-1 h-20">
            <div className="flex items-center justify-center h-full">
              <p className="text-xs">Graph view...</p>
            </div>
          </div>
        </div>
        
        <div 
          className={`${
            focusArea === 'all' 
              ? 'col-span-1' 
              : focusArea === 'properties' 
                ? 'col-span-3' 
                : 'hidden'
          } bg-gray-100 p-2 rounded transition-all duration-300`}
        >
          <h3 className="font-medium text-xs">Properties</h3>
          <div className="bg-white p-2 border rounded mt-1 h-20">
            <p className="text-xs">Node properties...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const BeforeBreadcrumbNavigation = () => (
  <div className="border p-4 rounded-md">
    <div className="bg-gray-100 p-3 rounded mb-3">
      <h3 className="font-medium">Selected Node: Person (Employee)</h3>
      <div className="bg-white p-2 border rounded mt-2">
        <p className="text-sm">Name: John Doe</p>
        <p className="text-sm">Department: Engineering</p>
      </div>
    </div>
  </div>
);

const AfterBreadcrumbNavigation = () => {
  const [view, setView] = useState<'graph' | 'node' | 'property'>('node');
  
  return (
    <div className="border p-4 rounded-md">
      <div className="flex items-center mb-3 text-sm">
        <span 
          className="text-blue-500 hover:underline cursor-pointer"
          onClick={() => setView('graph')}
        >
          Graph
        </span>
        <span className="mx-2">›</span>
        <span 
          className="text-blue-500 hover:underline cursor-pointer"
          onClick={() => setView('node')}
        >
          Person (Employee)
        </span>
        {view === 'property' && (
          <>
            <span className="mx-2">›</span>
            <span className="text-gray-700">Department</span>
          </>
        )}
      </div>
      
      <div className="bg-gray-100 p-3 rounded mb-3">
        {view === 'graph' && (
          <>
            <h3 className="font-medium">Graph Overview</h3>
            <div className="bg-white p-2 border rounded mt-2">
              <p className="text-sm">10 nodes, 15 edges</p>
              <p className="text-sm">Click a node to explore details</p>
            </div>
          </>
        )}
        
        {view === 'node' && (
          <>
            <h3 className="font-medium">Node: Person (Employee)</h3>
            <div className="bg-white p-2 border rounded mt-2">
              <p className="text-sm">Name: John Doe</p>
              <p 
                className="text-sm text-blue-500 hover:underline cursor-pointer"
                onClick={() => setView('property')}
              >
                Department: Engineering
              </p>
            </div>
          </>
        )}
        
        {view === 'property' && (
          <>
            <h3 className="font-medium">Property: Department</h3>
            <div className="bg-white p-2 border rounded mt-2">
              <p className="text-sm">Value: Engineering</p>
              <p className="text-sm">Type: String</p>
              <p className="text-sm">Related nodes: 5 other employees</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Entity Deduplication Notification Components
const BeforeDeduplicationNotifications = () => {
  return (
    <div className="p-3 border rounded bg-white">
      <div className="mb-2 border rounded-lg shadow-sm p-2 bg-white">
        <div className="flex items-center">
          <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold">Processing Subgraph 2/3</div>
            <div className="text-xs text-gray-600">Generating graph for: "Market Analysis" (66% complete)</div>
          </div>
        </div>
      </div>
      
      <div className="mb-2 border rounded-lg shadow-sm p-2 bg-white">
        <div className="flex items-center">
          <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold">Subgraph 2/3 Complete</div>
            <div className="text-xs text-gray-600">Added 8 nodes and 6 edges. Progress: 66%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AfterDeduplicationNotifications = () => {
  return (
    <div className="p-3 border rounded bg-white">
      <div className="mb-2 border rounded-lg shadow-sm p-2 bg-white">
        <div className="flex items-center">
          <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold">Processing Subgraph 2/3</div>
            <div className="text-xs text-gray-600">Generating graph for: "Market Analysis" (66% complete) with entity deduplication</div>
          </div>
        </div>
      </div>
      
      <div className="mb-2 border rounded-lg shadow-sm p-2 bg-white">
        <div className="flex items-center">
          <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold">Subgraph 2/3 Complete</div>
            <div className="text-xs text-gray-600">Added 8 nodes and 6 edges with entity deduplication. Progress: 66%</div>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg shadow-sm p-2 bg-white">
        <div className="flex items-center">
          <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold">All Subgraphs Processed</div>
            <div className="text-xs text-gray-600">Successfully generated complete graph from 3 segments with intelligent entity deduplication.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Components for text label update showcase
const BeforeTextLabelsUpdate = () => (
  <div className="border p-4 rounded-md bg-white">
    <div className="flex flex-col space-y-4">
      <div className="bg-blue-600 text-white p-3 rounded flex items-center">
        <Database size={16} className="mr-2" />
        <h3 className="font-medium">Graph AI Component Output</h3>
      </div>
      
      <div className="p-3 border rounded">
        <div className="flex items-center">
          <span className="text-gray-700 font-medium">Navigation menu item:</span>
          <span className="ml-2 px-3 py-1 bg-gray-100 rounded">Graph AI Component Output</span>
        </div>
      </div>
      
      <div className="p-3 border rounded">
        <div className="flex items-center">
          <span className="text-gray-700 font-medium">Browser tab:</span>
          <span className="ml-2 px-3 py-1 bg-gray-100 rounded">Text-to-Graph AI | Dashboard</span>
        </div>
      </div>
    </div>
  </div>
);

const AfterTextLabelsUpdate = () => (
  <div className="border p-4 rounded-md bg-white">
    <div className="flex flex-col space-y-4">
      <div className="bg-blue-600 text-white p-3 rounded flex items-center">
        <Database size={16} className="mr-2" />
        <h3 className="font-medium">Graph Component AI Text Outputs</h3>
      </div>
      
      <div className="p-3 border rounded">
        <div className="flex items-center">
          <span className="text-gray-700 font-medium">Navigation menu item:</span>
          <span className="ml-2 px-3 py-1 bg-gray-100 rounded">Graph Component AI Text Outputs</span>
        </div>
      </div>
      
      <div className="p-3 border rounded">
        <div className="flex items-center">
          <span className="text-gray-700 font-medium">Browser tab:</span>
          <span className="ml-2 px-3 py-1 bg-gray-100 rounded">Knowledge Graph AI | Text Analyzer</span>
        </div>
      </div>
    </div>
  </div>
);

// Before component for subgraph sequential numbering
const BeforeSubgraphNumbering = () => {
  return (
    <div className="border p-4 rounded-md">
      <div className="mb-3">
        <h3 className="font-medium mb-2">Subgraph Generation (First Batch)</h3>
        <div className="flex gap-2">
          <Badge className="bg-blue-500">sg1</Badge>
          <Badge className="bg-green-500">sg2</Badge>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded">
        <div className="text-sm font-medium mb-1">Graph Overview</div>
        <div className="flex gap-3 mb-3">
          <div className="bg-white p-2 border rounded text-sm">
            <span className="font-medium">Subgraph 1:</span>
            <div className="text-xs">5 nodes, 4 edges</div>
          </div>
          <div className="bg-white p-2 border rounded text-sm">
            <span className="font-medium">Subgraph 2:</span>
            <div className="text-xs">3 nodes, 2 edges</div>
          </div>
        </div>
        
        <div className="text-sm font-medium mb-1">New Batch - Second Operation</div>
        <div className="flex gap-2 mb-2">
          <Badge className="bg-red-500">sg1</Badge>
          <Badge className="bg-purple-500">sg2</Badge>
        </div>
        
        <div className="bg-orange-100 p-2 rounded border border-orange-200 text-xs">
          <AlertTriangle className="inline-block h-3 w-3 mr-1 text-orange-500" />
          <span className="text-orange-700">Notice how new subgraphs use same IDs (sg1, sg2)</span>
        </div>
      </div>
    </div>
  );
};

// After component for subgraph sequential numbering
const AfterSubgraphNumbering = () => {
  return (
    <div className="border p-4 rounded-md">
      <div className="mb-3">
        <h3 className="font-medium mb-2">Subgraph Generation (First Batch)</h3>
        <div className="flex gap-2">
          <Badge className="bg-blue-500">sg1</Badge>
          <Badge className="bg-green-500">sg2</Badge>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded">
        <div className="text-sm font-medium mb-1">Graph Overview</div>
        <div className="flex gap-3 mb-3">
          <div className="bg-white p-2 border rounded text-sm">
            <span className="font-medium">Subgraph 1:</span>
            <div className="text-xs">5 nodes, 4 edges</div>
          </div>
          <div className="bg-white p-2 border rounded text-sm">
            <span className="font-medium">Subgraph 2:</span>
            <div className="text-xs">3 nodes, 2 edges</div>
          </div>
        </div>
        
        <div className="text-sm font-medium mb-1">New Batch - Second Operation</div>
        <div className="flex gap-2 mb-2">
          <Badge className="bg-red-500">sg3</Badge>
          <Badge className="bg-purple-500">sg4</Badge>
        </div>
        
        <div className="bg-green-100 p-2 rounded border border-green-200 text-xs">
          <CheckCircle className="inline-block h-3 w-3 mr-1 text-green-500" />
          <span className="text-green-700">Improved: New subgraphs use sequential IDs (sg3, sg4)</span>
        </div>
      </div>
    </div>
  );
};

export default function UIShowcase() {
  return (
    <div className="container mx-auto">
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-6">UI Enhancement Showcase</h1>
        <p className="text-gray-600 mb-8">
          This page demonstrates various UI enhancement options with before/after examples and detailed explanations.
          Click "View Details" on any card to see the full comparison.
        </p>
        
        <Tabs defaultValue="layout" className="mb-10">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="layout">Layout Structure</TabsTrigger>
            <TabsTrigger value="visual">Visual Space</TabsTrigger>
            <TabsTrigger value="ux">User Experience</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="interaction">Interaction Patterns</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Experience</TabsTrigger>
            <TabsTrigger value="customization">UI Customization</TabsTrigger>
          </TabsList>
          
          <TabsContent value="layout" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ShowcaseItem
                title="Collapsible Panels"
                description="Replace static panels with collapsible sections that can be expanded or collapsed as needed"
                complexity="Easy"
                impact="High"
                beforeImage={<BeforeCollapsiblePanel />}
                afterImage={<AfterCollapsiblePanel />}
                explanation="Collapsible panels allow users to focus on the information that matters most to them while keeping other data easily accessible. This reduces visual clutter and cognitive load, especially important in information-dense interfaces like knowledge graphs. Implementation is straightforward using the Collapsible component from shadcn/ui, requiring minimal changes to existing component structure."
              />
              
              <ShowcaseItem
                title="Tab-Based Organization"
                description="Convert stacked content sections into tabbed interfaces for cleaner organization"
                complexity="Easy"
                impact="Medium"
                beforeImage={<BeforeTabPanel />}
                afterImage={<AfterTabPanel />}
                explanation="Tabs maintain access to all content while dramatically reducing vertical space requirements. This approach works well for related but distinct content sections that users typically access separately. The implementation leverages the existing Tabs component, making it simple to restructure current information hierarchies without disrupting the underlying data flow."
              />
              
              <ShowcaseItem
                title="Sidebar Expansion"
                description="Make the sidebar collapsible to provide more space for the main content area"
                complexity="Medium"
                impact="High"
                beforeImage={<BeforeSidebar />}
                afterImage={<AfterSidebar />}
                explanation="A collapsible sidebar gives users control over their workspace, allowing them to allocate screen real estate to what's most important at any given moment. This is especially valuable when working with complex visualizations that benefit from maximum space. The animation provides a smooth transition that helps users maintain context awareness as they change the layout."
              />
              
              <ShowcaseItem
                title="Floating Panels"
                description="Convert fixed panels to floating/draggable windows that users can position as needed"
                complexity="Hard"
                impact="Medium"
                beforeImage={<div className="p-4 bg-gray-50 flex justify-center">
                  <div className="border p-3 rounded bg-white text-center">
                    <p className="text-sm mb-2">Fixed position panel</p>
                    <div className="w-32 h-16 bg-gray-200 rounded-sm"></div>
                  </div>
                </div>}
                afterImage={<div className="p-4 bg-gray-50 flex items-start">
                  <div className="border p-3 rounded bg-white shadow-md text-center ml-6 mt-4" style={{cursor: 'move'}}>
                    <div className="bg-gray-100 p-1 mb-2 flex justify-between text-xs rounded">
                      <span>Draggable panel</span>
                      <span className="text-gray-500">✕</span>
                    </div>
                    <div className="w-32 h-16 bg-gray-200 rounded-sm"></div>
                  </div>
                </div>}
                explanation="Floating panels provide maximum flexibility, allowing users to create custom workspace layouts that suit their specific needs. This approach requires implementing drag-and-drop functionality, panel minimization, and z-index management, but results in a highly adaptable interface. The implementation would require a more substantial change to the application architecture but could significantly enhance the user experience for power users."
              />
              
              <ShowcaseItem
                title="Global UI Element Customization"
                description="Let users resize, reposition, and reshape any UI element across the entire application"
                complexity="Hard"
                impact="High"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white p-2 border rounded">
                    <div className="text-xs font-medium mb-2">Predefined UI Layouts</div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <button className="bg-gray-100 border rounded px-2 py-0.5 text-[9px]">Default</button>
                      <button className="bg-gray-100 border rounded px-2 py-0.5 text-[9px]">Compact</button>
                      <button className="bg-gray-100 border rounded px-2 py-0.5 text-[9px]">Expanded</button>
                    </div>
                    <div className="flex items-center justify-between text-[9px] mb-1">
                      <span>Panel Size</span>
                      <div className="flex">
                        <button className="border px-1 rounded-l">S</button>
                        <button className="border-t border-b px-1 bg-blue-50">M</button>
                        <button className="border px-1 rounded-r">L</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-[9px]">Reset All</span>
                      <button className="bg-gray-100 border rounded px-1 py-0.5 text-[9px]">↺</button>
                    </div>
                  </div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white border rounded p-2">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-medium">UI Customization Center</div>
                        <div className="flex items-center bg-gray-100 rounded-full p-0.5">
                          <div className="relative flex h-4 w-8 cursor-pointer items-center rounded-full bg-blue-500 px-0.5">
                            <div className="absolute h-3 w-3 rounded-full bg-white transition-transform translate-x-4"></div>
                          </div>
                          <span className="text-[8px] font-medium ml-1 text-blue-600">Edit Mode ON</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 text-[8px]">Save Layout</button>
                        <button className="bg-gray-50 border rounded px-1.5 py-0.5 text-[8px]">Reset</button>
                      </div>
                    </div>
                    
                    {/* Main content with tabs */}
                    <div className="border rounded mb-3">
                      <div className="flex border-b text-[9px]">
                        <div className="px-2 py-1 bg-blue-50 border-r">Elements</div>
                        <div className="px-2 py-1 border-r">Themes</div>
                        <div className="px-2 py-1">Presets</div>
                      </div>
                      
                      {/* Element customization panel */}
                      <div className="p-2">
                        {/* Selected element indicator with resize handles */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[9px] font-medium">Selected: <span className="text-blue-500">Graph Panel</span></div>
                          <div className="flex items-center gap-1">
                            <button className="border rounded w-4 h-4 flex items-center justify-center bg-gray-50">
                              <div className="w-2 h-2 border border-dashed"></div>
                            </button>
                            <button className="border rounded w-4 h-4 flex items-center justify-center bg-gray-50">
                              <div className="w-2 h-0.5 bg-gray-400"></div>
                            </button>
                          </div>
                        </div>
                        
                        {/* Size controls */}
                        <div className="mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px]">Size</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] text-gray-500">W: 640px</span>
                              <span className="text-[8px] text-gray-500">H: 480px</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <input type="range" className="w-full h-1.5" value={75} />
                            <button className="border rounded px-1 bg-gray-50 text-[8px]">🔒</button>
                          </div>
                        </div>
                        
                        {/* Position controls */}
                        <div className="mb-2">
                          <div className="text-[9px] mb-1">Position</div>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="flex items-center">
                              <span className="text-[8px] w-5">X:</span>
                              <input type="range" className="w-full h-1.5" value={50} />
                            </div>
                            <div className="flex items-center">
                              <span className="text-[8px] w-5">Y:</span>
                              <input type="range" className="w-full h-1.5" value={30} />
                            </div>
                          </div>
                        </div>
                        
                        {/* Shape controls */}
                        <div>
                          <div className="text-[9px] mb-1">Shape</div>
                          <div className="grid grid-cols-3 gap-1">
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-[8px]">Radius</span>
                                <span className="text-[8px] text-gray-500">6px</span>
                              </div>
                              <input type="range" className="w-full h-1.5" value={25} />
                            </div>
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-[8px]">Border</span>
                                <span className="text-[8px] text-gray-500">1px</span>
                              </div>
                              <input type="range" className="w-full h-1.5" value={10} />
                            </div>
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-[8px]">Shadow</span>
                                <span className="text-[8px] text-gray-500">sm</span>
                              </div>
                              <input type="range" className="w-full h-1.5" value={20} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Live preview area */}
                    <div className="border rounded p-1">
                      <div className="text-[9px] mb-1 text-center">Live Preview</div>
                      <div className="bg-gray-50 rounded h-16 relative">
                        {/* Sample UI element with resize handles */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-white border rounded shadow-sm">
                          {/* Corner resize handles */}
                          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                          
                          {/* Edge resize handles */}
                          <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-blue-300 rounded-full"></div>
                          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-blue-300 rounded-full"></div>
                          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-300 rounded-full"></div>
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-300 rounded-full"></div>
                          
                          {/* Central drag handle */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-100 border border-blue-300 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}
                explanation="Advanced UI customization empowers users to tailor the application's interface precisely to their needs and preferences. Rather than being limited to predefined layouts, this approach gives users granular control over every UI element's size, position, and appearance. The implementation requires a comprehensive design system with styled components that accept dimension and position props, along with a specialized editing mode that renders resize/move handles around selected elements. By storing these customizations in user profiles, the system provides a personalized experience that significantly enhances productivity by allowing users to optimize screen real estate for their specific workflows."
              />
              
              <ShowcaseItem
                title="Enhanced Global UI Customization"
                description="Global controls in the header to customize the entire interface layout and appearance"
                complexity="Medium"
                impact="High"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white p-2 border rounded">
                    <div className="flex justify-between items-center p-1 bg-gray-100 mb-2">
                      <div className="text-[10px] font-medium">Application Header</div>
                      <div className="flex gap-1">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-24 bg-gray-50 border rounded p-1">
                        <div className="text-[8px] font-medium">Panel 1</div>
                        <div className="w-full h-16 bg-gray-100 mt-1 rounded"></div>
                      </div>
                      <div className="flex-1 h-24 bg-gray-50 border rounded p-1">
                        <div className="text-[8px] font-medium">Panel 2</div>
                        <div className="w-full h-16 bg-gray-100 mt-1 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white p-2 border rounded">
                    <div className="flex justify-between items-center p-1 bg-gray-100 mb-2">
                      <div className="text-[10px] font-medium">Application Header</div>
                      <div className="flex gap-1">
                        <div className="px-1.5 py-0.5 bg-blue-100 border border-blue-300 rounded text-[8px] text-blue-800 flex items-center">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
                          Customize UI
                        </div>
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    
                    {/* Customization panel below header */}
                    <div className="mb-2 border rounded bg-blue-50 p-1.5">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-[9px] font-medium text-blue-800">Global UI Customization</div>
                        <div className="flex gap-1">
                          <button className="px-1 py-0.5 bg-white border border-blue-200 rounded text-[7px]">Exit</button>
                          <button className="px-1 py-0.5 bg-green-500 text-white rounded text-[7px]">Save</button>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <div className="flex-1 border border-blue-200 rounded bg-white p-1">
                          <div className="text-[7px] font-medium mb-0.5">Layout</div>
                          <div className="grid grid-cols-2 gap-0.5">
                            <button className="bg-blue-100 border border-blue-300 rounded text-[6px] p-0.5">Side by Side</button>
                            <button className="bg-white border rounded text-[6px] p-0.5">Stacked</button>
                          </div>
                        </div>
                        <div className="flex-1 border border-blue-200 rounded bg-white p-1">
                          <div className="text-[7px] font-medium mb-0.5">Theme</div>
                          <div className="grid grid-cols-2 gap-0.5">
                            <button className="bg-white border rounded text-[6px] p-0.5">Light</button>
                            <button className="bg-blue-100 border border-blue-300 rounded text-[6px] p-0.5">Dark</button>
                          </div>
                        </div>
                        <div className="flex-1 border border-blue-200 rounded bg-white p-1">
                          <div className="text-[7px] font-medium mb-0.5">Density</div>
                          <div className="grid grid-cols-3 gap-0.5">
                            <button className="bg-white border rounded text-[6px] p-0.5">Low</button>
                            <button className="bg-blue-100 border border-blue-300 rounded text-[6px] p-0.5">Med</button>
                            <button className="bg-white border rounded text-[6px] p-0.5">High</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Main content with custom layout */}
                    <div className="flex gap-2">
                      <div className="w-2/3 h-16 bg-gray-50 border rounded p-1">
                        <div className="text-[8px] font-medium">Panel 1 (Resized)</div>
                        <div className="w-full h-8 bg-gray-100 mt-1 rounded"></div>
                      </div>
                      <div className="w-1/3 h-16 bg-gray-50 border rounded p-1">
                        <div className="text-[8px] font-medium">Panel 2</div>
                        <div className="w-full h-8 bg-gray-100 mt-1 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>}
                explanation="Placing UI customization controls in the global header allows users to modify the entire application layout in a consistent way from anywhere in the application. This enhanced approach includes a dedicated customization panel where users can adjust layout type, theme, and content density without entering a special 'edit mode'. The changes apply globally across all screens, ensuring a unified experience. By including preset configurations alongside granular controls, this implementation balances simplicity and power - giving users quick access to common arrangements while still allowing detailed customization where needed. The panel's persistent position in the header makes UI customization a first-class feature rather than a hidden setting."
              />

              <ShowcaseItem
                title="Element-Level UI Customization"
                description="Individual control over UI elements with complete hierarchy visualization"
                complexity="Hard"
                impact="High"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white p-2 border rounded">
                    <div className="text-xs font-medium mb-2">Global UI Settings</div>
                    <div className="flex space-x-2 mb-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
                      <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
                      <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                      <div className="w-6 h-6 bg-amber-600 rounded-full"></div>
                    </div>
                    <div className="text-xs font-medium mb-2">Layout Options</div>
                    <div className="flex space-x-2">
                      <div className="w-16 h-8 border rounded flex items-center justify-center bg-gray-100">
                        <span className="text-[8px]">Default</span>
                      </div>
                      <div className="w-16 h-8 border rounded flex items-center justify-center">
                        <span className="text-[8px]">Compact</span>
                      </div>
                    </div>
                  </div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs font-medium">UI Customization</div>
                    <div className="flex space-x-1">
                      <button className="text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-700">Edit Mode</button>
                      <button className="text-xs bg-blue-500 px-1.5 py-0.5 rounded text-white">Save</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-1.5 border rounded">
                      <div className="text-[8px] font-medium mb-1">Element Hierarchy</div>
                      <div className="border border-gray-100 rounded bg-gray-50 p-1.5 h-14 overflow-hidden">
                        <div className="flex items-center mb-1">
                          <svg className="w-2 h-2 text-gray-500 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                          <div className="w-3 h-3 bg-blue-100 rounded-sm flex items-center justify-center ml-1 mr-1">
                            <svg className="w-2 h-2 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            </svg>
                          </div>
                          <span className="text-[7px] font-medium">Main Container</span>
                        </div>
                        <div className="ml-3">
                          <div className="flex items-center mb-1">
                            <svg className="w-2 h-2 text-gray-500 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <div className="w-3 h-3 bg-purple-100 rounded-sm flex items-center justify-center ml-1 mr-1">
                              <svg className="w-2 h-2 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              </svg>
                            </div>
                            <span className="text-[7px] font-medium text-blue-700">Header</span>
                          </div>
                          <div className="ml-3">
                            <div className="flex items-center mb-1">
                              <div className="w-3 h-3 bg-green-100 rounded-sm flex items-center justify-center ml-3 mr-1">
                                <svg className="w-2 h-2 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="8" />
                                </svg>
                              </div>
                              <span className="text-[7px]">Navigation Menu</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-1.5 border rounded flex flex-col">
                      <div className="text-[8px] font-medium mb-1">Element Properties</div>
                      <div className="bg-blue-50 p-1 rounded mb-1 flex items-center">
                        <div className="w-3 h-3 bg-purple-100 rounded-sm flex items-center justify-center mr-1">
                          <svg className="w-2 h-2 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          </svg>
                        </div>
                        <span className="text-[7px] font-medium">Header</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <div className="text-[6px] text-gray-500">Width</div>
                          <div className="border border-gray-200 rounded-sm h-2 flex items-center pl-1">
                            <span className="text-[6px]">100%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[6px] text-gray-500">Background</div>
                          <div className="flex h-2">
                            <div className="w-2 h-2 bg-white border border-gray-200 rounded-l-sm"></div>
                            <div className="flex-1 border-t border-r border-b border-gray-200 rounded-r-sm"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 bg-white p-1.5 border rounded flex flex-col">
                    <div className="text-[8px] font-medium mb-1">Element Preview</div>
                    <div className="border border-gray-100 rounded bg-gray-50 p-1 h-8 flex items-center justify-center">
                      <div className="w-full h-3 border border-dashed border-blue-300 rounded-sm bg-white">
                        <div className="text-[6px] text-center">Header Element</div>
                      </div>
                    </div>
                    <div className="mt-1 text-[6px] text-gray-500">
                      Path: Root / Main Container / <span className="text-blue-600">Header</span>
                    </div>
                  </div>
                </div>}
                explanation="This advanced customization system provides granular control over every UI element in the application by visualizing the complete element hierarchy. Users can select any component from a tree view - from containers down to individual controls - and customize its properties including dimensions, spacing, appearance, and position. The system shows live previews of changes and maintains awareness of the component's place in the DOM through visual path indicators. The edit mode toggle provides a safe way to make changes, with a dedicated save function to apply them across the application. This approach gives power users unprecedented control over their interface while maintaining the application's core functionality."
              />
              
              <ShowcaseItem
                title="Graph-Specific Appearance Controls"
                description="Dedicated controls for customizing graph visualization appearance separate from UI layout"
                complexity="Medium"
                impact="High"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white p-2 border rounded">
                    <div className="text-xs font-medium mb-2">Graph Visualization Settings</div>
                    <div className="flex mb-2">
                      <div className="flex-1 h-20 bg-gray-100 rounded flex items-center justify-center">
                        <div className="text-[8px] text-gray-500">Graph preview</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="text-[8px]">Node Size: <span className="font-medium">Medium</span></div>
                      <div className="text-[8px]">Edge Width: <span className="font-medium">1px</span></div>
                      <div className="text-[8px]">Node Color: <span className="font-medium">Default</span></div>
                      <div className="text-[8px]">Label Size: <span className="font-medium">10pt</span></div>
                    </div>
                  </div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white p-2 border rounded">
                    <div className="text-xs font-medium mb-2">Graph Appearance Customization</div>
                    
                    {/* Split layout with preview and controls */}
                    <div className="flex gap-2 mb-2">
                      {/* Left side: Graph preview */}
                      <div className="w-1/2 h-36 bg-gray-100 rounded relative">
                        <div className="flex items-center justify-center h-full">
                          {/* Sample graph */}
                          <div className="relative">
                            {/* Node 1 (Person) */}
                            <div className="absolute top-0 left-0 w-10 h-10 rounded-lg bg-blue-100 border-2 border-blue-400 flex items-center justify-center text-[8px] shadow-md transform -translate-x-1/2 -translate-y-1/2">
                              Person
                            </div>
                            
                            {/* Node 2 (Organization) */}
                            <div className="absolute bottom-0 right-0 w-12 h-8 rounded-lg bg-green-100 border-2 border-green-400 flex items-center justify-center text-[8px] shadow-md transform translate-x-1/2 translate-y-1/2">
                              Organization
                            </div>
                            
                            {/* Edge */}
                            <svg width="100" height="60" className="absolute top-0 left-0 pointer-events-none">
                              <defs>
                                <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                                  <path d="M0,0 L0,6 L9,3 z" fill="#6366f1" />
                                </marker>
                              </defs>
                              <line x1="5" y1="5" x2="95" y2="55" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrow)" />
                              <text x="45" y="25" fill="#4f46e5" fontSize="6px" textAnchor="middle" transform="rotate(45, 45, 25)">works_at</text>
                            </svg>
                          </div>
                        </div>
                        
                        {/* Custom theme indicator */}
                        <div className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm px-1 py-0.5 rounded text-[6px] border">
                          Custom Theme: Executive
                        </div>
                      </div>
                      
                      {/* Right side: Controls */}
                      <div className="w-1/2 space-y-1.5">
                        {/* Node Style section */}
                        <div>
                          <div className="text-[8px] font-medium mb-0.5">Node Style</div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <div>
                              <div className="text-[7px] text-gray-600">Shape</div>
                              <select className="w-full text-[7px] border rounded p-0.5">
                                <option>Rounded Rectangle</option>
                                <option>Circle</option>
                                <option>Hexagon</option>
                              </select>
                            </div>
                            <div>
                              <div className="text-[7px] text-gray-600">Border</div>
                              <select className="w-full text-[7px] border rounded p-0.5">
                                <option>Medium (2px)</option>
                                <option>Thin (1px)</option>
                                <option>Thick (3px)</option>
                              </select>
                            </div>
                            <div>
                              <div className="text-[7px] text-gray-600">Size Scaling</div>
                              <select className="w-full text-[7px] border rounded p-0.5">
                                <option>By Connections</option>
                                <option>By Type</option>
                                <option>Fixed</option>
                              </select>
                            </div>
                            <div>
                              <div className="text-[7px] text-gray-600">Shadow</div>
                              <select className="w-full text-[7px] border rounded p-0.5">
                                <option>Medium</option>
                                <option>None</option>
                                <option>Large</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        {/* Edge Style section */}
                        <div>
                          <div className="text-[8px] font-medium mb-0.5">Edge Style</div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <div>
                              <div className="text-[7px] text-gray-600">Line Style</div>
                              <select className="w-full text-[7px] border rounded p-0.5">
                                <option>Straight</option>
                                <option>Curved</option>
                                <option>Angled</option>
                              </select>
                            </div>
                            <div>
                              <div className="text-[7px] text-gray-600">Arrow Style</div>
                              <select className="w-full text-[7px] border rounded p-0.5">
                                <option>Triangle</option>
                                <option>Open</option>
                                <option>None</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        {/* Theme presets */}
                        <div>
                          <div className="text-[8px] font-medium mb-0.5">Preset Themes</div>
                          <div className="flex gap-1">
                            <button className="px-1.5 py-0.5 bg-white border rounded text-[7px]">Default</button>
                            <button className="px-1.5 py-0.5 bg-indigo-100 border border-indigo-300 rounded text-[7px]">Executive</button>
                            <button className="px-1.5 py-0.5 bg-white border rounded text-[7px]">Minimal</button>
                            <button className="px-1.5 py-0.5 bg-white border rounded text-[7px]">Vibrant</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom bar with save button */}
                    <div className="flex justify-end">
                      <button className="px-2 py-0.5 bg-blue-500 text-white rounded text-[8px]">
                        Save Appearance Settings
                      </button>
                    </div>
                  </div>
                </div>}
                explanation="Separating graph-specific appearance controls from global UI customization provides a more focused experience for users who want to customize how their data is visualized without changing the overall interface layout. This dedicated panel offers comprehensive controls for node shape, size, border styles, shadows, edge types, arrow styles, and directional indicators. The real-time preview shows how these changes will affect the graph visualization, helping users make informed decisions. Preset themes offer quick, cohesive style changes, while the granular controls allow for detailed customization. The separation of graph appearance from UI layout concerns follows good design principles by grouping related functionality and preventing settings from becoming overwhelming. The dedicated 'Save Appearance Settings' button ensures users don't lose their customizations."
              />
            </div>
          </TabsContent>
          
          <TabsContent value="visual" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ShowcaseItem
                title="Enhanced Node Visualization"
                description="Larger nodes with improved labeling, type pill display, and better spacing"
                complexity="Medium"
                impact="High"
                beforeImage={
                  <div className="p-4 border rounded bg-gray-50 flex justify-center">
                    <div className="relative">
                      {/* Small node (20px radius) */}
                      <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center">
                        <div className="absolute w-full text-center text-xs font-medium" style={{top: '-18px'}}>Person</div>
                      </div>
                    </div>
                  </div>
                }
                afterImage={
                  <div className="p-4 border rounded bg-gray-50 flex justify-center">
                    <div className="relative">
                      {/* Larger node (40px radius) */}
                      <div className="w-20 h-20 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center">
                        <div className="absolute w-full text-center text-sm font-medium" style={{top: '-22px'}}>Person</div>
                        <div className="absolute px-2 py-0.5 bg-white text-xs rounded-full shadow-sm" style={{bottom: '-12px'}}>Employee</div>
                      </div>
                    </div>
                  </div>
                }
                explanation="Node visualization has been significantly improved with several key changes. The node radius was increased from 20px to 40px, providing more space for labels and visual elements. Layout settings were adjusted with higher node repulsion (300 from 200), increased link distance (140px from 100px), and larger collision radius (50px from 30px) to prevent overlap. Node labels are now positioned more clearly above the node, while type pills appear below the node on a white background for better readability. The taxonomy relationship label was changed from 'IS_PARENT_TO' to 'IS_PARENT_OF' for improved clarity. These changes work together to create a more readable and information-rich visualization that better accommodates both primary node labels and taxonomic type information."
              />
              
              <ShowcaseItem
                title="Hover-Expandable Elements"
                description="Show minimal information by default, revealing more details on hover"
                complexity="Easy" 
                impact="Medium"
                beforeImage={<BeforeHoverExpand />}
                afterImage={<AfterHoverExpand />}
                explanation="Hover-expandable elements provide a clean, uncluttered interface that still gives users access to all the information they need. By showing only the most essential details by default and revealing secondary information on hover, this approach significantly reduces visual complexity while maintaining full functionality. The implementation is straightforward, requiring only state management for hover detection and conditional rendering."
              />
              
              <ShowcaseItem
                title="Increased Whitespace"
                description="Add more padding and margins between elements to reduce visual clutter"
                complexity="Easy"
                impact="Medium"
                beforeImage={<div className="p-2 bg-white border rounded">
                  <div className="bg-gray-100 p-1 rounded mb-1">
                    <h4 className="text-sm font-medium">Section 1</h4>
                    <div className="bg-white p-1 border rounded mt-1">
                      <p className="text-xs">Content here with minimal spacing between elements</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-1 rounded mb-1">
                    <h4 className="text-sm font-medium">Section 2</h4>
                    <div className="bg-white p-1 border rounded mt-1">
                      <p className="text-xs">More content with tight spacing</p>
                    </div>
                  </div>
                </div>}
                afterImage={<div className="p-4 bg-white border rounded">
                  <div className="bg-gray-100 p-3 rounded mb-4">
                    <h4 className="text-sm font-medium mb-2">Section 1</h4>
                    <div className="bg-white p-3 border rounded mt-2">
                      <p className="text-xs">Content here with more breathing room</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-3 rounded">
                    <h4 className="text-sm font-medium mb-2">Section 2</h4>
                    <div className="bg-white p-3 border rounded mt-2">
                      <p className="text-xs">More content with comfortable spacing</p>
                    </div>
                  </div>
                </div>}
                explanation="Increasing whitespace is one of the simplest yet most effective ways to improve readability and reduce cognitive load. By adding more padding and margins between elements, the interface becomes less cluttered and easier to parse visually. This approach requires minimal code changes, primarily adjusting CSS spacing properties, but can dramatically improve the perceived quality and usability of the interface."
              />
              
              <ShowcaseItem
                title="Font Size Hierarchy"
                description="Establish a clearer visual hierarchy with more distinct font sizes"
                complexity="Easy"
                impact="Medium"
                beforeImage={<div className="p-3 bg-white border rounded">
                  <h3 className="text-sm font-medium mb-2">Graph Summary</h3>
                  <p className="text-sm mb-2">Total elements: 25</p>
                  <p className="text-sm mb-2">Node types: 4</p>
                  <p className="text-sm">Edge types: 6</p>
                </div>}
                afterImage={<div className="p-3 bg-white border rounded">
                  <h3 className="text-lg font-semibold mb-2">Graph Summary</h3>
                  <p className="text-sm mb-1 text-gray-700">Total elements: 25</p>
                  <p className="text-xs mb-1 text-gray-600">Node types: 4</p>
                  <p className="text-xs text-gray-600">Edge types: 6</p>
                </div>}
                explanation="A well-defined typographic hierarchy helps users quickly scan and understand information by clearly differentiating between primary, secondary, and tertiary content. By varying font sizes, weights, and colors systematically, you create natural focal points and reading paths through the interface. This approach involves straightforward CSS changes but provides significant benefits for information comprehension and overall user experience."
              />
              
              <ShowcaseItem
                title="Card Height Management"
                description="Make cards auto-expand based on content or add scrolling to prevent overflow"
                complexity="Medium"
                impact="Medium"
                beforeImage={<div className="border rounded grid grid-cols-2 gap-4 p-4">
                  <div className="bg-white p-3 border rounded h-32 overflow-hidden">
                    <h4 className="text-sm font-medium mb-2">Card with fixed height</h4>
                    <p className="text-xs mb-1">This content might get cut off if there's too much text in this card because it has a fixed height.</p>
                    <p className="text-xs mb-1">Additional content is not visible when it exceeds the container height.</p>
                    <p className="text-xs">This line will likely be cut off from view with the current fixed height.</p>
                  </div>
                  <div className="bg-white p-3 border rounded h-32 overflow-hidden">
                    <h4 className="text-sm font-medium mb-2">Another card</h4>
                    <p className="text-xs">This card has less content.</p>
                  </div>
                </div>}
                afterImage={<div className="border rounded grid grid-cols-2 gap-4 p-4">
                  <div style={{maxHeight: '140px'}} className="bg-white p-3 border rounded overflow-auto relative">
                    <h4 className="text-sm font-medium mb-2">Card with scrolling</h4>
                    <p className="text-xs mb-1">This content won't get cut off because the card has scrolling enabled when content exceeds the maximum height.</p>
                    <p className="text-xs mb-1">Additional content is accessible via scrolling.</p>
                    <p className="text-xs mb-1">This line remains accessible through scrolling.</p>
                    <p className="text-xs mb-1">You can continue scrolling to see everything!</p>
                    <p className="text-xs mb-1">Nothing is lost or hidden from view.</p>
                    <p className="text-xs mb-1">All content is available with a simple scroll.</p>
                    <p className="text-xs mb-1">The scroll indicator shows more content is available.</p>
                    <p className="text-xs">User has complete control over content visibility!</p>
                    <div className="absolute bottom-0 right-0 left-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                  </div>
                  <div className="bg-white p-3 border rounded">
                    <h4 className="text-sm font-medium mb-2">Auto-height card</h4>
                    <p className="text-xs mb-1">This card automatically adjusts to its content height.</p>
                    <p className="text-xs mb-1">No matter how much content there is.</p>
                    <p className="text-xs mb-1">The container grows as needed.</p>
                    <p className="text-xs mb-1">Every line is always visible.</p>
                    <p className="text-xs">The card fits its content perfectly!</p>
                  </div>
                </div>}
                explanation="Fixed-height containers can lead to content being cut off or create awkward empty spaces. Adaptive height management ensures all content is accessible while maintaining a clean layout. This can be implemented either by allowing containers to expand based on their content (auto-height) or by adding scrolling to containers that exceed a maximum height. Both approaches ensure users can access all information without disrupting the overall layout consistency."
              />
              
              <ShowcaseItem
                title="Advanced Data Visualization Controls"
                description="Provide sophisticated controls for exploring complex graph data"
                complexity="Hard"
                impact="High"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white border rounded p-2">
                    <div className="text-xs font-medium mb-2">Graph Visualization</div>
                    <div className="bg-gray-100 h-28 rounded flex items-center justify-center text-xs">
                      Graph with basic default visualization
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button className="border rounded px-2 py-1 text-xs mr-1">+</button>
                      <button className="border rounded px-2 py-1 text-xs">-</button>
                    </div>
                  </div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white border rounded">
                    {/* Control panel header */}
                    <div className="p-2 border-b flex justify-between items-center">
                      <div className="text-xs font-medium">Graph Visualization</div>
                      <div className="flex space-x-1">
                        <button className="text-xs px-1.5 py-0.5 bg-blue-50 border border-blue-200 rounded">Reset</button>
                        <button className="text-xs px-1.5 py-0.5 bg-gray-50 border rounded">Save View</button>
                      </div>
                    </div>
                    
                    {/* Main content area */}
                    <div className="flex">
                      {/* Left sidebar with controls */}
                      <div className="w-1/3 p-2 border-r">
                        <div className="mb-3">
                          <div className="text-xs font-medium mb-1">Display Mode</div>
                          <div className="grid grid-cols-2 gap-1">
                            <button className="text-[9px] py-1 bg-blue-100 border border-blue-200 rounded">Force-Directed</button>
                            <button className="text-[9px] py-1 bg-gray-50 border rounded">Hierarchical</button>
                            <button className="text-[9px] py-1 bg-gray-50 border rounded">Circular</button>
                            <button className="text-[9px] py-1 bg-gray-50 border rounded">Radial</button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="text-xs font-medium mb-1">Node Filters</div>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <input type="checkbox" className="mr-1" checked />
                              <span className="text-[9px]">Person</span>
                              <div className="ml-1 w-2 h-2 rounded-full bg-blue-400"></div>
                              <span className="text-[9px] ml-auto">24</span>
                            </div>
                            <div className="flex items-center">
                              <input type="checkbox" className="mr-1" checked />
                              <span className="text-[9px]">Organization</span>
                              <div className="ml-1 w-2 h-2 rounded-full bg-green-400"></div>
                              <span className="text-[9px] ml-auto">18</span>
                            </div>
                            <div className="flex items-center">
                              <input type="checkbox" className="mr-1" />
                              <span className="text-[9px]">Location</span>
                              <div className="ml-1 w-2 h-2 rounded-full bg-purple-400"></div>
                              <span className="text-[9px] ml-auto">12</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs font-medium mb-1">Edge Controls</div>
                          <div className="mb-1">
                            <div className="flex justify-between text-[9px]">
                              <span>Link Distance</span>
                              <span>75px</span>
                            </div>
                            <input type="range" className="w-full h-1" value={75} />
                          </div>
                          <div>
                            <div className="flex justify-between text-[9px]">
                              <span>Force Strength</span>
                              <span>0.5</span>
                            </div>
                            <input type="range" className="w-full h-1" value={50} />
                          </div>
                        </div>
                      </div>
                      
                      {/* Main visualization area */}
                      <div className="w-2/3 p-2">
                        <div className="h-32 bg-gray-100 rounded relative">
                          {/* Sample visualization */}
                          <div className="absolute top-1/4 left-1/4 w-5 h-5 rounded-full bg-blue-100 border border-blue-400"></div>
                          <div className="absolute top-1/2 left-1/2 w-5 h-5 rounded-full bg-blue-100 border border-blue-400"></div>
                          <div className="absolute bottom-1/4 right-1/4 w-5 h-5 rounded-full bg-green-100 border border-green-400"></div>
                          
                          <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <line x1="25%" y1="25%" x2="50%" y2="50%" stroke="#6366f1" strokeWidth="1" />
                            <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#6366f1" strokeWidth="1" />
                          </svg>
                          
                          {/* Visualization controls */}
                          <div className="absolute bottom-2 right-2 flex space-x-1">
                            <button className="bg-white rounded-full w-5 h-5 flex items-center justify-center text-[8px] border shadow-sm">+</button>
                            <button className="bg-white rounded-full w-5 h-5 flex items-center justify-center text-[8px] border shadow-sm">-</button>
                            <button className="bg-white rounded-full w-5 h-5 flex items-center justify-center text-[8px] border shadow-sm">↔</button>
                          </div>
                          
                          {/* Minimap */}
                          <div className="absolute top-2 right-2 w-12 h-12 bg-white border rounded shadow-sm p-1">
                            <div className="w-full h-full relative bg-gray-50">
                              <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-blue-400"></div>
                              <div className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full bg-blue-400"></div>
                              <div className="absolute bottom-1/4 right-1/4 w-1 h-1 rounded-full bg-green-400"></div>
                              <div className="absolute inset-0 border border-dashed border-blue-400 m-1"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Bottom analytics/metrics panel */}
                        <div className="mt-2 bg-gray-50 rounded p-1 border flex justify-between items-center">
                          <div className="flex space-x-2 text-[9px] text-gray-500">
                            <div>Nodes: 42</div>
                            <div>Edges: 67</div>
                            <div>Density: 0.32</div>
                          </div>
                          <div className="text-[9px] text-blue-500">View Analytics →</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}
                explanation="Advanced data visualization controls empower users to explore complex graph datasets more effectively, uncovering insights that might otherwise remain hidden. This feature provides a comprehensive set of tools including layout algorithms (force-directed, hierarchical, circular), filtering options, physics controls, and visual analytics. The implementation combines interactive D3.js visualizations with React state management to create a responsive, powerful exploration interface. By giving users precise control over how the graph is rendered and analyzed, the application becomes a more effective tool for knowledge discovery and pattern recognition."
              />
            </div>
          </TabsContent>
          
          <TabsContent value="ux" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ShowcaseItem
                title="Enhanced Append Mode UI"
                description="Improved visual presentation and button behavior in append mode"
                complexity="Easy"
                impact="Medium"
                beforeImage={<BeforeAppendMode />}
                afterImage={<AfterAppendMode />}
                explanation="The enhanced Append Mode UI improves the graph generation experience with clear visual cues and intuitive state transitions. Color coding (green for append mode) helps users understand the current state, while proper disabling and resetting of options prevents confusion. The improved UI maintains context by providing clear labels, appropriate button text, and smooth transitions between states. These subtle enhancements significantly improve user confidence when building complex multi-segment graphs incrementally."
              />
              
              <ShowcaseItem
                title="Entity Deduplication Notifications"
                description="Enhanced toast notifications to show intelligent entity deduplication process"
                complexity="Easy"
                impact="Medium"
                beforeImage={<BeforeDeduplicationNotifications />}
                afterImage={<AfterDeduplicationNotifications />}
                explanation="Enhanced toast notifications provide users with clear visibility into the entity deduplication process during multi-segment graph generation. By clearly indicating when deduplication is being applied, users gain better understanding of how the system maintains data integrity across text segments. This small UI enhancement significantly improves the user's mental model of the system's intelligence and provides confidence that duplicate entities are being properly handled."
              />
              
              <ShowcaseItem
                title="Focus Mode"
                description="Add a toggle to hide secondary panels and focus only on primary content"
                complexity="Medium"
                impact="High"
                beforeImage={<BeforeFocusMode />}
                afterImage={<AfterFocusMode />}
                explanation="Focus mode allows users to temporarily simplify the interface by hiding non-essential elements, helping them concentrate on specific tasks without distractions. This is particularly valuable for complex applications where different tasks might benefit from different interface configurations. The implementation requires component state management to control visibility and layout, but delivers significant usability benefits for users working with complex data or visualizations."
              />
              
              <ShowcaseItem
                title="Sequential Subgraph Numbering"
                description="Intelligent tracking of subgraph IDs across multiple operations"
                complexity="Easy"
                impact="Medium"
                beforeImage={<BeforeSubgraphNumbering />}
                afterImage={<AfterSubgraphNumbering />}
                explanation="Enhanced subgraph numbering ensures that when users create multiple batches of subgraphs in separate operations, the new subgraphs continue sequential numbering (e.g., sg3, sg4) instead of reusing the same IDs (sg1, sg2). This seemingly small improvement significantly reduces confusion when filtering and analyzing subgraphs, providing a more coherent user experience when working with complex multi-segment graph visualizations. The backend implementation intelligently tracks existing subgraph counters and ensures proper sequential naming across all graph operations."
              />
              
              <ShowcaseItem
                title="Context-Sensitive Panels"
                description="Show only relevant tools and information based on the current task"
                complexity="Medium"
                impact="High"
                beforeImage={<div className="border p-3 rounded">
                  <div className="flex mb-3 bg-gray-100 p-2 rounded">
                    <button className="px-2 py-1 bg-white border rounded text-xs mr-2">Add Node</button>
                    <button className="px-2 py-1 bg-white border rounded text-xs mr-2">Add Edge</button>
                    <button className="px-2 py-1 bg-white border rounded text-xs mr-2">Delete</button>
                    <button className="px-2 py-1 bg-white border rounded text-xs mr-2">Export</button>
                    <button className="px-2 py-1 bg-white border rounded text-xs">Search</button>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center text-xs">
                    Graph content area
                  </div>
                </div>}
                afterImage={<div className="border p-3 rounded">
                  <div className="flex mb-3 bg-gray-100 p-2 rounded items-center">
                    <span className="text-xs mr-3 text-gray-500">Node selected:</span>
                    <button className="px-2 py-1 bg-white border rounded text-xs mr-2">Edit Node</button>
                    <button className="px-2 py-1 bg-white border rounded text-xs mr-2">Connect</button>
                    <button className="px-2 py-1 bg-white border rounded text-xs mr-2">Delete</button>
                    <button className="px-2 py-1 bg-white border border-blue-300 rounded text-xs">View Details</button>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center text-xs">
                    Graph with selected node highlighted
                  </div>
                </div>}
                explanation="Context-sensitive panels dynamically adjust to show only the tools and information relevant to the current task or selection, reducing interface complexity and helping users focus on appropriate actions. This approach requires monitoring the application state (such as selected elements or active modes) and conditionally rendering different UI elements based on that context. Though more complex to implement, it significantly reduces cognitive load by presenting users with only what they need when they need it."
              />
              
              <ShowcaseItem
                title="Smart Default States"
                description="Start with certain elements collapsed if they're not immediately needed"
                complexity="Easy"
                impact="Medium"
                beforeImage={<div className="border p-3 rounded">
                  <div className="bg-gray-100 p-2 rounded mb-2">
                    <h4 className="text-xs font-medium">Graph Summary</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      Statistics and information that may not be needed immediately
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded mb-2">
                    <h4 className="text-xs font-medium">Node Context</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      No node selected yet
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <h4 className="text-xs font-medium">Input Area</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      Primary input area (should be visible immediately)
                    </div>
                  </div>
                </div>}
                afterImage={(() => {
                  const [showSummary, setShowSummary] = useState(false);
                  const [showContext, setShowContext] = useState(false);
                  
                  return (
                    <div className="border p-3 rounded">
                      <div className="bg-gray-100 p-2 rounded mb-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-medium">Graph Summary</h4>
                          <button 
                            className="text-xs text-blue-500 hover:underline"
                            onClick={() => setShowSummary(!showSummary)}
                          >
                            {showSummary ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        {showSummary && (
                          <div className="bg-white p-2 border rounded mt-1 text-xs animate-fadeIn">
                            Statistics and information that may not be needed immediately
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-100 p-2 rounded mb-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-medium">Node Context</h4>
                          <button 
                            className="text-xs text-blue-500 hover:underline"
                            onClick={() => setShowContext(!showContext)}
                          >
                            {showContext ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        {showContext && (
                          <div className="bg-white p-2 border rounded mt-1 text-xs animate-fadeIn">
                            No node selected yet
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-100 p-2 rounded">
                        <h4 className="text-xs font-medium">Input Area</h4>
                        <div className="bg-white p-2 border rounded mt-1 text-xs">
                          Primary input area (expanded by default)
                        </div>
                      </div>
                    </div>
                  );
                })()}
                explanation="Smart default states present an optimized initial view of the application, showing only what's most relevant to beginning users or common workflows. This approach reduces initial complexity and helps users focus on getting started without being overwhelmed. Less frequently used features or contextual information are collapsed but easily accessible when needed. This requires thoughtful analysis of user workflows to determine appropriate defaults, but implementation is relatively straightforward."
              />
              
              <ShowcaseItem
                title="Section Priorities"
                description="Visually de-emphasize less important sections to direct attention"
                complexity="Easy"
                impact="Medium"
                beforeImage={<div className="border p-3 rounded">
                  <div className="bg-gray-100 p-2 rounded mb-2">
                    <h4 className="text-xs font-medium">Primary Action</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      Important content
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded mb-2">
                    <h4 className="text-xs font-medium">Secondary Feature</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      Less important content
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <h4 className="text-xs font-medium">Tertiary Option</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      Rarely used content
                    </div>
                  </div>
                </div>}
                afterImage={<div className="border p-3 rounded">
                  <div className="bg-blue-50 p-2 border-l-4 border-blue-400 rounded mb-2 shadow-sm">
                    <h4 className="text-xs font-medium text-blue-700">Primary Action</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      Important content
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded mb-2">
                    <h4 className="text-xs font-medium">Secondary Feature</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      Less important content
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-gray-500">
                    <h4 className="text-xs font-medium">Tertiary Option</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs text-gray-400">
                      Rarely used content
                    </div>
                  </div>
                </div>}
                explanation="Visual hierarchy through color, size, and positioning helps guide users' attention to the most important elements first, creating a natural flow through the interface. This approach uses subtle visual cues like color intensity, border treatments, and typography to indicate the relative importance of different sections. Implementation involves primarily CSS changes but requires thoughtful consideration of actual feature importance based on user needs and common workflows."
              />
            </div>
          </TabsContent>
          
          <TabsContent value="navigation" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ShowcaseItem
                title="Improved Text Labels"
                description="Update text labels across the application for better clarity and consistency"
                complexity="Easy"
                impact="Medium"
                beforeImage={<BeforeTextLabelsUpdate />}
                afterImage={<AfterTextLabelsUpdate />}
                explanation="Clear, descriptive text labels help users understand the purpose of different UI components. We've updated 'Graph AI Component Output' to 'Graph Component AI Text Outputs' to better describe the function of this component, providing clearer context for users. This change maintains consistency across the navigation menu, page headers, and browser tab names, creating a more cohesive user experience with minimal implementation effort."
              />
            
              <ShowcaseItem
                title="Breadcrumb Navigation"
                description="Add breadcrumbs to help users understand where they are in the app"
                complexity="Easy"
                impact="Medium"
                beforeImage={<BeforeBreadcrumbNavigation />}
                afterImage={<AfterBreadcrumbNavigation />}
                explanation="Breadcrumb navigation provides context awareness by showing users their current location within a hierarchical structure and offering direct navigation to parent levels. This is particularly valuable in complex applications with nested data or multiple levels of detail. The implementation is straightforward, requiring only tracking of the current navigation path and rendering breadcrumb links that update the application state when clicked."
              />
              
              <ShowcaseItem
                title="Graph Minimap"
                description="Add a small overview map of the graph that helps with navigation"
                complexity="Medium"
                impact="High"
                beforeImage={<div className="border p-3 rounded">
                  <div className="bg-gray-100 p-2 rounded mb-2 h-40 flex items-center justify-center">
                    <p className="text-xs">Graph visualization area (zoomed in to show detail)</p>
                  </div>
                </div>}
                afterImage={<div className="border p-3 rounded">
                  <div className="bg-gray-100 p-2 rounded mb-2 h-40 flex items-center justify-center relative">
                    <p className="text-xs">Graph visualization area (zoomed in to show detail)</p>
                    <div className="absolute bottom-2 right-2 w-20 h-20 bg-white border rounded p-1 shadow-md">
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                        <div className="relative w-full h-full">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-[8px] text-gray-400">Overview Map</div>
                          </div>
                          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-blue-500 bg-blue-100 opacity-50"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}
                explanation="A graph minimap provides global context when working with large, complex visualizations by showing a bird's-eye view of the entire graph with the current viewport highlighted. This helps users understand where they are in relation to the whole and allows for quick navigation to different areas. Implementation is more complex, requiring rendering a scaled-down version of the graph with viewport tracking, but provides significant navigation benefits for large datasets."
              />
              
              <ShowcaseItem
                title="Jump-to Controls"
                description="Add quick navigation controls to jump between major sections"
                complexity="Easy"
                impact="Medium"
                beforeImage={<div className="border p-3 rounded">
                  <div className="bg-gray-100 p-2 rounded mb-2">
                    <h4 className="text-xs font-medium">Section 1</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      Content for section 1
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded mb-2">
                    <h4 className="text-xs font-medium">Section 2</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      Content for section 2
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <h4 className="text-xs font-medium">Section 3</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      Content for section 3
                    </div>
                  </div>
                </div>}
                afterImage={<div className="border p-3 rounded">
                  <div className="flex justify-center mb-3 bg-white p-1 border rounded sticky top-0">
                    <button className="px-2 py-1 mx-1 rounded text-xs bg-gray-100 hover:bg-gray-200">Jump to S1</button>
                    <button className="px-2 py-1 mx-1 rounded text-xs bg-gray-100 hover:bg-gray-200">Jump to S2</button>
                    <button className="px-2 py-1 mx-1 rounded text-xs bg-gray-100 hover:bg-gray-200">Jump to S3</button>
                  </div>
                  <div id="section1" className="bg-gray-100 p-2 rounded mb-2">
                    <h4 className="text-xs font-medium">Section 1</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      Content for section 1
                    </div>
                  </div>
                  <div id="section2" className="bg-gray-100 p-2 rounded mb-2">
                    <h4 className="text-xs font-medium">Section 2</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      Content for section 2
                    </div>
                  </div>
                  <div id="section3" className="bg-gray-100 p-2 rounded">
                    <h4 className="text-xs font-medium">Section 3</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      Content for section 3
                    </div>
                  </div>
                </div>}
                explanation="Jump-to controls provide quick access to different sections of the application, eliminating the need for excessive scrolling or manual navigation. This is particularly useful in single-page applications with lengthy content or multiple distinct sections. Implementation is straightforward, using either fragment links to elements with specific IDs or programmatically scrolling/focusing elements when navigation buttons are clicked."
              />
              
              <ShowcaseItem
                title="Keyboard Shortcuts"
                description="Add keyboard shortcuts for common actions to speed up workflows"
                complexity="Medium"
                impact="High"
                beforeImage={<div className="border p-3 rounded">
                  <div className="bg-gray-100 p-2 rounded mb-2 flex space-x-2">
                    <button className="px-2 py-1 bg-white border rounded text-xs">New Node</button>
                    <button className="px-2 py-1 bg-white border rounded text-xs">Delete</button>
                    <button className="px-2 py-1 bg-white border rounded text-xs">Zoom In</button>
                    <button className="px-2 py-1 bg-white border rounded text-xs">Zoom Out</button>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center text-xs">
                    Graph area
                  </div>
                </div>}
                afterImage={<div className="border p-3 rounded">
                  <div className="bg-gray-100 p-2 rounded mb-2 flex space-x-2">
                    <button className="px-2 py-1 bg-white border rounded text-xs flex items-center">
                      New Node
                      <span className="ml-1 text-gray-400 text-[8px] border px-1 rounded">N</span>
                    </button>
                    <button className="px-2 py-1 bg-white border rounded text-xs flex items-center">
                      Delete
                      <span className="ml-1 text-gray-400 text-[8px] border px-1 rounded">Del</span>
                    </button>
                    <button className="px-2 py-1 bg-white border rounded text-xs flex items-center">
                      Zoom In
                      <span className="ml-1 text-gray-400 text-[8px] border px-1 rounded">+</span>
                    </button>
                    <button className="px-2 py-1 bg-white border rounded text-xs flex items-center">
                      Zoom Out
                      <span className="ml-1 text-gray-400 text-[8px] border px-1 rounded">-</span>
                    </button>
                    <button className="px-2 py-1 bg-white border rounded text-xs">
                      <span className="text-gray-500 text-[10px]">?</span>
                    </button>
                  </div>
                  <div className="bg-gray-50 p-2 rounded text-center text-xs">
                    Graph area with keyboard shortcut support
                  </div>
                  <div className="mt-2 p-2 bg-white border rounded">
                    <div className="text-xs font-medium mb-1">Keyboard Shortcuts</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                      <div>
                        <span className="text-gray-500">N</span> - New Node
                      </div>
                      <div>
                        <span className="text-gray-500">E</span> - New Edge
                      </div>
                      <div>
                        <span className="text-gray-500">Del</span> - Delete Selected
                      </div>
                      <div>
                        <span className="text-gray-500">Ctrl+Z</span> - Undo
                      </div>
                      <div>
                        <span className="text-gray-500">+/-</span> - Zoom In/Out
                      </div>
                      <div>
                        <span className="text-gray-500">Space</span> - Pan Mode
                      </div>
                    </div>
                  </div>
                </div>}
                explanation="Keyboard shortcuts significantly increase efficiency for power users by reducing reliance on mouse interactions for common tasks. This feature is especially valuable for applications that involve repetitive operations or frequent switching between different modes or tools. Implementation requires setting up event listeners for key combinations and associating them with appropriate actions, as well as providing visual cues and documentation to help users discover and learn available shortcuts."
              />
            </div>
          </TabsContent>
          
          <TabsContent value="interaction" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ShowcaseItem
                title="Graph Explorer Chat"
                description="Add a dedicated AI chat interface for analyzing and expanding graphs with rich metadata visualization"
                complexity="Medium"
                impact="High"
                beforeImage={<BeforeGraphChat />}
                afterImage={<AfterGraphChat />}
                explanation="The Graph Explorer Chat transforms simple text conversations into a powerful graph analysis tool by adding structured metadata extraction and visualization. This interface allows users to explore patterns, suggest new nodes/relationships, and get deeper insights about their knowledge graph. The implementation uses the ChatContext system to manage message state and adds collapsible sections for graph analysis with visual indicators of the graph connection status."
              />
              
              <ShowcaseItem
                title="Hover States for Nodes"
                description="Add rich hover states for graph nodes to show more information without clicking"
                complexity="Medium"
                impact="High"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center relative">
                    <div className="text-sm">Person</div>
                  </div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="w-32 h-32 mx-auto bg-blue-100 border-2 border-blue-400 rounded-full flex items-center justify-center relative shadow-lg">
                    <div className="text-sm">Person</div>
                    <div className="absolute top-full mt-2 bg-white p-3 rounded shadow-lg border w-48 z-10">
                      <h5 className="text-xs font-medium mb-1">John Doe (Person)</h5>
                      <div className="text-xs mb-1">Age: 35</div>
                      <div className="text-xs mb-1">Role: Software Engineer</div>
                      <div className="text-xs mb-1">Connections: 5</div>
                      <div className="text-xs text-blue-500 cursor-pointer">View Details →</div>
                    </div>
                  </div>
                </div>}
                explanation="Enhanced hover states for graph nodes provide immediate access to key information without requiring additional clicks or navigation steps. This approach is particularly valuable in knowledge graphs where users frequently need to scan and assess many nodes quickly. The implementation involves CSS hover states and absolutely positioned tooltips or popovers that appear on hover and display contextual information from the node's data."
              />
              
              <ShowcaseItem
                title="Drag-to-Connect"
                description="Enable dragging from one node to another to create connections"
                complexity="Hard"
                impact="Medium"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="flex justify-around">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">A</div>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">B</div>
                  </div>
                  <div className="mt-3 text-xs text-center text-gray-500">
                    Menu → Add Edge → Select Source → Select Target
                  </div>
                </div>}
                afterImage={(() => {
                  // State machine states: 'idle', 'dragging', 'connected'
                  const [connectState, setConnectState] = useState('idle');
                  const [isNearTarget, setIsNearTarget] = useState(false);
                  const [isValidConnection, setIsValidConnection] = useState(true); // Rule-based validation
                  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
                  const [connectionType, setConnectionType] = useState('RELATES_TO');
                  const [undoHistory, setUndoHistory] = useState<string[]>([]);
                  const [showConnectionTypeMenu, setShowConnectionTypeMenu] = useState(false);
                  
                  // Store node positions to match the "before" section layout
                  const nodeAPosition = { x: 70, y: 40 };
                  const nodeBPosition = { x: 170, y: 40 };
                  
                  // Node types for rule-based validation
                  const nodeAType = 'Person';
                  const nodeBType = 'Organization';
                  
                  // Connection rules matrix (which types can connect)
                  const connectionRules = {
                    Person: ['Person', 'Organization', 'Event'],
                    Organization: ['Person', 'Organization'],
                    Event: ['Person', 'Organization', 'Event']
                  };
                  
                  // Available connection types based on node types
                  const getAvailableConnectionTypes = () => {
                    if (nodeAType === 'Person' && nodeBType === 'Organization') {
                      return ['WORKS_AT', 'MEMBER_OF', 'FOUNDED'];
                    }
                    return ['RELATES_TO', 'CONNECTED_TO'];
                  };
                  
                  const isConnectionValid = () => {
                    // Check if nodeB type is in the list of allowed connections for nodeA
                    return connectionRules[nodeAType]?.includes(nodeBType) || false;
                  };
                  
                  const containerRef = useRef<HTMLDivElement>(null);
                  const nodeARef = useRef<HTMLDivElement>(null);
                  const nodeBRef = useRef<HTMLDivElement>(null);
                  
                  const isDragging = connectState === 'dragging';
                  const isConnected = connectState === 'connected';
                  
                  // Throttle function to limit expensive calculations
                  const throttle = (func: Function, limit: number) => {
                    let inThrottle: boolean;
                    return function(...args: any[]) {
                      if (!inThrottle) {
                        func(...args);
                        inThrottle = true;
                        setTimeout(() => inThrottle = false, limit);
                      }
                    };
                  };
                  
                  const handleDragStart = () => {
                    if (connectState !== 'connected') {
                      setConnectState('dragging');
                      setDragPosition({ ...nodeAPosition });
                      setIsValidConnection(isConnectionValid());
                      
                      // Add to undo history
                      setUndoHistory(prev => [...prev, connectState]);
                    }
                  };
                  
                  const handleDragEnd = () => {
                    if (connectState === 'dragging') {
                      if (isNearTarget && isValidConnection) {
                        // Success - show connection type menu
                        setConnectState('connected');
                        setShowConnectionTypeMenu(true);
                        
                        // Create successful connection animation
                        setDragPosition({ ...nodeBPosition });
                        
                        // Add connection success sound effect
                        // (just simulated in this demo)
                      } else {
                        // Return to starting position with animation
                        setConnectState('idle');
                        setDragPosition({ ...nodeAPosition });
                      }
                      setIsNearTarget(false);
                    }
                  };
                  
                  const handleMouseMove = throttle((e: React.MouseEvent<HTMLDivElement>) => {
                    if (connectState === 'dragging') {
                      const container = containerRef.current?.getBoundingClientRect();
                      if (container) {
                        const x = e.clientX - container.left;
                        const y = e.clientY - container.top;
                        
                        // Check if close to node B
                        const distance = Math.sqrt(
                          Math.pow(x - nodeBPosition.x, 2) + Math.pow(y - nodeBPosition.y, 2)
                        );
                        
                        // If within 30px of node B center, prepare to snap
                        if (distance < 30) {
                          setIsNearTarget(true);
                        } else {
                          setIsNearTarget(false);
                        }
                        
                        // Update handle position to follow mouse
                        setDragPosition({ x, y });
                      }
                    }
                  }, 16); // Throttle to ~60fps
                  
                  const reset = () => {
                    setConnectState('idle');
                    setIsNearTarget(false);
                    setDragPosition({ ...nodeAPosition });
                    setShowConnectionTypeMenu(false);
                    setUndoHistory([]);
                  };
                  
                  const undo = () => {
                    if (undoHistory.length > 0) {
                      const prevState = undoHistory[undoHistory.length - 1];
                      setConnectState(prevState);
                      setUndoHistory(prev => prev.slice(0, -1));
                      
                      if (prevState === 'idle') {
                        setDragPosition({ ...nodeAPosition });
                      }
                    }
                  };
                  
                  const handleKeyDown = (e: React.KeyboardEvent) => {
                    // Space or Enter to start/complete connection when a node is focused
                    if (e.key === ' ' || e.key === 'Enter') {
                      if (document.activeElement === nodeARef.current && connectState === 'idle') {
                        handleDragStart();
                        // Focus the target node
                        nodeBRef.current?.focus();
                      } else if (document.activeElement === nodeBRef.current && connectState === 'dragging') {
                        if (isValidConnection) {
                          handleDragEnd();
                        }
                      }
                    }
                    
                    // Arrow keys to navigate between nodes
                    if (e.key === 'ArrowRight' && document.activeElement === nodeARef.current) {
                      nodeBRef.current?.focus();
                    } else if (e.key === 'ArrowLeft' && document.activeElement === nodeBRef.current) {
                      nodeARef.current?.focus();
                    }
                    
                    // Escape to cancel
                    if (e.key === 'Escape') {
                      reset();
                    }
                    
                    // Ctrl+Z for undo
                    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                      undo();
                    }
                  };
                  
                  // Set the initial position
                  useEffect(() => {
                    setDragPosition({ ...nodeAPosition });
                  }, []);
                  
                  return (
                    <div 
                      ref={containerRef}
                      className="p-4 border rounded bg-gray-50 relative h-32"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleDragEnd}
                      onMouseLeave={handleDragEnd}
                      onKeyDown={handleKeyDown}
                      tabIndex={-1} // Make container focusable for keyboard events
                    >
                      {/* Status indicator for keyboard users */}
                      <div className="absolute top-1 left-0 right-0 text-[9px] text-center text-gray-500">
                        Press Tab to navigate, Space/Enter to connect, Escape to cancel
                      </div>
                      
                      {/* Main nodes container */}
                      <div className="flex justify-around">
                        {/* Node A */}
                        <div 
                          ref={nodeARef}
                          tabIndex={0} // Make focusable
                          aria-label={`Node A: ${nodeAType}. Press Enter to start connection.`}
                          role="button"
                          className={`w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center 
                            ${connectState !== 'connected' ? 'cursor-grab' : ''} 
                            ${document.activeElement === nodeARef.current ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                            transition-all duration-200 ease-in-out`
                          }
                          onMouseDown={connectState !== 'connected' ? handleDragStart : undefined}
                          style={{ position: 'relative' }}
                        >
                          <span className="font-medium">A</span>
                          <span className="absolute -top-1 -right-1 text-[8px] px-1 bg-blue-200 rounded-full">{nodeAType}</span>
                        </div>
                        
                        {/* Node B */}
                        <div 
                          ref={nodeBRef}
                          tabIndex={0} // Make focusable
                          aria-label={`Node B: ${nodeBType}. ${isValidConnection ? 'Valid connection target.' : 'Invalid connection target.'}`}
                          role="button"
                          className={`w-16 h-16 rounded-full flex items-center justify-center
                            ${isNearTarget && isDragging ? isValidConnection ? 'bg-green-200 border-2 border-green-400 scale-110' : 'bg-red-200 border-2 border-red-400' : 'bg-green-100'}
                            ${isConnected ? 'border-2 border-blue-500 scale-105' : ''}
                            ${!isConnected && isDragging && !isNearTarget ? 'border border-dashed border-gray-400' : ''}
                            ${document.activeElement === nodeBRef.current ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                            transition-all duration-200 ease-in-out
                          `}
                          style={{ position: 'relative' }}
                        >
                          <span className="font-medium">B</span>
                          <span className="absolute -top-1 -right-1 text-[8px] px-1 bg-green-200 rounded-full">{nodeBType}</span>
                        </div>
                      </div>
                      
                      {/* Connection type menu - shown when connection is made */}
                      {showConnectionTypeMenu && (
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-16 bg-white shadow-lg rounded border p-1 z-10 w-32 text-xs">
                          <div className="font-medium text-center pb-1 border-b">Select Relation Type</div>
                          {getAvailableConnectionTypes().map((type) => (
                            <div 
                              key={type}
                              className="py-1 px-2 hover:bg-blue-50 cursor-pointer text-center"
                              onClick={() => {
                                setConnectionType(type);
                                setShowConnectionTypeMenu(false);
                              }}
                            >
                              {type.replace('_', ' ')}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Instructions/actions text */}
                      <div className="mt-3 text-xs text-center text-gray-500 flex justify-center items-center">
                        {!isConnected ? (
                          "Drag from A to B to connect"
                        ) : (
                          <div>
                            <span className="font-medium mr-2">{connectionType}</span>
                            <button
                              className="px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                              onClick={reset}
                            >
                              Reset
                            </button>
                            {undoHistory.length > 0 && (
                              <button
                                className="px-2 py-1 ml-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                                onClick={undo}
                                aria-label="Undo last action"
                              >
                                Undo
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Validation info for non-valid connections */}
                      {isDragging && !isValidConnection && (
                        <div className="absolute top-1 right-2 text-[9px] text-red-500 font-medium">
                          Invalid connection: {nodeAType} → {nodeBType}
                        </div>
                      )}
                      
                      {/* Connection line for connected state - with animation */}
                      {isConnected && (
                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                          <defs>
                            <marker 
                              id="arrowhead" 
                              markerWidth="5" 
                              markerHeight="5" 
                              refX="5" 
                              refY="2.5" 
                              orient="auto"
                            >
                              <polygon points="0 0, 5 2.5, 0 5" fill="#3b82f6" />
                            </marker>
                          </defs>
                          <path
                            d={`M ${nodeAPosition.x} ${nodeAPosition.y} L ${nodeBPosition.x} ${nodeBPosition.y}`}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            fill="none"
                            markerEnd="url(#arrowhead)"
                            className="origin-center"
                            style={{
                              animation: "drawLine 0.5s ease-in-out forwards"
                            }}
                          />
                          <text 
                            x={(nodeAPosition.x + nodeBPosition.x) / 2} 
                            y={(nodeAPosition.y + nodeBPosition.y) / 2 - 5}
                            fontSize="9"
                            textAnchor="middle"
                            fill="#4b5563"
                            className="font-medium"
                          >
                            {connectionType}
                          </text>
                        </svg>
                      )}
                      
                      {/* Drag handle and connection line */}
                      {isDragging && !isConnected && (
                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                          <defs>
                            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                              <feGaussianBlur stdDeviation="2" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                          </defs>
                          <line 
                            x1={nodeAPosition.x} 
                            y1={nodeAPosition.y} 
                            x2={dragPosition.x} 
                            y2={dragPosition.y} 
                            stroke={isValidConnection ? "#4299e1" : "#f87171"} 
                            strokeWidth="2" 
                            strokeDasharray="4"
                          />
                          <circle 
                            cx={dragPosition.x} 
                            cy={dragPosition.y} 
                            r="6" 
                            fill={isValidConnection ? "#3b82f6" : "#ef4444"} 
                            className="cursor-grabbing"
                            filter={isNearTarget ? "url(#glow)" : ""}
                            style={{
                              animation: isNearTarget ? "pulse 1s infinite" : ""
                            }}
                          />
                        </svg>
                      )}
                      
                      {/* Custom CSS animations via inline style */}
                      <style dangerouslySetInnerHTML={{
                        __html: `
                          @keyframes pulse {
                            0% { transform: scale(1); opacity: 1; }
                            50% { transform: scale(1.2); opacity: 0.7; }
                            100% { transform: scale(1); opacity: 1; }
                          }
                          @keyframes drawLine {
                            0% { stroke-dasharray: 100; stroke-dashoffset: 100; }
                            100% { stroke-dasharray: 100; stroke-dashoffset: 0; }
                          }
                        `
                      }} />
                    </div>
                  );
                })()}
                explanation="Drag-to-connect functionality creates a more intuitive, direct manipulation interface for building graph relationships compared to traditional multi-step processes. This approach feels more natural and reduces the cognitive load required to understand how nodes relate to each other. Implementation requires more complex event handling for drag operations, visual feedback during the drag state, and logic to validate and create connections between compatible node types."
              />
              
              <ShowcaseItem
                title="Contextual Right-Click Menu"
                description="Add a context menu with node-specific actions on right-click"
                complexity="Medium"
                impact="Medium"
                beforeImage={<div className="p-4 border rounded bg-gray-50 flex justify-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="text-sm">Node</div>
                  </div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50 flex justify-center relative">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-400">
                    <div className="text-sm">Node</div>
                  </div>
                  <div className="absolute bg-white border rounded shadow-lg w-48 p-1 left-1/2 top-1/2">
                    <div className="text-xs py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer">View Details</div>
                    <div className="text-xs py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer">Edit Properties</div>
                    <div className="text-xs py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer">Add Connection</div>
                    <div className="text-xs py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer">Web Search</div>
                    <div className="text-xs py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer">Navigate to Related</div>
                    <div className="text-xs py-1.5 px-2 hover:bg-gray-100 rounded text-red-500 cursor-pointer">Delete</div>
                  </div>
                </div>}
                explanation="Contextual right-click menus provide quick access to relevant actions based on the specific element clicked, following established UI patterns that users are already familiar with. This approach reduces the need for fixed toolbars or multi-step processes, making the interface more efficient and responsive. Implementation requires handling right-click events and rendering a conditional menu with actions appropriate to the clicked element's type and state."
              />
              
              <ShowcaseItem
                title="Zoom Controls with Preview"
                description="Add zoom controls with a preview of what's being zoomed into"
                complexity="Medium"
                impact="Medium"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-gray-200 rounded h-32 flex items-center justify-center text-xs">
                    Graph visualization area
                  </div>
                  <div className="flex justify-end mt-2">
                    <button className="text-xs px-2 py-1 border rounded mr-1">-</button>
                    <button className="text-xs px-2 py-1 border rounded">+</button>
                  </div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-gray-200 rounded h-32 flex items-center justify-center text-xs relative">
                    Graph visualization area
                    <div className="absolute bottom-2 right-2 flex items-center bg-white shadow-md rounded border p-1">
                      <button className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-l">-</button>
                      <div className="text-xs px-3 border-x">100%</div>
                      <button className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-r">+</button>
                      <div className="ml-2 w-12 h-12 border bg-gray-50 rounded flex items-center justify-center">
                        <div className="w-6 h-6 bg-gray-400 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>}
                explanation="Enhanced zoom controls with a preview provide better context and orientation when navigating a complex graph, reducing the disorientation that can happen with traditional zoom operations. This feature is particularly valuable for large knowledge graphs where users need to maintain awareness of their location within the overall structure. Implementation requires tracking the current viewport in relation to the full graph and rendering a miniature representation that updates as the user navigates."
              />
              
              <ShowcaseItem
                title="Application-Wide Customization Hub"
                description="Allow users to personalize the entire interface and save configurations"
                complexity="Hard"
                impact="High"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white border rounded-lg shadow-sm">
                    <div className="p-2 border-b flex justify-between items-center">
                      <div className="text-xs font-medium">Knowledge Graph Explorer</div>
                      <div className="text-xs text-gray-500">Standard Theme</div>
                    </div>
                    <div className="p-2 grid grid-cols-3 gap-2">
                      <div className="border rounded col-span-2 p-2 bg-gray-50 text-xs flex items-center justify-center">Graph Visualization Area</div>
                      <div className="border rounded p-2 bg-gray-50 text-xs flex flex-col">
                        <div className="text-xs font-medium mb-1">Properties</div>
                        <div className="space-y-1 text-[10px]">
                          <div>Type: Person</div>
                          <div>Label: John Doe</div>
                          <div>Created: Yesterday</div>
                        </div>
                      </div>
                      <div className="border rounded col-span-3 p-2 bg-gray-50 text-xs">
                        <div className="text-xs mb-1">Enter text to generate graph:</div>
                        <div className="w-full h-6 border rounded bg-white"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-center mt-2 text-gray-500">Limited customization options</div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  {/* Top section: App preview with customized theme */}
                  <div className="flex mb-3">
                    <div className="w-[65%] mr-3">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="bg-indigo-600 p-2 border-b flex justify-between items-center">
                          <div className="text-xs font-semibold text-white">Knowledge Graph Explorer</div>
                          <div className="flex space-x-1">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                          </div>
                        </div>
                        <div className="p-2 grid grid-cols-3 gap-2">
                          <div className="col-span-2 p-2 bg-indigo-100 rounded border border-indigo-200 text-xs flex items-center justify-center relative">
                            {/* Customized graph elements */}
                            <div className="absolute left-1/4 top-1/3 w-5 h-5 bg-yellow-100 border border-yellow-400" style={{clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'}}></div>
                            <div className="absolute right-1/3 bottom-1/4 w-5 h-5 rounded-full bg-pink-100 border border-pink-400"></div>
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                              <line x1="28%" y1="33%" x2="66%" y2="75%" stroke="#9333ea" strokeWidth="2" strokeDasharray="4" />
                            </svg>
                            <span className="text-indigo-800">Custom Graph View</span>
                          </div>
                          <div className="p-2 bg-white rounded border border-indigo-200 text-xs flex flex-col">
                            <div className="text-xs font-medium text-indigo-800 mb-1">Properties</div>
                            <div className="space-y-1 text-[10px]">
                              <div className="bg-indigo-50 p-1 rounded">Type: Person</div>
                              <div className="bg-indigo-50 p-1 rounded">Label: John Doe</div>
                              <div className="bg-indigo-50 p-1 rounded">Created: Yesterday</div>
                            </div>
                          </div>
                          <div className="col-span-3 p-2 border border-indigo-200 rounded bg-white text-xs">
                            <div className="text-xs mb-1 text-indigo-800">Input:</div>
                            <div className="w-full h-6 border rounded border-indigo-300 bg-indigo-50"></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-center mt-1 text-indigo-600">Custom "Deep Ocean" Theme</div>
                    </div>
                    
                    {/* Theme selection panel */}
                    <div className="w-[35%] bg-white border rounded p-2">
                      <div className="text-xs font-medium mb-2 flex justify-between items-center">
                        <span>Interface Themes</span>
                        <span className="text-blue-500 text-[10px]">Export Settings</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="border rounded p-1 text-center text-[9px] bg-gray-50">
                          <div className="w-full h-6 mb-1 bg-white border rounded"></div>
                          Light
                        </div>
                        <div className="border rounded p-1 text-center text-[9px] bg-gray-50">
                          <div className="w-full h-6 mb-1 bg-gray-800 border rounded"></div>
                          Dark
                        </div>
                        <div className="border rounded p-1 text-center text-[9px] bg-blue-50 border-blue-200">
                          <div className="w-full h-6 mb-1 bg-indigo-600 border rounded"></div>
                          Ocean
                        </div>
                        <div className="border rounded p-1 text-center text-[9px] bg-gray-50">
                          <div className="w-full h-6 mb-1 bg-amber-600 border rounded"></div>
                          Sunset
                        </div>
                      </div>
                      
                      <div className="text-xs font-medium mb-1">Layout Options</div>
                      <div className="grid grid-cols-3 gap-1 mb-2">
                        <div className="border rounded p-1 text-center flex flex-col items-center">
                          <div className="w-8 h-5 flex flex-col">
                            <div className="h-1 bg-gray-300 mb-px"></div>
                            <div className="h-3 flex space-x-px">
                              <div className="w-3 bg-gray-300"></div>
                              <div className="flex-1 bg-gray-300"></div>
                            </div>
                          </div>
                          <div className="text-[8px] mt-px">Default</div>
                        </div>
                        <div className="border rounded p-1 text-center flex flex-col items-center border-blue-200 bg-blue-50">
                          <div className="w-8 h-5 flex space-x-px">
                            <div className="w-2 bg-gray-300"></div>
                            <div className="flex-1 flex flex-col">
                              <div className="h-2 bg-gray-300 mb-px"></div>
                              <div className="flex-1 bg-gray-300"></div>
                            </div>
                          </div>
                          <div className="text-[8px] mt-px">Sidebar</div>
                        </div>
                        <div className="border rounded p-1 text-center flex flex-col items-center">
                          <div className="w-8 h-5 flex flex-col">
                            <div className="h-2 bg-gray-300 mb-px"></div>
                            <div className="flex-1 bg-gray-300"></div>
                          </div>
                          <div className="text-[8px] mt-px">Focus</div>
                        </div>
                      </div>
                      
                      <div className="text-xs font-medium mb-1">Saved Profiles</div>
                      <div className="space-y-1">
                        <div className="border rounded p-1 bg-gray-50 text-[10px] flex justify-between items-center">
                          <span>Default</span>
                          <button className="px-1 bg-gray-100 rounded text-[8px]">Apply</button>
                        </div>
                        <div className="border rounded p-1 bg-gray-50 text-[10px] flex justify-between items-center">
                          <span>Presentation Mode</span>
                          <button className="px-1 bg-gray-100 rounded text-[8px]">Apply</button>
                        </div>
                        <div className="border rounded p-1 bg-blue-50 text-[10px] flex justify-between items-center">
                          <span>My Custom Theme</span>
                          <button className="px-1 bg-blue-500 text-white rounded text-[8px]">Active</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom section: Component styling & spacing controls */}
                  <div className="bg-white border rounded p-2">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs font-medium">Component Customization</div>
                      <div className="text-xs text-blue-500">Reset to Default</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {/* Element styling */}
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500 mb-1">Element Styling</div>
                        <div className="grid grid-cols-3 gap-2">
                          {/* Node styling */}
                          <div className="border rounded p-1">
                            <div className="text-[10px] font-medium mb-1">Nodes</div>
                            <div className="flex space-x-1 mb-1">
                              <div className="w-4 h-4 rounded-full bg-pink-100 border border-pink-300"></div>
                              <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
                              <div className="w-4 h-4" style={{clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', background: '#e0f2fe', border: '1px solid #7dd3fc'}}></div>
                            </div>
                            <input type="range" className="w-full h-1 mb-1" />
                            <div className="grid grid-cols-4 gap-px">
                              <div className="w-3 h-3 rounded-sm bg-blue-100"></div>
                              <div className="w-3 h-3 rounded-sm bg-green-100"></div>
                              <div className="w-3 h-3 rounded-sm bg-indigo-100"></div>
                              <div className="w-3 h-3 rounded-sm bg-gray-100 flex items-center justify-center text-[6px]">+</div>
                            </div>
                          </div>
                          
                          {/* Edge styling */}
                          <div className="border rounded p-1">
                            <div className="text-[10px] font-medium mb-1">Edges</div>
                            <div className="flex flex-col space-y-1 mb-1">
                              <div className="h-px bg-indigo-400"></div>
                              <div className="h-px border-t border-dashed border-indigo-400"></div>
                            </div>
                            <input type="range" className="w-full h-1 mb-1" />
                            <div className="flex justify-between">
                              <div className="text-[8px]">Arrow</div>
                              <div className="flex space-x-px">
                                <div className="w-3 h-3 rounded-sm bg-blue-100 flex items-center justify-center text-[6px]">→</div>
                                <div className="w-3 h-3 rounded-sm bg-blue-100 flex items-center justify-center text-[6px]">●</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Text styling */}
                          <div className="border rounded p-1">
                            <div className="text-[10px] font-medium mb-1">Text</div>
                            <div className="space-y-1 mb-1">
                              <div className="h-2 bg-gray-200 rounded-sm w-full"></div>
                              <div className="h-2 bg-gray-200 rounded-sm w-3/4"></div>
                            </div>
                            <div className="flex text-[8px] justify-between">
                              <div>Font</div>
                              <select className="border text-[7px] w-12 rounded">
                                <option>Sans</option>
                              </select>
                            </div>
                            <div className="flex justify-between mt-1">
                              <div className="text-[8px]">Size</div>
                              <div className="flex space-x-px">
                                <div className="w-3 h-3 rounded-sm bg-blue-100 flex items-center justify-center text-[6px]">-</div>
                                <div className="w-3 h-3 rounded-sm bg-blue-100 flex items-center justify-center text-[6px]">+</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Spacing & Animations */}
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div className="border rounded p-1">
                            <div className="text-[10px] font-medium mb-1">Spacing</div>
                            <div className="flex justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <span className="text-[8px] w-10">Compact</span>
                                  <input type="radio" className="w-2 h-2" />
                                </div>
                                <div className="flex items-center">
                                  <span className="text-[8px] w-10">Normal</span>
                                  <input type="radio" className="w-2 h-2" checked />
                                </div>
                                <div className="flex items-center">
                                  <span className="text-[8px] w-10">Spacious</span>
                                  <input type="radio" className="w-2 h-2" />
                                </div>
                              </div>
                              <div className="border w-12 h-10 rounded flex items-center justify-center p-1">
                                <div className="border w-full h-full rounded bg-gray-50"></div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border rounded p-1">
                            <div className="text-[10px] font-medium mb-1">Animations</div>
                            <div className="flex justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <span className="text-[8px] w-12">Minimal</span>
                                  <input type="radio" className="w-2 h-2" />
                                </div>
                                <div className="flex items-center">
                                  <span className="text-[8px] w-12">Standard</span>
                                  <input type="radio" className="w-2 h-2" checked />
                                </div>
                                <div className="flex items-center">
                                  <span className="text-[8px] w-12">Rich</span>
                                  <input type="radio" className="w-2 h-2" />
                                </div>
                              </div>
                              <div className="relative w-10 h-10">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-6 h-6 bg-indigo-100 rounded-full animate-pulse flex items-center justify-center">
                                    <div className="w-3 h-3 bg-indigo-300 rounded-full"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Component selection & presets */}
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Components & Presets</div>
                        <div className="border rounded p-2 h-[98px] overflow-y-auto space-y-1">
                          <div className="text-[10px] px-1 font-medium">Core Components</div>
                          <div className="flex items-center bg-blue-50 rounded p-1">
                            <input type="checkbox" className="w-2 h-2 mr-1" checked />
                            <div className="text-[8px]">Graph Canvas</div>
                          </div>
                          <div className="flex items-center rounded p-1">
                            <input type="checkbox" className="w-2 h-2 mr-1" checked />
                            <div className="text-[8px]">Property Panel</div>
                          </div>
                          <div className="flex items-center rounded p-1">
                            <input type="checkbox" className="w-2 h-2 mr-1" checked />
                            <div className="text-[8px]">Text Input</div>
                          </div>
                          <div className="text-[10px] px-1 font-medium mt-1">Optional Components</div>
                          <div className="flex items-center rounded p-1">
                            <input type="checkbox" className="w-2 h-2 mr-1" checked />
                            <div className="text-[8px]">History Panel</div>
                          </div>
                          <div className="flex items-center rounded p-1">
                            <input type="checkbox" className="w-2 h-2 mr-1" />
                            <div className="text-[8px]">Analytics Dashboard</div>
                          </div>
                          <div className="flex items-center rounded p-1">
                            <input type="checkbox" className="w-2 h-2 mr-1" checked />
                            <div className="text-[8px]">Search Tools</div>
                          </div>
                        </div>
                        
                        <div className="mt-2 border rounded p-1">
                          <div className="text-[10px] font-medium mb-1">Quick Presets</div>
                          <div className="grid grid-cols-2 gap-1">
                            <button className="text-[8px] p-px border rounded bg-gray-50">Data Analysis</button>
                            <button className="text-[8px] p-px border rounded bg-blue-50 border-blue-200">Knowledge Map</button>
                            <button className="text-[8px] p-px border rounded bg-gray-50">Minimal View</button>
                            <button className="text-[8px] p-px border rounded bg-gray-50">Full Features</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}
                explanation="This comprehensive customization system allows users to personalize the entire application interface to suit their preferences and workflow needs. It includes theme selection (light/dark/custom), layout options (default/sidebar/focus), component styling (nodes, edges, text), spacing controls, animation settings, and the ability to show/hide optional components. Users can save their configurations as named profiles for quick switching between different setups. This level of customization not only improves user satisfaction but also enhances productivity by allowing the interface to be optimized for specific use cases, such as data analysis, knowledge mapping, or presentations."
              />
            </div>
          </TabsContent>
          
          <TabsContent value="accessibility" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ShowcaseItem
                title="Text Scaling Support"
                description="Ensure the interface properly scales when users increase text size"
                complexity="Medium"
                impact="Medium"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="overflow-hidden bg-white rounded border p-2">
                    <div className="text-xs font-medium whitespace-nowrap">Node Properties (cannot expand with larger text)</div>
                    <div className="flex text-xs mt-1 overflow-hidden">
                      <div className="font-medium w-20 flex-shrink-0">Type:</div>
                      <div className="truncate">Person</div>
                    </div>
                    <div className="flex text-xs mt-1 overflow-hidden">
                      <div className="font-medium w-20 flex-shrink-0">Name:</div>
                      <div className="truncate">John Smith gets cut off when text is too large</div>
                    </div>
                  </div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white rounded border p-2">
                    <div className="text-xs font-medium">Node Properties (adapts to text size)</div>
                    <div className="mt-1">
                      <div className="text-xs font-medium">Type:</div>
                      <div className="text-xs bg-gray-50 p-1 rounded break-words">Person</div>
                    </div>
                    <div className="mt-1">
                      <div className="text-xs font-medium">Name:</div>
                      <div className="text-xs bg-gray-50 p-1 rounded break-words">John Smith text wraps naturally when content is too long for a single line</div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end text-xs space-x-2">
                    <button className="px-2 py-1 border rounded">A<span className="text-[8px]">-</span></button>
                    <button className="px-2 py-1 border rounded">A</button>
                    <button className="px-2 py-1 border rounded">A<span className="text-[12px]">+</span></button>
                  </div>
                </div>}
                explanation="Text scaling support ensures the interface remains usable when users adjust their browser's text size or zoom level to improve readability. This feature is essential for users with visual impairments but benefits anyone who prefers larger text. Implementation involves using flexible layout techniques like CSS Grid and Flexbox, avoiding fixed dimensions that can't accommodate larger text, and testing the interface at various text sizes to ensure proper adaptation."
              />
              
              <ShowcaseItem
                title="Screen Reader Optimization"
                description="Enhance the interface for non-visual navigation with screen readers"
                complexity="Hard"
                impact="High"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white border rounded p-2">
                    <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-xs">
                      Graph visualization (not accessible to screen readers)
                    </div>
                  </div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white border rounded p-2">
                    <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-xs relative">
                      Graph visualization (screen reader optimized)
                      <div className="absolute top-0 left-0 invisible">
                        <div className="sr-only">
                          Graph contains 5 nodes and 8 edges. Current node: Person "John Doe" has 3 connections.
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 bg-black text-green-400 text-xs p-2 rounded font-mono">
                      &gt; Node: Person "John Doe"<br/>
                      &gt; Connected to: Company "Acme Inc" via "WORKS_AT"<br/>
                      &gt; Connected to: Person "Jane Smith" via "COLLEAGUE"
                    </div>
                  </div>
                </div>}
                explanation="Screen reader optimization makes your application accessible to users who rely on assistive technologies for navigation and information consumption. This involves adding appropriate ARIA attributes, ensuring a logical tab order, providing text alternatives for visual elements, and structuring content in a way that makes sense when read aloud. For graph visualizations specifically, this requires creating alternative text-based representations of the graph structure and relationships that can be navigated non-visually."
              />
              
              <ShowcaseItem
                title="Voice Command Interface"
                description="Control the application and navigate the graph using voice commands"
                complexity="Hard"
                impact="High"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white border rounded p-2">
                    <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-xs">
                      Graph visualization (keyboard & mouse only)
                    </div>
                    <div className="flex justify-end mt-2">
                      <button className="border rounded px-2 py-1 text-xs bg-gray-50">Help</button>
                    </div>
                  </div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white border rounded p-2">
                    <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-xs relative">
                      <div className="flex flex-col items-center">
                        <div>Graph visualization with voice control</div>
                        <div className="mt-2 flex items-center px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200 text-[10px] text-blue-700">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                          Listening for commands...
                        </div>
                      </div>
                      
                      {/* Voice command hints */}
                      <div className="absolute top-1 right-1 bg-white/70 backdrop-blur-sm border rounded px-1.5 py-1 text-[8px]">
                        <div className="font-medium mb-0.5">Voice Commands:</div>
                        <div className="text-gray-700">• "Select node Person"</div>
                        <div className="text-gray-700">• "Zoom in/out"</div>
                        <div className="text-gray-700">• "Show properties"</div>
                        <div className="text-gray-700">• "Create connection to..."</div>
                      </div>
                    </div>
                    
                    {/* Transcript panel */}
                    <div className="flex mt-2">
                      <div className="flex-1 mr-2 border rounded bg-gray-50 p-2 text-[10px]">
                        <div className="font-medium mb-1 text-gray-500">Transcript:</div>
                        <div className="font-mono">
                          <div className="text-gray-500">You: "Select node Person"</div>
                          <div className="text-blue-600">→ Selected node: "John Doe" (Person)</div>
                          <div className="text-gray-500">You: "Show properties"</div>
                          <div className="text-blue-600">→ Displaying properties for "John Doe"</div>
                          <div className="text-gray-500">You: "Find connections"</div>
                          <div className="text-blue-600">→ Found 3 connections</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-1">
                        <button className="border rounded-full w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100">
                          <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        </button>
                        <button className="border rounded px-2 text-[10px] bg-gray-50">Help</button>
                        <button className="border rounded px-2 text-[10px] bg-gray-50">Settings</button>
                      </div>
                    </div>
                  </div>
                </div>}
                explanation="Voice command interfaces provide hands-free control of the application, making it more accessible to users with motor disabilities and offering convenience for all users. This feature uses speech recognition to interpret spoken commands and translates them into application actions. The implementation includes a command vocabulary tailored to graph operations (like node selection, path finding, and property viewing), visual feedback to confirm recognition, and a transcript panel to review past commands and responses. Voice commands are especially valuable in complex visualization contexts where traditional keyboard shortcuts might be numerous and difficult to remember."
              />
              
              <ShowcaseItem
                title="Color Blind Friendly Modes"
                description="Provide alternative color schemes for different types of color blindness"
                complexity="Medium"
                impact="High"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white border rounded p-2">
                    <div className="w-full text-center text-xs font-medium mb-1">Standard Color Scheme</div>
                    <div className="flex space-x-3 justify-center mb-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 border"></div>
                      <div className="w-6 h-6 rounded-full bg-green-500 border"></div>
                      <div className="w-6 h-6 rounded-full bg-red-500 border"></div>
                      <div className="w-6 h-6 rounded-full bg-purple-500 border"></div>
                      <div className="w-6 h-6 rounded-full bg-yellow-500 border"></div>
                    </div>
                    <div className="w-full h-20 bg-gray-100 flex items-center justify-center text-xs">
                      Graph with standard colors (difficult for color blind users)
                    </div>
                  </div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-white border rounded p-2">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs font-medium">Color Blind Modes</div>
                      <select className="text-[10px] border rounded px-1 py-0.5">
                        <option>Deuteranopia (Red-Green)</option>
                        <option>Protanopia (Red)</option>
                        <option>Tritanopia (Blue)</option>
                        <option>Monochromacy</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="p-1 border rounded">
                        <div className="text-[10px] font-medium text-center mb-1">Deuteranopia Mode</div>
                        <div className="flex space-x-2 justify-center mb-2">
                          <div className="w-4 h-4 rounded-full bg-blue-600 border"></div>
                          <div className="w-4 h-4 rounded-full bg-amber-600 border"></div>
                          <div className="w-4 h-4 rounded-full bg-sky-400 border"></div>
                          <div className="w-4 h-4 rounded-full bg-slate-800 border"></div>
                        </div>
                        <div className="w-full h-12 bg-gray-100 flex items-center justify-center text-[8px]">
                          <div className="w-3 h-3 rounded-full bg-blue-600 border mr-1"></div>
                          <div className="w-3 h-3 rounded-full bg-amber-600 border"></div>
                          Distinguishable colors
                        </div>
                      </div>
                      
                      <div className="p-1 border rounded">
                        <div className="text-[10px] font-medium text-center mb-1">Pattern Enhanced</div>
                        <div className="flex space-x-2 justify-center mb-2">
                          <div className="w-4 h-4 rounded-full bg-indigo-600 border"></div>
                          <div className="w-4 h-4 rounded-full bg-rose-600 border border-dashed"></div>
                          <div className="w-4 h-4 rounded-full bg-emerald-600 border border-dotted"></div>
                          <div className="w-4 h-4 rounded-full bg-amber-400" style={{background: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 2px, #fcd34d 2px, #fcd34d 4px)'}}></div>
                        </div>
                        <div className="w-full h-12 bg-gray-100 flex items-center justify-center text-[8px]">
                          <div className="w-3 h-3 rounded-full bg-indigo-600 border mr-1"></div>
                          <div className="w-3 h-3 rounded-full bg-indigo-600 border border-dashed"></div>
                          Colors + patterns
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center p-2">
                      <div className="text-xs">
                        <div className="flex items-center mb-1">
                          <div className="w-3 h-3 rounded-full border mr-1" style={{background: 'repeating-linear-gradient(45deg, #1e40af, #1e40af 2px, #3b82f6 2px, #3b82f6 4px)'}}></div>
                          Person nodes use blue with stripes
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full border border-dashed bg-amber-500 mr-1"></div>
                          Organization nodes use amber with dashes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}
                explanation="Color blind friendly modes ensure that all users can distinguish between different node and edge types regardless of their color perception abilities. This accessibility feature offers alternate color palettes specifically designed for various types of color blindness (deuteranopia, protanopia, tritanopia, and monochromacy). For enhanced accessibility, the implementation combines colors with distinct patterns, shapes, or textures to provide multiple visual cues. This approach follows inclusive design principles and allows users to select the mode that works best for their specific needs, creating a more equitable experience for all users."
              />
            </div>
          </TabsContent>
          
          <TabsContent value="mobile" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ShowcaseItem
                title="Responsive Graph Layout"
                description="Optimize graph layout for small screens with automatic resizing and repositioning"
                complexity="Medium"
                impact="High"
                beforeImage={<div className="border rounded p-3 bg-white">
                  <div className="text-center text-xs text-gray-500 mb-1">Desktop Layout</div>
                  <div className="bg-gray-50 p-2 rounded relative" style={{height: '150px'}}>
                    {/* Desktop graph visualization with many nodes */}
                    <div className="absolute top-1/4 left-1/4 w-10 h-10 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-xs">Node 1</div>
                    <div className="absolute top-1/2 left-1/2 w-10 h-10 rounded-full bg-green-100 border border-green-300 flex items-center justify-center text-xs">Node 2</div>
                    <div className="absolute bottom-1/4 right-1/4 w-10 h-10 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-xs">Node 3</div>
                    <div className="absolute top-2/3 left-1/3 w-10 h-10 rounded-full bg-yellow-100 border border-yellow-300 flex items-center justify-center text-xs">Node 4</div>
                    <div className="absolute top-1/3 right-1/3 w-10 h-10 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-xs">Node 5</div>
                    {/* Lines connecting nodes */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line x1="35%" y1="30%" x2="50%" y2="50%" stroke="#999" strokeWidth="1" />
                      <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#999" strokeWidth="1" />
                      <line x1="66%" y1="33%" x2="50%" y2="50%" stroke="#999" strokeWidth="1" />
                      <line x1="33%" y1="66%" x2="50%" y2="50%" stroke="#999" strokeWidth="1" />
                    </svg>
                  </div>
                  <div className="mt-2 p-2 border rounded bg-gray-50">
                    <div className="text-xs text-gray-500">Controls panel</div>
                    <div className="flex mt-1">
                      <div className="bg-white border rounded p-1 mr-1 text-xs">Zoom</div>
                      <div className="bg-white border rounded p-1 mr-1 text-xs">Filter</div>
                      <div className="bg-white border rounded p-1 text-xs">Layout</div>
                    </div>
                  </div>
                </div>}
                afterImage={<div className="border rounded p-3 bg-white">
                  <div className="text-center text-xs text-gray-500 mb-1">Mobile-Optimized Layout</div>
                  <div className="bg-gray-50 p-2 rounded relative" style={{height: '150px'}}>
                    {/* Mobile graph with fewer visible nodes and larger touch targets */}
                    <div className="absolute top-1/3 left-1/3 w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-xs shadow-md">Node 1</div>
                    <div className="absolute bottom-1/3 right-1/3 w-12 h-12 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center text-xs shadow-md">Node 2</div>
                    {/* Lines connecting nodes */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line x1="33%" y1="33%" x2="66%" y2="66%" stroke="#999" strokeWidth="2" />
                    </svg>
                    {/* Minimap in corner */}
                    <div className="absolute top-2 right-2 w-16 h-16 bg-white border rounded shadow-sm p-1">
                      <div className="text-xxs text-center text-gray-400">Overview</div>
                      <div className="relative h-10 w-full">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-blue-300"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-green-300"></div>
                        <div className="absolute top-3/4 left-3/4 w-2 h-2 rounded-full bg-purple-300"></div>
                        <div className="absolute bottom-1/2 right-1/2 w-2 h-2 rounded-full bg-yellow-300"></div>
                        <div className="absolute top-1/3 right-2/3 w-2 h-2 rounded-full bg-red-300"></div>
                        {/* Viewport indicator */}
                        <div className="absolute inset-0 border border-blue-500 bg-blue-50 bg-opacity-20"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-center mb-1">
                      <div className="inline-flex bg-white border rounded-full shadow-sm">
                        <button className="p-1 text-xs rounded-l-full px-3 bg-gray-100">-</button>
                        <button className="p-1 text-xs rounded-r-full px-3">+</button>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button className="bg-white border rounded-full p-1 px-3 text-xs shadow-sm flex items-center">
                        <span className="mr-1">⚙️</span> More
                      </button>
                    </div>
                  </div>
                </div>}
                explanation="Responsive graph layouts are essential for mobile users. This approach includes several optimizations: larger touch targets for nodes, simplified views showing fewer elements at once, a minimap for navigating the full graph, touch-friendly zoom controls, and automatic layout adjustment. The mobile version maintains the same data representation while adapting the presentation to overcome the constraints of small screens and touch interaction. This requires responsive design principles and touch event handling in the graph visualization library."
              />
              
              <ShowcaseItem
                title="Touch-Optimized Controls"
                description="Replace mouse-oriented controls with touch-friendly alternatives designed for mobile"
                complexity="Medium"
                impact="High"
                beforeImage={<div className="border rounded p-3 bg-white">
                  <div className="text-center text-xs text-gray-500 mb-2">Desktop Controls</div>
                  <div className="bg-gray-50 p-2 rounded mb-2">
                    <div className="flex mb-2">
                      <div className="bg-white border rounded p-1 mr-1 text-xs flex items-center">
                        <span className="inline-block w-3 h-3 mr-1 bg-gray-400 rounded-sm"></span>
                        Select
                      </div>
                      <div className="bg-white border rounded p-1 mr-1 text-xs flex items-center">
                        <span className="inline-block w-3 h-3 mr-1 bg-gray-400 rounded-sm"></span>
                        Pan
                      </div>
                      <div className="bg-white border rounded p-1 text-xs flex items-center">
                        <span className="inline-block w-3 h-3 mr-1 bg-gray-400 rounded-sm"></span>
                        Zoom
                      </div>
                    </div>
                    <div className="flex">
                      <div className="bg-white border rounded p-1 mr-1 text-xs">
                        <span className="text-xs text-gray-500">Zoom:</span>
                        <input type="range" className="w-20 h-2 ml-1" />
                      </div>
                      <div className="bg-white border rounded p-1 text-xs">
                        <span className="text-xs text-gray-500">Filter:</span>
                        <select className="text-xs border ml-1 w-20">
                          <option>All</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Small controls designed for mouse precision
                  </div>
                </div>}
                afterImage={<div className="border rounded p-3 bg-white">
                  <div className="text-center text-xs text-gray-500 mb-2">Touch-Optimized Controls</div>
                  <div className="bg-gray-50 p-2 rounded mb-2">
                    {/* Large buttons with icon + text */}
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="bg-white border rounded-lg p-2 text-center shadow-sm">
                        <div className="flex justify-center mb-1">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">👆</div>
                        </div>
                        <div className="text-xs">Select</div>
                      </div>
                      <div className="bg-white border rounded-lg p-2 text-center shadow-sm">
                        <div className="flex justify-center mb-1">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">👋</div>
                        </div>
                        <div className="text-xs">Pan</div>
                      </div>
                      <div className="bg-white border rounded-lg p-2 text-center shadow-sm">
                        <div className="flex justify-center mb-1">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">🔍</div>
                        </div>
                        <div className="text-xs">Zoom</div>
                      </div>
                    </div>
                    {/* Floating action buttons */}
                    <div className="relative h-10">
                      <div className="absolute right-2 bottom-0 flex">
                        <div className="w-8 h-8 rounded-full bg-white border shadow-md flex items-center justify-center text-sm mr-2">+</div>
                        <div className="w-8 h-8 rounded-full bg-white border shadow-md flex items-center justify-center text-sm">-</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
                    Large, finger-sized buttons with visual affordances
                  </div>
                </div>}
                explanation="Touch interfaces require larger target sizes, simplified controls, and intuitive gesture support. This example transforms the traditional mouse-centric control panel into a touch-optimized interface with finger-sized buttons (minimum 44x44px touch targets), clear visual affordances, and reduced control density. Floating action buttons provide quick access to common functions, while gesture support (pinch to zoom, swipe to pan) replaces traditional control widgets. These changes make the application much more usable on smartphones and tablets while maintaining feature parity."
              />
              
              <ShowcaseItem
                title="Mobile-First Property Panel"
                description="Transform property displays into full-screen modal interfaces for mobile"
                complexity="Medium" 
                impact="High"
                beforeImage={<div className="border rounded p-3 bg-white">
                  <div className="text-center text-xs text-gray-500 mb-2">Desktop Property Panel</div>
                  <div className="flex">
                    <div className="bg-gray-50 p-2 rounded mr-2" style={{width: '60%', height: '140px'}}>
                      {/* Simple graph visualization */}
                      <div className="flex justify-center items-center h-full text-xs text-gray-400">
                        Graph Visualization Area
                      </div>
                    </div>
                    <div className="border rounded p-2 bg-white" style={{width: '40%'}}>
                      <div className="text-xs font-medium mb-1">Node Properties</div>
                      <div className="text-xs mb-1"><span className="text-gray-500">ID:</span> node-123</div>
                      <div className="text-xs mb-1"><span className="text-gray-500">Type:</span> Person</div>
                      <div className="text-xs mb-1"><span className="text-gray-500">Name:</span> John Smith</div>
                      <div className="text-xs mb-1"><span className="text-gray-500">Age:</span> 42</div>
                      <div className="text-xs mb-1"><span className="text-gray-500">Connections:</span> 3</div>
                      <div className="flex mt-2">
                        <button className="bg-gray-100 rounded text-xs px-2 py-1 mr-1">Edit</button>
                        <button className="bg-gray-100 rounded text-xs px-2 py-1">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>}
                afterImage={<div className="border rounded p-3 bg-white">
                  <div className="text-center text-xs text-gray-500 mb-2">Mobile Property Panel</div>
                  {/* Mobile view with full-screen modal */}
                  <div className="relative bg-gray-50 rounded" style={{height: '140px'}}>
                    {/* Simple graph visualization */}
                    <div className="flex justify-center items-center h-full text-xs text-gray-400">
                      Graph Visualization Area
                    </div>
                    {/* Property modal sliding from bottom */}
                    <div className="absolute inset-x-0 bottom-0 border-t rounded-t-xl bg-white shadow-lg p-3" style={{height: '80%'}}>
                      {/* Handle for dragging */}
                      <div className="absolute top-1 left-0 right-0 flex justify-center">
                        <div className="w-10 h-1 bg-gray-300 rounded"></div>
                      </div>
                      <div className="mt-3">
                        {/* Larger, touch-friendly property display */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-sm font-medium">Person</div>
                          <button className="text-xs bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">×</button>
                        </div>
                        <div className="text-sm font-medium mb-1">John Smith</div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="border rounded p-2 bg-gray-50">
                            <div className="text-xs text-gray-500">Age</div>
                            <div className="text-sm">42</div>
                          </div>
                          <div className="border rounded p-2 bg-gray-50">
                            <div className="text-xs text-gray-500">Connections</div>
                            <div className="text-sm">3</div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-2">
                          <button className="bg-blue-50 border border-blue-200 rounded-lg text-sm px-3 py-1.5 mr-2">Edit</button>
                          <button className="bg-red-50 border border-red-200 rounded-lg text-sm px-3 py-1.5">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}
                explanation="On mobile devices, traditional side panels become impractical due to limited screen width. This design transforms the property panel into a bottom sheet modal that slides up from the bottom of the screen, following mobile UI conventions similar to native apps. The sheet can be dragged to adjust its height, has larger touch targets, and uses a card-based layout for different property groups. This approach maximizes the available space for the graph visualization while providing a rich, touch-friendly interface for viewing and editing node properties."
              />
              
              <ShowcaseItem
                title="Pinch-to-Zoom Navigation"
                description="Implement intuitive touch gestures for navigating complex graph visualizations"
                complexity="Hard"
                impact="High"
                beforeImage={<div className="border rounded p-3 bg-white">
                  <div className="text-center text-xs text-gray-500 mb-2">Traditional Controls</div>
                  <div className="bg-gray-50 rounded p-2 mb-2" style={{height: '120px'}}>
                    {/* Graph visualization */}
                    <div className="flex justify-center items-center h-full text-xs text-gray-400">
                      Graph Visualization Area
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-white border rounded-lg p-1 flex items-center">
                      <button className="text-xs px-2 py-1">-</button>
                      <div className="border-l border-r px-2 py-1">
                        <input type="range" className="w-20 h-1" />
                      </div>
                      <button className="text-xs px-2 py-1">+</button>
                    </div>
                  </div>
                </div>}
                afterImage={<div className="border rounded p-3 bg-white">
                  <div className="text-center text-xs text-gray-500 mb-2">Touch Gesture Navigation</div>
                  <div className="bg-gray-50 rounded p-2 relative" style={{height: '140px'}}>
                    {/* Graph visualization */}
                    <div className="flex justify-center items-center h-full">
                      <div className="relative">
                        {/* Visualization with gesture indicators */}
                        <div className="w-24 h-24 border border-dashed border-gray-300 rounded-full flex items-center justify-center">
                          <div className="text-xs text-gray-400">Graph Area</div>
                        </div>
                        {/* Gesture indicators */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-36 h-36 border border-dashed border-blue-300 rounded-full opacity-50"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-400">
                              <path d="M7 11l5 5 5-5" />
                              <path d="M7 6l5 5 5-5" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Gesture hint overlay */}
                    <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 rounded px-2 py-1 text-xs border shadow-sm">
                      <div className="flex items-center mb-1">
                        <div className="text-gray-500 mr-1">Pinch:</div>
                        <div>Zoom</div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-gray-500 mr-1">Two-finger drag:</div>
                        <div>Pan</div>
                      </div>
                    </div>
                  </div>
                </div>}
                explanation="Touch-based navigation is essential for mobile users exploring complex graph visualizations. This implementation adds support for standard touch gestures that mobile users already know: pinch to zoom in/out, two-finger pan to move around the graph, double-tap to center on a specific node, and tap to select. The design also includes a gesture hint system that teaches new users the available interactions, gradually fading out as they demonstrate proficiency. This approach requires adding touch event handlers to the visualization layer but creates a much more natural interaction model for mobile users."
              />
              
              <ShowcaseItem
                title="Context-Aware Toolbars"
                description="Adapt toolbars and menus to screen size with responsive design patterns"
                complexity="Medium"
                impact="Medium"
                beforeImage={<div className="border rounded p-3 bg-white">
                  <div className="text-center text-xs text-gray-500 mb-2">Desktop Toolbar</div>
                  <div className="bg-gray-100 p-2 rounded mb-2">
                    <div className="flex items-center">
                      <button className="bg-white border rounded px-2 py-1 text-xs mr-2 flex items-center">
                        <span className="mr-1">+</span>Add Node
                      </button>
                      <button className="bg-white border rounded px-2 py-1 text-xs mr-2 flex items-center">
                        <span className="mr-1">↔️</span>Add Edge
                      </button>
                      <button className="bg-white border rounded px-2 py-1 text-xs mr-2 flex items-center">
                        <span className="mr-1">🔍</span>Find
                      </button>
                      <button className="bg-white border rounded px-2 py-1 text-xs mr-2 flex items-center">
                        <span className="mr-1">⚙️</span>Settings
                      </button>
                      <button className="bg-white border rounded px-2 py-1 text-xs mr-2 flex items-center">
                        <span className="mr-1">💾</span>Save
                      </button>
                      <button className="bg-white border rounded px-2 py-1 text-xs flex items-center">
                        <span className="mr-1">📤</span>Export
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-2" style={{height: '100px'}}>
                    <div className="flex justify-center items-center h-full text-xs text-gray-400">
                      Graph Visualization Area
                    </div>
                  </div>
                </div>}
                afterImage={<div className="border rounded p-3 bg-white">
                  <div className="text-center text-xs text-gray-500 mb-2">Mobile-Optimized Toolbar</div>
                  <div className="bg-gray-100 p-2 rounded mb-2">
                    <div className="flex items-center justify-between">
                      {/* Only most important actions visible */}
                      <button className="bg-white border rounded-full w-8 h-8 flex items-center justify-center shadow-sm text-xs">+</button>
                      {/* More menu with dropdown */}
                      <div className="relative">
                        <button className="bg-white border rounded-lg px-3 py-1 text-xs flex items-center shadow-sm">
                          <span className="mr-1">⋮</span>More
                        </button>
                        {/* Dropdown menu */}
                        <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg p-1 z-10">
                          <div className="text-xs px-3 py-1.5 rounded hover:bg-gray-50 flex items-center">
                            <span className="mr-2">↔️</span>Add Edge
                          </div>
                          <div className="text-xs px-3 py-1.5 rounded hover:bg-gray-50 flex items-center">
                            <span className="mr-2">🔍</span>Find
                          </div>
                          <div className="text-xs px-3 py-1.5 rounded hover:bg-gray-50 flex items-center">
                            <span className="mr-2">⚙️</span>Settings
                          </div>
                          <div className="text-xs px-3 py-1.5 rounded hover:bg-gray-50 flex items-center">
                            <span className="mr-2">💾</span>Save
                          </div>
                          <div className="text-xs px-3 py-1.5 rounded hover:bg-gray-50 flex items-center">
                            <span className="mr-2">📤</span>Export
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-2 relative" style={{height: '100px'}}>
                    <div className="flex justify-center items-center h-full text-xs text-gray-400">
                      Graph Visualization Area
                    </div>
                    {/* Floating Action Button */}
                    <div className="absolute right-2 bottom-2">
                      <button className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg">
                        <span className="text-lg">+</span>
                      </button>
                    </div>
                  </div>
                </div>}
                explanation="Context-aware toolbars adapt their design based on screen size and device capabilities. For mobile devices, this means consolidating less-used actions into menus, prioritizing the most common functions, and using patterns like floating action buttons (FABs) for primary actions. The implementation uses responsive breakpoints to show different UI components based on available screen space. This approach maintains functionality across all devices while optimizing the interface for touch interaction and limited screen real estate, following established mobile UI patterns that users already understand."
              />
            </div>
          </TabsContent>
          
          <TabsContent value="customization" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="text-lg font-medium mb-3">Global UI Element Customization Demo</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This demo showcases how users can customize UI elements throughout the application. Toggle "Edit Mode" to activate customization controls,
                  then select panels to resize, reposition, or reshape them according to your preferences.
                </p>
                
                {/* Simple UI customization demo to show concept in showcase */}
                <div className="mt-4">
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="mb-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </div>
                        <h3 className="font-medium">UI Customization</h3>
                      </div>
                      <button className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium">
                        Save Layout
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded border">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium">Theme</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Dark Mode</span>
                          <div className="relative inline-flex h-5 w-10 items-center rounded-full bg-gray-200">
                            <span className="inline-block h-3 w-3 transform rounded-full bg-white translate-x-1"></span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded border">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium">Layout</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center p-1.5 rounded bg-blue-50 border border-blue-200">
                            <div className="w-3 h-3 rounded-full mr-2 bg-blue-500 opacity-60"></div>
                            <span className="text-xs">Side by Side</span>
                          </div>
                          <div className="flex items-center p-1.5 rounded hover:bg-gray-100">
                            <div className="w-3 h-3 rounded-full mr-2 bg-blue-500 opacity-60"></div>
                            <span className="text-xs">Stacked</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded border">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium">Density</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center p-1.5 rounded hover:bg-gray-100">
                            <div className="w-3 h-3 rounded-full mr-2 bg-blue-500 opacity-60"></div>
                            <span className="text-xs">Compact</span>
                          </div>
                          <div className="flex items-center p-1.5 rounded bg-blue-50 border border-blue-200">
                            <div className="w-3 h-3 rounded-full mr-2 bg-blue-500 opacity-60"></div>
                            <span className="text-xs">Comfortable</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-4 italic">
                      This is a simplified demo. The actual UI customization is accessible from the "Customize UI" button in the header.
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-md p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Application-Wide Customization Hub</h4>
                  <p className="text-xs text-blue-700 mb-3">
                    The UI customization feature allows users to create personalized layouts optimized for their specific workflows.
                    Changes can be saved in profiles and applied across the entire application.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-xs">
                      <h5 className="font-medium mb-1.5">Customization Features:</h5>
                      <ul className="list-disc ml-4 space-y-1 text-blue-700">
                        <li>Size controls with aspect ratio locking</li>
                        <li>Position controls with grid snapping</li>
                        <li>Shape controls for corners, borders, shadows</li>
                        <li>Color theme customization per element</li>
                        <li>Typography customization options</li>
                        <li>Saved custom layout profiles</li>
                      </ul>
                    </div>
                    <div className="text-xs">
                      <h5 className="font-medium mb-1.5">Implementation Details:</h5>
                      <ul className="list-disc ml-4 space-y-1 text-blue-700">
                        <li>Edit mode with resize/move handles</li>
                        <li>Style persistence in local storage or user profiles</li>
                        <li>CSS custom properties for dynamic styling</li>
                        <li>React context for global customization state</li>
                        <li>Resize/drag event handlers with constraints</li>
                        <li>JSON-exportable layout configurations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <ShowcaseItem
                  title="Theme Customization Profiles"
                  description="Allow users to save and share custom theme configurations for the application"
                  complexity="Medium"
                  impact="High"
                  beforeImage={<div className="p-3 border rounded">
                    <div className="mb-3 flex items-center">
                      <div className="w-24 h-6 bg-blue-600 rounded mr-2"></div>
                      <div className="text-xs">Default Theme</div>
                    </div>
                    <div className="flex mb-2">
                      <div className="w-6 h-6 bg-blue-600 rounded mr-1"></div>
                      <div className="w-6 h-6 bg-blue-500 rounded mr-1"></div>
                      <div className="w-6 h-6 bg-blue-400 rounded mr-1"></div>
                      <div className="w-6 h-6 bg-blue-300 rounded mr-1"></div>
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    </div>
                    <button className="text-xs px-2 py-1 border rounded">Reset to Default</button>
                  </div>}
                  afterImage={<div className="p-3 border rounded">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-24 h-6 bg-purple-600 rounded mr-2"></div>
                        <div className="text-xs">Custom Theme</div>
                      </div>
                      <select className="text-xs px-1 py-0.5 border rounded">
                        <option>My Theme</option>
                        <option>Dark Mode</option>
                        <option>High Contrast</option>
                        <option>+ Create New</option>
                      </select>
                    </div>
                    <div className="flex mb-3">
                      <div className="w-6 h-6 bg-purple-600 rounded mr-1"></div>
                      <div className="w-6 h-6 bg-purple-500 rounded mr-1"></div>
                      <div className="w-6 h-6 bg-purple-400 rounded mr-1"></div>
                      <div className="w-6 h-6 bg-purple-300 rounded mr-1"></div>
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex justify-between">
                      <button className="text-xs px-2 py-1 border rounded">Reset</button>
                      <div className="flex">
                        <button className="text-xs px-2 py-1 mr-1 border rounded bg-gray-50">Share</button>
                        <button className="text-xs px-2 py-1 border rounded bg-purple-50 text-purple-700">Save</button>
                      </div>
                    </div>
                  </div>}
                  explanation="Theme customization profiles allow users to create, save, and share personalized color schemes and visual preferences across the application. This feature enhances user engagement by providing personalized experiences that can adapt to different working conditions, branding requirements, or accessibility needs. The implementation requires a centralized theme management system using CSS variables, persistent storage of theme configurations, and a user interface for creating and switching between themes."
                />
                
                <ShowcaseItem
                  title="Color Blind Friendly Modes"
                  description="Provide specialized color schemes for different types of color vision deficiencies"
                  complexity="Hard"
                  impact="High"
                  beforeImage={<div className="p-3 border rounded">
                    <div className="flex justify-between mb-3">
                      <div className="text-xs font-medium">Graph Nodes Coloring</div>
                    </div>
                    <div className="flex items-center justify-center mb-3 space-x-2">
                      <div className="w-6 h-6 rounded-full bg-red-500"></div>
                      <div className="w-6 h-6 rounded-full bg-green-500"></div>
                      <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                      <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
                      <div className="w-6 h-6 rounded-full bg-purple-500"></div>
                    </div>
                    <div className="text-[8px] text-gray-500 text-center">
                      Standard color scheme
                    </div>
                  </div>}
                  afterImage={<div className="p-3 border rounded">
                    <div className="flex justify-between mb-2">
                      <div className="text-xs font-medium">Accessible Color Modes</div>
                      <select className="text-xs px-1 py-0.5 border rounded">
                        <option>Deuteranopia</option>
                        <option>Protanopia</option>
                        <option>Tritanopia</option>
                        <option>Monochromacy</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-center mb-2 space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-700"></div>
                      <div className="w-6 h-6 rounded-full bg-orange-500"></div>
                      <div className="w-6 h-6 rounded-full bg-teal-500"></div>
                      <div className="w-6 h-6 rounded-full bg-indigo-300"></div>
                      <div className="w-6 h-6 rounded-full bg-amber-700"></div>
                    </div>
                    <div className="text-[8px] text-gray-500 text-center mb-1">
                      Color blind friendly palette
                    </div>
                    <div className="flex text-[8px] items-center justify-center space-x-1">
                      <div className="flex items-center mr-1">
                        <span className="w-2 h-2 rounded-full bg-blue-700 mr-0.5"></span>
                        <span>Person</span>
                      </div>
                      <div className="flex items-center mr-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500 mr-0.5"></span>
                        <span>Organization</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-teal-500 mr-0.5"></span>
                        <span>Event</span>
                      </div>
                    </div>
                  </div>}
                  explanation="Color blind friendly modes provide alternative color schemes optimized for various types of color vision deficiencies, ensuring that all users can distinguish between different elements in data visualizations. This feature is crucial for making applications accessible to the 8% of men and 0.5% of women with color vision deficiencies. The implementation requires creating distinct color palettes for each type of color blindness (deuteranopia, protanopia, tritanopia, and monochromacy), ensuring sufficient contrast between adjacent colors, and often adding patterns or labels as secondary identifiers."
                />
                
                <ShowcaseItem
                  title="Workspace Layouts"
                  description="Allow users to save custom workspace layouts with preferred panel configurations"
                  complexity="Hard"
                  impact="High"
                  beforeImage={<div className="p-3 border rounded">
                    <div className="flex flex-col h-36">
                      <div className="h-1/2 flex mb-1">
                        <div className="w-1/2 mr-1 border rounded bg-gray-50 flex items-center justify-center">
                          <span className="text-[8px]">Graph Panel</span>
                        </div>
                        <div className="w-1/2 border rounded bg-gray-50 flex items-center justify-center">
                          <span className="text-[8px]">Properties Panel</span>
                        </div>
                      </div>
                      <div className="h-1/2 border rounded bg-gray-50 flex items-center justify-center">
                        <span className="text-[8px]">Input Panel</span>
                      </div>
                    </div>
                    <div className="text-[8px] text-gray-500 text-center mt-1">
                      Default layout (fixed)
                    </div>
                  </div>}
                  afterImage={<div className="p-3 border rounded">
                    <div className="flex justify-between mb-1">
                      <div className="text-xs font-medium">Custom Workspace</div>
                      <select className="text-xs px-1 py-0.5 border rounded">
                        <option>Analytics Layout</option>
                        <option>Editing Focus</option>
                        <option>Presentation Mode</option>
                      </select>
                    </div>
                    <div className="flex flex-col h-32">
                      <div className="h-2/3 flex mb-1">
                        <div className="w-3/4 mr-1 border rounded bg-gray-50 flex items-center justify-center">
                          <span className="text-[8px]">Graph Panel (Expanded)</span>
                        </div>
                        <div className="w-1/4 flex flex-col">
                          <div className="h-1/2 mb-1 border rounded bg-gray-50 flex items-center justify-center">
                            <span className="text-[8px]">Properties</span>
                          </div>
                          <div className="h-1/2 border rounded bg-gray-50 flex items-center justify-center">
                            <span className="text-[8px]">Search</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-1/3 border rounded bg-gray-50 flex items-center justify-center">
                        <span className="text-[8px]">Input Panel (Minimized)</span>
                      </div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <div className="text-[8px] text-gray-500">
                        Saved custom layout
                      </div>
                      <div className="flex">
                        <button className="text-[8px] px-1 py-0.5 border rounded-sm mr-1">Reset</button>
                        <button className="text-[8px] px-1 py-0.5 border rounded-sm mr-1">Share</button>
                        <button className="text-[8px] px-1 py-0.5 border rounded-sm bg-blue-50 text-blue-700">Save As...</button>
                      </div>
                    </div>
                  </div>}
                  explanation="Custom workspace layouts allow users to arrange and resize UI elements based on their specific tasks and preferences, then save these configurations for later reuse. This feature is particularly valuable for complex applications where different workflows benefit from different arrangements of the interface. Implementation requires a flexible layout system (typically using CSS Grid or a specialized layout library), the ability to drag, resize, and reposition panels, and a system to serialize and restore layout configurations."
                />
                
                <ShowcaseItem
                  title="Interaction Preferences"
                  description="Customizable interaction behaviors for mouse, keyboard, and touch input"
                  complexity="Medium"
                  impact="Medium"
                  beforeImage={<div className="p-3 border rounded">
                    <div className="text-xs font-medium mb-2">Default Interactions</div>
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]">Pan Graph</span>
                        <span className="text-[10px] bg-gray-100 px-1 rounded">Click + Drag</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]">Zoom</span>
                        <span className="text-[10px] bg-gray-100 px-1 rounded">Scroll Wheel</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]">Select Node</span>
                        <span className="text-[10px] bg-gray-100 px-1 rounded">Click</span>
                      </div>
                    </div>
                  </div>}
                  afterImage={<div className="p-3 border rounded">
                    <div className="text-xs font-medium mb-2">Customizable Interactions</div>
                    <div className="space-y-1.5 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]">Pan Graph</span>
                        <select className="text-[9px] px-1 py-0.5 border rounded">
                          <option>Click + Drag</option>
                          <option>Right-click + Drag</option>
                          <option>Middle Button + Drag</option>
                          <option>Shift + Drag</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]">Zoom</span>
                        <select className="text-[9px] px-1 py-0.5 border rounded">
                          <option>Scroll Wheel</option>
                          <option>Pinch Gesture</option>
                          <option>+/- Keys</option>
                          <option>Double Click</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]">Select Multiple</span>
                        <select className="text-[9px] px-1 py-0.5 border rounded">
                          <option>Ctrl + Click</option>
                          <option>Shift + Click</option>
                          <option>Click + Drag Area</option>
                          <option>Double Click</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 text-[10px]">
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-1 w-3 h-3" checked />
                        <span>Invert scroll</span>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" className="mr-1 w-3 h-3" />
                        <span>Touch mode</span>
                      </div>
                    </div>
                  </div>}
                  explanation="Customizable interaction preferences allow users to personalize how they interact with the application using mouse, keyboard, and touch inputs. This feature accommodates different user habits, physical abilities, and device setups by letting them map their preferred input methods to different actions. The implementation involves creating a configurable input management system that can bind different input events to application functions, storing these preferences in user profiles, and providing an interface to modify these bindings."
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}