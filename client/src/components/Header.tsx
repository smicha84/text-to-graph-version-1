import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Edit2, X, Save, Moon, Sun, Layout, Maximize, Minimize, Grid, Sliders } from "lucide-react";

// Define UI customization settings
interface UISettings {
  darkMode: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
  layout: 'sideBySide' | 'stacked' | 'wideGraph';
  fontSize: 'small' | 'medium' | 'large';
}

export default function Header() {
  const [location] = useLocation();
  const [showCustomization, setShowCustomization] = useState(false);
  const [settings, setSettings] = useState<UISettings>({
    darkMode: false,
    density: 'comfortable',
    layout: 'sideBySide',
    fontSize: 'medium',
  });
  
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
  
  // Update a specific setting
  const updateSetting = <K extends keyof UISettings>(key: K, value: UISettings[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      return newSettings;
    });
  };
  
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
        </div>
      )}
    </>
  );
}
