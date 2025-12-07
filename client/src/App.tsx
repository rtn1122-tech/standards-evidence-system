// import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProfileSetup from "./pages/ProfileSetup";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import RequestCustomService from "./pages/RequestCustomService";
import RequestPrint from "./pages/RequestPrint";
import CreateCustomEvidence from "./pages/CreateCustomEvidence";
import MyEvidences from "./pages/MyEvidences";
import OwnerDashboard from "./pages/OwnerDashboard";
import Standards from "./pages/Standards";
import StandardDetail from "./pages/StandardDetail";
import ProgressStats from "./pages/ProgressStats";
import AdminPanel from "./pages/AdminPanel";
import FillEvidence from "./pages/FillEvidence";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/landing"} component={LandingPage} />
      <Route path="/about" component={About} />
      <Route path={"/profile-setup"} component={ProfileSetup} />
      <Route path={"/request-custom-service"} component={RequestCustomService} />
      <Route path={"/request-print"} component={RequestPrint} />
      <Route path={"/create-custom-evidence"} component={CreateCustomEvidence} />
      <Route path={"/my-evidences"} component={MyEvidences} />      <Route path={"/ owner-dashboard"} component={OwnerDashboard} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/standards"} component={Standards} />
      <Route path={"/standard/:id"} component={StandardDetail} />
      <Route path={"/progress"} component={ProgressStats} />
      <Route path={"/evidence/fill/:id"} component={FillEvidence} />

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
          {/* <Toaster /> */}
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
