import React, { useState } from "react";
import { 
  useListContent,
  useCreateContent,
  useGetContent,
  useUpdateContent,
  useDeleteContent
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Copy, Wand2, Trash2, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Content() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("long");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: contents, isLoading } = useListContent();
  const createContent = useCreateContent();
  const deleteContent = useDeleteContent();
  
  const { data: activeContent, isLoading: isActiveLoading } = useGetContent(selectedId!, {
    query: { enabled: !!selectedId }
  });

  const handleGenerate = () => {
    if (!topic.trim()) return;
    createContent.mutate({ data: { topic, type } }, {
      onSuccess: (newContent) => {
        setTopic("");
        setSelectedId(newContent.id);
        queryClient.invalidateQueries({ queryKey: ["/api/content"] });
        toast({ title: "Content generation started", description: "Your AI is working on the script..." });
      }
    });
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteContent.mutate({ id }, {
      onSuccess: () => {
        if (selectedId === id) setSelectedId(null);
        queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      }
    });
  };

  const handleCopy = (text: string | null | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const renderContentTab = (text: string | null | undefined, label: string) => {
    return (
      <div className="relative mt-4">
        <Button 
          variant="secondary" 
          size="sm" 
          className="absolute right-2 top-2 h-8"
          onClick={() => handleCopy(text)}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy {label}
        </Button>
        <div className="bg-muted/30 border rounded-md p-6 min-h-[300px] whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {text || "Generating content..."}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Video className="w-8 h-8 text-primary" />
          AI Content Studio
        </h1>
        <p className="text-muted-foreground mt-1">Generate complete video assets from a single topic.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Left Panel: Generator & List */}
        <div className="md:col-span-1 flex flex-col gap-6 h-full">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Topic</label>
                <Input 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Video topic..." 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Format</label>
                <div className="flex gap-2">
                  <Button 
                    variant={type === 'long' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setType('long')}
                  >
                    Long Form
                  </Button>
                  <Button 
                    variant={type === 'short' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setType('short')}
                  >
                    Shorts/Reels
                  </Button>
                </div>
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={createContent.isPending || !topic.trim()} 
                className="w-full mt-2"
              >
                {createContent.isPending ? (
                  <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="w-4 h-4 mr-2" /> Generate All</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="flex-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm">Saved Content</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-auto flex-1">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
              ) : (
                <div className="divide-y divide-border/50">
                  {contents?.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedId(item.id)}
                      className={`p-3 cursor-pointer hover:bg-secondary/50 transition-colors ${
                        selectedId === item.id ? 'bg-secondary/80 border-l-2 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm line-clamp-1 pr-2">{item.title}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={(e) => handleDelete(item.id, e)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline" className="text-[9px] uppercase px-1">{item.type}</Badge>
                        <Badge variant={item.status === 'completed' ? 'success' : 'secondary'} className="text-[9px]">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Content Tabs */}
        <div className="md:col-span-3 h-full">
          {!selectedId ? (
             <Card className="h-full flex flex-col items-center justify-center border-dashed text-center p-8">
               <Video className="w-16 h-16 text-muted-foreground/30 mb-4" />
               <h3 className="text-xl font-semibold mb-2">Studio Canvas Empty</h3>
               <p className="text-muted-foreground max-w-sm">Generate new content or select a saved item to view its generated assets.</p>
             </Card>
          ) : isActiveLoading ? (
             <Card className="h-full flex items-center justify-center p-8">
               <div className="flex flex-col items-center gap-4">
                 <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                 <p className="text-muted-foreground font-mono text-sm">Loading studio assets...</p>
               </div>
             </Card>
          ) : activeContent ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b bg-muted/10 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="mb-2 uppercase text-[10px] tracking-wider">{activeContent.type}</Badge>
                    <CardTitle className="text-xl">{activeContent.title}</CardTitle>
                  </div>
                  <Badge variant="success">{activeContent.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                <Tabs defaultValue="script" className="flex-1 flex flex-col h-full">
                  <div className="border-b px-6 py-2 overflow-x-auto bg-muted/5">
                    <TabsList className="bg-transparent h-auto p-0 gap-4 justify-start">
                      <TabsTrigger value="outline" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2">Outline</TabsTrigger>
                      <TabsTrigger value="hook" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2">Hook</TabsTrigger>
                      <TabsTrigger value="script" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2">Full Script</TabsTrigger>
                      <TabsTrigger value="description" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2">Description</TabsTrigger>
                      <TabsTrigger value="seo" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2">SEO & Tags</TabsTrigger>
                      <TabsTrigger value="prompts" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2">Visual Prompts</TabsTrigger>
                    </TabsList>
                  </div>
                  <div className="flex-1 overflow-auto p-6">
                    <TabsContent value="outline" className="m-0 h-full">
                      {renderContentTab(activeContent.outline, "Outline")}
                    </TabsContent>
                    <TabsContent value="hook" className="m-0 h-full">
                      {renderContentTab(activeContent.hook, "Hook")}
                    </TabsContent>
                    <TabsContent value="script" className="m-0 h-full">
                      {renderContentTab(activeContent.script, "Script")}
                    </TabsContent>
                    <TabsContent value="description" className="m-0 h-full">
                      {renderContentTab(activeContent.description, "Description")}
                    </TabsContent>
                    <TabsContent value="seo" className="m-0 h-full space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-primary">SEO Title Options</h4>
                        {renderContentTab(activeContent.seoTitle, "Titles")}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-2 text-primary">Tags & Hashtags</h4>
                        <div className="bg-muted/30 border rounded-md p-4 font-mono text-sm">
                          <span className="block text-muted-foreground mb-1">Tags:</span>
                          <span className="block mb-4">{activeContent.tags}</span>
                          <span className="block text-muted-foreground mb-1">Hashtags:</span>
                          <span className="block text-primary">{activeContent.hashtags}</span>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="prompts" className="m-0 h-full space-y-6">
                       <div>
                        <h4 className="font-semibold text-sm mb-2 text-primary">Thumbnail Prompt</h4>
                        {renderContentTab(activeContent.thumbnailPrompt, "Thumbnail Prompt")}
                      </div>
                       <div>
                        <h4 className="font-semibold text-sm mb-2 text-primary">B-Roll / Image Prompts</h4>
                        {renderContentTab(activeContent.imagePrompt, "Image Prompts")}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
