import { useState } from 'react';
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
import Header from '../components/Header';

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

export default function UIShowcase() {
  return (
    <div className="container mx-auto">
      <Header />
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-6">UI Enhancement Showcase</h1>
        <p className="text-gray-600 mb-8">
          This page demonstrates various UI enhancement options with before/after examples and detailed explanations.
          Click "View Details" on any card to see the full comparison.
        </p>
        
        <Tabs defaultValue="layout" className="mb-10">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="layout">Layout Structure</TabsTrigger>
            <TabsTrigger value="visual">Visual Space</TabsTrigger>
            <TabsTrigger value="ux">User Experience</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="interaction">Interaction Patterns</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
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
            </div>
          </TabsContent>
          
          <TabsContent value="visual" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </TabsContent>
          
          <TabsContent value="ux" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                afterImage={<div className="border p-3 rounded">
                  <div className="bg-gray-100 p-2 rounded mb-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-medium">Graph Summary</h4>
                      <button className="text-xs text-blue-500">Show</button>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded mb-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-medium">Node Context</h4>
                      <button className="text-xs text-blue-500">Show</button>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <h4 className="text-xs font-medium">Input Area</h4>
                    <div className="bg-white p-2 border rounded mt-1 text-xs">
                      Primary input area (expanded by default)
                    </div>
                  </div>
                </div>}
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
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="flex justify-around items-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center cursor-grab">A</div>
                    <div className="h-0.5 w-16 bg-gray-400 flex items-center relative">
                      <div className="absolute text-xs whitespace-nowrap -top-4 text-center w-full">Drag to connect</div>
                    </div>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-400">B</div>
                  </div>
                </div>}
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
            </div>
          </TabsContent>
          
          <TabsContent value="accessibility" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ShowcaseItem
                title="Keyboard Navigation for Graphs"
                description="Enable full keyboard navigation of graph elements without requiring a mouse"
                complexity="Hard"
                impact="High"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-gray-200 rounded h-32 flex items-center justify-center text-xs">
                    Graph only navigable with mouse
                  </div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="bg-gray-200 rounded h-32 flex items-center justify-center text-xs relative">
                    <div className="absolute top-2 left-2 right-2 bg-black bg-opacity-10 text-white text-opacity-80 text-xs p-1 rounded">
                      Use Tab to select nodes, Arrow keys to navigate connected nodes
                    </div>
                    <div className="w-16 h-16 bg-blue-100 border-2 border-blue-500 rounded-full flex items-center justify-center relative">
                      <div className="text-sm">Node</div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-blue-500 text-[10px]">
                        ↵
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-center text-gray-600">
                    Press Tab to select elements, Enter to activate, arrows to navigate
                  </div>
                </div>}
                explanation="Keyboard navigation is essential for both accessibility and power user efficiency, allowing users to interact with the graph without requiring a mouse. This feature is critical for users with motor impairments but benefits all users by enabling faster workflows. Implementation requires adding focus management, visible focus indicators, and keyboard event handling to navigate and interact with graph elements using only the keyboard."
              />
              
              <ShowcaseItem
                title="High Contrast Mode"
                description="Add a high contrast mode for better visibility and accessibility"
                complexity="Medium"
                impact="Medium"
                beforeImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="p-3 bg-white rounded shadow-sm">
                    <div className="flex">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-xs">P</div>
                      <div className="ml-2">
                        <div className="text-xs font-medium text-gray-800">Person</div>
                        <div className="text-xs text-gray-500">John Doe</div>
                      </div>
                    </div>
                    <div className="mt-2 h-0.5 bg-gray-200"></div>
                    <div className="mt-2 flex justify-end">
                      <button className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded">Edit</button>
                    </div>
                  </div>
                </div>}
                afterImage={<div className="p-4 border rounded bg-gray-50">
                  <div className="absolute top-2 right-2 flex items-center text-xs">
                    <div className="mr-2">High Contrast</div>
                    <div className="w-8 h-4 bg-black rounded-full relative">
                      <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-3 bg-black rounded shadow-sm">
                    <div className="flex">
                      <div className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center text-black font-bold text-xs">P</div>
                      <div className="ml-2">
                        <div className="text-xs font-bold text-white">Person</div>
                        <div className="text-xs text-yellow-300">John Doe</div>
                      </div>
                    </div>
                    <div className="mt-2 h-0.5 bg-white"></div>
                    <div className="mt-2 flex justify-end">
                      <button className="text-xs px-2 py-1 bg-yellow-300 text-black font-bold rounded">Edit</button>
                    </div>
                  </div>
                </div>}
                explanation="High contrast mode improves visibility and readability for users with visual impairments or those working in challenging lighting conditions. This feature uses strongly contrasting colors and clear visual distinctions between elements to ensure all content is perceivable. Implementation involves creating alternative color schemes with sufficient contrast ratios and allowing users to toggle between standard and high-contrast appearances."
              />
              
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}