import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Edit2, X, Save, Moon, Sun, Layout, Grid, Sliders, Type, Layers, Target, Move, Plus, Minus, Eye, EyeOff, ExternalLink } from "lucide-react";

// Define UI customization settings
interface UISettings {
  darkMode: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
  layout: 'sideBySide' | 'stacked' | 'wideGraph';
  fontSize: 'small' | 'medium' | 'large';
}

// Define element customization types
interface ElementStyle {
  width?: string;
  height?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  boxShadow?: string;
  opacity?: string;
  zIndex?: string;
  position?: string;
  top?: string;
  left?: string;
  transform?: string;
  display?: string;
  alignItems?: string;
  gap?: string;
  border?: string;
  minHeight?: string;
}

interface ElementData {
  id: string;
  name: string;
  selector: string;
  type: 'container' | 'panel' | 'control' | 'text';
  style: ElementStyle;
  parentId?: string;
  children?: string[];
}

export default function Header() {
  const [location] = useLocation();
  const [showCustomization, setShowCustomization] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'elements'>('global');
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elementHierarchy, setElementHierarchy] = useState<ElementData[]>([]);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [expandedElements, setExpandedElements] = useState<string[]>([]);
  
  // Global settings state
  const [settings, setSettings] = useState<UISettings>({
    darkMode: false,
    density: 'comfortable',
    layout: 'sideBySide',
    fontSize: 'medium',
  });
  
  // Reference to main panel
  const mainPanelRef = useRef<HTMLDivElement>(null);
  
  // Sample hierarchy - you would generate this dynamically in a real implementation
  const sampleElements: ElementData[] = [
    {
      id: 'main-container',
      name: 'Main Container',
      selector: 'body > div#root > div.app-container',
      type: 'container',
      style: { width: '100%', height: '100vh' },
      children: ['header', 'content-area']
    },
    {
      id: 'header',
      name: 'Header',
      selector: 'header',
      type: 'container',
      style: { width: '100%', height: 'auto', padding: '1rem', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
      parentId: 'main-container',
      children: ['logo-area', 'navigation', 'actions']
    },
    {
      id: 'logo-area',
      name: 'Logo Area',
      selector: 'header .logo-area',
      type: 'container',
      style: { display: 'flex', alignItems: 'center' },
      parentId: 'header'
    },
    {
      id: 'navigation',
      name: 'Navigation Menu',
      selector: 'header .nav-menu',
      type: 'container',
      style: { display: 'flex', gap: '0.75rem' },
      parentId: 'header',
      children: ['nav-item-1', 'nav-item-2', 'nav-item-3', 'nav-item-4', 'nav-item-5']
    },
    {
      id: 'nav-item-1',
      name: 'Graph V2 Link',
      selector: 'header .nav-menu a[href="/graph-v2"]',
      type: 'control',
      style: { padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem' },
      parentId: 'navigation'
    },
    {
      id: 'nav-item-2',
      name: 'T2G Anatomy Link',
      selector: 'header .nav-menu a[href="/text-to-graph-anatomy"]',
      type: 'control',
      style: { padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem' },
      parentId: 'navigation'
    },
    {
      id: 'nav-item-3',
      name: 'Web Search Link',
      selector: 'header .nav-menu a[href="/web-search-anatomy"]',
      type: 'control',
      style: { padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem' },
      parentId: 'navigation'
    },
    {
      id: 'nav-item-4',
      name: 'API Logs Link',
      selector: 'header .nav-menu a[href="/logs"]',
      type: 'control',
      style: { padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem' },
      parentId: 'navigation'
    },
    {
      id: 'nav-item-5',
      name: 'UI Showcase Link',
      selector: 'header .nav-menu a[href="/ui-showcase"]',
      type: 'control',
      style: { padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem' },
      parentId: 'navigation'
    },
    {
      id: 'actions',
      name: 'Action Buttons',
      selector: 'header .actions',
      type: 'container',
      style: { display: 'flex', gap: '0.75rem' },
      parentId: 'header',
      children: ['help-button', 'customize-button']
    },
    {
      id: 'help-button',
      name: 'Help Button',
      selector: 'header .actions button:first-child',
      type: 'control',
      style: { padding: '0.5rem', borderRadius: '0.375rem', color: '#4B5563' },
      parentId: 'actions'
    },
    {
      id: 'customize-button',
      name: 'Customize UI Button',
      selector: 'header .actions button:last-child',
      type: 'control',
      style: { padding: '0.5rem 0.75rem', borderRadius: '0.375rem', color: '#4B5563', display: 'flex', alignItems: 'center' },
      parentId: 'actions'
    },
    {
      id: 'content-area',
      name: 'Content Area',
      selector: 'main',
      type: 'container',
      style: { width: '100%', minHeight: 'calc(100vh - 68px)', padding: '1.5rem' },
      parentId: 'main-container',
      children: ['graph-view', 'property-panel', 'input-panel']
    },
    {
      id: 'graph-view',
      name: 'Graph Visualization',
      selector: '.graph-view',
      type: 'panel',
      style: { width: '100%', height: '500px', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' },
      parentId: 'content-area'
    },
    {
      id: 'property-panel',
      name: 'Property Panel',
      selector: '.property-panel',
      type: 'panel',
      style: { width: '100%', height: 'auto', backgroundColor: '#ffffff', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1rem' },
      parentId: 'content-area'
    },
    {
      id: 'input-panel',
      name: 'Input Panel',
      selector: '.input-panel',
      type: 'panel',
      style: { width: '100%', height: 'auto', backgroundColor: '#ffffff', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1rem' },
      parentId: 'content-area'
    }
  ];
  
  // Load sample elements on component mount
  useEffect(() => {
    // In a real implementation, this would be dynamically generated from the DOM
    setElementHierarchy(sampleElements);
    
    // By default, expand the main container
    setExpandedElements(['main-container']);
  }, []);
  
  // Load settings from localStorage when component mounts
  useEffect(() => {
    const savedSettings = localStorage.getItem('uiSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        applySettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse saved UI settings', error);
      }
    }
  }, []);
  
  // Apply settings to the document
  const applySettings = (newSettings: UISettings) => {
    // Apply dark mode
    if (newSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply density
    document.body.dataset.density = newSettings.density;
    
    // Apply layout
    document.body.dataset.layout = newSettings.layout;
    
    // Apply font size
    document.body.dataset.fontSize = newSettings.fontSize;
  };
  
  // Save settings to localStorage
  const saveSettings = () => {
    try {
      localStorage.setItem('uiSettings', JSON.stringify(settings));
      applySettings(settings);
      // Show saved notification (could be implemented)
    } catch (error) {
      console.error('Failed to save UI settings', error);
    }
  };
  
  // Save element styles
  const saveElementStyles = () => {
    try {
      localStorage.setItem('elementStyles', JSON.stringify(elementHierarchy));
      // In a real implementation, you would apply these styles to the actual elements
      setEditMode(false);
      // Show saved notification (could be implemented)
    } catch (error) {
      console.error('Failed to save element styles', error);
    }
  };
  
  // Update a specific global setting
  const updateSetting = <K extends keyof UISettings>(key: K, value: UISettings[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      return newSettings;
    });
  };
  
  // Update an element's style
  const updateElementStyle = (elementId: string, styleKey: keyof ElementStyle, value: string) => {
    setElementHierarchy(prev => {
      return prev.map(element => {
        if (element.id === elementId) {
          return {
            ...element,
            style: {
              ...element.style,
              [styleKey]: value
            }
          };
        }
        return element;
      });
    });
  };
  
  // Toggle element expansion in hierarchy tree
  const toggleElementExpansion = (elementId: string) => {
    setExpandedElements(prev => {
      if (prev.includes(elementId)) {
        return prev.filter(id => id !== elementId);
      } else {
        return [...prev, elementId];
      }
    });
  };
  
  // Get element icon based on type
  const getElementIcon = (type: ElementData['type']) => {
    switch (type) {
      case 'container':
        return <Layers size={14} />;
      case 'panel':
        return <Layout size={14} />;
      case 'control':
        return <Target size={14} />;
      case 'text':
        return <Type size={14} />;
      default:
        return <div className="w-3.5 h-3.5" />;
    }
  };
  
  // Render hierarchy tree
  const renderElementTree = (parentId?: string, depth = 0) => {
    const elements = parentId 
      ? elementHierarchy.filter(element => element.parentId === parentId)
      : elementHierarchy.filter(element => !element.parentId);
    
    if (elements.length === 0) return null;
    
    return (
      <ul className={`space-y-0.5 ${depth > 0 ? 'ml-4 mt-1' : ''}`}>
        {elements.map(element => {
          const hasChildren = elementHierarchy.some(e => e.parentId === element.id);
          const isExpanded = expandedElements.includes(element.id);
          const isSelected = selectedElement === element.id;
          const isHovered = hoveredElement === element.id;
          
          return (
            <li key={element.id} className="text-sm">
              <div 
                className={`flex items-center py-1 px-2 rounded ${
                  isSelected 
                    ? 'bg-blue-100 text-blue-800' 
                    : isHovered
                      ? 'bg-gray-100'
                      : 'hover:bg-gray-50'
                } cursor-pointer transition-colors group`}
                onClick={() => setSelectedElement(element.id)}
                onMouseEnter={() => setHoveredElement(element.id)}
                onMouseLeave={() => setHoveredElement(null)}
              >
                {hasChildren && (
                  <button 
                    className="mr-1 w-4 h-4 flex items-center justify-center text-gray-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleElementExpansion(element.id);
                    }}
                  >
                    <svg 
                      className={`w-3 h-3 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                
                {!hasChildren && <div className="w-4 mr-1" />}
                
                <div className="mr-1.5 text-gray-500">
                  {getElementIcon(element.type)}
                </div>
                
                <span className="flex-1 truncate">{element.name}</span>
                
                <button 
                  className={`w-5 h-5 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isSelected ? 'opacity-100' : ''
                  }`}
                  title="View element in DOM"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(`Highlight element in DOM: ${element.selector}`);
                    // In a real app, this would highlight the actual element
                  }}
                >
                  <ExternalLink size={12} />
                </button>
                
                <button 
                  className={`w-5 h-5 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isSelected ? 'opacity-100' : ''
                  }`}
                  title={isSelected ? 'Hide in preview' : 'Show in preview'}
                  onClick={(e) => {
                    e.stopPropagation();
                    // In a real app, this would toggle visibility in the preview
                  }}
                >
                  {isSelected ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
              
              {hasChildren && isExpanded && renderElementTree(element.id, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };
  
  // Get the selected element's data
  const selectedElementData = selectedElement 
    ? elementHierarchy.find(element => element.id === selectedElement) 
    : null;
  
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
        
        <div className="flex items-center space-x-3 nav-menu">
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
        </div>
        
        <div className="flex items-center space-x-3 actions">
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
        <div className="container mx-auto px-6 py-4 bg-gray-50 border-b border-gray-200" ref={mainPanelRef}>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button 
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'global' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('global')}
            >
              Global Settings
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'elements' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('elements')}
            >
              Element Customization
            </button>
          </div>
          
          {/* Global Settings Tab */}
          {activeTab === 'global' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Global UI Customization</h2>
                <button 
                  onClick={saveSettings}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium flex items-center"
                >
                  <Save size={16} className="mr-1.5" />
                  Save Settings
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Theme Settings */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      settings.darkMode ? 'bg-slate-800 text-white' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
                    </div>
                    <h3 className="ml-2 font-medium">Theme</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dark Mode</span>
                      <button
                        onClick={() => updateSetting('darkMode', !settings.darkMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Layout Settings */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                      <Layout size={18} />
                    </div>
                    <h3 className="ml-2 font-medium">Layout</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div 
                      onClick={() => updateSetting('layout', 'sideBySide')}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        settings.layout === 'sideBySide' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full mr-2 flex-shrink-0 bg-blue-500 opacity-60"></div>
                      <span className="text-sm">Side by Side</span>
                    </div>
                    
                    <div 
                      onClick={() => updateSetting('layout', 'stacked')}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        settings.layout === 'stacked' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full mr-2 flex-shrink-0 bg-blue-500 opacity-60"></div>
                      <span className="text-sm">Stacked</span>
                    </div>
                    
                    <div 
                      onClick={() => updateSetting('layout', 'wideGraph')}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        settings.layout === 'wideGraph' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full mr-2 flex-shrink-0 bg-blue-500 opacity-60"></div>
                      <span className="text-sm">Wide Graph</span>
                    </div>
                  </div>
                </div>
                
                {/* Density Settings */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Grid size={18} />
                    </div>
                    <h3 className="ml-2 font-medium">Density</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div 
                      onClick={() => updateSetting('density', 'compact')}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        settings.density === 'compact' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full mr-2 flex-shrink-0 bg-blue-500 opacity-60"></div>
                      <span className="text-sm">Compact</span>
                    </div>
                    
                    <div 
                      onClick={() => updateSetting('density', 'comfortable')}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        settings.density === 'comfortable' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full mr-2 flex-shrink-0 bg-blue-500 opacity-60"></div>
                      <span className="text-sm">Comfortable</span>
                    </div>
                    
                    <div 
                      onClick={() => updateSetting('density', 'spacious')}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        settings.density === 'spacious' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full mr-2 flex-shrink-0 bg-blue-500 opacity-60"></div>
                      <span className="text-sm">Spacious</span>
                    </div>
                  </div>
                </div>
                
                {/* Text Size Settings */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Sliders size={18} />
                    </div>
                    <h3 className="ml-2 font-medium">Text Size</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div 
                      onClick={() => updateSetting('fontSize', 'small')}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        settings.fontSize === 'small' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full mr-2 flex-shrink-0 bg-blue-500 opacity-60"></div>
                      <span className="text-sm">Small</span>
                    </div>
                    
                    <div 
                      onClick={() => updateSetting('fontSize', 'medium')}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        settings.fontSize === 'medium' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full mr-2 flex-shrink-0 bg-blue-500 opacity-60"></div>
                      <span className="text-sm">Medium</span>
                    </div>
                    
                    <div 
                      onClick={() => updateSetting('fontSize', 'large')}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        settings.fontSize === 'large' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full mr-2 flex-shrink-0 bg-blue-500 opacity-60"></div>
                      <span className="text-sm">Large</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Element Customization Tab */}
          {activeTab === 'elements' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Element Customization</h2>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setEditMode(!editMode)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                      editMode 
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <Move size={15} className="mr-1.5" />
                    {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                  </button>
                  <button 
                    onClick={saveElementStyles}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium flex items-center"
                    disabled={!editMode}
                  >
                    <Save size={15} className="mr-1.5" />
                    Save Changes
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Element Tree */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Element Hierarchy</h3>
                    <div className="text-xs text-gray-500">
                      {elementHierarchy.length} elements
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-2 bg-gray-50 overflow-y-auto" style={{ maxHeight: '400px' }}>
                    {renderElementTree()}
                  </div>
                </div>
                
                {/* Element Properties */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center mb-3">
                    <h3 className="font-medium">Element Properties</h3>
                  </div>
                  
                  {selectedElementData ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-md border border-blue-100 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-2">
                          {getElementIcon(selectedElementData.type)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{selectedElementData.name}</div>
                          <div className="text-xs text-gray-600">{selectedElementData.selector}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1">Size</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Width</div>
                              <div className="flex">
                                <input 
                                  type="text" 
                                  className="flex-1 border border-gray-300 rounded-l-md px-2 py-1 text-sm"
                                  value={selectedElementData.style.width || ''}
                                  onChange={(e) => updateElementStyle(selectedElementData.id, 'width', e.target.value)}
                                  disabled={!editMode}
                                />
                                <div className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-md px-2 py-1 text-xs text-gray-500 flex items-center">
                                  px/%
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Height</div>
                              <div className="flex">
                                <input 
                                  type="text" 
                                  className="flex-1 border border-gray-300 rounded-l-md px-2 py-1 text-sm"
                                  value={selectedElementData.style.height || ''}
                                  onChange={(e) => updateElementStyle(selectedElementData.id, 'height', e.target.value)}
                                  disabled={!editMode}
                                />
                                <div className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-md px-2 py-1 text-xs text-gray-500 flex items-center">
                                  px/%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1">Spacing</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Padding</div>
                              <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                value={selectedElementData.style.padding || ''}
                                onChange={(e) => updateElementStyle(selectedElementData.id, 'padding', e.target.value)}
                                disabled={!editMode}
                              />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Margin</div>
                              <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                value={selectedElementData.style.margin || ''}
                                onChange={(e) => updateElementStyle(selectedElementData.id, 'margin', e.target.value)}
                                disabled={!editMode}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1">Appearance</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Background</div>
                              <div className="flex">
                                <div 
                                  className="w-6 h-6 border border-gray-300 rounded-l-md"
                                  style={{ backgroundColor: selectedElementData.style.backgroundColor || '#ffffff' }}
                                ></div>
                                <input 
                                  type="text" 
                                  className="flex-1 border border-l-0 border-gray-300 rounded-r-md px-2 py-1 text-sm"
                                  value={selectedElementData.style.backgroundColor || ''}
                                  onChange={(e) => updateElementStyle(selectedElementData.id, 'backgroundColor', e.target.value)}
                                  disabled={!editMode}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Text Color</div>
                              <div className="flex">
                                <div 
                                  className="w-6 h-6 border border-gray-300 rounded-l-md"
                                  style={{ backgroundColor: selectedElementData.style.color || '#000000' }}
                                ></div>
                                <input 
                                  type="text" 
                                  className="flex-1 border border-l-0 border-gray-300 rounded-r-md px-2 py-1 text-sm"
                                  value={selectedElementData.style.color || ''}
                                  onChange={(e) => updateElementStyle(selectedElementData.id, 'color', e.target.value)}
                                  disabled={!editMode}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1">Border</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Radius</div>
                              <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                value={selectedElementData.style.borderRadius || ''}
                                onChange={(e) => updateElementStyle(selectedElementData.id, 'borderRadius', e.target.value)}
                                disabled={!editMode}
                              />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Width</div>
                              <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                value={selectedElementData.style.borderWidth || ''}
                                onChange={(e) => updateElementStyle(selectedElementData.id, 'borderWidth', e.target.value)}
                                disabled={!editMode}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                        <Target size={22} />
                      </div>
                      <h4 className="text-sm font-medium text-gray-700">No Element Selected</h4>
                      <p className="text-xs text-gray-500 mt-1">Select an element from the hierarchy tree to view and edit its properties.</p>
                    </div>
                  )}
                </div>
                
                {/* Preview / Help */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center mb-3">
                    <h3 className="font-medium">Element Preview</h3>
                  </div>
                  
                  {selectedElementData ? (
                    <div>
                      <div className="border rounded-md p-3 bg-gray-50 mb-3 aspect-video flex items-center justify-center">
                        <div 
                          className="border border-dashed border-gray-300 rounded flex items-center justify-center text-center p-3"
                          style={{
                            width: selectedElementData.style.width || '80%',
                            height: selectedElementData.style.height || '80%',
                            padding: selectedElementData.style.padding,
                            margin: selectedElementData.style.margin,
                            borderRadius: selectedElementData.style.borderRadius,
                            borderWidth: selectedElementData.style.borderWidth,
                            backgroundColor: selectedElementData.style.backgroundColor,
                            color: selectedElementData.style.color,
                            fontSize: selectedElementData.style.fontSize,
                            boxShadow: selectedElementData.style.boxShadow,
                          }}
                        >
                          <div className="text-xs">{selectedElementData.name}</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-2">Element Path:</div>
                      <div className="flex flex-wrap items-center text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                        {/* Generate element path based on hierarchy */}
                        {(() => {
                          const path = [];
                          let currentId = selectedElementData.parentId;
                          
                          while (currentId) {
                            const parent = elementHierarchy.find(el => el.id === currentId);
                            if (parent) {
                              path.unshift(
                                <div key={parent.id} className="flex items-center">
                                  <span className="hover:text-blue-600 cursor-pointer" onClick={() => setSelectedElement(parent.id)}>
                                    {parent.name}
                                  </span>
                                  <span className="mx-1">/</span>
                                </div>
                              );
                              currentId = parent.parentId;
                            } else {
                              break;
                            }
                          }
                          
                          path.unshift(
                            <div key="root" className="flex items-center">
                              <span className="hover:text-blue-600 cursor-pointer" onClick={() => setSelectedElement('main-container')}>
                                Root
                              </span>
                              <span className="mx-1">/</span>
                            </div>
                          );
                          
                          return path;
                        })()}
                        <span className="font-medium text-blue-700">{selectedElementData.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                        <Eye size={22} />
                      </div>
                      <h4 className="text-sm font-medium text-gray-700">No Preview Available</h4>
                      <p className="text-xs text-gray-500 mt-1">Select an element from the hierarchy tree to see a preview.</p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium mb-2">Tips</h4>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc ml-4">
                      <li>Click on elements in the hierarchy tree to edit their properties</li>
                      <li>Use the eye icon to show/hide elements in the application</li>
                      <li>Click on elements in the path to navigate up the hierarchy</li>
                      <li>Enter edit mode to make changes to element properties</li>
                      <li>Save your changes to apply them to the application</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
