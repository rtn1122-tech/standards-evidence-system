import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProfileSetup from "./pages/ProfileSetup";
import StandardDetail from "./pages/StandardDetail";
import Dashboard from "./pages/Dashboard";
import SubEvidenceFormNew from "./pages/SubEvidenceFormNew";
import SubEvidenceFormEdit from "./pages/SubEvidenceFormEdit";
import SubEvidencePreview from "./pages/SubEvidencePreview";
import MyEvidence from "./pages/MyEvidence";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import VerifyEvidence from "./pages/VerifyEvidence";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/landing"} component={LandingPage} />
      <Route path="/about" component={About} />
      <Route path="/verify/:id" component={VerifyEvidence} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/profile-setup"} component={ProfileSetup} />
      <Route path="/standard/:id" component={StandardDetail} />
      <Route path="/evidence/sub/:subTemplateId" component={SubEvidenceFormNew} />
      <Route path="/evidence/sub-new/:subTemplateId" component={SubEvidenceFormNew} />
      <Route path="/evidence/edit/:evidenceId" component={SubEvidenceFormEdit} />
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
