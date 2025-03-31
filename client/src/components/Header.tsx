import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Edit2, X } from "lucide-react";
import UICustomizationDemo from "@/components/UICustomizationDemo";

export default function Header() {
  const [location] = useLocation();
  const [showCustomization, setShowCustomization] = useState(false);
  
  return (
    <>
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <i className="fas fa-project-diagram text-primary text-2xl mr-3"></i>
              <h1 className="font-semibold text-xl">Text to Property Graph</h1>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link href="/graph-v2">
            <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
              location === "/graph-v2" 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:text-primary"
            } transition-colors`}>
              <i className="fas fa-flask mr-2"></i>
              <span>Graph V2</span>
            </div>
          </Link>
          
          <Link href="/text-to-graph-anatomy">
            <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
              location === "/text-to-graph-anatomy" 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:text-primary"
            } transition-colors`}>
              <i className="fas fa-project-diagram mr-2"></i>
              <span>T2G Anatomy</span>
            </div>
          </Link>
          
          <Link href="/web-search-anatomy">
            <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
              location === "/web-search-anatomy" 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:text-primary"
            } transition-colors`}>
              <i className="fas fa-globe mr-2"></i>
              <span>Web Search</span>
            </div>
          </Link>
          
          <Link href="/logs">
            <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
              location === "/logs" 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:text-primary"
            } transition-colors`}>
              <i className="fas fa-history mr-2"></i>
              <span>API Logs</span>
            </div>
          </Link>
          
          <Link href="/ui-showcase">
            <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
              location === "/ui-showcase" 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:text-primary"
            } transition-colors`}>
              <i className="fas fa-palette mr-2"></i>
              <span>UI Showcase</span>
            </div>
          </Link>
          
          <button className="text-gray-600 hover:text-primary transition-colors">
            <i className="fas fa-question-circle"></i>
          </button>
          
          <button 
            onClick={() => setShowCustomization(!showCustomization)} 
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
              showCustomization 
                ? "bg-blue-500 text-white" 
                : "text-gray-600 hover:text-primary"
            } transition-colors`}
          >
            {showCustomization ? <X size={16} className="mr-1" /> : <Edit2 size={16} className="mr-1" />}
            {showCustomization ? "Close UI Editor" : "Customize UI"}
          </button>
        </div>
      </header>
      
      {showCustomization && (
        <div className="container mx-auto px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Global UI Customization</h2>
          <UICustomizationDemo />
        </div>
      )}
    </>
  );
}
