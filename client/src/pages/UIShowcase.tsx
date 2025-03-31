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
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Before</h3>
                <div className="border rounded-md p-4 bg-gray-50">
                  {beforeImage}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">After</h3>
                <div className="border rounded-md p-4 bg-gray-50">
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
        <div className="flex border-b mb-4">
          <button 
            className={`px-4 py-2 text-sm font-medium ${activeTab === "summary" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
            onClick={() => setActiveTab("summary")}
          >
            Graph Summary
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium ${activeTab === "context" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
            onClick={() => setActiveTab("context")}
          >
            Node Context
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium ${activeTab === "ontology" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
            onClick={() => setActiveTab("ontology")}
          >
            Ontology Patterns
          </button>
        </div>
        
        {activeTab === "summary" && (
          <div className="bg-gray-50 p-3 rounded">
            <div className="bg-white p-2 border rounded">
              <p className="text-sm">10 nodes, 15 edges, 4 types</p>
            </div>
          </div>
        )}
        
        {activeTab === "context" && (
          <div className="bg-gray-50 p-3 rounded">
            <div className="bg-white p-2 border rounded">
              <p className="text-sm">Selected: Person (Employee)</p>
            </div>
          </div>
        )}
        
        {activeTab === "ontology" && (
          <div className="bg-gray-50 p-3 rounded">
            <div className="bg-white p-2 border rounded">
              <p className="text-sm">Person → Works At → Company</p>
            </div>
          </div>
        )}
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
  <div className="border p-4 rounded-md grid grid-cols-3 gap-4">
    <div className="col-span-1 bg-gray-100 p-3 rounded">
      <h3 className="font-medium">Input</h3>
      <div className="bg-white p-2 border rounded mt-2 h-32">
        <p className="text-sm">Text input area...</p>
      </div>
    </div>
    <div className="col-span-1 bg-gray-100 p-3 rounded">
      <h3 className="font-medium">Graph</h3>
      <div className="bg-white p-2 border rounded mt-2 h-32">
        <div className="flex items-center justify-center h-full">
          <p className="text-sm">Graph view...</p>
        </div>
      </div>
    </div>
    <div className="col-span-1 bg-gray-100 p-3 rounded">
      <h3 className="font-medium">Properties</h3>
      <div className="bg-white p-2 border rounded mt-2 h-32">
        <p className="text-sm">Node properties...</p>
      </div>
    </div>
  </div>
);

const AfterFocusMode = () => {
  const [focusArea, setFocusArea] = useState<'all' | 'input' | 'graph' | 'properties'>('all');
  
  return (
    <div className="border p-4 rounded-md">
      <div className="mb-2 flex justify-end space-x-2">
        <Button size="sm" variant={focusArea === 'all' ? 'default' : 'outline'} onClick={() => setFocusArea('all')}>
          All Panels
        </Button>
        <Button size="sm" variant={focusArea === 'input' ? 'default' : 'outline'} onClick={() => setFocusArea('input')}>
          Focus Input
        </Button>
        <Button size="sm" variant={focusArea === 'graph' ? 'default' : 'outline'} onClick={() => setFocusArea('graph')}>
          Focus Graph
        </Button>
        <Button size="sm" variant={focusArea === 'properties' ? 'default' : 'outline'} onClick={() => setFocusArea('properties')}>
          Focus Properties
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div 
          className={`${
            focusArea === 'all' 
              ? 'col-span-1' 
              : focusArea === 'input' 
                ? 'col-span-3' 
                : 'hidden'
          } bg-gray-100 p-3 rounded transition-all duration-300`}
        >
          <h3 className="font-medium">Input</h3>
          <div className="bg-white p-2 border rounded mt-2 h-32">
            <p className="text-sm">Text input area...</p>
          </div>
        </div>
        
        <div 
          className={`${
            focusArea === 'all' 
              ? 'col-span-1' 
              : focusArea === 'graph' 
                ? 'col-span-3' 
                : 'hidden'
          } bg-gray-100 p-3 rounded transition-all duration-300`}
        >
          <h3 className="font-medium">Graph</h3>
          <div className="bg-white p-2 border rounded mt-2 h-32">
            <div className="flex items-center justify-center h-full">
              <p className="text-sm">Graph view...</p>
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
          } bg-gray-100 p-3 rounded transition-all duration-300`}
        >
          <h3 className="font-medium">Properties</h3>
          <div className="bg-white p-2 border rounded mt-2 h-32">
            <p className="text-sm">Node properties...</p>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="layout">Layout Structure</TabsTrigger>
            <TabsTrigger value="visual">Visual Space</TabsTrigger>
            <TabsTrigger value="ux">User Experience</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
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
                  <div className="bg-white p-3 border rounded max-h-32 overflow-auto">
                    <h4 className="text-sm font-medium mb-2">Card with scrolling</h4>
                    <p className="text-xs mb-1">This content won't get cut off because the card has scrolling enabled when content exceeds the maximum height.</p>
                    <p className="text-xs mb-1">Additional content is accessible via scrolling.</p>
                    <p className="text-xs">This line remains accessible through scrolling.</p>
                  </div>
                  <div className="bg-white p-3 border rounded">
                    <h4 className="text-sm font-medium mb-2">Auto-height card</h4>
                    <p className="text-xs">This card automatically adjusts to its content height.</p>
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
        </Tabs>
      </div>
    </div>
  );
}