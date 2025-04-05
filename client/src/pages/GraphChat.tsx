import React, { useState, useEffect, useRef } from 'react';
import { useChatContext, ChatMessage } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  RotateCcw, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  Info,
  Database
} from 'lucide-react';

// Individual chat message component
function ChatMessageItem({ message }: { message: ChatMessage }) {
  const [expanded, setExpanded] = useState(false);
  const { applyChangesToGraph } = useChatContext();
  const hasAnalysis = message.graphAnalysis && 
    (message.graphAnalysis.suggestedNodes?.length > 0 || 
     message.graphAnalysis.suggestedEdges?.length > 0 ||
     message.graphAnalysis.analysis);

  // Format the timestamp
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(message.timestamp);

  // Determine message style based on role
  const messageStyle = () => {
    switch (message.role) {
      case 'user':
        return 'bg-blue-100 border-blue-300';
      case 'assistant':
        return 'bg-gray-100 border-gray-300';
      case 'system':
        return 'bg-amber-100 border-amber-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  // Determine avatar based on role
  const avatarIcon = () => {
    switch (message.role) {
      case 'user':
        return <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">U</div>;
      case 'assistant':
        return <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">A</div>;
      case 'system':
        return <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">S</div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white">?</div>;
    }
  };

  // Handle applying changes to the graph
  const handleApplyChanges = () => {
    if (message.graphAnalysis) {
      applyChangesToGraph(message.graphAnalysis);
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${messageStyle()} mb-4`}>
      <div className="flex items-start">
        {/* Avatar */}
        <div className="mr-3 flex-shrink-0">
          {avatarIcon()}
        </div>
        
        {/* Message content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <div className="font-medium capitalize">{message.role}</div>
            <div className="text-xs text-gray-500">{formattedTime}</div>
          </div>
          
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {/* Graph analysis section (if available) */}
          {hasAnalysis && (
            <div className="mt-3">
              <div 
                className="flex items-center text-sm font-medium text-blue-600 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
              >
                <Database size={16} className="mr-1" />
                <span>Graph Analysis</span>
                {expanded ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
              </div>
              
              {expanded && (
                <div className="mt-2 p-3 bg-white border border-blue-200 rounded-md">
                  {/* Analysis text */}
                  {message.graphAnalysis.analysis && (
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1 flex items-center">
                        <Info size={14} className="mr-1" />
                        Analysis
                      </div>
                      <div className="text-sm text-gray-700">
                        {message.graphAnalysis.analysis}
                      </div>
                    </div>
                  )}
                  
                  {/* Suggested nodes */}
                  {message.graphAnalysis.suggestedNodes?.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1 flex items-center">
                        <PlusCircle size={14} className="mr-1" />
                        Suggested Nodes ({message.graphAnalysis.suggestedNodes.length})
                      </div>
                      <ul className="text-sm ml-5 list-disc">
                        {message.graphAnalysis.suggestedNodes.map((node: any, i: number) => (
                          <li key={i} className="text-gray-700">
                            {node.label} <span className="text-xs text-gray-500">({node.type})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Suggested edges */}
                  {message.graphAnalysis.suggestedEdges?.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1 flex items-center">
                        <PlusCircle size={14} className="mr-1" />
                        Suggested Relationships ({message.graphAnalysis.suggestedEdges.length})
                      </div>
                      <ul className="text-sm ml-5 list-disc">
                        {message.graphAnalysis.suggestedEdges.map((edge: any, i: number) => (
                          <li key={i} className="text-gray-700">
                            {edge.source} <span className="text-xs">{edge.label}</span> {edge.target}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Apply changes button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={handleApplyChanges}
                  >
                    <CheckCircle size={14} className="mr-1" />
                    Apply Changes to Graph
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main GraphChat component
export default function GraphChat() {
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    clearMessages,
    graphContext,
    setGraphContext
  } = useChatContext();
  
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (userInput.trim() === '') return;
    
    sendMessage(userInput.trim());
    setUserInput('');
  };

  // Handle Enter key in textarea
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Database size={20} className="mr-2" />
            <h1 className="text-xl font-semibold">Graph Component AI Text Outputs</h1>
          </div>
          <div className="flex space-x-2">
            {graphContext ? (
              <div className="bg-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                <Database size={14} className="mr-1" />
                <span>Graph Connected</span>
              </div>
            ) : (
              <div className="bg-amber-500 px-3 py-1 rounded-full text-sm flex items-center">
                <AlertTriangle size={14} className="mr-1" />
                <span>No Graph Connected</span>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-blue-500 text-white"
              onClick={clearMessages}
            >
              <RotateCcw size={16} className="mr-1" />
              Clear Output
            </Button>
          </div>
        </div>
        
        {/* Messages container */}
        <div className="h-[60vh] overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Info size={48} className="mb-2" />
              <p className="text-lg">No AI output yet</p>
              <p className="text-sm">Start a conversation about your graph data</p>
            </div>
          ) : (
            messages.map(message => (
              <ChatMessageItem key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex space-x-2">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI to analyze your graph data..."
              className="resize-none"
              rows={3}
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || userInput.trim() === ''}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : (
                <Send size={16} className="mr-1" />
              )}
              Send
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <p>
              {graphContext ? (
                <>
                  <span className="font-medium">Graph context connected:</span> {graphContext.nodes.length} nodes, {graphContext.edges.length} edges
                </>
              ) : (
                <>
                  <span className="font-medium">No graph context connected.</span> Connect a graph to enable contextual analysis.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}