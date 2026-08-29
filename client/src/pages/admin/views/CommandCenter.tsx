import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useFetch } from "../../../hooks/useApi";
import {
  AlertTriangle,
  Map,
  Users,
  FileText,
  Activity,
  ShieldAlert,
  XCircle,
  Database,
  CheckCircle,
  Navigation,
  Radio,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DisasterMap from "../../../components/maps/DisasterMap";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";

export default function CommandCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<any>({});
  const [activeIncidents, setActiveIncidents] = useState<any[]>([]);
  const [openShelters, setOpenShelters] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);

  // Data for dispatch modal
  const { data: volsData } = useFetch<any>("/volunteers");
  const volunteers = volsData?.volunteers || [];

  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [alertForm, setAlertForm] = useState({
    title: "",
    description: "",
    severity: "HIGH",
    disasterType: "Flood",
    radius: 10,
    latitude: 13.0,
    longitude: 80.2,
    expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16),
  });
  const [incidentForm, setIncidentForm] = useState({
    title: "",
    description: "",
    severity: "HIGH",
    disasterType: "Flood",
    status: "ACTIVE",
    latitude: 13.0,
    longitude: 80.2,
    affectedArea: 10,
  });
  const [dispatchForm, setDispatchForm] = useState({
    title: "",
    description: "",
    volunteerId: "",
    priority: "HIGH",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, incRes, shelRes, reqRes, alertRes] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/incidents"),
        api.get("/shelters"),
        api.get("/assistance"),
        api.get("/alerts"),
      ]);
      setSummary(sumRes.data || {});

      const incs = incRes.data.incidents || [];
      setActiveIncidents(incs.filter((i: any) => i.status !== "RESOLVED"));

      const shels = shelRes.data.shelters || [];
      setOpenShelters(shels.filter((s: any) => s.status === "OPEN"));

      const reqs = reqRes.data.requests || [];
      setPendingRequests(
        reqs.filter(
          (r: any) => r.status === "PENDING" || r.status === "ASSIGNED",
        ),
      );

      const alts = alertRes.data.alerts || [];
      setAlerts(alts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    let s: any = null;
    import("../../../services/socket").then(({ socketService }) => {
      s = socketService.connect();
      s?.on("incident:created", fetchData);
      s?.on("alert:created", fetchData);
      s?.on("assistance:created", fetchData);
      s?.on("assistance:updated", fetchData);
    });
    return () => {
      if (s) {
        s.off("incident:created");
        s.off("alert:created");
        s.off("assistance:created");
        s.off("assistance:updated");
      }
    };
  }, []);

  // Submit Handlers
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/alerts", alertForm);
      setAlertModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/incidents", incidentForm);
      setIncidentModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/tasks", dispatchForm);
      setDispatchModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && Object.keys(summary).length === 0) {
    return (
      <div className="p-8 flex justify-center items-center h-full text-muted-foreground animate-pulse">
        Initializing EOC Systems...
      </div>
    );
  }

  const criticalAlertsCount = alerts.filter(
    (a) => a.severity === "CRITICAL",
  ).length;
  const criticalRequestsCount = pendingRequests.filter(
    (r) => r.priority === "CRITICAL" || r.priority === "HIGH",
  ).length;

  return (
    <div className="p-4 md:p-6  space-y-6 pb-20">
      {/* SYSTEM STATUS BAR */}
      <div className="bg-card border border-border rounded-lg px-4 py-2 flex flex-wrap gap-4 items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground">
        <div className="flex items-center gap-6">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-brand-emerald/100 mr-2 animate-pulse"></div>
            Database Live
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-brand-emerald/100 mr-2 animate-pulse"></div>
            Realtime Comms
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-brand-emerald/100 mr-2 animate-pulse"></div>
            Weather Integrations
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          <span>EOC ACTIVE</span>
        </div>
      </div>

      {/* CRITICAL METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          className="bg-card border border-border rounded-xl p-4 shadow-lg flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => navigate("/admin/alerts")}
        >
          <div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">
              Critical Alerts
            </p>
            <h3
              className={`text-3xl font-bold ${criticalAlertsCount > 0 ? "text-brand-red" : "text-foreground"}`}
            >
              {criticalAlertsCount}
            </h3>
          </div>
          <div
            className={`p-3 rounded-full ${criticalAlertsCount > 0 ? "bg-brand-red/10 text-brand-red" : "bg-slate-100 text-muted-foreground"}`}
          >
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div
          className="bg-card border border-border rounded-xl p-4 shadow-lg flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => navigate("/admin/incidents")}
        >
          <div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">
              Active Incidents
            </p>
            <h3 className="text-3xl font-bold text-brand-amber">
              {summary.totalIncidents || activeIncidents.length || 0}
            </h3>
          </div>
          <div className="p-3 rounded-full bg-brand-amber/10 text-brand-amber">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div
          className="bg-card border border-border rounded-xl p-4 shadow-lg flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => navigate("/admin/shelters")}
        >
          <div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">
              Open Shelters
            </p>
            <h3 className="text-3xl font-bold text-brand-aqua">
              {summary.totalShelters || openShelters.length || 0}
            </h3>
          </div>
          <div className="p-3 rounded-full bg-brand-aqua/10 text-brand-aqua">
            <Map className="w-6 h-6" />
          </div>
        </div>

        <div
          className="bg-card border border-border rounded-xl p-4 shadow-lg flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => navigate("/admin/volunteers")}
        >
          <div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">
              Volunteers
            </p>
            <h3 className="text-3xl font-bold text-brand-emerald">
              {summary.totalVolunteers || volunteers.length || 0}
            </h3>
          </div>
          <div className="p-3 rounded-full bg-brand-emerald/10 text-brand-emerald">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div
          className="bg-card border border-border rounded-xl p-4 shadow-lg flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => navigate("/admin/assistance")}
        >
          <div>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">
              Pending Requests
            </p>
            <h3
              className={`text-3xl font-bold ${criticalRequestsCount > 0 ? "text-brand-amber" : "text-foreground"}`}
            >
              {pendingRequests.length}
            </h3>
          </div>
          <div className="p-3 rounded-full bg-brand-amber/10 text-brand-amber">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT/MAIN: LIVE OPERATIONAL MAP */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="bg-card rounded-xl border border-border overflow-hidden flex flex-col shadow-lg">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background">
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center">
                <Radio className="w-4 h-4 mr-2 text-brand-red animate-pulse" />
                Live Operational Map
              </h2>
              <div className="flex gap-2">
                <span className="text-[10px] bg-brand-red/10 border border-brand-red/30 text-red-400 px-2 py-0.5 rounded flex items-center">
                  <span className="w-2 h-2 rounded-full bg-brand-red/100 mr-1"></span>
                  Alerts
                </span>
                <span className="text-[10px] bg-brand-amber/10 border border-orange-900 text-orange-400 px-2 py-0.5 rounded flex items-center">
                  <span className="w-2 h-2 rounded-full bg-brand-amber/100 mr-1"></span>
                  Incidents
                </span>
                <span className="text-[10px] bg-brand-aqua/10 border border-blue-900 text-blue-400 px-2 py-0.5 rounded flex items-center">
                  <span className="w-2 h-2 rounded-full bg-brand-indigo/100 mr-1"></span>
                  Shelters
                </span>
              </div>
            </div>
            <div className="flex-1 min-h-[500px] relative bg-slate-50">
              <DisasterMap
                shelters={openShelters}
                incidents={activeIncidents}
                requests={pendingRequests}
                alerts={alerts}
                centerLoc={[13.0827, 80.2707]} // Fallback center for admin view if no user loc is available
                zoom={11}
              />
            </div>
          </section>

          {/* CRITICAL RESPONSE QUEUE */}
          <section className="bg-card rounded-xl border border-border overflow-hidden shadow-lg">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background">
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-brand-amber" />
                Critical Response Queue
              </h2>
              <Button
                variant="link"
                size="sm"
                className="text-blue-400 p-0 h-auto"
                onClick={() => navigate("/admin/assistance")}
              >
                Manage Queue
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-background text-muted-foreground text-xs uppercase border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Citizen</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {pendingRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        <CheckCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        No pending requests in the queue.
                      </td>
                    </tr>
                  ) : (
                    pendingRequests.slice(0, 5).map((req: any) => (
                      <tr
                        key={req.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {req.citizen?.name || "Unknown Citizen"}
                        </td>
                        <td className="px-4 py-3">{req.requestType}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                              req.priority === "CRITICAL"
                                ? "bg-brand-red/10 border-brand-red/30 text-brand-red"
                                : req.priority === "HIGH"
                                  ? "bg-brand-amber/10 border-orange-900 text-brand-amber"
                                  : "bg-brand-aqua/10 border-blue-900 text-blue-400"
                            }`}
                          >
                            {req.priority || "HIGH"}
                          </span>
                        </td>
                        <td className="px-4 py-3 truncate max-w-[150px] text-xs">
                          {req.location
                            ?.split(",")
                            .map((c: string) => parseFloat(c).toFixed(3))
                            .join(", ")}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-border bg-slate-50 text-foreground">
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {req.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-blue-800 text-blue-400 hover:bg-brand-aqua/10"
                              onClick={() => {
                                setDispatchForm({
                                  ...dispatchForm,
                                  priority: req.priority || "HIGH",
                                  description: `Request: ${req.requestType}`,
                                  title: `Dispatch for ${req.citizen?.name}`,
                                });
                                setDispatchModalOpen(true);
                              }}
                            >
                              Dispatch
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: QUICK COMMANDS & ACTIVE INCIDENTS */}
        <div className="space-y-6 flex flex-col">
          {/* QUICK COMMANDS */}
          <section className="bg-card rounded-xl border border-border overflow-hidden shadow-lg">
            <div className="p-4 border-b border-border bg-background">
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center">
                <Navigation className="w-4 h-4 mr-2 text-brand-aqua" />
                Quick Commands
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <Button
                onClick={() => setAlertModalOpen(true)}
                className="w-full justify-start bg-red-700 hover:bg-brand-red text-white shadow-md border border-red-600"
              >
                <ShieldAlert className="w-4 h-4 mr-2 text-red-200" /> Broadcast
                Critical Alert
              </Button>
              <Button
                onClick={() => setIncidentModalOpen(true)}
                className="w-full justify-start bg-card border border-border hover:bg-slate-100 text-foreground shadow-sm"
              >
                <Activity className="w-4 h-4 mr-2 text-orange-400" /> Log New
                Incident
              </Button>
              <Button
                onClick={() => setDispatchModalOpen(true)}
                className="w-full justify-start bg-card border border-border hover:bg-slate-100 text-foreground shadow-sm"
              >
                <Users className="w-4 h-4 mr-2 text-blue-400" /> Dispatch
                Volunteers
              </Button>
            </div>
          </section>

          {/* ACTIVE INCIDENTS */}
          <section className="bg-card rounded-xl border border-border overflow-hidden shadow-lg flex-1 flex flex-col max-h-[500px]">
            <div className="p-4 border-b border-border bg-background flex justify-between items-center">
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center">
                <Activity className="w-4 h-4 mr-2 text-brand-amber" />
                Active Incidents Log
              </h2>
              <Button
                variant="link"
                size="sm"
                className="text-blue-400 p-0 h-auto"
                onClick={() => navigate("/admin/incidents")}
              >
                View All
              </Button>
            </div>
            <div className="divide-y divide-border overflow-y-auto flex-1">
              {activeIncidents.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                  <CheckCircle className="w-8 h-8 text-muted-foreground mb-2" />
                  No active incidents.
                </div>
              ) : (
                activeIncidents.map((incident: any) => (
                  <div
                    key={incident.id}
                    className="p-4 hover:bg-slate-50/50 cursor-pointer transition-colors"
                    onClick={() => navigate("/admin/incidents")}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-foreground text-sm line-clamp-1 mr-2">
                        {incident.title}
                      </span>
                      <span
                        className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                          incident.severity === "CRITICAL"
                            ? "bg-brand-red/10 border-brand-red/30 text-brand-red"
                            : incident.severity === "HIGH"
                              ? "bg-brand-amber/10 border-orange-900 text-brand-amber"
                              : "bg-brand-aqua/10 border-blue-900 text-blue-400"
                        }`}
                      >
                        {incident.severity || "HIGH"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1 flex items-center">
                      <span className="text-foreground font-medium mr-1">
                        {incident.type || "Emergency"}
                      </span>
                      <span className="mx-1">•</span>
                      <span className="truncate">
                        {incident.location || "Location unverified"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {incident.description}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Create Alert */}
      {alertModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-background flex justify-between items-center">
              <h3 className="font-bold text-lg text-foreground flex items-center">
                <ShieldAlert className="mr-2 text-brand-red h-5 w-5" />{" "}
                Broadcast Alert
              </h3>
              <button
                onClick={() => setAlertModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateAlert} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Title
                </label>
                <input
                  required
                  type="text"
                  className="w-full rounded-md border border-border bg-background text-foreground p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={alertForm.title}
                  onChange={(e) =>
                    setAlertForm({ ...alertForm, title: e.target.value })
                  }
                  placeholder="e.g. Flash Flood Warning"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  required
                  className="w-full rounded-md border border-border bg-background text-foreground p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  value={alertForm.description}
                  onChange={(e) =>
                    setAlertForm({ ...alertForm, description: e.target.value })
                  }
                  placeholder="Provide detailed instructions..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Severity
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background text-foreground p-2 text-sm"
                    value={alertForm.severity}
                    onChange={(e) =>
                      setAlertForm({ ...alertForm, severity: e.target.value })
                    }
                  >
                    <option>CRITICAL</option>
                    <option>HIGH</option>
                    <option>MODERATE</option>
                    <option>LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Type
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background text-foreground p-2 text-sm"
                    value={alertForm.disasterType}
                    onChange={(e) =>
                      setAlertForm({
                        ...alertForm,
                        disasterType: e.target.value,
                      })
                    }
                  >
                    <option>Flood</option>
                    <option>Earthquake</option>
                    <option>Cyclone</option>
                    <option>Fire</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-red-700 hover:bg-brand-red text-white mt-2"
                disabled={submitting}
              >
                {submitting ? "Broadcasting..." : "Broadcast Alert Now"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Create Incident */}
      {incidentModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-background flex justify-between items-center">
              <h3 className="font-bold text-lg text-foreground flex items-center">
                <Activity className="mr-2 text-brand-amber h-5 w-5" /> Log
                Incident
              </h3>
              <button
                onClick={() => setIncidentModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateIncident} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Title
                </label>
                <input
                  required
                  type="text"
                  className="w-full rounded-md border border-border bg-background text-foreground p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={incidentForm.title}
                  onChange={(e) =>
                    setIncidentForm({ ...incidentForm, title: e.target.value })
                  }
                  placeholder="e.g. Bridge Collapse"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  required
                  className="w-full rounded-md border border-border bg-background text-foreground p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={2}
                  value={incidentForm.description}
                  onChange={(e) =>
                    setIncidentForm({
                      ...incidentForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Severity
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background text-foreground p-2 text-sm"
                    value={incidentForm.severity}
                    onChange={(e) =>
                      setIncidentForm({
                        ...incidentForm,
                        severity: e.target.value,
                      })
                    }
                  >
                    <option>CRITICAL</option>
                    <option>HIGH</option>
                    <option>MODERATE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Type
                  </label>
                  <select
                    className="w-full rounded-md border border-border bg-background text-foreground p-2 text-sm"
                    value={incidentForm.disasterType}
                    onChange={(e) =>
                      setIncidentForm({
                        ...incidentForm,
                        disasterType: e.target.value,
                      })
                    }
                  >
                    <option>Infrastructure</option>
                    <option>Flood</option>
                    <option>Fire</option>
                    <option>Medical</option>
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-orange-700 hover:bg-orange-600 text-white mt-2"
                disabled={submitting}
              >
                {submitting ? "Logging..." : "Log Incident"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Dispatch Volunteer */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-md w-full border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-background flex justify-between items-center">
              <h3 className="font-bold text-lg text-foreground flex items-center">
                <Users className="mr-2 text-brand-aqua h-5 w-5" /> Dispatch
                Volunteer
              </h3>
              <button
                onClick={() => setDispatchModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleDispatch} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Task Title
                </label>
                <input
                  required
                  type="text"
                  className="w-full rounded-md border border-border bg-background text-foreground p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={dispatchForm.title}
                  onChange={(e) =>
                    setDispatchForm({ ...dispatchForm, title: e.target.value })
                  }
                  placeholder="e.g. Deliver medical supplies"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Select Volunteer
                </label>
                <select
                  required
                  className="w-full rounded-md border border-border bg-background text-foreground p-2 text-sm"
                  value={dispatchForm.volunteerId}
                  onChange={(e) =>
                    setDispatchForm({
                      ...dispatchForm,
                      volunteerId: e.target.value,
                    })
                  }
                >
                  <option value="">-- Choose a volunteer --</option>
                  {volunteers.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.volunteerProfile?.status || "UNKNOWN"})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Instructions / Description
                </label>
                <textarea
                  required
                  className="w-full rounded-md border border-border bg-background text-foreground p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={2}
                  value={dispatchForm.description}
                  onChange={(e) =>
                    setDispatchForm({
                      ...dispatchForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-700 hover:bg-brand-indigo text-white mt-2"
                disabled={submitting}
              >
                {submitting ? "Dispatching..." : "Confirm Dispatch"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
