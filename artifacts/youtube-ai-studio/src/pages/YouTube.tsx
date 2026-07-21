import React from "react";
import { 
  useGetChannelInfo,
  useGetYoutubeAnalytics,
  useListVideos
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlaySquare, TrendingUp, Users, Eye, Clock, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export default function YouTube() {
  const { data: channelInfo, isLoading: isChannelLoading } = useGetChannelInfo();
  const { data: analytics, isLoading: isAnalyticsLoading } = useGetYoutubeAnalytics();
  const { data: videos, isLoading: isVideosLoading } = useListVideos({ limit: 10 });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <PlaySquare className="w-8 h-8 text-[#FF0000]" />
            YouTube Studio
          </h1>
          <p className="text-muted-foreground mt-1">Live metrics and performance data directly from YouTube.</p>
        </div>
        <Button variant="outline">Open Native Studio</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-card to-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Channel Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold">{channelInfo?.channelName || "Channel"}</div>
              <Badge variant="success" className="bg-success/20 text-success border-success/30 font-mono">
                SCORE {channelInfo?.healthScore || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{(channelInfo?.subscribers || 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{(channelInfo?.totalViews || 0).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rev</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-success">${(channelInfo?.monthlyRevenue || 0).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">Recent Videos</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="keywords">Tracked Keywords</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Views Over Time (Last 28 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {isAnalyticsLoading ? (
                  <div className="h-full w-full flex items-center justify-center">Loading chart...</div>
                ) : analytics?.dailyStats && analytics.dailyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.dailyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorYtViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF0000" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FF0000" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      />
                      <Area type="monotone" dataKey="views" stroke="#FF0000" strokeWidth={3} fillOpacity={1} fill="url(#colorYtViews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                   <div className="h-full w-full flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
                     No chart data available
                   </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="videos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {videos?.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:border-primary/50 transition-all group">
                <div className="aspect-video bg-muted relative group-hover:opacity-90 transition-opacity">
                  {video.thumbnailUrl ? (
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlaySquare className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-xs font-mono">
                    {Math.floor((video.duration || 0)/60)}:{(video.duration || 0)%60 < 10 ? '0' : ''}{(video.duration || 0)%60}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold line-clamp-2 text-sm mb-3 group-hover:text-primary transition-colors">{video.title}</h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                    <span className="flex items-center"><Eye className="w-3 h-3 mr-1" /> {video.views.toLocaleString()}</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="competitors">
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              Competitor tracking UI would go here.
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="keywords">
           <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
              Keyword tracking UI would go here.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
