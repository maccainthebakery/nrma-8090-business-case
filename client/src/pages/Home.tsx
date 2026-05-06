/*
 * NRMA 8090 Business Case — Home Page
 * Design: Corporate Precision — white canvas, NRMA Blue (#003087) authority
 * Fonts: Playfair Display (headings) + Source Sans 3 (body)
 * Layout: Sticky nav + scroll-spy + filter chips + asymmetric 2/3+1/3 sections
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, ReferenceLine, ReferenceArea, Cell
} from "recharts";
import { Menu, X, ChevronRight, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Slider } from "@/components/ui/slider";

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "summary",     label: "Summary" },
  { id: "findings",    label: "PoC Findings" },
  { id: "knowledge",   label: "Knowledge Graph" },
  { id: "financials",  label: "Financials" },
  { id: "roadmap",     label: "Roadmap" },
  { id: "risks",       label: "Risks" },
  { id: "recommendation", label: "Recommendation" },
];

const FILTER_OPTIONS = [
  { id: "all",         label: "All Sections" },
  { id: "efficiency",  label: "Efficiency Gains" },
  { id: "cost",        label: "Cost Model" },
  { id: "risk",        label: "Risks & Gaps" },
  { id: "action",      label: "Actions" },
];

const SECTION_TAGS: Record<string, string[]> = {
  summary:        ["all", "efficiency", "cost"],
  findings:       ["all", "efficiency"],
  knowledge:      ["all", "action", "risk"],
  financials:     ["all", "cost"],
  roadmap:        ["all", "action"],
  risks:          ["all", "risk"],
  recommendation: ["all", "action"],
};

const sdlcData = [
  { phase: "Requirements\n(Refinery)",    timeAlloc: 15, gain: 70,  confirmed: true },
  { phase: "Architecture\n(Foundry)",     timeAlloc: 15, gain: 70,  confirmed: true },
  { phase: "Work Orders\n(Planner)",      timeAlloc: 15, gain: 70,  confirmed: true },
  { phase: "Code Execution\n(MCP)",       timeAlloc: 30, gain: 50,  confirmed: true },
  { phase: "Testing\n(Validator)",        timeAlloc: 15, gain: 0,   confirmed: false },
  { phase: "Review &\nDeploy",            timeAlloc: 10, gain: 20,  confirmed: false },
];

const reqTimeData = [
  { label: "Without 8090", days: 5, fill: "#ef4444" },
  { label: "With 8090",    days: 1, fill: "#003087" },
];

const cumulativeData = Array.from({ length: 36 }, (_, i) => {
  const m = i + 1;
  const sq = (2117000 / 12) * m;
  let cum8090 = 0;
  for (let j = 1; j <= m; j++) {
    if (j <= 6) {
      cum8090 += (2117000 / 12) + 10 * 324 + 10 * 101;
    } else {
      cum8090 += (7 * 211700 / 12) + 7 * 324 + 7 * 50.6;
    }
  }
  return { month: m, statusQuo: Math.round(sq / 1000), with8090: Math.round(cum8090 / 1000) };
});

const annualData = [
  { name: "Status Quo\n(10 FTE)", fte: 2117, platform: 0 },
  { name: "Conservative\n(8 FTE)", fte: 1694, platform: 36 },
  { name: "Moderate\n(7 FTE)",    fte: 1482, platform: 31 },
  { name: "Aggressive\n(6 FTE)",  fte: 1270, platform: 27 },
];

const fteTableData = [
  { role: "Architect / Tech Lead", count: 2, base: "$185,000", loaded: "$536,500" },
  { role: "Senior Developer",      count: 3, base: "$155,000", loaded: "$674,250" },
  { role: "Mid-Level Developer",   count: 2, base: "$120,000", loaded: "$348,000" },
  { role: "BA / Iteration Manager",count: 1, base: "$130,000", loaded: "$188,500" },
  { role: "QA Engineer",           count: 1, base: "$115,000", loaded: "$166,750" },
  { role: "Product Owner",         count: 1, base: "$140,000", loaded: "$203,000" },
];

const tokenData = [
  { scenario: "Conservative", tokens: "1.5M", tokenCost: "$2,274", total: "$41,154", pct: "1.9%" },
  { scenario: "Moderate (Expected)", tokens: "4.0M", tokenCost: "$6,065", total: "$44,945", pct: "2.1%", highlight: true },
  { scenario: "High (MCP-Heavy)", tokens: "8.0M", tokenCost: "$12,131", total: "$51,011", pct: "2.4%" },
];

const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "Knowledge Graph Build",
    duration: "Months 1–6",
    cost: "$173,755",
    color: "bg-amber-500",
    items: [
      "Ingest legacy codebase into 8090 Knowledge Graph",
      "0.5 FTE Architect + 0.5 FTE Senior Dev dedicated",
      "Elevated token budget for MCP cache reads",
      "Token governance framework established",
      "Onboarding & change management programme",
    ],
    status: "Investment",
  },
  {
    phase: "Phase 2",
    title: "Optimised Steady State",
    duration: "Month 7 onwards",
    cost: "$31,462/yr",
    color: "bg-nrma-blue",
    items: [
      "Transition to 7-FTE optimised team structure",
      "Full SDLC orchestration via 8090 (all modules)",
      "Validator (testing) module fully validated",
      "Net annual saving: $604k AUD",
      "Breakeven achieved at Month 7",
    ],
    status: "Saving",
  },
];

const risks = [
  {
    severity: "high",
    title: "Token Cost Overrun",
    description: "The PoC explicitly flagged that MCP cache reads consume significantly more tokens than expected. Without governance, costs could escalate during the Knowledge Graph build phase.",
    mitigation: "Implement token budgets per work order before execution. Monitor usage via the 8090 admin console weekly during Phase 1.",
    icon: AlertTriangle,
  },
  {
    severity: "high",
    title: "Legacy Codebase Incompatibility",
    description: "The PoC confirmed that 8090 is not currently suitable for existing codebases without a Knowledge Graph. Attempting to use it on legacy code before Phase 1 is complete will yield poor results.",
    mitigation: "Enforce a strict gate: no production work orders until the Knowledge Graph build is validated by the Architect.",
    icon: AlertTriangle,
  },
  {
    severity: "medium",
    title: "Validator Module TBD",
    description: "The Validator (testing) module was not completed during the PoC. The 48.5% weighted productivity gain is therefore conservative — but the testing ROI remains unquantified.",
    mitigation: "Schedule a dedicated 2-week Validator sprint in Month 2 of Phase 1 to quantify testing efficiency gains.",
    icon: Clock,
  },
  {
    severity: "medium",
    title: "Developer Cognitive Overload",
    description: "The PoC noted that fast code generation can create cognitive overload for developers and reviewers. 5–10× story throughput requires proportional review capacity.",
    mitigation: "Implement AGENTS.md review checklists and linting rules. Rotate review duties to prevent bottlenecks.",
    icon: AlertTriangle,
  },
  {
    severity: "low",
    title: "No Jira Integration",
    description: "8090 cannot currently output requirements directly into Jira. Work orders require manual handoff, adding friction to existing SDLC workflows.",
    mitigation: "Use 8090's Markdown export capability as an interim bridge. Raise Jira integration as a product roadmap request with 8090.",
    icon: CheckCircle2,
  },
  {
    severity: "low",
    title: "No UX Prototyping Tool",
    description: "8090 has no built-in prototyping or design tool. The PoC used Figma Make, Vercel, and Abacus.ai as external tools, adding workflow complexity.",
    mitigation: "Standardise on Abacus.ai as the prototype tool for PoC outputs. This workflow is already proven in the PoC.",
    icon: CheckCircle2,
  },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-blue-100 shadow-lg rounded p-3 text-sm">
        <p className="font-semibold text-[#003087] mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color || "#003087" }}>
            {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Financial Model Calculator ─────────────────────────────────────────────
function calcFinancials(seats: number) {
  const SEAT_COST_AUD_PM = 200 / 0.65;          // ~$307.69 AUD/seat/month
  const TOKEN_COST_AUD_PM_PER_SEAT = 37.50;     // mid scenario
  const KG_BUILD = 174_000;                      // fixed regardless of team size
  const FTE_COST_AVG = 211_700;                  // loaded AUD/yr per person
  const FTE_REDUCTION = 0.30;                    // 30% headcount reduction

  const fteCostYr = seats * FTE_COST_AVG;
  const seatCostYr = seats * SEAT_COST_AUD_PM * 12;
  const tokenCostYr = seats * TOKEN_COST_AUD_PM_PER_SEAT * 12;
  const platformCostYr = seatCostYr + tokenCostYr;
  const platformPct = (platformCostYr / fteCostYr) * 100;

  const fteSaved = Math.round(seats * FTE_REDUCTION);
  const annualFteSaving = fteSaved * FTE_COST_AVG;
  const netAnnualSaving = annualFteSaving - platformCostYr;
  const monthlyNet = netAnnualSaving / 12;
  const breakeven = monthlyNet > 0 ? Math.ceil(KG_BUILD / monthlyNet) : 999;

  const statusQuo3yr = fteCostYr * 3;
  const reducedFteYr = (seats - fteSaved) * FTE_COST_AVG;
  const yr1 = KG_BUILD + (reducedFteYr / 2) + (fteCostYr / 2) + platformCostYr;
  const yr2 = reducedFteYr + platformCostYr;
  const yr3 = reducedFteYr + platformCostYr;
  const total8090 = yr1 + yr2 + yr3;
  const netSaving3yr = statusQuo3yr - total8090;

  // Cumulative 36-month data
  const cumData = Array.from({ length: 36 }, (_, i) => {
    const m = i + 1;
    const sq = (fteCostYr / 12) * m;
    let cum8090 = 0;
    for (let j = 1; j <= m; j++) {
      if (j <= 6) {
        cum8090 += (fteCostYr / 12) + (platformCostYr / 12) + (KG_BUILD / 6);
      } else {
        cum8090 += (reducedFteYr / 12) + (platformCostYr / 12);
      }
    }
    return { month: m, statusQuo: Math.round(sq / 1000), with8090: Math.round(cum8090 / 1000) };
  });

  // Annual bar data
  const annualBarData = [
    { name: "Status Quo", fte: Math.round(fteCostYr / 1000), platform: 0 },
    { name: `Conservative\n(${seats - Math.round(seats*0.1)} FTE)`, fte: Math.round((seats - Math.round(seats*0.1)) * FTE_COST_AVG / 1000), platform: Math.round(platformCostYr / 1000) },
    { name: `Moderate\n(${seats - fteSaved} FTE)`, fte: Math.round(reducedFteYr / 1000), platform: Math.round(platformCostYr / 1000) },
    { name: `Aggressive\n(${seats - Math.round(seats*0.4)} FTE)`, fte: Math.round((seats - Math.round(seats*0.4)) * FTE_COST_AVG / 1000), platform: Math.round(platformCostYr / 1000) },
  ];

  return {
    seats, fteCostYr, seatCostYr, tokenCostYr, platformCostYr, platformPct,
    fteSaved, annualFteSaving, netAnnualSaving, breakeven,
    statusQuo3yr, netSaving3yr, yr1, yr2, yr3,
    cumData, annualBarData,
    KG_BUILD,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const [activeSection, setActiveSection] = useState("summary");
  const [activeFilter, setActiveFilter] = useState("all");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [seatCount, setSeatCount] = useState(10);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const fin = useMemo(() => calcFinancials(seatCount), [seatCount]);

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 120;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMobileNavOpen(false);
  };

  const isVisible = (sectionId: string) => {
    if (activeFilter === "all") return true;
    return SECTION_TAGS[sectionId]?.includes(activeFilter) ?? true;
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Sticky Navigation ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 bg-[#003087] rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs tracking-tight">NRMA</span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-[#003087] font-bold text-sm leading-tight" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>8090 Software Factory</div>
                  <div className="text-gray-400 text-xs leading-tight">Business Case — May 2026</div>
                </div>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              {NAV_ITEMS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`nav-link ${activeSection === id ? "active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </nav>

            {/* CTA + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <a
                href="#recommendation"
                onClick={(e) => { e.preventDefault(); scrollTo("recommendation"); }}
                className="hidden sm:inline-flex items-center gap-1.5 bg-[#003087] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded hover:bg-[#002070] transition-colors"
              >
                Recommendation <ChevronRight size={13} />
              </a>
              <button
                className="lg:hidden p-2 text-[#003087]"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                aria-label="Toggle navigation"
              >
                {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="container py-4 flex flex-col gap-1">
              {NAV_ITEMS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`text-left px-3 py-2.5 rounded text-sm font-semibold transition-colors ${
                    activeSection === id
                      ? "bg-[#003087] text-white"
                      : "text-gray-600 hover:bg-blue-50 hover:text-[#003087]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ── Filter Bar ── */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100">
        <div className="container">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-hide">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1 shrink-0">View:</span>
            {FILTER_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveFilter(id)}
                className={`filter-chip shrink-0 ${activeFilter === id ? "active" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main>

        {/* ══════════════════════════════════════════════════════════════════
            HERO — Executive Summary
        ══════════════════════════════════════════════════════════════════ */}
        <section
          id="summary"
          className={`transition-all duration-500 ${isVisible("summary") ? "opacity-100" : "opacity-30 pointer-events-none"}`}
        >
          {/* Hero banner */}
          <div className="bg-[#003087] text-white">
            <div className="container py-16 lg:py-20">
              <div className="grid lg:grid-cols-3 gap-10 items-start">
                <div className="lg:col-span-2">
                  <div className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">10-Person Delivery Team · 6-Week PoC · May 2026</div>
                  <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
                    8090 Software Factory:<br />
                    <span className="text-blue-200">A Business Case for</span><br />
                    Accelerated Delivery
                  </h1>
                  <p className="text-blue-100 text-lg leading-relaxed max-w-xl">
                    Following a 6-week Proof of Concept with a 10-person NRMA delivery team, we have validated transformative productivity gains across the SDLC. This document presents the financial case for full adoption, including a 6-month Knowledge Graph build for legacy codebase compatibility.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-7">
                    <button onClick={() => scrollTo("findings")} className="bg-white text-[#003087] text-sm font-bold px-5 py-2.5 rounded hover:bg-blue-50 transition-colors">
                      View Findings
                    </button>
                    <button onClick={() => scrollTo("financials")} className="border border-blue-400 text-white text-sm font-semibold px-5 py-2.5 rounded hover:bg-blue-800 transition-colors">
                      Financial Model
                    </button>
                  </div>
                </div>

                {/* KPI Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  {[
                    { value: "48.5%", label: "Weighted Productivity Gain", sub: "Across SDLC phases" },
                    { value: "5–10×", label: "Story Throughput", sub: "Foundry + Planner" },
                    { value: "$1.67M", label: "3-Year Net Saving", sub: "Moderate FTE scenario" },
                    { value: "Month 7", label: "Breakeven Point", sub: "Post KG build" },
                  ].map((kpi, i) => (
                    <div key={i} className="bg-blue-800/50 border border-blue-700 rounded p-4">
                      <div className="text-2xl lg:text-3xl font-bold text-white leading-none mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{kpi.value}</div>
                      <div className="text-blue-200 text-xs font-semibold uppercase tracking-wide leading-tight">{kpi.label}</div>
                      <div className="text-blue-400 text-xs mt-0.5">{kpi.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary narrative */}
          <div className="bg-white">
            <div className="container py-14">
              <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                  <span className="section-rule" />
                  <h2 className="text-3xl font-bold text-[#003087] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>Executive Summary</h2>
                  <p className="text-gray-700 text-base leading-relaxed mb-4">
                    The 8090 Software Factory platform operates as a Layer 3 SDLC orchestration tool — maintaining a living Knowledge Graph that connects requirements (Refinery), architecture (Foundry), planning (Planner), and testing (Validator). This is fundamentally different from Layer 2 coding assistants such as GitHub Copilot.
                  </p>
                  <p className="text-gray-700 text-base leading-relaxed mb-4">
                    The 6-week PoC, conducted on a greenfield project, confirmed a <strong className="text-[#003087]">70% reduction in requirements effort</strong> and a <strong className="text-[#003087]">5–10× increase in story throughput</strong> during the architecture and planning phases. The Validator (testing) module remains under evaluation.
                  </p>
                  <p className="text-gray-700 text-base leading-relaxed">
                    The total platform cost (seat licenses plus token consumption) represents approximately <strong className="text-[#003087]">2.1% of the fully loaded FTE cost</strong> for a 10-person delivery team. A 6-month Knowledge Graph build for legacy codebase compatibility is a confirmed prerequisite, costing ~$174k AUD, after which a moderate FTE reduction of 3 headcount yields a net annual saving of $604k AUD and a 3-year net saving of $1.67M AUD.
                  </p>
                </div>

                {/* Key constraints callout */}
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded p-5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-amber-800 font-bold text-sm mb-1">Critical Prerequisite</div>
                        <p className="text-amber-700 text-sm leading-relaxed">
                          The PoC confirmed that <strong>8090 is not currently suitable for existing codebases</strong> without a Knowledge Graph. A 6-month build phase is mandatory before legacy work can begin.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={18} className="text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-blue-800 font-bold text-sm mb-1">Token Cost Risk</div>
                        <p className="text-blue-700 text-sm leading-relaxed">
                          MCP cache reads consume significantly more tokens than expected. Token budgeting and governance must be established before executing work orders.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — PoC Findings
        ══════════════════════════════════════════════════════════════════ */}
        <section
          id="findings"
          className={`bg-[#f7f9fc] border-t border-gray-100 transition-all duration-500 ${isVisible("findings") ? "opacity-100" : "opacity-30 pointer-events-none"}`}
        >
          <div className="container py-16">
            <span className="section-rule" />
            <div className="grid lg:grid-cols-3 gap-12 items-start mb-12">
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-[#003087] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>PoC Findings</h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  The team evaluated 8090 across its four core modules over 6 weeks on a greenfield project. The following findings are drawn directly from the official PoC report.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Official PoC Results</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Refinery (Requirements)</span>
                    <span className="text-[#003087] font-bold text-sm">70% saving</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Foundry + Planner</span>
                    <span className="text-[#003087] font-bold text-sm">5–10× throughput</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Validator (Testing)</span>
                    <span className="text-amber-600 font-bold text-sm">TBD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Module cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Refinery */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Module 1</div>
                    <h3 className="text-xl font-bold text-[#003087]" style={{ fontFamily: "'Playfair Display', serif" }}>Refinery</h3>
                    <div className="text-gray-500 text-sm">Requirements & Ideation</div>
                  </div>
                  <div className="text-right">
                    <div className="stat-number">70%</div>
                    <div className="text-xs text-gray-500 font-semibold">effort saving</div>
                  </div>
                </div>
                <blockquote className="poc-quote mb-4 text-sm">
                  "It was remarkably quick at producing the documentation and easy to update. I spent around a day making requirements and had a working proof of concept for what is a mid-sized project. Without 8090 I would have spent about 4–6 working days."
                </blockquote>
                <div className="text-sm text-gray-600 leading-relaxed">
                  Requirements for a mid-sized project compressed from <strong>4–6 days</strong> to <strong>1 day</strong>, including a working prototype built from 8090 outputs via Abacus.ai.
                </div>
              </div>

              {/* Foundry + Planner */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Modules 2 & 3</div>
                    <h3 className="text-xl font-bold text-[#003087]" style={{ fontFamily: "'Playfair Display', serif" }}>Foundry + Planner</h3>
                    <div className="text-gray-500 text-sm">Architecture & Work Orders</div>
                  </div>
                  <div className="text-right">
                    <div className="stat-number">5–10×</div>
                    <div className="text-xs text-gray-500 font-semibold">throughput</div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {[
                    ["Design to prototype", "1–3 weeks → 1–4 days"],
                    ["Work order generation", "60–70% time reduction"],
                    ["Sprint management", "10–25% improvement"],
                    ["Parallel execution", "~50% improvement (MCP)"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{label}</span>
                      <span className="text-[#003087] font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Execution */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Cursor + MCP</div>
                    <h3 className="text-xl font-bold text-[#003087]" style={{ fontFamily: "'Playfair Display', serif" }}>Code Execution</h3>
                    <div className="text-gray-500 text-sm">Cursor IDE + Software Factory MCP</div>
                  </div>
                  <div className="text-right">
                    <div className="stat-number">~50%</div>
                    <div className="text-xs text-gray-500 font-semibold">parallel exec gain</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The MCP connection enables the agent to advise on execution and parallel execution plans. Initial project scaffolding that previously took days can be completed in a few hours. Work orders carry full blueprint context, reducing rework.
                </p>
              </div>

              {/* Validator */}
              <div className="bg-white border border-amber-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Module 4 — In Progress</div>
                    <h3 className="text-xl font-bold text-[#003087]" style={{ fontFamily: "'Playfair Display', serif" }}>Validator</h3>
                    <div className="text-gray-500 text-sm">Testing & QA</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-amber-500" style={{ fontFamily: "'Playfair Display', serif" }}>TBD</div>
                    <div className="text-xs text-gray-500 font-semibold">not yet validated</div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-700">
                  The Validator module was not completed during the PoC. This means the <strong>48.5% weighted gain is conservative</strong> — testing efficiency gains will increase the overall figure once validated.
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Requirements time comparison */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h4 className="text-base font-bold text-[#003087] mb-1">Requirements Time: Before vs After</h4>
                <p className="text-xs text-gray-500 mb-5">Mid-sized project — NRMA PoC (working days)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={reqTimeData} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} domain={[0, 7]} />
                    <Tooltip content={<CustomTooltip suffix=" days" />} />
                    <Bar dataKey="days" radius={[4, 4, 0, 0]}>
                      {reqTimeData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                  <TrendingDown size={14} />
                  <span><strong>70% saving</strong> — includes working prototype via Abacus.ai</span>
                </div>
              </div>

              {/* SDLC efficiency gains */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h4 className="text-base font-bold text-[#003087] mb-1">Efficiency Gains by SDLC Phase</h4>
                <p className="text-xs text-gray-500 mb-5">Weighted overall gain: <strong className="text-[#003087]">48.5%</strong> (Validator TBD = 0%)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={sdlcData} barGap={2} barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="phase" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} domain={[0, 80]} unit="%" />
                    <Tooltip content={<CustomTooltip suffix="%" />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <ReferenceLine y={48.5} stroke="#FF6600" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "Weighted avg 48.5%", position: "right", fontSize: 10, fill: "#FF6600" }} />
                    <Bar dataKey="timeAlloc" name="Time Alloc %" fill="#93c5fd" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="gain" name="Efficiency Gain %" radius={[3, 3, 0, 0]}>
                      {sdlcData.map((entry, index) => (
                        <Cell key={index} fill={entry.confirmed ? "#003087" : "#94a3b8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 2b — Knowledge Graph: Greenfield vs Brownfield
        ══════════════════════════════════════════════════════════════════ */}
        <section
          id="knowledge"
          className={`bg-white border-t border-gray-100 transition-all duration-500 ${isVisible("knowledge") ? "opacity-100" : "opacity-30 pointer-events-none"}`}
        >
          <div className="container py-16">
            <span className="section-rule" />
            <div className="grid lg:grid-cols-3 gap-12 items-start mb-12">
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-[#003087] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Knowledge Graph: Greenfield vs Brownfield</h2>
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  The most important strategic distinction in AI-assisted development is not which platform you choose — it is whether the platform's Knowledge Graph reflects <strong className="text-[#003087]">your context</strong>. The PoC succeeded on a greenfield project precisely because 8090 built its Knowledge Graph in real time, ingesting every requirement, blueprint, and work order as the project was created. Brownfield is the harder, more valuable problem.
                </p>
                <p className="text-gray-600 text-base leading-relaxed">
                  No vendor's pre-built Knowledge Base can substitute for NRMA-specific context. What makes 8090 genuinely useful on our legacy systems is not generic software patterns — the foundation model already knows those. It is the accumulated, undocumented institutional knowledge of how our systems are structured, why architectural decisions were made, and how our domain language maps to our codebase.
                </p>
              </div>
              <div className="bg-[#003087] text-white rounded-lg p-6">
                <div className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-3">Strategic Asset</div>
                <p className="text-blue-100 text-sm leading-relaxed">
                  The $174k Phase 1 investment creates a <strong className="text-white">permanent, proprietary NRMA Knowledge Graph</strong> that compounds in value over time — de-risking onboarding, reducing bus-factor dependency, and accelerating every future project regardless of which AI platform is used in 3 years.
                </p>
              </div>
            </div>

            {/* Greenfield vs Brownfield comparison */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-green-600 uppercase tracking-widest">NRMA PoC — Proven</div>
                    <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Greenfield</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    ["KG construction", "Built in real time alongside the project"],
                    ["Context accuracy", "100% — every decision captured as it is made"],
                    ["Time to productivity", "Immediate — no pre-work required"],
                    ["PoC result", "70% requirements saving, 5–10× story throughput"],
                    ["Risk", "Low — context is complete and current"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wide">{label}: </span>
                        <span className="text-sm text-gray-600">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
                    <Clock size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">Phase 1 — 6 Months Required</div>
                    <h3 className="text-lg font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Brownfield (Legacy)</h3>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    ["KG construction", "Retroactive ingestion — guided by Architect + Senior Dev"],
                    ["Context accuracy", "Requires human validation of implicit decisions"],
                    ["Time to productivity", "6 months to build KG before full SDLC use"],
                    ["What must be captured", "System structure, domain language, tech debt patterns, coupling"],
                    ["Risk", "Medium — managed via structured ingestion process"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">{label}: </span>
                        <span className="text-sm text-gray-600">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Vendor KB callout */}
            <div className="bg-[#f7f9fc] border border-gray-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-bold text-[#003087] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Why Vendor-Supplied Knowledge Bases Are Insufficient</h3>
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Some vendors (including those using Amazon Q as a foundation) offer pre-built Knowledge Bases as part of their service proposition. While this may appear to accelerate onboarding, it fundamentally misunderstands the source of value in a Knowledge Graph.
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    A vendor's KB reflects their previous clients' patterns, generic industry conventions, and their own consulting methodology. It does not — and cannot — contain the context that makes AI genuinely useful on NRMA's systems.
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "What a vendor KB contains", items: ["Generic software patterns (already in the foundation model)", "Previous clients' architectural conventions", "Vendor's own consulting methodology"], color: "text-red-500", dot: "bg-red-400" },
                    { label: "What NRMA's KG must contain", items: ["NRMA-specific domain language and system topology", "Legacy architectural decisions and their rationale", "Team conventions, naming standards, test patterns", "Coupling between business platforms, payments and membership systems"], color: "text-green-600", dot: "bg-green-500" },
                  ].map((group) => (
                    <div key={group.label}>
                      <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${group.color}`}>{group.label}</div>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <div key={item} className="flex items-start gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${group.dot} mt-1.5 shrink-0`} />
                            <span className="text-xs text-gray-600">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KG as a permanent asset */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: "🏗", title: "De-risks Onboarding", body: "New engineers and AI agents alike can query the KG to understand system context, reducing ramp-up time from months to days." },
                { icon: "🧠", title: "Reduces Bus-Factor Risk", body: "Tribal knowledge held by senior engineers is externalised into a queryable, persistent asset that survives personnel changes." },
                { icon: "🔄", title: "Platform-Agnostic Value", body: "The KG is an NRMA asset, not an 8090 asset. If the platform changes in 3 years, the structured knowledge remains and can be migrated." },
              ].map((card) => (
                <div key={card.title} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <div className="text-2xl mb-3">{card.icon}</div>
                  <h4 className="font-bold text-[#003087] text-sm mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{card.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — Financials
        ══════════════════════════════════════════════════════════════════ */}
        <section
          id="financials"
          className={`bg-white border-t border-gray-100 transition-all duration-500 ${isVisible("financials") ? "opacity-100" : "opacity-30 pointer-events-none"}`}
        >
          <div className="container py-16">
            <span className="section-rule" />
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-3xl font-bold text-[#003087] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Financial Model</h2>
                <p className="text-gray-500 text-sm max-w-xl">All figures in AUD. FTE costs fully loaded (base × 1.45). Platform uses mid-range token scenario. Exchange rate: 1 USD = 1.62 AUD.</p>
              </div>
            </div>

            {/* ── SEAT SLIDER ── */}
            <div className="bg-[#f0f4fa] border border-blue-100 rounded-xl p-6 mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <div className="text-xs font-bold text-[#003087] uppercase tracking-widest mb-0.5">Team Size Modeller</div>
                  <p className="text-gray-500 text-xs">Drag the slider to model different team sizes. KG build cost is fixed — savings scale with headcount.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-4xl font-bold text-[#003087]" style={{ fontFamily: "'Playfair Display', serif" }}>{seatCount}</span>
                  <span className="text-sm text-gray-500 leading-tight">seats<br />(users)</span>
                </div>
              </div>
              <Slider
                min={5}
                max={50}
                step={1}
                value={[seatCount]}
                onValueChange={([v]) => setSeatCount(v)}
                className="mb-3"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>5 seats</span>
                <span className="text-[#003087] font-semibold">Current: {seatCount} seats</span>
                <span>50 seats</span>
              </div>
            </div>

            {/* Dynamic KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {[
                {
                  value: `$${(fin.fteCostYr / 1_000_000).toFixed(2)}M`,
                  label: "Total FTE Cost",
                  sub: `${seatCount}-person team, loaded`,
                  color: "text-[#003087]",
                },
                {
                  value: `$${fin.platformCostYr.toLocaleString("en-AU", { maximumFractionDigits: 0 })}`,
                  label: "Platform Cost/yr",
                  sub: `${seatCount} seats + mid tokens`,
                  color: "text-[#003087]",
                },
                {
                  value: `${fin.platformPct.toFixed(1)}%`,
                  label: "Platform vs FTE",
                  sub: "Cost as % of loaded FTE",
                  color: "text-[#FF6600]",
                },
                {
                  value: `$${Math.round(fin.netAnnualSaving / 1000)}k`,
                  label: "Annual Net Saving",
                  sub: `Steady state, ${seatCount - fin.fteSaved} FTE`,
                  color: "text-green-600",
                },
              ].map((s, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm transition-all duration-300">
                  <div className={`text-3xl lg:text-4xl font-bold leading-none mb-1 ${s.color}`} style={{ fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                  <div className="text-[#003087] text-xs font-bold uppercase tracking-wide">{s.label}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Insight callout */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-5 py-3 mb-10 flex flex-wrap gap-6 text-sm">
              <div><span className="text-gray-500">FTE reduction (30%): </span><strong className="text-[#003087]">{fin.fteSaved} FTE saved</strong></div>
              <div><span className="text-gray-500">Annual FTE saving: </span><strong className="text-green-700">${fin.annualFteSaving.toLocaleString("en-AU", { maximumFractionDigits: 0 })}</strong></div>
              <div><span className="text-gray-500">KG build cost (fixed): </span><strong className="text-amber-700">${fin.KG_BUILD.toLocaleString()}</strong></div>
              <div><span className="text-gray-500">Breakeven: </span><strong className="text-[#003087]">Month {fin.breakeven}</strong></div>
              <div><span className="text-gray-500">3-year net saving: </span><strong className="text-green-700">${(fin.netSaving3yr / 1_000_000).toFixed(2)}M</strong></div>
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-2 gap-8 mb-10">
              {/* Annual cost comparison */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h4 className="text-base font-bold text-[#003087] mb-1">Annual Cost by FTE Reduction Scenario</h4>
                <p className="text-xs text-gray-500 mb-5">Steady state, mid token usage (AUD $000s) — {seatCount} seats</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={fin.annualBarData} barGap={2} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}k`} />
                    <Tooltip content={<CustomTooltip prefix="$" suffix="k" />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="fte" name="FTE Cost" stackId="a" fill="#003087" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="platform" name="Platform Cost" stackId="a" fill="#FF6600" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Cumulative cost */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h4 className="text-base font-bold text-[#003087] mb-1">Cumulative Cost Over 36 Months</h4>
                <p className="text-xs text-gray-500 mb-5">Moderate scenario — {fin.fteSaved} FTE reduction post KG build (AUD $000s)</p>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={fin.cumData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => v === 6 ? "M6 (KG)" : `M${v}`}
                      ticks={[1, 6, 12, 18, 24, 30, 36]} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(1)}M`} />
                    <Tooltip content={<CustomTooltip prefix="$" suffix="k" />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <ReferenceArea x1={1} x2={6} fill="#fef3c7" fillOpacity={0.5} />
                    <ReferenceLine x={fin.breakeven} stroke="#6366f1" strokeDasharray="4 3"
                      label={{ value: `Breakeven M${fin.breakeven}`, position: "top", fontSize: 10, fill: "#6366f1" }} />
                    <Line type="monotone" dataKey="statusQuo" name="Status Quo" stroke="#ef4444" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="with8090" name="With 8090" stroke="#003087" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                  <TrendingUp size={14} />
                  <span><strong>${(fin.netSaving3yr / 1_000_000).toFixed(2)}M net saving</strong> over 3 years · Breakeven at Month {fin.breakeven}</span>
                </div>
              </div>
            </div>

            {/* Token scenarios table */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-[#003087] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Platform Cost — Token Scenarios ({seatCount} seats)</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Scenario</th>
                      <th>Tokens/Dev/Mo</th>
                      <th className="text-right">Seat Cost/yr</th>
                      <th className="text-right">Token Cost/yr</th>
                      <th className="text-right">Total Platform</th>
                      <th className="text-right">% of FTE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { scenario: "Conservative", tokens: "1.5M", tokenMult: 0.6 },
                      { scenario: "Moderate (Expected)", tokens: "4.0M", tokenMult: 1.0, highlight: true },
                      { scenario: "High (MCP-Heavy)", tokens: "8.0M", tokenMult: 2.0 },
                    ].map((row) => {
                      const sc = fin.seatCostYr;
                      const tc = fin.tokenCostYr * row.tokenMult;
                      const tot = sc + tc;
                      const pct = (tot / fin.fteCostYr * 100).toFixed(1);
                      return (
                        <tr key={row.scenario} className={row.highlight ? "highlight" : ""}>
                          <td className="font-medium">{row.scenario}</td>
                          <td className="text-gray-500">{row.tokens}</td>
                          <td className="text-right text-gray-500">${sc.toLocaleString("en-AU", { maximumFractionDigits: 0 })}</td>
                          <td className="text-right text-gray-500">${tc.toLocaleString("en-AU", { maximumFractionDigits: 0 })}</td>
                          <td className="text-right font-semibold text-[#003087]">${tot.toLocaleString("en-AU", { maximumFractionDigits: 0 })}</td>
                          <td className="text-right font-bold text-[#FF6600]">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-700 flex items-start gap-2">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span><strong>PoC flagged:</strong> MCP cache reads are the primary token cost driver. Governance required before executing large work orders.</span>
              </div>
            </div>

            {/* 3-year TCO summary */}
            <div className="bg-[#f7f9fc] border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-[#003087] mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>3-Year Total Cost of Ownership — {seatCount} Seats</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { year: "Year 1", sq: fin.statusQuo3yr / 3, w8090: fin.yr1, note: `Includes 6-mo KG build + ${seatCount - fin.fteSaved} FTE for 6 mo` },
                  { year: "Year 2", sq: fin.statusQuo3yr / 3, w8090: fin.yr2, note: `${seatCount - fin.fteSaved} FTE + platform (steady state)` },
                  { year: "Year 3", sq: fin.statusQuo3yr / 3, w8090: fin.yr3, note: `${seatCount - fin.fteSaved} FTE + platform (steady state)` },
                ].map((row, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded p-4">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{row.year}</div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Status Quo</span>
                      <span className="text-sm font-semibold text-red-500">${row.sq.toLocaleString("en-AU", { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">With 8090</span>
                      <span className="text-sm font-semibold text-[#003087]">${row.w8090.toLocaleString("en-AU", { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="text-xs text-gray-400 border-t border-gray-100 pt-2 mt-2">{row.note}</div>
                  </div>
                ))
              }
              </div>
              <div className="mt-5 bg-green-50 border border-green-200 rounded-lg p-4 flex flex-wrap gap-6">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">3-Year Status Quo</div>
                  <div className="text-xl font-bold text-red-500" style={{ fontFamily: "'Playfair Display', serif" }}>${(fin.statusQuo3yr / 1_000_000).toFixed(2)}M</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">3-Year With 8090</div>
                  <div className="text-xl font-bold text-[#003087]" style={{ fontFamily: "'Playfair Display', serif" }}>${((fin.yr1 + fin.yr2 + fin.yr3) / 1_000_000).toFixed(2)}M</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">3-Year Net Saving</div>
                  <div className="text-xl font-bold text-green-700" style={{ fontFamily: "'Playfair Display', serif" }}>${(fin.netSaving3yr / 1_000_000).toFixed(2)}M</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Breakeven</div>
                  <div className="text-xl font-bold text-[#003087]" style={{ fontFamily: "'Playfair Display', serif" }}>Month {fin.breakeven}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 4 — Roadmap
        ══════════════════════════════════════════════════════════════════ */}
        <section
          id="roadmap"
          className={`bg-[#f7f9fc] border-t border-gray-100 transition-all duration-500 ${isVisible("roadmap") ? "opacity-100" : "opacity-30 pointer-events-none"}`}
        >
          <div className="container py-16">
            <span className="section-rule" />
            <div className="grid lg:grid-cols-3 gap-12 items-start mb-12">
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-[#003087] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Implementation Roadmap</h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  The PoC confirmed that 8090 is not currently suitable for existing codebases. A structured two-phase approach is required: a 6-month Knowledge Graph build as a mandatory prerequisite, followed by full steady-state operation with an optimised team structure.
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded p-5 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Phase 1 Investment</div>
                <div className="stat-number mb-1">$174k</div>
                <div className="text-gray-500 text-sm">One-off KG build cost</div>
                <div className="mt-3 text-xs text-gray-400">Recoverable in Month 7 via FTE savings</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {roadmapPhases.map((phase, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <div className={`${i === 0 ? "bg-amber-500" : "bg-[#003087]"} text-white p-5`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold uppercase tracking-widest opacity-80">{phase.phase}</div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${i === 0 ? "bg-amber-600 text-white" : "bg-blue-800 text-white"}`}>{phase.status}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{phase.title}</h3>
                    <div className="text-sm opacity-80">{phase.duration} · {phase.cost}</div>
                  </div>
                  <div className="p-5">
                    <ul className="space-y-2">
                      {phase.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-gray-600">
                          <CheckCircle2 size={15} className={`mt-0.5 shrink-0 ${i === 0 ? "text-amber-500" : "text-[#003087]"}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-base font-bold text-[#003087] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>36-Month Timeline</h3>
              <div className="relative">
                <div className="flex items-center gap-0 mb-3">
                  {Array.from({ length: 36 }, (_, i) => i + 1).map((m) => (
                    <div
                      key={m}
                      className={`flex-1 h-8 flex items-center justify-center text-xs font-semibold border-r border-white last:border-r-0 ${
                        m <= 6 ? "bg-amber-400 text-white" :
                        m <= 12 ? "bg-[#003087] text-white" :
                        "bg-blue-100 text-[#003087]"
                      }`}
                      title={`Month ${m}`}
                    >
                      {m === 1 ? "M1" : m === 6 ? "M6" : m === 7 ? "M7" : m === 12 ? "M12" : m === 24 ? "M24" : m === 36 ? "M36" : ""}
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 flex-wrap text-xs">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-400 rounded-sm" /><span className="text-gray-600">Phase 1: KG Build (M1–M6)</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#003087] rounded-sm" /><span className="text-gray-600">Transition (M7–M12)</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-100 rounded-sm border border-blue-200" /><span className="text-gray-600">Steady State (M13+)</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 5 — Risks & Gaps
        ══════════════════════════════════════════════════════════════════ */}
        <section
          id="risks"
          className={`bg-white border-t border-gray-100 transition-all duration-500 ${isVisible("risks") ? "opacity-100" : "opacity-30 pointer-events-none"}`}
        >
          <div className="container py-16">
            <span className="section-rule" />
            <div className="grid lg:grid-cols-3 gap-12 items-start mb-12">
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-[#003087] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Risks, Gaps & Mitigations</h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  The PoC was candid about the platform's current limitations. These are not reasons to reject adoption — they are known, manageable constraints with clear mitigations.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "High", count: 2, color: "bg-red-50 border-red-200 text-red-700" },
                  { label: "Medium", count: 2, color: "bg-amber-50 border-amber-200 text-amber-700" },
                  { label: "Low", count: 2, color: "bg-green-50 border-green-200 text-green-700" },
                ].map((s) => (
                  <div key={s.label} className={`border rounded p-3 ${s.color}`}>
                    <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{s.count}</div>
                    <div className="text-xs font-bold uppercase tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {risks.map((risk, i) => {
                const Icon = risk.icon;
                const severityStyle = {
                  high: "border-red-200 bg-red-50",
                  medium: "border-amber-200 bg-amber-50",
                  low: "border-green-200 bg-green-50",
                }[risk.severity];
                const iconColor = {
                  high: "text-red-500",
                  medium: "text-amber-500",
                  low: "text-green-500",
                }[risk.severity];
                const badgeStyle = {
                  high: "bg-red-100 text-red-700",
                  medium: "bg-amber-100 text-amber-700",
                  low: "bg-green-100 text-green-700",
                }[risk.severity];
                return (
                  <div key={i} className={`border rounded-lg p-5 ${severityStyle}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <Icon size={18} className={`mt-0.5 shrink-0 ${iconColor}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-800 text-sm">{risk.title}</h4>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide ${badgeStyle}`}>{risk.severity}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{risk.description}</p>
                      </div>
                    </div>
                    <div className="bg-white/70 border border-white rounded p-3 ml-7">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Mitigation</div>
                      <p className="text-xs text-gray-600 leading-relaxed">{risk.mitigation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            SECTION 6 — Recommendation
        ══════════════════════════════════════════════════════════════════ */}
        <section
          id="recommendation"
          className={`bg-[#003087] text-white border-t border-blue-900 transition-all duration-500 ${isVisible("recommendation") ? "opacity-100" : "opacity-30 pointer-events-none"}`}
        >
          <div className="container py-16">
            <span className="block w-12 h-0.5 bg-blue-400 mb-5" />
            <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Strategic Recommendation</h2>
            <p className="text-blue-200 text-base mb-12 max-w-2xl">
              Based on the PoC findings and the financial modelling presented in this document, we recommend the following three actions.
            </p>

            <div className="grid lg:grid-cols-3 gap-6 mb-12">
              {[
                {
                  num: "01",
                  title: "Approve the Knowledge Graph Build",
                  body: "Allocate $173,755 AUD for a 6-month Phase 1 investment to ingest the legacy codebase into 8090's Knowledge Graph. This is a confirmed prerequisite — without it, 8090 cannot be used on existing systems.",
                  action: "Approve Phase 1 budget",
                },
                {
                  num: "02",
                  title: "Implement Token Governance",
                  body: "Establish token budgets per work order before execution begins. Assign a technical owner to monitor usage via the 8090 admin console weekly during Phase 1. MCP cache reads are the primary cost risk.",
                  action: "Assign governance owner",
                },
                {
                  num: "03",
                  title: "Transition to 7-FTE Model at Month 7",
                  body: "Upon completion of the Knowledge Graph build, transition to the 7-FTE optimised structure. This realises a net annual saving of $604k AUD while maintaining current delivery velocity.",
                  action: "Plan FTE transition",
                },
              ].map((rec, i) => (
                <div key={i} className="bg-blue-800/40 border border-blue-700 rounded-lg p-6">
                  <div className="text-5xl font-bold text-blue-700 leading-none mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{rec.num}</div>
                  <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>{rec.title}</h3>
                  <p className="text-blue-200 text-sm leading-relaxed mb-5">{rec.body}</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
                    <ChevronRight size={13} />
                    {rec.action}
                  </div>
                </div>
              ))}
            </div>

            {/* Final summary strip */}
            <div className="border-t border-blue-800 pt-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Phase 1 Investment", value: "$173,755", sub: "One-off, 6 months" },
                  { label: "Platform Cost (Annual)", value: "$44,945", sub: "2.1% of FTE cost" },
                  { label: "Annual Net Saving (Y2+)", value: "$604k", sub: "Moderate scenario" },
                  { label: "3-Year Net Saving", value: "$1.67M", sub: "Breakeven: Month 7" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">{s.label}</div>
                    <div className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                    <div className="text-blue-400 text-xs mt-0.5">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#f7f9fc] border-t border-gray-200">
          <div className="container py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-[#003087] font-bold text-sm mb-1" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>NRMA Technology · 8090 PoC Business Case</div>
                <div className="text-gray-400 text-xs">Prepared for CTO presentation · May 2026 · All figures AUD · FTE costs fully loaded at ×1.45</div>
              </div>
              <div className="text-xs text-gray-400 text-right">
                <div>Source: HO-8090POCFindings-050526-034336.pdf</div>
                <div>Platform pricing: 8090.ai · FTE benchmarks: 2026 AUS market data</div>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
