import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <i className="fas fa-project-diagram text-primary text-2xl mr-3"></i>
        <h1 className="font-semibold text-xl">Text to Property Graph</h1>
      </div>
      
      <div className="flex items-center space-x-4">
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
