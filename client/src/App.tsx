import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { BasicDataForm } from "@/pages/BasicDataForm";
import { ProjectDetailsForm } from "@/pages/ProjectDetailsForm";
import { ResultsPage } from "@/pages/ResultsPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={BasicDataForm} />
      <Route path="/projeto" component={ProjectDetailsForm} />
      <Route path="/resultado" component={ResultsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
