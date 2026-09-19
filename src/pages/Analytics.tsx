import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { ArrowLeft, Users, Zap, Copy, TrendingUp, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const ADMIN_PASSWORD = "autoposter-admin-2024";
const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

type AnalyticsEvent = {
  id: string;
  event_name: string;
  license_key_hash: string | null;
  tier: string | null;
  platform: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const Analytics = () => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("7d");

  const login = () => {
    if (password === ADMIN_PASSWORD) setAuthed(true);
  };

  useEffect(() => {
    if (!authed) return;
    fetchEvents();
  }, [authed, range]);

  const fetchEvents = async () => {
    setLoading(true);
    const days = range === "24h" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const since = new Date(Date.now() - days * 86400000).toISOString();

    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (!error && data) setEvents(data as AnalyticsEvent[]);
    setLoading(false);
  };

  const stats = useMemo(() => {
    const uniqueUsers = new Set(events.filter(e => e.license_key_hash).map(e => e.license_key_hash)).size;
    const opens = events.filter(e => e.event_name === "extension_opened").length;
    const analyses = events.filter(e => e.event_name === "ai_analysis_started").length;
    const completed = events.filter(e => e.event_name === "ai_analysis_completed").length;
    const failed = events.filter(e => e.event_name === "ai_analysis_failed").length;
    const copies = events.filter(e => e.event_name === "listing_copied").length;
    const uploads = events.filter(e => e.event_name === "photos_uploaded").length;
    const upgradeClicks = events.filter(e => e.event_name === "upgrade_clicked").length;
    const limitsHit = events.filter(e => e.event_name === "limit_reached").length;

    return { uniqueUsers, opens, analyses, completed, failed, copies, uploads, upgradeClicks, limitsHit };
  }, [events]);

  const funnelData = useMemo(() => [
    { name: "Opened", value: stats.opens },
    { name: "Photos", value: stats.uploads },
    { name: "AI Started", value: stats.analyses },
    { name: "AI Done", value: stats.completed },
    { name: "Copied", value: stats.copies },
  ], [stats]);

  const tierData = useMemo(() => {
    const tiers: Record<string, number> = {};
    events.forEach(e => {
      const t = e.tier || "unknown";
      tiers[t] = (tiers[t] || 0) + 1;
    });
    return Object.entries(tiers).map(([name, value]) => ({ name, value }));
  }, [events]);

  const dailyData = useMemo(() => {
    const days: Record<string, { opens: number; analyses: number; copies: number }> = {};
    events.forEach(e => {
      const day = e.created_at.split("T")[0];
      if (!days[day]) days[day] = { opens: 0, analyses: 0, copies: 0 };
      if (e.event_name === "extension_opened") days[day].opens++;
      if (e.event_name === "ai_analysis_started") days[day].analyses++;
      if (e.event_name === "listing_copied") days[day].copies++;
    });
    return Object.entries(days)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({ date: date.slice(5), ...d }));
  }, [events]);

  const platformData = useMemo(() => {
    const platforms: Record<string, number> = {};
    events.filter(e => e.event_name === "listing_copied" && e.platform).forEach(e => {
      platforms[e.platform!] = (platforms[e.platform!] || 0) + 1;
    });
    return Object.entries(platforms).map(([name, value]) => ({ name, value }));
  }, [events]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader><CardTitle>Admin Analytics</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && login()}
              placeholder="Admin wachtwoord"
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            />
            <Button onClick={login} className="w-full">Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Autoposter Analytics</h1>
          </div>
          <div className="flex items-center gap-2">
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 uur</SelectItem>
                <SelectItem value="7d">7 dagen</SelectItem>
                <SelectItem value="30d">30 dagen</SelectItem>
                <SelectItem value="90d">90 dagen</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchEvents} disabled={loading}>
              {loading ? "Laden..." : "Ververs"}
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard icon={<Users className="w-4 h-4" />} label="Unieke gebruikers" value={stats.uniqueUsers} />
          <StatCard icon={<Zap className="w-4 h-4" />} label="AI Analyses" value={stats.completed} sub={`${stats.failed} gefaald`} />
          <StatCard icon={<Copy className="w-4 h-4" />} label="Listings gekopieerd" value={stats.copies} />
          <StatCard icon={<ArrowUpRight className="w-4 h-4" />} label="Upgrade clicks" value={stats.upgradeClicks} />
          <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Limiet bereikt" value={stats.limitsHit} />
        </div>

        {/* Funnel */}
        <Card>
          <CardHeader><CardTitle className="text-base">Conversie Funnel</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Daily Activity */}
          <Card>
            <CardHeader><CardTitle className="text-base">Dagelijkse Activiteit</CardTitle></CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="opens" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Opens" />
                    <Line type="monotone" dataKey="analyses" stroke="#10b981" strokeWidth={2} dot={false} name="Analyses" />
                    <Line type="monotone" dataKey="copies" stroke="#f59e0b" strokeWidth={2} dot={false} name="Copies" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tier Distribution */}
          <Card>
            <CardHeader><CardTitle className="text-base">Tier Verdeling</CardTitle></CardHeader>
            <CardContent>
              <div className="h-56 flex items-center justify-center">
                {tierData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={tierData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                        {tierData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-sm">Geen data</p>}
              </div>
            </CardContent>
          </Card>

          {/* Platform Usage */}
          <Card>
            <CardHeader><CardTitle className="text-base">Platform Gebruik</CardTitle></CardHeader>
            <CardContent>
              <div className="h-56">
                {platformData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={platformData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {platformData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-sm">Geen data</p>}
              </div>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardHeader><CardTitle className="text-base">Recente Events</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {events.slice(0, 20).map(e => (
                  <div key={e.id} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{e.event_name}</span>
                      {e.tier && <span className="text-xs text-muted-foreground">{e.tier}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString("nl-NL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                ))}
                {events.length === 0 && <p className="text-muted-foreground text-sm">Geen events gevonden</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub?: string }) => (
  <Card>
    <CardContent className="pt-4 pb-3 px-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </CardContent>
  </Card>
);

export default Analytics;
