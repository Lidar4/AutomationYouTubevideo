import React, { useState } from "react";
import { 
  useListResearch, 
  useCreateResearch, 
  useGetResearch,
  useDeleteResearch
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Compass, Trash2, ChevronRight, Activity, Zap, BarChart2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Research() {
  const [topic, setTopic] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { data: researchJobs, isLoading } = useListResearch();
  const createResearch = useCreateResearch();
  const deleteResearch = useDeleteResearch();
  
  const { data: activeResearch, isLoading: isActiveLoading } = useGetResearch(selectedId!, {
    query: { enabled: !!selectedId }
  });

  const handleAnalyze = () => {
    if (!topic.trim()) return;
    createResearch.mutate({ data: { topic } }, {
      onSuccess: (newResearch) => {
        setTopic("");
        setSelectedId(newResearch.id);
        queryClient.invalidateQueries({ queryKey: ["/api/research"] });
      }
    });
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteResearch.mutate({ id }, {
      onSuccess: () => {
        if (selectedId === id) setSelectedId(null);
        queryClient.invalidateQueries({ queryKey: ["/api/research"] });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Compass className="w-8 h-8 text-primary" />
          AI Research Engine
        </h1>
        <p className="text-muted-foreground mt-1">Deep-dive analysis on content viability and search intent.</p>
      </div>

      {/* Input Section */}
      <Card className="border-primary/20 bg-card">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a broad topic or specific question (e.g. 'How to build a SaaS in 2024')" 
                className="pl-10 h-12 text-base font-medium"
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
            <Button onClick={handleAnalyze} disabled={createResearch.isPending || !topic.trim()} size="lg" className="px-8">
              {createResearch.isPending ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Results Panel */}
        <div className="md:col-span-2 space-y-6">
          {!selectedId ? (
            <Card className="h-[600px] flex flex-col items-center justify-center border-dashed text-center p-8">
              <Compass className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No active research</h3>
              <p className="text-muted-foreground max-w-sm">Enter a topic above or select a past research job from the list to view its deep-dive analysis.</p>
            </Card>
          ) : isActiveLoading ? (
            <Card className="h-[600px] flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground font-mono text-sm animate-pulse">Running neural analysis...</p>
              </div>
            </Card>
          ) : activeResearch ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              {/* Verdict Banner */}
              <div className={`p-6 rounded-lg border flex items-start gap-4 ${
                activeResearch.shouldCreate ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'
              }`}>
                <div className="mt-1">
                  {activeResearch.shouldCreate ? (
                    <Zap className="w-8 h-8 text-success" />
                  ) : (
                    <Activity className="w-8 h-8 text-destructive" />
                  )}
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${activeResearch.shouldCreate ? 'text-success' : 'text-destructive'}`}>
                    {activeResearch.shouldCreate ? "YES — Create this video" : "NO — Skip this topic"}
                  </h2>
                  <p className="mt-2 text-foreground/80 leading-relaxed font-medium">
                    {activeResearch.reasoning || "Analysis complete. Data signals point toward the verdict above."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Evergreen Potential</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold font-mono">{activeResearch.evergreenPotential || 0}/100</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Viral Potential</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold font-mono">{activeResearch.viralPotential || 0}/100</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5" />
                    Deep Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Audience Analysis</h4>
                    <p className="text-muted-foreground leading-relaxed">{activeResearch.audienceAnalysis || "Awaiting detail..."}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Search Intent</h4>
                    <p className="text-muted-foreground leading-relaxed">{activeResearch.searchIntent || "Awaiting detail..."}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Content Gap</h4>
                    <p className="text-muted-foreground leading-relaxed">{activeResearch.contentGapAnalysis || "Awaiting detail..."}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>

        {/* History List */}
        <div className="md:col-span-1">
          <Card className="h-full max-h-[800px] flex flex-col">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle>Research History</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-auto flex-1">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading history...</div>
              ) : (
                <div className="divide-y divide-border/50">
                  {researchJobs?.map((job) => (
                    <div 
                      key={job.id} 
                      onClick={() => setSelectedId(job.id)}
                      className={`p-4 cursor-pointer hover:bg-secondary/50 transition-colors flex flex-col gap-2 ${
                        selectedId === job.id ? 'bg-secondary/80 border-l-2 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium text-sm line-clamp-2 leading-tight">{job.topic}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={(e) => handleDelete(job.id, e)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={job.status === 'completed' ? 'success' : 'secondary'} className="text-[10px]">
                          {job.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {researchJobs?.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">No past research.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
