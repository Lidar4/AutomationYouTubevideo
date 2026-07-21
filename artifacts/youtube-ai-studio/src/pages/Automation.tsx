import React from "react";
import { 
  useListAutomationJobs,
  useGetAutomationLogs
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Cpu, Play, Settings, AlertCircle, Clock } from "lucide-react";

export default function Automation() {
  const { data: jobs, isLoading: isJobsLoading } = useListAutomationJobs({});
  const { data: logs, isLoading: isLogsLoading } = useGetAutomationLogs({ limit: 20 });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Cpu className="w-8 h-8 text-primary" />
            Automation Center
          </h1>
          <p className="text-muted-foreground mt-1">Manage scheduled jobs, webhooks, and background workers.</p>
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Active Jobs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isJobsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">Loading jobs...</TableCell>
                    </TableRow>
                  ) : jobs?.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs uppercase font-mono">{job.type}</Badge></TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{job.frequency}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}</TableCell>
                      <TableCell>
                        <Badge variant={job.status === 'active' ? 'success' : 'secondary'} className="text-[10px] uppercase">
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Play className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!jobs || jobs.length === 0) && !isJobsLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No active jobs configured.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="h-full">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Execution Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50 max-h-[600px] overflow-auto">
                {isLogsLoading ? (
                  <div className="p-4 text-center">Loading logs...</div>
                ) : logs?.map((log) => (
                  <div key={log.id} className="p-4 text-sm hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-semibold text-primary">{log.jobName}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {log.status === 'success' ? (
                        <div className="w-2 h-2 rounded-full bg-success" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-destructive" />
                      )}
                      <span className="text-muted-foreground line-clamp-2 leading-relaxed text-xs font-mono">
                        {log.message}
                      </span>
                    </div>
                  </div>
                ))}
                {(!logs || logs.length === 0) && !isLogsLoading && (
                  <div className="p-8 text-center text-muted-foreground text-sm">No execution logs available.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
