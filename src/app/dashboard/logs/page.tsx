"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Activity, ShieldCheck, Terminal, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/warranty/activity-logs");
        const json = await res.json();
        
        if (!res.ok) {
          throw new Error(json.error || "Failed to load audit logs");
        }
        
        setLogs(json.data);
      } catch (err: any) {
        toast({
          title: "Audit Error",
          description: err.message || "Failed to retrieve activity feed.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [toast]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-450 uppercase tracking-widest font-bold">Security Audit</p>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white mt-1 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
          System Activity Logs
        </h2>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/80 text-xs leading-normal">
        <ShieldCheck className="w-5 h-5 text-dent-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Compliance Logging Activated</p>
          <p className="text-slate-500 dark:text-slate-400">
            For medical device traceability (crowns/prostheses), all creations, updates, and removals of warranty certifications are automatically recorded along with the initiating operator, timestamp, and client IP address.
          </p>
        </div>
      </div>

      {/* Logs Table Card */}
      <Card>
        <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200/40 dark:border-slate-800/30">
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="w-4.5 h-4.5 text-dent-blue-500" />
            Audit History
          </CardTitle>
          <CardDescription>
            Showing the 100 most recent operations scoped for your laboratory workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200/30 dark:border-slate-900/30 text-[9px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50/20 dark:bg-slate-950/10">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Operator</th>
                  <th className="p-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/10 dark:divide-slate-900/10 text-xs">
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="p-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                      <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 font-semibold">
                      No activity logs found for this account.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="p-4 font-bold text-slate-400 font-mono">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                          log.action === "Created Card"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : log.action === "Updated Card"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : log.action === "Deleted Card"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-350 font-medium font-sans">
                        {log.details}
                      </td>
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                        {log.userName}
                      </td>
                      <td className="p-4 text-right text-slate-400 font-mono font-bold">
                        {log.ipAddress || "::1"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
