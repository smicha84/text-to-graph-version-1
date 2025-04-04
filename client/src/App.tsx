import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import LogsPage from "@/pages/Logs";
import GraphV2 from "@/pages/GraphV2";
import LogTest from "@/pages/LogTest";
import TextToGraphAnatomy from "@/pages/TextToGraphAnatomy";
import WebSearchAnatomy from "@/pages/WebSearchAnatomy";
import UIShowcase from "@/pages/UIShowcase";
import GraphChat from "@/pages/GraphChat";
import Header from "@/components/Header";
import { ChatProvider } from "@/contexts/ChatContext";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import GraphAnalytics from "@/pages/GraphAnalytics";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/home" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/logs" component={LogsPage} />
          <Route path="/graph-v2" component={GraphV2} />
          <Route path="/graph-chat" component={GraphChat} />
          <Route path="/log-test" component={LogTest} />
          <Route path="/text-to-graph-anatomy" component={TextToGraphAnatomy} />
          <Route path="/web-search-anatomy" component={WebSearchAnatomy} />
          <Route path="/ui-showcase" component={UIShowcase} />
          <Route path="/auth" component={Auth} />
          <Route path="/profile" component={Profile} />
          <Route path="/analytics" component={GraphAnalytics} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatProvider>
        <Router />
        <Toaster />
      </ChatProvider>
    </QueryClientProvider>
  );
}

export default App;
