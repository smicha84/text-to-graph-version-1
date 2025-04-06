import { useMemo } from 'react';
import { Graph, Node, Edge } from '@/types/graph';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface GraphAnalyticsProps {
  graph: Graph | null;
}

export default function GraphAnalytics({ graph }: GraphAnalyticsProps) {
  // Calculate basic metrics
  const metrics = useMemo(() => {
    if (!graph) return null;
    
    // Basic counts
    const nodeCount = graph.nodes.length;
    const edgeCount = graph.edges.length;
    const density = nodeCount > 1 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;
    
    // Node type distribution
    const nodeTypes: Record<string, number> = {};
    graph.nodes.forEach(node => {
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    });
    
    // Edge type distribution
    const edgeTypes: Record<string, number> = {};
    graph.edges.forEach(edge => {
      edgeTypes[edge.label] = (edgeTypes[edge.label] || 0) + 1;
    });
    
    // Calculate node degrees (connections)
    const nodeDegrees: Record<string, number> = {};
    graph.nodes.forEach(node => {
      nodeDegrees[node.id] = 0;
    });
    
    graph.edges.forEach(edge => {
      nodeDegrees[edge.source] = (nodeDegrees[edge.source] || 0) + 1;
      nodeDegrees[edge.target] = (nodeDegrees[edge.target] || 0) + 1;
    });
    
    // Find central nodes (nodes with highest degree)
    const centralNodes = Object.entries(nodeDegrees)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, degree]) => {
        const node = graph.nodes.find(n => n.id === id);
        return {
          id,
          label: node?.label || 'Unknown',
          type: node?.type || 'Unknown',
          degree
        };
      });
    
    // Identify isolated nodes (degree 0)
    const isolatedNodes = Object.entries(nodeDegrees)
      .filter(([_, degree]) => degree === 0)
      .map(([id]) => {
        const node = graph.nodes.find(n => n.id === id);
        return {
          id,
          label: node?.label || 'Unknown',
          type: node?.type || 'Unknown'
        };
      });
    
    // Prepare data for charts
    const nodeTypeChartData = Object.entries(nodeTypes).map(([type, count]) => ({
      name: type,
      value: count
    }));
    
    const edgeTypeChartData = Object.entries(edgeTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([type, count]) => ({
        name: type,
        value: count
      }));
    
    return {
      nodeCount,
      edgeCount,
      density,
      nodeTypes,
      edgeTypes,
      centralNodes,
      isolatedNodes,
      nodeTypeChartData,
      edgeTypeChartData
    };
  }, [graph]);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];
  
  if (!graph || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Graph Analytics</CardTitle>
          <CardDescription>No graph data available for analysis</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Graph Analytics</CardTitle>
        <CardDescription>
          Analysis of the current graph structure and patterns
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Basic Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Nodes</span>
              <span className="text-2xl font-bold">{metrics.nodeCount}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Edges</span>
              <span className="text-2xl font-bold">{metrics.edgeCount}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Density</span>
              <span className="text-2xl font-bold">{metrics.density.toFixed(3)}</span>
            </div>
          </div>
          
          <Separator />
          
          {/* Detailed Analysis */}
          <Accordion type="single" collapsible className="w-full">
            {/* Node Types */}
            <AccordionItem value="node-types">
              <AccordionTrigger>Node Type Distribution</AccordionTrigger>
              <AccordionContent>
                <div className="h-64 my-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.nodeTypeChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {metrics.nodeTypeChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string) => [`${value} nodes`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(metrics.nodeTypes).map(([type, count]) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}: {count}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Edge Types */}
            <AccordionItem value="edge-types">
              <AccordionTrigger>Relationship Types</AccordionTrigger>
              <AccordionContent>
                <div className="h-64 my-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.edgeTypeChartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(metrics.edgeTypes).map(([type, count]) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}: {count}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Central Nodes */}
            <AccordionItem value="central-nodes">
              <AccordionTrigger>Central Nodes</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Nodes with the highest number of connections</p>
                  {metrics.centralNodes.length > 0 ? (
                    <div className="space-y-2">
                      {metrics.centralNodes.map(node => (
                        <div key={node.id} className="flex justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{node.label}</span>
                            <Badge className="ml-2" variant="outline">{node.type}</Badge>
                          </div>
                          <Badge variant="secondary">{node.degree} connections</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No central nodes found</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Isolated Nodes */}
            <AccordionItem value="isolated-nodes">
              <AccordionTrigger>Isolated Nodes</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Nodes without any connections</p>
                  {metrics.isolatedNodes.length > 0 ? (
                    <div className="space-y-2">
                      {metrics.isolatedNodes.map(node => (
                        <div key={node.id} className="flex justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{node.label}</span>
                            <Badge className="ml-2" variant="outline">{node.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No isolated nodes found</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}