import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import LogsPage from "@/pages/Logs";
import GraphV2 from "@/pages/GraphV2";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/logs" component={LogsPage} />
      <Route path="/graph-v2" component={GraphV2} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
