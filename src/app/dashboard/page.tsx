import { getSessionServer } from "@/lib/session";
import dbConnect from "@/lib/mongodb";
import WarrantyCard from "@/models/WarrantyCard";
import ActivityLog from "@/models/ActivityLog";
import Template from "@/models/Template";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  FolderHeart, 
  Activity, 
  Plus, 
  TrendingUp, 
  ArrowUpRight,
  Star,
  ArrowRight,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 0; // Fetch fresh data on every request

export default async function DashboardPage() {
  const session = await getSessionServer();
  if (!session || !session.user) {
    redirect("/login");
  }

  await dbConnect();

  const query: any = {};
  if (session.user.role !== "admin") {
    query.createdBy = session.user.id;
  }

  // Fetch all user cards to compute statistics on the server side
  const cards = await WarrantyCard.find(query).sort({ createdAt: -1 }).lean();
  const recentCards = cards.slice(0, 5);

  // Stats computation
  const total = cards.length;
  const now = new Date();
  let active = 0;
  let averageYears = 0;
  const materials: Record<string, number> = {};

  cards.forEach((card: any) => {
    const issueDate = new Date(card.date);
    const expiryDate = new Date(issueDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + card.warrantyYears);
    
    if (expiryDate > now) {
      active++;
    }
    
    averageYears += card.warrantyYears;
    materials[card.materialType] = (materials[card.materialType] || 0) + 1;
  });

  const avgWarranty = total > 0 ? (averageYears / total).toFixed(1) : "0";
  const expired = total - active;

  // Group materials for a list view
  const materialList = Object.entries(materials)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Fetch activity logs
  const logQuery: any = {};
  if (session.user.role !== "admin") {
    logQuery.userId = session.user.id;
  }
  const recentLogs = await ActivityLog.find(logQuery)
    .sort({ timestamp: -1 })
    .limit(5)
    .lean();

  // Fetch default templates for this user
  const defaultTemplateQuery: any = { isDefault: true };
  if (session.user.role !== "admin") {
    defaultTemplateQuery.createdBy = session.user.id;
  }
  const defaultTemplates = await Template.find(defaultTemplateQuery)
    .sort({ updatedAt: -1 })
    .lean();

  // Create monthly trends statistics for last 6 months
  const monthlyData: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toLocaleString("default", { month: "short" });
    monthlyData[monthKey] = 0;
  }

  cards.forEach((card: any) => {
    const cardDate = new Date(card.createdAt || card.date);
    const monthKey = cardDate.toLocaleString("default", { month: "short" });
    if (monthKey in monthlyData) {
      monthlyData[monthKey] += 1;
    }
  });

  const trendEntries = Object.entries(monthlyData);
  const maxTrendVal = Math.max(...trendEntries.map(([, val]) => val), 1);

  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-dent-blue-900/10 to-dent-green-500/5 border border-slate-200/50 dark:border-slate-800/30 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Greetings, {session.user.name}!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
            Welcome to the certificate management dashboard for <span className="font-bold text-dent-blue-500">{session.user.labName || "32 Dental Design"}</span>.
          </p>
        </div>
        <Link href="/dashboard/cards/create">
          <Button className="gap-2 shadow-md">
            <Plus className="w-4.5 h-4.5" />
            Generate Warranty Card
          </Button>
        </Link>
      </div>

      {/* Default Templates Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold tracking-wide">Default Templates</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">· Pinned Presets</span>
          </div>
          <Link href="/dashboard/templates" className="text-xs font-bold text-dent-blue-500 hover:text-dent-blue-600 flex items-center gap-1 group">
            Manage Templates
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {defaultTemplates.length === 0 ? (
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-dashed border-amber-300/50 dark:border-amber-800/40 bg-amber-50/30 dark:bg-amber-950/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No default templates pinned</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Star a template to pin it here for quick access.</p>
              </div>
            </div>
            <Link href="/dashboard/templates">
              <Button size="sm" variant="outline" className="text-xs border-amber-300/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 shrink-0">
                Go to Templates
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(defaultTemplates as any[]).map((tmpl) => (
              <div
                key={tmpl._id.toString()}
                className="group relative glass-panel rounded-2xl border-2 border-amber-300/50 dark:border-amber-700/30 bg-amber-50/20 dark:bg-amber-950/5 overflow-hidden shadow-sm hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Amber top accent line */}
                <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-amber-500" />

                {/* Mini visual preview */}
                <div
                  className="relative h-20 overflow-hidden flex items-end"
                  style={{ backgroundColor: tmpl.layoutFront === 'modern' ? '#020617' : '#f1f5f9' }}
                >
                  {tmpl.cardBgImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tmpl.cardBgImage} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />
                  )}
                  {(tmpl.layoutFront === 'default' || tmpl.layoutFront === 'modern') && (
                    <svg className="absolute bottom-0 right-0 w-16 h-16 z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 100 0 Q 30 30 0 100 L 100 100 Z" fill={tmpl.layoutFront === 'modern' ? '#020617' : '#e2e8f0'} opacity="0.8" />
                      <path d="M 100 -3 Q 27 27 -3 100" fill="none" stroke={tmpl.primaryColor || '#0f52ba'} strokeWidth="3.5" />
                    </svg>
                  )}
                  {tmpl.layoutFront === 'classic' && (
                    <div className="absolute inset-1.5 border-2 border-double rounded z-10" style={{ borderColor: tmpl.primaryColor || '#0f52ba', opacity: 0.6 }} />
                  )}
                  <div className="relative z-10 p-3 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-widest leading-none" style={{ color: tmpl.layoutFront === 'modern' ? '#fff' : '#0f172a' }}>
                        {tmpl.name}
                      </span>
                      <div className="w-3 h-3 rounded-full border-2 border-white/40 shadow-sm" style={{ backgroundColor: tmpl.primaryColor || '#0f52ba' }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Default Preset</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase tracking-wider block">Font</span>
                      <span className="font-bold text-slate-600 dark:text-slate-400 capitalize">{tmpl.fontStyle || 'inter'}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase tracking-wider block">Layout</span>
                      <span className="font-bold text-slate-600 dark:text-slate-400 capitalize">{tmpl.layoutFront || 'default'}</span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/cards/create?templateId=${tmpl._id.toString()}`}
                    className="flex items-center justify-center gap-1.5 w-full mt-1 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-200/60 dark:border-amber-800/30 transition-colors group/use"
                  >
                    Use This Template
                    <ArrowRight className="w-3 h-3 group-hover/use:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Issued</span>
            <h3 className="text-2xl font-extrabold tracking-tight">{total}</h3>
            <p className="text-[10px] text-slate-500">Warranty Certificates</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-dent-blue-500/10 text-dent-blue-500 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Active Warranties</span>
            <h3 className="text-2xl font-extrabold tracking-tight text-emerald-500">{active}</h3>
            <p className="text-[10px] text-slate-500">Currently Valid</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Avg Duration</span>
            <h3 className="text-2xl font-extrabold tracking-tight">{avgWarranty}</h3>
            <p className="text-[10px] text-slate-500">Years Coverage</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850/50 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Expired Cards</span>
            <h3 className="text-2xl font-extrabold tracking-tight text-rose-500">{expired}</h3>
            <p className="text-[10px] text-slate-500">Warranty Term Ended</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <FolderHeart className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts / Lists Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Graph */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850/50 flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm tracking-wide">Issuance Activity Trend</h4>
              <p className="text-[10px] text-slate-400">Volume of warranty cards generated monthly</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Realtime Sync</span>
            </div>
          </div>

          {/* Simple responsive SVG monthly bar chart */}
          <div className="h-44 flex items-end justify-between gap-4 mt-2 px-2">
            {trendEntries.map(([month, count]) => {
              const pct = (count / maxTrendVal) * 100;
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="relative w-full h-32 flex items-end justify-center">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold py-0.5 px-1.5 rounded shadow pointer-events-none">
                      {count} Cards
                    </div>
                    {/* Bar */}
                    <div 
                      style={{ height: `${Math.max(pct, 5)}%` }}
                      className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-dent-blue-600 to-dent-blue-400 dark:from-dent-blue-700 dark:to-dent-blue-500 shadow-md group-hover:from-dent-green-500 group-hover:to-dent-green-400 transition-all duration-300"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200">
                    {month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Material Distribution Summary */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850/50 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm tracking-wide mb-1">Top Materials</h4>
            <p className="text-[10px] text-slate-400 mb-4">Preferred crown/bridge restoration materials</p>
            
            <div className="space-y-4">
              {materialList.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-semibold">
                  No materials data yet.
                </div>
              ) : (
                materialList.map((m, idx) => {
                  const pct = total > 0 ? (m.count / total) * 100 : 0;
                  return (
                    <div key={m.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="truncate max-w-[130px]">{m.name}</span>
                        <span className="text-slate-400 font-bold">{m.count} Cards</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                        <div 
                          style={{ width: `${pct}%` }} 
                          className={`h-full rounded-full bg-gradient-to-r ${
                            idx === 0 
                              ? "from-dent-blue-500 to-dent-blue-400" 
                              : idx === 1 
                              ? "from-emerald-500 to-emerald-400" 
                              : "from-purple-500 to-purple-400"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <Link href="/dashboard/cards" className="text-xs font-bold text-dent-blue-500 hover:text-dent-blue-600 flex items-center gap-1 group mt-4">
            View all card listings
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Recents Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent cards list */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm tracking-wide">Recently Created Cards</h4>
            <Link href="/dashboard/cards" className="text-xs font-bold text-slate-400 hover:text-slate-300">
              Show all
            </Link>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/40 dark:border-slate-900/40 text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                  <th className="pb-3">Job ID</th>
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Doctor</th>
                  <th className="pb-3">Material</th>
                  <th className="pb-3">Issued</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/10 dark:divide-slate-900/10 text-xs">
                {recentCards.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No warranty cards created yet.{" "}
                      <Link href="/dashboard/cards/create" className="text-dent-blue-500 hover:underline">
                        Create one now.
                      </Link>
                    </td>
                  </tr>
                ) : (
                  recentCards.map((card: any) => (
                    <tr key={card._id.toString()} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="py-3 font-mono font-bold text-dent-blue-500">
                        <Link href={`/dashboard/cards?search=${card.jobId}`} className="hover:underline">
                          {card.jobId}
                        </Link>
                      </td>
                      <td className="py-3 font-semibold">{card.patientName}</td>
                      <td className="py-3 font-medium text-slate-500">{card.doctorName}</td>
                      <td className="py-3 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 font-semibold">
                          {card.materialType}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {new Date(card.createdAt || card.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity audit feed */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850/50">
          <h4 className="font-bold text-sm tracking-wide mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            Audit Action Feed
          </h4>
          
          <div className="space-y-4">
            {recentLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-semibold">
                No activity logged yet.
              </div>
            ) : (
              recentLogs.map((log: any) => (
                <div key={log._id.toString()} className="flex items-start gap-3 text-xs leading-normal">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {log.action}
                    </p>
                    <p className="text-[10px] text-slate-450 mt-0.5 leading-snug">
                      {log.details}
                    </p>
                    <span className="text-[8px] text-slate-500 font-bold block mt-0.5 uppercase tracking-wide">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
