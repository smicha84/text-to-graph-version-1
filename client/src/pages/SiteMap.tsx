import React from 'react';
import { Link } from 'wouter';
import { useAuthStore } from '../stores/auth';
import { ArrowDown, ArrowRight, ExternalLink, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SiteMapNodeProps {
  title: string;
  path: string;
  description: string;
  icon?: React.ReactNode;
  color?: string;
  authRequired?: boolean;
  isActive?: boolean;
  children?: React.ReactNode;
}

const SiteMapNode: React.FC<SiteMapNodeProps> = ({
  title,
  path,
  description,
  icon,
  color = 'bg-blue-100 text-blue-800 border-blue-200',
  authRequired = false,
  isActive = true,
  children
}) => {
  const { isAuthenticated } = useAuthStore();
  const isAccessible = !authRequired || isAuthenticated;
  
  return (
    <div className="relative">
      <Card className={`p-4 transition-all border-2 ${isActive ? color : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            {icon && <div className="mr-2">{icon}</div>}
            <h3 className="font-semibold">{title}</h3>
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-70 border">
            {authRequired ? 'Auth Required' : 'Public'}
          </div>
        </div>
        <p className="text-sm mb-3">{description}</p>
        <div className="flex justify-between items-center">
          <code className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">{path}</code>
          <Button asChild size="sm" variant={isAccessible ? "default" : "outline"} disabled={!isAccessible}>
            <Link href={path}>
              <span className="flex items-center">
                View <ExternalLink className="ml-1" size={14} />
              </span>
            </Link>
          </Button>
        </div>
      </Card>
      
      {children && (
        <div className="ml-8 mt-2 pl-6 border-l-2 border-dashed border-gray-300">
          {children}
        </div>
      )}
    </div>
  );
};

export default function SiteMap() {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Site Map</h1>
        <p className="text-gray-600">
          This page provides a visual overview of all pages in the application and how they connect.
          {!isAuthenticated && (
            <span className="ml-2 text-amber-600">
              Note: You are not logged in. Some pages require authentication.
            </span>
          )}
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Entry Point */}
        <SiteMapNode
          title="Landing Page"
          path="/"
          description="The main entry point and marketing page for the application."
          color="bg-green-100 text-green-800 border-green-200"
        >
          <div className="flex items-center justify-center py-2">
            <ArrowDown size={20} className="text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <SiteMapNode
              title="Authentication"
              path="/auth"
              description="User login and registration forms."
              color="bg-purple-100 text-purple-800 border-purple-200"
            >
              <div className="flex items-center justify-center py-2">
                <ArrowDown size={20} className="text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <SiteMapNode
                  title="Dashboard"
                  path="/dashboard"
                  description="User dashboard to manage graphs and see recent activity."
                  color="bg-indigo-100 text-indigo-800 border-indigo-200"
                  authRequired={true}
                  isActive={isAuthenticated}
                >
                  <div className="flex items-center justify-center py-2">
                    <ArrowDown size={20} className="text-gray-400" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    
                    <SiteMapNode
                      title="Analytics Dashboard"
                      path="/analytics"
                      description="Detailed analytics for graph data and metrics."
                      color="bg-red-100 text-red-800 border-red-200"
                      authRequired={true}
                      isActive={isAuthenticated}
                    />
                  </div>
                </SiteMapNode>
                
                <SiteMapNode
                  title="Profile"
                  path="/profile"
                  description="User profile management and settings."
                  color="bg-sky-100 text-sky-800 border-sky-200"
                  authRequired={true}
                  isActive={isAuthenticated}
                />
              </div>
            </SiteMapNode>
            
            <SiteMapNode
              title="Home"
              path="/home"
              description="Original home page (now redirects to Dashboard for auth users)."
              color="bg-orange-100 text-orange-800 border-orange-200"
            >
              <div className="flex items-center justify-center py-2">
                <ArrowDown size={20} className="text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <SiteMapNode
                  title="Graph Chat"
                  path="/graph-chat"
                  description="AI-assisted graph chat interface."
                  color="bg-teal-100 text-teal-800 border-teal-200"
                />
              </div>
            </SiteMapNode>
          </div>
        </SiteMapNode>
        
        {/* Additional/Feature Pages */}
        <div className="border-t-2 border-dashed border-gray-300 pt-8 mt-4">
          <h2 className="text-xl font-bold mb-4">Feature/Demonstration Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SiteMapNode
              title="Text to Graph Anatomy"
              path="/text-to-graph-anatomy"
              description="Demonstrates the text-to-graph transformation process."
              color="bg-emerald-100 text-emerald-800 border-emerald-200"
            />
            
            <SiteMapNode
              title="Web Search Anatomy"
              path="/web-search-anatomy"
              description="Demonstrates the web search integration feature."
              color="bg-emerald-100 text-emerald-800 border-emerald-200"
            />
            
            <SiteMapNode
              title="UI Showcase"
              path="/ui-showcase"
              description="Showcases UI components and styling options."
              color="bg-pink-100 text-pink-800 border-pink-200"
            />
            
            <SiteMapNode
              title="Smiley Page"
              path="/smiley"
              description="An orange page with a big smiley face."
              color="bg-orange-100 text-orange-800 border-orange-200"
            />
            
            <SiteMapNode
              title="Spiderman's Fear"
              path="/spiderman"
              description="Spiderman running away from a fly."
              color="bg-red-100 text-red-800 border-red-200"
            />
            
            <SiteMapNode
              title="API Logs"
              path="/logs"
              description="View API interaction logs for debugging."
              color="bg-gray-100 text-gray-800 border-gray-200"
            />
            
            <SiteMapNode
              title="Log Test"
              path="/log-test"
              description="Testing page for log functionality."
              color="bg-gray-100 text-gray-800 border-gray-200"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-12 border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Navigation Flow Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span>Entry Points</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
            <span>Authentication</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-indigo-500 mr-2"></div>
            <span>User Dashboard</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
            <span>Graph Creation</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span>Analytics</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-emerald-500 mr-2"></div>
            <span>Feature Demos</span>
          </div>
        </div>
      </div>
    </div>
  );
}