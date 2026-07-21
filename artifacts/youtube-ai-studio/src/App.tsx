import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Shell } from '@/components/layout/Shell';

import Dashboard from '@/pages/Dashboard';
import Research from '@/pages/Research';
import Content from '@/pages/Content';
import Pipeline from '@/pages/Pipeline';
import YouTube from '@/pages/YouTube';
import Automation from '@/pages/Automation';
import ApiSettings from '@/pages/ApiSettings';

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/research" component={Research} />
        <Route path="/content" component={Content} />
        <Route path="/pipeline" component={Pipeline} />
        <Route path="/youtube" component={YouTube} />
        <Route path="/automation" component={Automation} />
        <Route path="/api-settings" component={ApiSettings} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
