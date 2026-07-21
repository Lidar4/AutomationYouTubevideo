import React from "react";
import { 
  useGetDashboardSummary, 
  useGetTrendingTopics, 
  useGetTrendingKeywords, 
  useGetTodaysOpportunities, 
  useGetAiSuggestions, 
  useListDrafts, 
  useListSchedules, 
  useListVideos 
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { PlaySquare, Users, Eye, DollarSign, TrendingUp, Sparkles, Lightbulb, Clock, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: trendingTopics } = useGetTrendingTopics();
  const { data: opportunities } = useGetTodaysOpportunities();
  const { data: aiSuggestions } = useGetAiSuggestions();

  // Mock data for charts to ensure it always looks good for design
  const chartData = [
    { date: "Mon", views: 4000, revenue: 240 },
    { date: "Tue", views: 3000, revenue: 139 },
    { date: "Wed", views: 2000, revenue: 980 },
    { date: "Thu", views: 2780, revenue: 390 },
    { date: "Fri", views: 1890, revenue: 480 },
    { date: "Sat", views: 2390, revenue: 380 },
    { date: "Sun", views: 3490, revenue: 430 },
  ];

  if (isSummaryLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-1">Your AI-powered content empire overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-mono text-xs">
            <Clock className="w-4 h-4 mr-2" /> 
            Last updated: Just now
          </Button>
          <Button>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Daily Brief
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{(summary?.totalViews || 0).toLocaleString()}</div>
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{(summary?.totalSubscribers || 0).toLocaleString()}</div>
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +180 new today
            </p>
          </CardContent>
        </Card>
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">${(summary?.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-success flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5 hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Content Score</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-mono">{summary?.contentScore || 85}/100</div>
            <p className="text-xs text-primary/80 mt-1">
              Optimized based on active pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        <Card className="md:col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Views and revenue for the past 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 flex-1">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-warning" />
              Today's Opportunities
            </CardTitle>
            <CardDescription>AI-detected high-potential topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunities?.slice(0, 4).map((opp) => (
                <div key={opp.id} className="flex flex-col gap-2 p-3 rounded-md bg-secondary/30 border border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm line-clamp-1">{opp.title}</h4>
                    <Badge variant={opp.priority === 'High' ? 'warning' : 'default'} className="text-[10px] px-1.5 py-0">
                      {opp.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                    <span>Est. {opp.estimatedViews.toLocaleString()} views</span>
                    <span>Diff: {opp.difficulty}</span>
                  </div>
                </div>
              ))}
              {(!opportunities || opportunities.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No opportunities found today.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendingTopics?.slice(0, 5).map((topic, i) => (
                <div key={topic.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded bg-secondary text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{topic.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{topic.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="font-mono text-success bg-success/10 border-success/20">+{topic.growth}%</Badge>
                    <span className="text-xs text-muted-foreground font-mono">{topic.searchVolume} vol</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSuggestions?.slice(0, 5).map((suggestion) => (
                <div key={suggestion.id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{suggestion.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{suggestion.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
