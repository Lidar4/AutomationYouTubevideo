import React, { useState } from "react";
import { 
  useListPipeline,
  useCreatePipelineJob
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ListTree, Play, CheckCircle2, Circle, Loader2, ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const WORKFLOW_STEPS = [
  "Topic", "Research", "Script", "Voice", "Scene Plan", 
  "Image Generation", "Video Generation", "Subtitle", 
  "Thumbnail", "SEO", "Ready for Review", "Publish"
];

export default function Pipeline() {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("long");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: pipelines, isLoading } = useListPipeline();
  const createPipeline = useCreatePipelineJob();

  const handleStartPipeline = () => {
    if (!topic.trim()) return;
    createPipeline.mutate({ data: { topic, videoType: type } }, {
      onSuccess: () => {
        setTopic("");
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: ["/api/pipeline"] });
        toast({ title: "Pipeline Started", description: "12-step autonomous workflow initiated." });
      }
    });
  };

  const getStepStatus = (currentStep: string, stepName: string, status: string) => {
    const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);
    const stepIndex = WORKFLOW_STEPS.indexOf(stepName);
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return status === "failed" ? "failed" : "active";
    return "pending";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ListTree className="w-8 h-8 text-primary" />
            AI Video Pipeline
          </h1>
          <p className="text-muted-foreground mt-1">End-to-end autonomous video generation workflow.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-lg shadow-primary/20 font-bold tracking-wide">
              <Play className="w-4 h-4 mr-2" fill="currentColor" />
              Start New Pipeline
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card border-card-border">
            <DialogHeader>
              <DialogTitle>Initialize Autonomous Pipeline</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Core Topic</label>
                <Input 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. History of Rome in 5 minutes" 
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Video Format</label>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant={type === 'long' ? 'default' : 'outline'} 
                    onClick={() => setType('long')}
                  >
                    Long Form (16:9)
                  </Button>
                  <Button 
                    variant={type === 'short' ? 'default' : 'outline'} 
                    onClick={() => setType('short')}
                  >
                    Short (9:16)
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleStartPipeline} 
                disabled={createPipeline.isPending || !topic.trim()} 
                className="w-full h-12"
              >
                {createPipeline.isPending ? "Initializing..." : "Launch Production Workflow"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading pipeline data...</div>
        ) : pipelines?.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 border-dashed">
            <ListTree className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-xl font-bold">No active pipelines</h3>
            <p className="text-muted-foreground mt-2">Start a new pipeline to see the magic happen.</p>
          </Card>
        ) : (
          pipelines?.map((job) => (
            <Card key={job.id} className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">{job.topic}</CardTitle>
                    <CardDescription className="font-mono text-xs mt-1">
                      ID: {job.id} | Started: {new Date(job.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium mb-1">{job.progress}% Complete</div>
                      <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${job.status === 'failed' ? 'bg-destructive' : 'bg-primary'} transition-all duration-1000`} 
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                    <Badge 
                      variant={job.status === 'completed' ? 'success' : job.status === 'failed' ? 'destructive' : 'default'}
                      className="uppercase tracking-wider"
                    >
                      {job.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-8 gap-x-4 relative">
                  {/* Stepper logic */}
                  {WORKFLOW_STEPS.map((step, index) => {
                    const status = getStepStatus(job.currentStep, step, job.status);
                    return (
                      <div key={step} className="flex flex-col items-center relative z-10 group">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors duration-300
                          ${status === 'completed' ? 'bg-success/20 text-success' : 
                            status === 'active' ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 
                            status === 'failed' ? 'bg-destructive/20 text-destructive' : 
                            'bg-secondary text-muted-foreground'}
                        `}>
                          {status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> :
                           status === 'active' ? <Loader2 className="w-5 h-5 animate-spin" /> :
                           <Circle className="w-5 h-5" />}
                        </div>
                        <span className={`text-xs font-semibold text-center leading-tight
                          ${status === 'active' ? 'text-primary' : 
                            status === 'completed' ? 'text-foreground' : 'text-muted-foreground'}
                        `}>
                          {step}
                        </span>
                        
                        {/* Connecting Line (except last) */}
                        {index < WORKFLOW_STEPS.length - 1 && (
                          <div className={`hidden lg:block absolute top-5 -right-[50%] w-full h-[2px] -z-10
                            ${status === 'completed' ? 'bg-success/50' : 'bg-secondary'}
                          `} />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {job.errorMessage && (
                  <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm font-mono flex items-start gap-3">
                    <span className="bg-destructive text-destructive-foreground px-2 py-0.5 rounded text-xs">ERROR</span>
                    {job.errorMessage}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
