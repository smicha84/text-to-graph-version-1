import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/auth";
import { Edit2, X, Save, Moon, Sun, Layout, Grid, Sliders, Type, Layers, Target, Move, Plus, Minus, Eye, EyeOff, ExternalLink, CornerRightDown, ArrowRight, Maximize2, Minimize2, RotateCcw, ChevronsUpDown, ChevronsLeftRight, Crosshair } from "lucide-react";

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
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderBottom?: string;
  borderTop?: string;
  border?: string;
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
  justifyContent?: string;
  gap?: string;
  minHeight?: string;
  minWidth?: string;
  maxHeight?: string;
  maxWidth?: string;
  overflow?: string;
  textAlign?: string;
  flexDirection?: string;
  flex?: string;
  cursor?: string;
  transition?: string;
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

// ResizeHandle component for direct manipulation
interface ResizeHandleProps {
  position: 'top' | 'right' | 'bottom' | 'left' | 'topRight' | 'bottomRight' | 'bottomLeft' | 'topLeft';
  onResize: (direction: string, delta: {x: number, y: number}) => void;
}

function ResizeHandle({ position, onResize }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  let cursor = 'nwse-resize';
  let icon = <CornerRightDown size={8} />;
  
  switch(position) {
    case 'top':
      cursor = 'ns-resize';
      icon = <ChevronsUpDown size={8} />;
      break;
    case 'right':
      cursor = 'ew-resize';
      icon = <ChevronsLeftRight size={8} />;
      break;
    case 'bottom':
      cursor = 'ns-resize';
      icon = <ChevronsUpDown size={8} />;
      break;
    case 'left':
      cursor = 'ew-resize';
      icon = <ChevronsLeftRight size={8} />;
      break;
    case 'topRight':
      cursor = 'nesw-resize';
      icon = <CornerRightDown size={8} style={{ transform: 'rotate(-90deg)' }} />;
      break;
    case 'bottomRight':
      cursor = 'nwse-resize';
      icon = <CornerRightDown size={8} />;
      break;
    case 'bottomLeft':
      cursor = 'nesw-resize';
      icon = <CornerRightDown size={8} style={{ transform: 'rotate(180deg)' }} />;
      break;
    case 'topLeft':
      cursor = 'nwse-resize';
      icon = <CornerRightDown size={8} style={{ transform: 'rotate(90deg)' }} />;
      break;
  }
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startPos.x;
      const deltaY = moveEvent.clientY - startPos.y;
      onResize(position, { x: deltaX, y: deltaY });
      setStartPos({ x: moveEvent.clientX, y: moveEvent.clientY });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position, onResize, startPos]);
  
  const positionStyles: Record<string, React.CSSProperties> = {
    top: { top: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
    right: { top: '50%', right: '-4px', transform: 'translateY(-50%)', cursor: 'ew-resize' },
    bottom: { bottom: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
    left: { top: '50%', left: '-4px', transform: 'translateY(-50%)', cursor: 'ew-resize' },
    topRight: { top: '-4px', right: '-4px', cursor: 'nesw-resize' },
    bottomRight: { bottom: '-4px', right: '-4px', cursor: 'nwse-resize' },
    bottomLeft: { bottom: '-4px', left: '-4px', cursor: 'nesw-resize' },
    topLeft: { top: '-4px', left: '-4px', cursor: 'nwse-resize' }
  };
  
  return (
    <div
      className="absolute w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center z-10"
      style={{ ...positionStyles[position], cursor }}
      onMouseDown={handleMouseDown}
    >
      <div className="text-white">{icon}</div>
    </div>
  );
}

export default function Header() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [showCustomization, setShowCustomization] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'elements'>('global');
  const [editMode, setEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elementHierarchy, setElementHierarchy] = useState<ElementData[]>([]);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [expandedElements, setExpandedElements] = useState<string[]>([]);
  
  // Direct manipulation states
  const [directEditMode, setDirectEditMode] = useState(false);
  const [elementDimensions, setElementDimensions] = useState({ width: 0, height: 0 });
  const [elementPosition, setElementPosition] = useState({ x: 0, y: 0 });
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  
  // Element selection mode - like browser dev tools
  const [elementSelectionMode, setElementSelectionMode] = useState(false);
  const [hoveredDOMElement, setHoveredDOMElement] = useState<Element | null>(null);
  
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
      parentId: 'header',
      children: ['app-logo', 'app-title']
    },
    {
      id: 'app-logo',
      name: 'Application Logo',
      selector: 'header .logo-area i',
      type: 'control',
      style: { fontSize: '1.5rem', color: '#4f46e5', marginRight: '0.75rem' },
      parentId: 'logo-area'
    },
    {
      id: 'app-title',
      name: 'Application Title',
      selector: 'header .logo-area h1',
      type: 'text',
      style: { fontSize: '1.25rem', fontWeight: '600', color: '#111827' },
      parentId: 'logo-area'
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
      parentId: 'navigation',
      children: ['nav-item-1-icon', 'nav-item-1-text']
    },
    {
      id: 'nav-item-1-icon',
      name: 'Graph V2 Icon',
      selector: 'header .nav-menu a[href="/graph-v2"] i',
      type: 'control',
      style: { color: 'inherit', marginRight: '0.5rem', fontSize: '0.875rem' },
      parentId: 'nav-item-1'
    },
    {
      id: 'nav-item-1-text',
      name: 'Graph V2 Text',
      selector: 'header .nav-menu a[href="/graph-v2"] span',
      type: 'text',
      style: { fontSize: '0.875rem', fontWeight: '500' },
      parentId: 'nav-item-1'
    },
    {
      id: 'nav-item-2',
      name: 'T2G Anatomy Link',
      selector: 'header .nav-menu a[href="/text-to-graph-anatomy"]',
      type: 'control',
      style: { padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem' },
      parentId: 'navigation',
      children: ['nav-item-2-icon', 'nav-item-2-text']
    },
    {
      id: 'nav-item-2-icon',
      name: 'T2G Anatomy Icon',
      selector: 'header .nav-menu a[href="/text-to-graph-anatomy"] i',
      type: 'control',
      style: { color: 'inherit', marginRight: '0.5rem', fontSize: '0.875rem' },
      parentId: 'nav-item-2'
    },
    {
      id: 'nav-item-2-text',
      name: 'T2G Anatomy Text',
      selector: 'header .nav-menu a[href="/text-to-graph-anatomy"] span',
      type: 'text',
      style: { fontSize: '0.875rem', fontWeight: '500' },
      parentId: 'nav-item-2'
    },
    {
      id: 'nav-item-3',
      name: 'Web Search Link',
      selector: 'header .nav-menu a[href="/web-search-anatomy"]',
      type: 'control',
      style: { padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem' },
      parentId: 'navigation',
      children: ['nav-item-3-icon', 'nav-item-3-text']
    },
    {
      id: 'nav-item-3-icon',
      name: 'Web Search Icon',
      selector: 'header .nav-menu a[href="/web-search-anatomy"] i',
      type: 'control',
      style: { color: 'inherit', marginRight: '0.5rem', fontSize: '0.875rem' },
      parentId: 'nav-item-3'
    },
    {
      id: 'nav-item-3-text',
      name: 'Web Search Text',
      selector: 'header .nav-menu a[href="/web-search-anatomy"] span',
      type: 'text',
      style: { fontSize: '0.875rem', fontWeight: '500' },
      parentId: 'nav-item-3'
    },
    {
      id: 'nav-item-4',
      name: 'API Logs Link',
      selector: 'header .nav-menu a[href="/logs"]',
      type: 'control',
      style: { padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem' },
      parentId: 'navigation',
      children: ['nav-item-4-icon', 'nav-item-4-text']
    },
    {
      id: 'nav-item-4-icon',
      name: 'API Logs Icon',
      selector: 'header .nav-menu a[href="/logs"] i',
      type: 'control',
      style: { color: 'inherit', marginRight: '0.5rem', fontSize: '0.875rem' },
      parentId: 'nav-item-4'
    },
    {
      id: 'nav-item-4-text',
      name: 'API Logs Text',
      selector: 'header .nav-menu a[href="/logs"] span',
      type: 'text',
      style: { fontSize: '0.875rem', fontWeight: '500' },
      parentId: 'nav-item-4'
    },
    {
      id: 'nav-item-5',
      name: 'UI Showcase Link',
      selector: 'header .nav-menu a[href="/ui-showcase"]',
      type: 'control',
      style: { padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem' },
      parentId: 'navigation',
      children: ['nav-item-5-icon', 'nav-item-5-text']
    },
    {
      id: 'nav-item-5-icon',
      name: 'UI Showcase Icon',
      selector: 'header .nav-menu a[href="/ui-showcase"] i',
      type: 'control',
      style: { color: 'inherit', marginRight: '0.5rem', fontSize: '0.875rem' },
      parentId: 'nav-item-5'
    },
    {
      id: 'nav-item-5-text',
      name: 'UI Showcase Text',
      selector: 'header .nav-menu a[href="/ui-showcase"] span',
      type: 'text',
      style: { fontSize: '0.875rem', fontWeight: '500' },
      parentId: 'nav-item-5'
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
      parentId: 'actions',
      children: ['help-button-icon']
    },
    {
      id: 'help-button-icon',
      name: 'Help Button Icon',
      selector: 'header .actions button:first-child svg',
      type: 'control',
      style: { width: '1.25rem', height: '1.25rem' },
      parentId: 'help-button'
    },
    {
      id: 'customize-button',
      name: 'Customize UI Button',
      selector: 'header .actions button:last-child',
      type: 'control',
      style: { padding: '0.5rem 0.75rem', borderRadius: '0.375rem', color: '#4B5563', display: 'flex', alignItems: 'center' },
      parentId: 'actions',
      children: ['customize-button-icon', 'customize-button-text']
    },
    {
      id: 'customize-button-icon',
      name: 'Customize Button Icon',
      selector: 'header .actions button:last-child svg',
      type: 'control',
      style: { width: '1rem', height: '1rem', marginRight: '0.375rem' },
      parentId: 'customize-button'
    },
    {
      id: 'customize-button-text',
      name: 'Customize Button Text',
      selector: 'header .actions button:last-child span',
      type: 'text',
      style: { fontSize: '0.875rem', fontWeight: '500' },
      parentId: 'customize-button'
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
      parentId: 'content-area',
      children: ['graph-header', 'graph-canvas', 'graph-controls']
    },
    {
      id: 'graph-header',
      name: 'Graph Header',
      selector: '.graph-view .graph-header',
      type: 'container',
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' },
      parentId: 'graph-view',
      children: ['graph-title', 'graph-actions']
    },
    {
      id: 'graph-title',
      name: 'Graph Title',
      selector: '.graph-view .graph-header h3',
      type: 'text',
      style: { fontSize: '1rem', fontWeight: '600', color: '#111827' },
      parentId: 'graph-header'
    },
    {
      id: 'graph-actions',
      name: 'Graph Actions',
      selector: '.graph-view .graph-header .actions',
      type: 'container',
      style: { display: 'flex', gap: '0.5rem' },
      parentId: 'graph-header'
    },
    {
      id: 'graph-canvas',
      name: 'Graph Canvas',
      selector: '.graph-view .graph-canvas',
      type: 'panel',
      style: { width: '100%', height: 'calc(500px - 3.5rem)', position: 'relative', overflow: 'hidden' },
      parentId: 'graph-view'
    },
    {
      id: 'graph-controls',
      name: 'Graph Controls',
      selector: '.graph-view .graph-controls',
      type: 'container',
      style: { display: 'flex', padding: '0.5rem', borderTop: '1px solid #e5e7eb', justifyContent: 'space-between' },
      parentId: 'graph-view'
    },
    {
      id: 'property-panel',
      name: 'Property Panel',
      selector: '.property-panel',
      type: 'panel',
      style: { width: '100%', height: 'auto', backgroundColor: '#ffffff', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1rem' },
      parentId: 'content-area',
      children: ['property-header', 'property-content']
    },
    {
      id: 'property-header',
      name: 'Property Panel Header',
      selector: '.property-panel .panel-header',
      type: 'container',
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
      parentId: 'property-panel'
    },
    {
      id: 'property-content',
      name: 'Property Panel Content',
      selector: '.property-panel .panel-content',
      type: 'container',
      style: { width: '100%' },
      parentId: 'property-panel'
    },
    {
      id: 'input-panel',
      name: 'Input Panel',
      selector: '.input-panel',
      type: 'panel',
      style: { width: '100%', height: 'auto', backgroundColor: '#ffffff', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1rem' },
      parentId: 'content-area',
      children: ['input-header', 'input-textarea', 'input-actions']
    },
    {
      id: 'input-header',
      name: 'Input Panel Header',
      selector: '.input-panel .panel-header',
      type: 'container',
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
      parentId: 'input-panel'
    },
    {
      id: 'input-textarea',
      name: 'Input Text Area',
      selector: '.input-panel textarea',
      type: 'control',
      style: { width: '100%', minHeight: '8rem', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.875rem' },
      parentId: 'input-panel'
    },
    {
      id: 'input-actions',
      name: 'Input Panel Actions',
      selector: '.input-panel .panel-actions',
      type: 'container',
      style: { display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '0.5rem' },
      parentId: 'input-panel'
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
  
  // Event handlers for element selection mode
  const handleElementHover = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    
    // Remove any existing highlight
    document.querySelectorAll('.ui-element-temp-highlight').forEach(el => {
      el.classList.remove('ui-element-temp-highlight');
    });
    
    // Add temporary highlight to the hovered element
    const target = e.target as Element;
    if (target) {
      target.classList.add('ui-element-temp-highlight');
      setHoveredDOMElement(target);
    }
  }, []);
  
  const handleElementSelect = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as Element;
    if (target) {
      // Remove temp highlight class
      document.querySelectorAll('.ui-element-temp-highlight').forEach(el => {
        el.classList.remove('ui-element-temp-highlight');
      });
      
      // Remove existing highlights
      document.querySelectorAll('.ui-element-highlight').forEach(el => {
        el.classList.remove('ui-element-highlight');
      });
      
      // Add highlight class to the selected element
      target.classList.add('ui-element-highlight');
      
      // Find the element in our hierarchy by matching selectors
      const findElementByDOMMatch = (element: HTMLElement): string | null => {
        for (const hierarchyElement of elementHierarchy) {
          try {
            const matchedElements = document.querySelectorAll(hierarchyElement.selector);
            // Convert NodeList to Array for iteration
            const elementsArray = Array.from(matchedElements);
            for (const matchedElement of elementsArray) {
              if (matchedElement === element || matchedElement.contains(element)) {
                return hierarchyElement.id;
              }
            }
          } catch (error) {
            console.error(`Invalid selector: ${hierarchyElement.selector}`);
          }
        }
        return null;
      };
      
      // Find and set the selected element in state
      const elementId = findElementByDOMMatch(target as HTMLElement);
      if (elementId) {
        setSelectedElement(elementId);
        
        // Expand parent elements in hierarchy
        const expandParents = (id: string) => {
          const element = elementHierarchy.find(el => el.id === id);
          if (element && element.parentId) {
            setExpandedElements(prev => {
              if (!prev.includes(element.parentId!)) {
                return [...prev, element.parentId!];
              }
              return prev;
            });
            expandParents(element.parentId);
          }
        };
        
        expandParents(elementId);
      }
      
      // Exit selection mode after selecting an element
      setElementSelectionMode(false);
    }
  }, [elementHierarchy, setSelectedElement, setExpandedElements, setElementSelectionMode]);
  
  // Set up element selection mode
  useEffect(() => {
    if (!elementSelectionMode) {
      // Remove highlighting classes when not in selection mode
      document.querySelectorAll('.ui-element-highlight').forEach(el => {
        el.classList.remove('ui-element-highlight');
      });
      document.body.classList.remove('element-select-mode');
      
      if (hoveredDOMElement) {
        setHoveredDOMElement(null);
      }
      
      // Remove event listeners
      document.removeEventListener('mouseover', handleElementHover);
      document.removeEventListener('click', handleElementSelect);
      return;
    }
    
    // Add the element-select-mode class to body
    document.body.classList.add('element-select-mode');
    
    // Add event listeners
    document.addEventListener('mouseover', handleElementHover);
    document.addEventListener('click', handleElementSelect);
    
    // Cleanup
    return () => {
      document.removeEventListener('mouseover', handleElementHover);
      document.removeEventListener('click', handleElementSelect);
      document.body.classList.remove('element-select-mode');
      
      // Remove any temporary highlights
      document.querySelectorAll('.ui-element-temp-highlight').forEach(el => {
        el.classList.remove('ui-element-temp-highlight');
      });
    };
  }, [elementSelectionMode, handleElementHover, handleElementSelect, hoveredDOMElement]);
  
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
  
  // Handle direct manipulation resize
  const handleElementResize = useCallback((direction: string, delta: {x: number, y: number}) => {
    if (!selectedElement) return;
    
    const element = elementHierarchy.find(el => el.id === selectedElement);
    if (!element) return;
    
    const style = { ...element.style };
    
    // Parse current dimensions, defaulting to reasonable values if not set
    const currentWidth = style.width ? parseInt(style.width, 10) : 100;
    const currentHeight = style.height ? parseInt(style.height, 10) : 100;
    
    let newWidth = currentWidth;
    let newHeight = currentHeight;
    
    // Adjust dimensions based on resize direction
    switch (direction) {
      case 'right':
        newWidth = Math.max(20, currentWidth + delta.x);
        break;
      case 'left':
        newWidth = Math.max(20, currentWidth - delta.x);
        break;
      case 'bottom':
        newHeight = Math.max(20, currentHeight + delta.y);
        break;
      case 'top':
        newHeight = Math.max(20, currentHeight - delta.y);
        break;
      case 'topRight':
        newWidth = Math.max(20, currentWidth + delta.x);
        newHeight = Math.max(20, currentHeight - delta.y);
        break;
      case 'bottomRight':
        newWidth = Math.max(20, currentWidth + delta.x);
        newHeight = Math.max(20, currentHeight + delta.y);
        break;
      case 'bottomLeft':
        newWidth = Math.max(20, currentWidth - delta.x);
        newHeight = Math.max(20, currentHeight + delta.y);
        break;
      case 'topLeft':
        newWidth = Math.max(20, currentWidth - delta.x);
        newHeight = Math.max(20, currentHeight - delta.y);
        break;
    }
    
    // Convert dimensions to CSS units
    const hasPixelWidth = style.width ? style.width.includes('px') : true;
    const hasPixelHeight = style.height ? style.height.includes('px') : true;
    
    const newWidthStr = hasPixelWidth ? `${newWidth}px` : `${newWidth}%`;
    const newHeightStr = hasPixelHeight ? `${newHeight}px` : `${newHeight}%`;
    
    // Update element dimensions
    updateElementStyle(element.id, 'width', newWidthStr);
    updateElementStyle(element.id, 'height', newHeightStr);
    
    // Update state for the preview
    setElementDimensions({ width: newWidth, height: newHeight });
  }, [selectedElement, elementHierarchy]);
  
  // Handle direct element dragging
  const handleElementDragStart = useCallback((e: React.MouseEvent) => {
    if (!directEditMode || !selectedElement) return;
    
    e.preventDefault();
    setIsDraggingElement(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      
      const deltaX = moveEvent.clientX - dragStartPos.x;
      const deltaY = moveEvent.clientY - dragStartPos.y;
      
      setElementPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setDragStartPos({ x: moveEvent.clientX, y: moveEvent.clientY });
    };
    
    const handleMouseUp = () => {
      setIsDraggingElement(false);
      
      // If we were dragging, update the element's position
      if (selectedElement) {
        const element = elementHierarchy.find(el => el.id === selectedElement);
        if (element) {
          // Update the element's position based on the drag
          // This could involve setting margin, position, transform, etc.
          // For this example, we'll use transform
          updateElementStyle(element.id, 'transform', `translate(${elementPosition.x}px, ${elementPosition.y}px)`);
        }
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [directEditMode, selectedElement, dragStartPos, elementPosition, elementHierarchy]);
  
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
                    
                    // Actually highlight the element in the DOM
                    try {
                      // Remove any existing highlight
                      document.querySelectorAll('.ui-element-highlight').forEach(el => {
                        el.classList.remove('ui-element-highlight');
                      });
                      
                      // Find and highlight the selected element
                      const domElement = document.querySelector(element.selector);
                      if (domElement) {
                        domElement.classList.add('ui-element-highlight');
                        
                        // Scroll the element into view if needed
                        domElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    } catch (error) {
                      console.error('Error highlighting element:', error);
                    }
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
          <Link href="/">
            <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
              location === "/" 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:text-primary"
            } transition-colors`}>
              <i className="fas fa-home mr-2"></i>
              <span>Home</span>
            </div>
          </Link>
          
          {isAuthenticated && (
            <Link href="/dashboard">
              <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                location === "/dashboard" 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-600 hover:text-primary"
              } transition-colors`}>
                <i className="fas fa-tachometer-alt mr-2"></i>
                <span>Dashboard</span>
              </div>
            </Link>
          )}
          
          {/* GraphV2 link removed */}
          
          <Link href="/graph-chat">
            <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
              location === "/graph-chat" 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:text-primary"
            } transition-colors`}>
              <i className="fas fa-comments mr-2"></i>
              <span>Graph Component AI Text Outputs</span>
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
          
          <Link href="/multi-player-graph">
            <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
              location === "/multi-player-graph" 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:text-primary"
            } transition-colors`}>
              <i className="fas fa-users mr-2"></i>
              <span>Multi Player Graph</span>
            </div>
          </Link>
          
          <Link href="/site-map">
            <div className={`flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
              location === "/site-map" 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:text-primary"
            } transition-colors`}>
              <i className="fas fa-sitemap mr-2"></i>
              <span>Site Map</span>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3 actions">
          <button className="text-gray-600 hover:text-primary transition-colors">
            <i className="fas fa-question-circle"></i>
          </button>
          
          {/* User Authentication */}
          {!isAuthenticated ? (
            <Link href="/auth">
              <div className="flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer bg-primary text-white hover:bg-primary/90 transition-colors">
                <i className="fas fa-sign-in-alt mr-2"></i>
                <span>Sign In</span>
              </div>
            </Link>
          ) : (
            <div className="relative group">
              <button className="flex items-center px-3 py-2 rounded-md text-sm font-medium cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <i className="fas fa-user-circle mr-2"></i>
                <span>{user?.username}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                <Link href="/profile">
                  <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <i className="fas fa-user mr-2"></i>
                    <span>Profile</span>
                  </div>
                </Link>
                <Link href="/dashboard">
                  <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    <span>Dashboard</span>
                  </div>
                </Link>
                <Link href="/analytics">
                  <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <i className="fas fa-chart-line mr-2"></i>
                    <span>Analytics</span>
                  </div>
                </Link>
                <div 
                  className="px-4 py-2 text-sm text-red-700 hover:bg-gray-100 flex items-center cursor-pointer"
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }}
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  <span>Logout</span>
                </div>
              </div>
            </div>
          )}
          
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
                    onClick={() => setElementSelectionMode(true)}
                    className="px-3 py-1.5 bg-indigo-500 text-white rounded-md text-sm font-medium flex items-center"
                    title="Click to select an element directly in the UI"
                  >
                    <Crosshair size={15} className="mr-1.5" />
                    Select Element
                  </button>
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
                  <div className="flex items-center mb-3 justify-between">
                    <h3 className="font-medium">Element Preview</h3>
                    <div className="flex space-x-1">
                      <button 
                        title="Reset changes" 
                        className="text-gray-500 hover:text-gray-700 p-1 rounded"
                        onClick={() => {
                          // Reset to original element style
                          setDirectEditMode(false);
                          setElementPosition({ x: 0, y: 0 });
                          // Find the original element in the sample data
                          const originalElement = sampleElements.find(e => e.id === selectedElement);
                          if (originalElement) {
                            const element = elementHierarchy.find(e => e.id === selectedElement);
                            if (element) {
                              // Reset the element to its original style
                              setElementHierarchy(prev => 
                                prev.map(e => e.id === selectedElement ? {...e, style: {...originalElement.style}} : e)
                              );
                            }
                          }
                        }}
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button 
                        title="Toggle direct manipulation mode" 
                        className={`p-1 rounded ${directEditMode ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => {
                          setDirectEditMode(!directEditMode);
                          // Initialize dimensions for the selected element
                          if (selectedElementData) {
                            const width = selectedElementData.style.width 
                              ? parseInt(selectedElementData.style.width as string, 10) 
                              : 100;
                            const height = selectedElementData.style.height 
                              ? parseInt(selectedElementData.style.height as string, 10) 
                              : 100;
                            setElementDimensions({ width, height });
                          }
                        }}
                      >
                        <Move size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {selectedElementData ? (
                    <div>
                      <div className="border rounded-md p-3 bg-gray-50 mb-3 aspect-video flex items-center justify-center relative">
                        <div 
                          className={`border ${directEditMode ? 'border-blue-500' : 'border-dashed border-gray-300'} rounded flex items-center justify-center text-center p-3 ${directEditMode ? 'cursor-move' : ''}`}
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
                            position: directEditMode ? 'relative' : undefined,
                            transform: directEditMode ? `translate(${elementPosition.x}px, ${elementPosition.y}px)` : undefined,
                            transition: directEditMode ? 'none' : 'all 0.2s ease-in-out',
                          }}
                          onMouseDown={directEditMode ? handleElementDragStart : undefined}
                        >
                          <div className="text-xs">{selectedElementData.name}</div>
                          
                          {/* Direct manipulation resize handles */}
                          {directEditMode && (
                            <>
                              <ResizeHandle position="top" onResize={handleElementResize} />
                              <ResizeHandle position="right" onResize={handleElementResize} />
                              <ResizeHandle position="bottom" onResize={handleElementResize} />
                              <ResizeHandle position="left" onResize={handleElementResize} />
                              <ResizeHandle position="topRight" onResize={handleElementResize} />
                              <ResizeHandle position="bottomRight" onResize={handleElementResize} />
                              <ResizeHandle position="bottomLeft" onResize={handleElementResize} />
                              <ResizeHandle position="topLeft" onResize={handleElementResize} />
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Visual manipulation controls */}
                      {directEditMode && (
                        <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-100 rounded border border-gray-200">
                          <div className="flex gap-1 items-center">
                            <button 
                              className="p-1 bg-white rounded text-gray-700 hover:bg-gray-50 border border-gray-300"
                              title="Center horizontally"
                              onClick={() => setElementPosition(prev => ({ ...prev, x: 0 }))}
                            >
                              <ChevronsLeftRight size={14} />
                            </button>
                            <button 
                              className="p-1 bg-white rounded text-gray-700 hover:bg-gray-50 border border-gray-300"
                              title="Center vertically"
                              onClick={() => setElementPosition(prev => ({ ...prev, y: 0 }))}
                            >
                              <ChevronsUpDown size={14} />
                            </button>
                          </div>
                          
                          <div className="flex gap-1 items-center">
                            <button 
                              className="p-1 bg-white rounded text-gray-700 hover:bg-gray-50 border border-gray-300"
                              title="Increase size"
                              onClick={() => {
                                // Increase both width and height proportionally
                                handleElementResize('bottomRight', { x: 10, y: 10 });
                              }}
                            >
                              <Maximize2 size={14} />
                            </button>
                            <button 
                              className="p-1 bg-white rounded text-gray-700 hover:bg-gray-50 border border-gray-300"
                              title="Decrease size"
                              onClick={() => {
                                // Decrease both width and height proportionally
                                handleElementResize('bottomRight', { x: -10, y: -10 });
                              }}
                            >
                              <Minimize2 size={14} />
                            </button>
                          </div>
                          
                          <div className="ml-auto text-xs text-gray-600">
                            <span>W: {elementDimensions.width}px</span>
                            <span className="mx-1">×</span>
                            <span>H: {elementDimensions.height}px</span>
                            <span className="mx-1">|</span>
                            <span>X: {elementPosition.x}px</span>
                            <span className="mx-1">Y: {elementPosition.y}px</span>
                          </div>
                        </div>
                      )}
                      
                      
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
