import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, RadialBarChart, RadialBar,
} from "recharts";
import {
  LayoutDashboard, Users, BellRing, Settings, LogOut, Volume2, Globe2, Pill,
  Droplets, TriangleAlert, MessageCircle, Search, ChevronRight, Plus, Mic,
  X, Check, Leaf,
} from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');`;

const T = {
  ink: "#1B2420",
  pine: "#1F3B32",
  pineLight: "#2E5346",
  pineDeep: "#152922",
  brass: "#BE8A2E",
  brassLight: "#E4B559",
  paper: "#F3F0E4",
  card: "#FFFFFF",
  clay: "#9C3B2E",
  clayLight: "#F1DAD3",
  line: "#DDD5BE",
  muted: "#6B6656",
};

const LANGUAGES = ["Assamese", "Manipuri", "Bodo", "Nepali", "Bengali"];

const memoryTrend = (base, jitter) =>
  Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`,
    score: Math.max(30, Math.min(100, Math.round(base + Math.sin(i / 2) * jitter + (i > 9 ? -i * 0.6 : 0)))),
  }));

const adherence = (vals) => vals.map((v, i) => ({ week: `Wk ${i + 1}`, pct: v }));

const PATIENTS = [
  {
    id: "p1", name: "Ratna Bezbaruah", age: 74, village: "Jorhat, Assam", language: "Assamese",
    memoryIndex: memoryTrend(78, 6), cognitiveStress: 32, adherence: adherence([92, 88, 90, 81]),
    medicines: [
      { id: "m1", name: "Donepezil 5mg", time: "08:00", taken: true },
      { id: "m2", name: "Memantine 10mg", time: "20:00", taken: false },
    ],
    reminders: [{ id: "r1", label: "Drink water", audio: "water_as.mp3" }],
  },
  {
    id: "p2", name: "Ibetombi Devi", age: 69, village: "Imphal West, Manipur", language: "Manipuri",
    memoryIndex: memoryTrend(64, 10), cognitiveStress: 58, adherence: adherence([70, 74, 60, 55]),
    medicines: [{ id: "m3", name: "Rivastigmine patch", time: "09:00", taken: true }],
    reminders: [{ id: "r2", label: "Take evening walk", audio: "walk_mni.mp3" }],
  },
  {
    id: "p3", name: "Pramila Basumatary", age: 81, village: "Kokrajhar, Assam", language: "Bodo",
    memoryIndex: memoryTrend(52, 8), cognitiveStress: 74, adherence: adherence([65, 58, 49, 40]),
    medicines: [
      { id: "m4", name: "Donepezil 10mg", time: "08:30", taken: false },
      { id: "m5", name: "Vitamin B12", time: "13:00", taken: false },
    ],
    reminders: [{ id: "r3", label: "Call daughter", audio: "call_bod.mp3" }],
  },
  {
    id: "p4", name: "Faria Rahman", age: 77, village: "Silchar, Assam", language: "Bengali",
    memoryIndex: memoryTrend(85, 4), cognitiveStress: 21, adherence: adherence([95, 97, 93, 96]),
    medicines: [{ id: "m6", name: "Memantine 5mg", time: "19:30", taken: true }],
    reminders: [{ id: "r4", label: "Play Folk Art game", audio: "game_ben.mp3" }],
  },
];

const initialAlerts = [
  { id: "a1", patientId: "p3", type: "medication", severity: "high", msg: "Morning Donepezil not marked taken", time: "07 min ago", notified: false },
  { id: "a2", patientId: "p2", type: "cognitive", severity: "high", msg: "Cognitive stress index rose 18 pts this week", time: "41 min ago", notified: false },
  { id: "a3", patientId: "p3", type: "hydration", severity: "medium", msg: "No hydration prompt response since noon", time: "1 hr ago", notified: true },
  { id: "a4", patientId: "p1", type: "routine", severity: "low", msg: "Daily Routine Sequence skipped yesterday", time: "3 hr ago", notified: false },
  { id: "a5", patientId: "p2", type: "medication", severity: "medium", msg: "Rivastigmine patch change is due today", time: "5 hr ago", notified: true },
];

const severityColor = { high: T.clay, medium: T.brass, low: T.pineLight };
const typeIcon = { medication: Pill, cognitive: TriangleAlert, hydration: Droplets, routine: BellRing };

function Card({ children, style, className = "" }) {
  return (
    <div
      className={className}
      style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, ...style }}
    >
      {children}
    </div>
  );
}

function Pill_({ children, tone = T.pine, bg = "rgba(31,59,50,0.08)" }) {
  return (
    <span style={{
      fontFamily: "IBM Plex Sans", fontSize: 12, fontWeight: 600, color: tone, background: bg,
      padding: "3px 10px", borderRadius: 999, letterSpacing: 0.2,
    }}>{children}</span>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 14px",
      borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
      background: active ? "rgba(228,181,89,0.14)" : "transparent",
      color: active ? T.brassLight : "rgba(243,240,228,0.72)",
      fontFamily: "IBM Plex Sans", fontSize: 14.5, fontWeight: 500,
      transition: "background 120ms ease",
    }}>
      <Icon size={18} strokeWidth={2} />
      {label}
    </button>
  );
}

function LoginScreen({ onLogin }) {
  const [role, setRole] = useState("caregiver");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || pw.trim().length < 4) {
      setErr("Enter your name and a password of at least 4 characters.");
      return;
    }
    setErr("");
    onLogin({ name: name.trim(), role });
  };

  return (
    <div className="login-screen" style={{ minHeight: "100vh", display: "flex", background: T.paper, fontFamily: "IBM Plex Sans" }}>
      <style>{FONT_IMPORT}</style>
      <div className="login-brand-panel" style={{
        flex: "1 1 42%", minWidth: 280, background: `linear-gradient(165deg, ${T.pine}, ${T.pineDeep})`,
        color: T.paper, padding: "56px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        <svg style={{ position: "absolute", inset: 0, opacity: 0.14 }} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 16 }).map((_, i) => (
            <path key={i} d={`M ${20 + (i % 4) * 100} ${20 + Math.floor(i / 4) * 200} q 20 40 0 80 q -20 40 0 80`}
              stroke={T.brassLight} strokeWidth="2" fill="none" />
          ))}
        </svg>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: T.brass, display: "grid", placeItems: "center" }}>
              <Leaf size={19} color={T.pineDeep} />
            </div>
            <span style={{ fontFamily: "Fraunces", fontSize: 18, fontWeight: 600 }}>Smriti Sathi</span>
          </div>
          <h1 style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: 40, lineHeight: 1.15, maxWidth: 380, margin: 0 }}>
            One quiet window into how they're doing today.
          </h1>
          <p style={{ marginTop: 18, maxWidth: 360, color: "rgba(243,240,228,0.75)", fontSize: 15, lineHeight: 1.6 }}>
            Built for families and health workers supporting elderly dementia
            patients across the North Eastern Region — memory trends, routine
            adherence and medicine reminders, in one place.
          </p>
        </div>
        <div style={{ position: "relative", fontSize: 13, color: "rgba(243,240,228,0.55)" }}>
          Ministry of Development of North Eastern Region · MDoNER
        </div>
      </div>

      <div className="login-form-panel" style={{ flex: "1 1 58%", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <form onSubmit={submit} style={{ width: "100%", maxWidth: 360 }}>
          <h2 style={{ fontFamily: "Fraunces", fontSize: 26, fontWeight: 600, color: T.ink, margin: "0 0 6px" }}>Sign in</h2>
          <p style={{ color: T.muted, fontSize: 14, margin: "0 0 28px" }}>Access your patients' dashboard and alerts.</p>

          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            {[{ k: "caregiver", label: "Family member" }, { k: "clinician", label: "Health worker" }].map((r) => (
              <button type="button" key={r.k} onClick={() => setRole(r.k)} style={{
                flex: 1, padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                border: `1.5px solid ${role === r.k ? T.pine : T.line}`,
                background: role === r.k ? T.pine : "transparent",
                color: role === r.k ? T.paper : T.ink,
                fontFamily: "IBM Plex Sans", fontSize: 13.5, fontWeight: 600,
              }}>{r.label}</button>
            ))}
          </div>

          <label style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anjali Bezbaruah"
            style={{
              width: "100%", marginTop: 6, marginBottom: 16, padding: "11px 13px", borderRadius: 10,
              border: `1.5px solid ${T.line}`, fontFamily: "IBM Plex Sans", fontSize: 14.5, outline: "none", boxSizing: "border-box",
            }} />

          <label style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>Password</label>
          <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="••••••••"
            style={{
              width: "100%", marginTop: 6, marginBottom: err ? 10 : 22, padding: "11px 13px", borderRadius: 10,
              border: `1.5px solid ${T.line}`, fontFamily: "IBM Plex Sans", fontSize: 14.5, outline: "none", boxSizing: "border-box",
            }} />
          {err && <p style={{ color: T.clay, fontSize: 13, margin: "0 0 14px" }}>{err}</p>}

          <button type="submit" style={{
            width: "100%", padding: "12px 14px", borderRadius: 10, border: "none", cursor: "pointer",
            background: T.brass, color: T.pineDeep, fontFamily: "IBM Plex Sans", fontSize: 15, fontWeight: 700,
          }}>Sign in</button>
          <p style={{ fontSize: 12.5, color: T.muted, marginTop: 14, lineHeight: 1.5 }}>
            This demo issues a session token client-side. In production this posts to
            the <code>/auth/login</code> endpoint and stores the returned JWT.
          </p>
        </form>
      </div>
    </div>
  );
}

function StatBig({ label, value, suffix = "", tone = T.ink }) {
  return (
    <div>
      <div style={{ fontFamily: "Fraunces", fontSize: 34, fontWeight: 600, color: tone, lineHeight: 1 }}>
        {value}<span style={{ fontSize: 18 }}>{suffix}</span>
      </div>
      <div style={{ fontSize: 13, color: T.muted, marginTop: 6 }}>{label}</div>
    </div>
  );
}

function DashboardView({ patient }) {
  const latest = patient.memoryIndex[patient.memoryIndex.length - 1].score;
  const first = patient.memoryIndex[0].score;
  const delta = latest - first;
  const lastAdherence = patient.adherence[patient.adherence.length - 1].pct;
  const stressData = [{ name: "stress", value: patient.cognitiveStress, fill: patient.cognitiveStress > 60 ? T.clay : patient.cognitiveStress > 40 ? T.brass : T.pine }];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 16 }}>
        <Card style={{ padding: 20 }}><StatBig label="Memory index (today)" value={latest} tone={T.pine} /></Card>
        <Card style={{ padding: 20 }}><StatBig label="14-day change" value={delta >= 0 ? `+${delta}` : delta} tone={delta >= 0 ? T.pine : T.clay} /></Card>
        <Card style={{ padding: 20 }}><StatBig label="Routine adherence" value={lastAdherence} suffix="%" tone={lastAdherence < 60 ? T.clay : T.pine} /></Card>
        <Card style={{ padding: 20 }}><StatBig label="Cognitive stress" value={patient.cognitiveStress} suffix="/100" tone={severityColor[patient.cognitiveStress > 60 ? "high" : patient.cognitiveStress > 40 ? "medium" : "low"]} /></Card>
      </div>

      <div className="dashboard-charts" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        <Card style={{ padding: "22px 22px 8px" }}>
          <h3 style={{ fontFamily: "Fraunces", fontSize: 18, fontWeight: 600, color: T.ink, margin: "0 0 4px" }}>Memory index — last 14 days</h3>
          <p style={{ fontSize: 12.5, color: T.muted, margin: "0 0 8px" }}>From on-device Difficulty AI telemetry, synced from the offline queue.</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={patient.memoryIndex} margin={{ left: -18, right: 8, top: 6 }}>
              <CartesianGrid stroke={T.line} vertical={false} />
              <XAxis dataKey="day" tick={{ fontFamily: "IBM Plex Sans", fontSize: 11, fill: T.muted }} axisLine={{ stroke: T.line }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontFamily: "IBM Plex Sans", fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans", fontSize: 12.5, borderRadius: 8, border: `1px solid ${T.line}` }} />
              <Line type="monotone" dataKey="score" stroke={T.pine} strokeWidth={2.5} dot={{ r: 3, fill: T.pine }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: 22, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3 style={{ fontFamily: "Fraunces", fontSize: 18, fontWeight: 600, color: T.ink, margin: "0 0 4px", alignSelf: "flex-start" }}>Cognitive stress</h3>
          <p style={{ fontSize: 12.5, color: T.muted, margin: "0 0 4px", alignSelf: "flex-start" }}>Lower is calmer</p>
          <ResponsiveContainer width="100%" height={190}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={stressData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={12} background={{ fill: T.paper }} maxBarSize={14} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: -110, fontFamily: "Fraunces", fontSize: 28, fontWeight: 600, color: T.ink }}>{patient.cognitiveStress}</div>
        </Card>
      </div>

      <Card style={{ padding: "22px 22px 8px" }}>
        <h3 style={{ fontFamily: "Fraunces", fontSize: 18, fontWeight: 600, color: T.ink, margin: "0 0 4px" }}>Daily routine adherence — by week</h3>
        <p style={{ fontSize: 12.5, color: T.muted, margin: "0 0 8px" }}>Share of scheduled routine tasks completed on time.</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={patient.adherence} margin={{ left: -18, right: 8, top: 6 }}>
            <CartesianGrid stroke={T.line} vertical={false} />
            <XAxis dataKey="week" tick={{ fontFamily: "IBM Plex Sans", fontSize: 11.5, fill: T.muted }} axisLine={{ stroke: T.line }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontFamily: "IBM Plex Sans", fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans", fontSize: 12.5, borderRadius: 8, border: `1px solid ${T.line}` }} />
            <Bar dataKey="pct" fill={T.brass} radius={[6, 6, 0, 0]} maxBarSize={46} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function PatientCard({ patient, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(patient.language);
  const [newReminder, setNewReminder] = useState("");

  const toggleMed = (medId) => {
    onUpdate({
      ...patient,
      medicines: patient.medicines.map((m) => (m.id === medId ? { ...m, taken: !m.taken } : m)),
    });
  };

  const addReminder = () => {
    if (!newReminder.trim()) return;
    onUpdate({
      ...patient,
      reminders: [...patient.reminders, { id: `r${Date.now()}`, label: newReminder.trim(), audio: "pending_upload.mp3" }],
    });
    setNewReminder("");
  };

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <div>
          <div style={{ fontFamily: "Fraunces", fontSize: 17, fontWeight: 600, color: T.ink }}>{patient.name}</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{patient.age} yrs · {patient.village} · {lang}</div>
        </div>
        <ChevronRight size={18} color={T.muted} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 150ms" }} />
      </button>

      {open && (
        <div style={{ padding: "0 20px 22px", borderTop: `1px solid ${T.line}` }}>
          <div className="patient-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 18 }}>
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: T.pine, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                <Pill size={15} /> Medicine schedule
              </h4>
              {patient.medicines.map((m) => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.line}` }}>
                  <div>
                    <div style={{ fontSize: 14, color: T.ink, fontWeight: 500 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{m.time}</div>
                  </div>
                  <button onClick={() => toggleMed(m.id)} style={{
                    border: "none", borderRadius: 999, cursor: "pointer", padding: "5px 12px", fontSize: 12, fontWeight: 600,
                    background: m.taken ? "rgba(31,59,50,0.1)" : T.clayLight, color: m.taken ? T.pine : T.clay,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    {m.taken ? <Check size={13} /> : <X size={13} />} {m.taken ? "Taken" : "Missed"}
                  </button>
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: T.pine, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                <Volume2 size={15} /> Custom audio reminders
              </h4>
              {patient.reminders.map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0" }}>
                  <Mic size={14} color={T.muted} />
                  <span style={{ fontSize: 13.5, color: T.ink }}>{r.label}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input value={newReminder} onChange={(e) => setNewReminder(e.target.value)} placeholder="New reminder phrase"
                  style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${T.line}`, fontSize: 13, fontFamily: "IBM Plex Sans" }} />
                <button onClick={addReminder} style={{ border: "none", borderRadius: 8, background: T.pine, color: T.paper, padding: "0 12px", cursor: "pointer" }}>
                  <Plus size={16} />
                </button>
              </div>

              <h4 style={{ fontSize: 13, fontWeight: 700, color: T.pine, margin: "18px 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
                <Globe2 size={15} /> Preferred spoken language
              </h4>
              <select value={lang} onChange={(e) => setLang(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${T.line}`, fontSize: 13.5, fontFamily: "IBM Plex Sans", background: "white" }}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function PatientsView({ patients, onUpdate }) {
  const [query, setQuery] = useState("");
  const filtered = patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ position: "relative", maxWidth: 340 }}>
        <Search size={16} color={T.muted} style={{ position: "absolute", left: 12, top: 12 }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patients"
          style={{ width: "100%", padding: "10px 12px 10px 34px", borderRadius: 10, border: `1.5px solid ${T.line}`, fontFamily: "IBM Plex Sans", fontSize: 14, boxSizing: "border-box" }} />
      </div>
      {filtered.map((p) => <PatientCard key={p.id} patient={p} onUpdate={onUpdate} />)}
    </div>
  );
}

function AlertsView({ alerts, patients, setAlerts }) {
  const [filter, setFilter] = useState("all");
  const nameOf = (id) => patients.find((p) => p.id === id)?.name ?? "Unknown";

  const toggleNotify = (id) => setAlerts(alerts.map((a) => (a.id === id ? { ...a, notified: !a.notified } : a)));
  const shown = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["all", "high", "medium", "low"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 14px", borderRadius: 999, cursor: "pointer", fontSize: 13, fontWeight: 600,
            border: `1.5px solid ${filter === f ? T.pine : T.line}`,
            background: filter === f ? T.pine : "transparent", color: filter === f ? T.paper : T.ink,
            textTransform: "capitalize",
          }}>{f}</button>
        ))}
      </div>

      <Card style={{ padding: 4 }}>
        {shown.map((a, i) => {
          const Icon = typeIcon[a.type];
          return (
            <div className="alert-row" key={a.id} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
              borderBottom: i < shown.length - 1 ? `1px solid ${T.line}` : "none",
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${severityColor[a.severity]}18`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon size={18} color={severityColor[a.severity]} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: T.ink }}>{nameOf(a.patientId)}</div>
                <div style={{ fontSize: 13.5, color: T.muted, marginTop: 1 }}>{a.msg}</div>
              </div>
              <Pill_ tone={severityColor[a.severity]} bg={`${severityColor[a.severity]}18`}>{a.severity}</Pill_>
              <span style={{ fontSize: 12, color: T.muted, minWidth: 70, textAlign: "right" }}>{a.time}</span>
              <button onClick={() => toggleNotify(a.id)} title="Forward via SMS / WhatsApp (Twilio)" style={{
                border: "none", borderRadius: 8, cursor: "pointer", padding: "7px 10px",
                background: a.notified ? "rgba(31,59,50,0.1)" : T.paper, color: a.notified ? T.pine : T.muted,
                display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600,
              }}>
                <MessageCircle size={14} /> {a.notified ? "Notified" : "Notify"}
              </button>
            </div>
          );
        })}
        {shown.length === 0 && <div style={{ padding: 30, textAlign: "center", color: T.muted, fontSize: 14 }}>No alerts at this severity.</div>}
      </Card>
      <p style={{ fontSize: 12.5, color: T.muted }}>
        "Notify" simulates forwarding this alert over SMS / WhatsApp through the Twilio API integration point defined for this module.
      </p>
    </div>
  );
}

const VIEWS = [
  { k: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { k: "patients", label: "Patients", icon: Users },
  { k: "alerts", label: "Alerts", icon: BellRing },
  { k: "settings", label: "Settings", icon: Settings },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState("dashboard");
  const [patients, setPatients] = useState(PATIENTS);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedId, setSelectedId] = useState(PATIENTS[0].id);

  const selected = useMemo(() => patients.find((p) => p.id === selectedId), [patients, selectedId]);
  const highAlertCount = alerts.filter((a) => a.severity === "high").length;

  const updatePatient = (updated) => setPatients(patients.map((p) => (p.id === updated.id ? updated : p)));

  if (!session) return <LoginScreen onLogin={setSession} />;

  return (
    <div className="app-shell" style={{ minHeight: "100vh", display: "flex", background: T.paper, fontFamily: "IBM Plex Sans" }}>
      <style>{FONT_IMPORT}</style>

      <aside className="app-sidebar" style={{ width: 232, background: T.pine, padding: "24px 16px", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div className="sidebar-brand" style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 30 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: T.brass, display: "grid", placeItems: "center" }}>
            <Leaf size={16} color={T.pineDeep} />
          </div>
          <span style={{ fontFamily: "Fraunces", fontSize: 16.5, fontWeight: 600, color: T.paper }}>Smriti Sathi</span>
        </div>

        <div className="sidebar-nav" style={{ display: "grid", gap: 4 }}>
          {VIEWS.map((v) => (
            <NavItem key={v.k} icon={v.icon} label={v.label} active={view === v.k} onClick={() => setView(v.k)} />
          ))}
        </div>

        <div className="sidebar-account" style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid rgba(243,240,228,0.14)" }}>
          <div style={{ padding: "0 8px 10px", fontSize: 12.5, color: "rgba(243,240,228,0.55)" }}>
            Signed in as<br /><span style={{ color: T.paper, fontWeight: 600 }}>{session.name}</span> · {session.role === "clinician" ? "Health worker" : "Family member"}
          </div>
          <NavItem icon={LogOut} label="Sign out" onClick={() => setSession(null)} />
        </div>
      </aside>

      <div className="app-content" style={{ flex: 1, minWidth: 0 }}>
        <header className="app-header" style={{
          padding: "18px 32px", borderBottom: `1px solid ${T.line}`, background: T.card,
          display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 5,
        }}>
          <div>
            <h1 style={{ fontFamily: "Fraunces", fontSize: 22, fontWeight: 600, color: T.ink, margin: 0 }}>
              {VIEWS.find((v) => v.k === view)?.label}
            </h1>
            {view === "dashboard" && <p style={{ margin: "2px 0 0", fontSize: 13, color: T.muted }}>Viewing {selected.name}</p>}
          </div>
          <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {view === "dashboard" && (
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={{
                padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${T.line}`, fontFamily: "IBM Plex Sans", fontSize: 13.5, background: "white",
              }}>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
            <button onClick={() => setView("alerts")} style={{
              position: "relative", border: `1.5px solid ${T.line}`, background: "white", borderRadius: 10, padding: 9, cursor: "pointer",
            }}>
              <BellRing size={18} color={T.ink} />
              {highAlertCount > 0 && (
                <span style={{
                  position: "absolute", top: -5, right: -5, width: 17, height: 17, borderRadius: "50%",
                  background: T.clay, color: "white", fontSize: 10, fontWeight: 700, display: "grid", placeItems: "center",
                }}>{highAlertCount}</span>
              )}
            </button>
          </div>
        </header>

        <main className="app-main" style={{ padding: 32, maxWidth: 1100 }}>
          {view === "dashboard" && <DashboardView patient={selected} />}
          {view === "patients" && <PatientsView patients={patients} onUpdate={updatePatient} />}
          {view === "alerts" && <AlertsView alerts={alerts} patients={patients} setAlerts={setAlerts} />}
          {view === "settings" && (
            <Card style={{ padding: 26, maxWidth: 480 }}>
              <h3 style={{ fontFamily: "Fraunces", fontSize: 18, fontWeight: 600, margin: "0 0 14px" }}>Account</h3>
              <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>
                Signed in as <strong>{session.name}</strong> ({session.role === "clinician" ? "Health worker" : "Family member"}).
                In production, role changes and password resets post to the same
                REST API and JWT auth service used at login.
              </p>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}