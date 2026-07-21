import React, { useState } from "react";
import { 
  useListApiSettings,
  useUpsertApiSetting
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings2, Key, CheckCircle2, AlertCircle, Bot, Youtube, Search, Image, Mic, Video, Layers, Cpu, Globe } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Provider configs for the UI mapping
const PROVIDERS = [
  { id: 'openai', label: 'OpenAI', icon: Bot, color: 'text-emerald-400' },
  { id: 'youtube', label: 'YouTube API', icon: Youtube, color: 'text-red-500' },
  { id: 'youtube_analytics', label: 'YouTube Analytics', icon: Search, color: 'text-red-400' },
  { id: 'google_oauth', label: 'Google OAuth', icon: Globe, color: 'text-blue-400' },
  { id: 'elevenlabs', label: 'ElevenLabs Voice', icon: Mic, color: 'text-purple-400' },
  { id: 'runway', label: 'Runway ML', icon: Video, color: 'text-pink-400' },
  { id: 'luma', label: 'Luma AI', icon: Layers, color: 'text-cyan-400' },
  { id: 'google_veo', label: 'Google Veo', icon: Cpu, color: 'text-blue-300' },
  { id: 'image_generation', label: 'Image Generation', icon: Image, color: 'text-amber-400' },
];

export default function ApiSettings() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: settings, isLoading } = useListApiSettings();
  const upsertSetting = useUpsertApiSetting();

  const handleSave = () => {
    if (!selectedProvider || !apiKey.trim()) return;
    
    upsertSetting.mutate({ provider: selectedProvider, data: { apiKey } }, {
      onSuccess: () => {
        toast({ title: "API Key saved successfully" });
        setSelectedProvider(null);
        setApiKey("");
        queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      }
    });
  };

  const isConfigured = (providerId: string) => {
    return settings?.some(s => s.provider === providerId && s.isConfigured) || false;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Key className="w-8 h-8 text-primary" />
          API Configuration Center
        </h1>
        <p className="text-muted-foreground mt-1">Connect the external services that power the autonomous studio.</p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading configurations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PROVIDERS.map((provider) => {
            const Icon = provider.icon;
            const configured = isConfigured(provider.id);
            
            return (
              <Card 
                key={provider.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => {
                  setSelectedProvider(provider.id);
                  setApiKey("");
                }}
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 rounded-full bg-secondary flex items-center justify-center ${provider.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{provider.label}</h3>
                    {configured ? (
                      <Badge variant="success" className="bg-success/20 text-success border-success/30 font-mono text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Configured
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="bg-warning/20 text-warning border-warning/30 font-mono text-[10px]">
                        <AlertCircle className="w-3 h-3 mr-1" /> Configuration Required
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedProvider} onOpenChange={(open) => !open && setSelectedProvider(null)}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Configure {PROVIDERS.find(p => p.id === selectedProvider)?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key / Credential</label>
              <Input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..." 
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Keys are encrypted before storage and never displayed again.</p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setSelectedProvider(null)}>Cancel</Button>
              <Button onClick={handleSave} disabled={upsertSetting.isPending || !apiKey.trim()}>
                {upsertSetting.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
