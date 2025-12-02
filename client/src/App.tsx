import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProfileSetup from "./pages/ProfileSetup";
import StandardDetail from "./pages/StandardDetail";
import EvidenceForm from "./pages/EvidenceForm";
import Dashboard from "./pages/Dashboard";
import SubEvidenceForm from "./pages/SubEvidenceForm";
import EvidencePreview from "./pages/EvidencePreview";
import SubEvidenceFormNew from "./pages/SubEvidenceFormNew";
import SubEvidencePreview from "./pages/SubEvidencePreview";
import MyEvidence from "./pages/MyEvidence";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/profile-setup"} component={ProfileSetup} />
      <Route path="/standard/:id" component={StandardDetail} />
      <Route path="/evidence/new" component={EvidenceForm} />
      <Route path="/evidence/:id" component={EvidenceForm} />
      <Route path="/evidence/sub/:subTemplateId" component={SubEvidenceForm} />
      <Route path="/evidence/preview/:id" component={EvidencePreview} />
      <Route path="/evidence/sub-new/:subTemplateId" component={SubEvidenceFormNew} />
      <Route path="/evidence/sub-preview/:id" component={SubEvidencePreview} />
      <Route path="/my-evidence" component={MyEvidence} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
