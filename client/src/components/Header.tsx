import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();
  
  return (
    <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <i className="fas fa-project-diagram text-primary text-2xl mr-3"></i>
            <h1 className="font-semibold text-xl">Text to Property Graph</h1>
          </div>
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
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
        
        <button className="text-gray-600 hover:text-primary transition-colors">
          <i className="fas fa-question-circle"></i>
        </button>
        
        <button className="text-gray-600 hover:text-primary transition-colors">
          <i className="fas fa-cog"></i>
        </button>
        
        <Button className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center">
          <i className="fas fa-star mr-2"></i>
          <span>Pro Mode</span>
        </Button>
      </div>
    </header>
  );
}
