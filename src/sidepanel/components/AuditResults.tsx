import React, { useState } from "react";
import { ScoreDisplay } from "./ScoreDisplay";
import { AuditReport, AuditIssue } from "@/utils/auditEngine";
import {
  BarChart3,
  AlertTriangle,
  FileText,
  Link2,
  ChevronRight,
  CheckCircle2,
  Info,
  ExternalLink,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  Search,
  Download,
} from "lucide-react";

interface AuditResultsProps {
  report: AuditReport;
}

const TABS = [
  { id: "Overview", label: "Overview", icon: BarChart3 },
  { id: "Issues", label: "Issues", icon: AlertTriangle },
  { id: "Content", label: "Content", icon: FileText },
  { id: "Links", label: "Links", icon: Link2 },
];

export const AuditResults: React.FC<AuditResultsProps> = ({ report }) => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [expandedLinkId, setExpandedLinkId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [linkFilter, setLinkFilter] = useState<"all" | "internal" | "external">(
    "all"
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        // ... previous implementation (no changes here but kept for context if needed, but I'll use target/replacement carefully)
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-center py-6 bg-white border border-slate-200 rounded-2xl mx-4 my-6 shadow-sm">
              <ScoreDisplay score={report.score} />
            </div>
            <div className="px-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Audit Summary
              </h3>
              <div className="grid gap-2">
                {Object.entries(report.categories).map(([cat, items]) => {
                  const issues = items.filter((i) => i.severity !== "Success");
                  if (issues.length === 0) return null;

                  const targetTab =
                    cat === "Content" || cat === "Metadata"
                      ? "Content"
                      : cat === "Crawlability" || cat === "Security"
                      ? "Links"
                      : "Issues";

                  const severityColor =
                    issues[0].severity === "Critical"
                      ? "bg-red-50 text-red-700 border-red-100"
                      : issues[0].severity === "High"
                      ? "bg-orange-50 text-orange-700 border-orange-100"
                      : "bg-amber-50 text-amber-700 border-amber-100";

                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveTab(targetTab)}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-indigo-300 transition-all text-left group rounded-xl"
                    >
                      <span className="text-sm font-semibold text-slate-700">
                        {cat}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 border rounded-md ${severityColor}`}
                        >
                          {issues.length} Issues
                        </span>
                        <ChevronRight
                          size={14}
                          className="text-slate-300 group-hover:text-indigo-400 transition-colors"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "Issues":
        const allIssues = Object.values(report.categories)
          .flat()
          .filter((i) => i.severity !== "Success");
        return (
          <div className="px-4 animate-in fade-in duration-300">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Action Required
            </h3>
            {allIssues.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
            {allIssues.length === 0 && (
              <div className="py-12 text-center">
                <CheckCircle2
                  size={48}
                  className="text-emerald-500 mx-auto mb-4 opacity-20"
                />
                <p className="text-slate-500 font-medium">
                  Everything looks great!
                </p>
              </div>
            )}
          </div>
        );

      case "Content":
        return (
          <div className="px-4 animate-in fade-in duration-300 space-y-8">
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Headings Structure
              </h3>
              <div className="bg-white border border-slate-200 overflow-hidden rounded-xl">
                {report.raw.headings.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 uppercase shrink-0 rounded-md">
                      {h.tag}
                    </span>
                    <span className="text-sm text-slate-700 font-medium">
                      {h.text}
                    </span>
                  </div>
                ))}
                {report.raw.headings.length === 0 && (
                  <div className="p-8 text-center text-slate-400 italic text-sm">
                    No headings found on this page.
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Images Analysis ({report.raw.images.length})
              </h3>
              <div className="grid gap-3">
                {report.raw.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-3 bg-white border border-slate-200 hover:border-indigo-200 transition-all rounded-xl shadow-sm"
                  >
                    <div className="w-12 h-12 bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center border border-slate-100 rounded-lg">
                      {img.src ? (
                        <img
                          src={img.src}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={20} className="text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">
                            ALT:
                          </span>
                          <span
                            className={`text-[11px] font-medium truncate ${
                              img.alt ? "text-slate-700" : "text-red-500 italic"
                            }`}
                          >
                            {img.alt || "Missing alt text"}
                          </span>
                        </div>
                        {img.width && img.height && (
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {img.width}×{img.height}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {img.src}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );

      case "Links":
        const internalLinks = report.raw.links.filter((l) => l.isInternal);
        const externalLinks = report.raw.links.filter((l) => l.isExternal);
        const filteredLinks = report.raw.links.filter((l) => {
          const matchesCategory =
            linkFilter === "all" ||
            (linkFilter === "internal" ? l.isInternal : l.isExternal);
          const matchesSearch =
            !searchQuery ||
            l.href.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.text.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesCategory && matchesSearch;
        });

        return (
          <div className="animate-in fade-in duration-300 space-y-4 px-4">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                  <button
                    onClick={() => setLinkFilter("all")}
                    className={`p-2 text-[10px] font-bold uppercase tracking-tight transition-all rounded-l-md ${
                      linkFilter === "all"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    All ({report.raw.links.length})
                  </button>
                  <button
                    onClick={() => setLinkFilter("internal")}
                    className={`p-2 text-[10px] font-bold uppercase tracking-tight transition-all ${
                      linkFilter === "internal"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Int ({internalLinks.length})
                  </button>
                  <button
                    onClick={() => setLinkFilter("external")}
                    className={`p-2 text-[10px] font-bold uppercase tracking-tight transition-all rounded-r-md ${
                      linkFilter === "external"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Ext ({externalLinks.length})
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                  <div className="relative flex-1 max-w-[120px]">
                    <Search
                      size={12}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Search links..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 pl-7 pr-2 py-1.5 text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                <div className="bg-slate-50/30 border-b border-slate-100 flex px-4 py-2">
                  <div className="flex-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Link Details & Metadata
                  </div>
                </div>
                {filteredLinks.map((link, idx) => {
                  const isExpanded = expandedLinkId === idx;
                  return (
                    <div key={idx} className="flex flex-col">
                      <button
                        onClick={() =>
                          setExpandedLinkId(isExpanded ? null : idx)
                        }
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                              {link.text || (
                                <span className="text-slate-300 italic font-normal">
                                  No anchor text
                                </span>
                              )}
                            </span>
                            {link.isInternal ? (
                              <span className="inline-flex items-center gap-1 text-[8px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">
                                INT
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                                EXT
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate font-medium">
                            {link.href}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-indigo-400" />
                        ) : (
                          <ChevronDown
                            size={16}
                            className="text-slate-300 group-hover:text-slate-400"
                          />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="bg-slate-50/50 p-4 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-1 duration-200">
                          <div className="grid gap-3">
                            <div>
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                Full Destination URL
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-600 break-all bg-white border border-slate-200 p-2.5 block flex-1 rounded-lg shadow-sm font-medium">
                                  {link.href}
                                </span>
                                <a
                                  href={link.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm rounded-lg"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                  Rel Attribute
                                </div>
                                <div className="text-[11px] font-medium text-slate-600 bg-white border border-slate-200 p-2.5 truncate rounded-lg shadow-sm">
                                  {link.rel || (
                                    <span className="text-slate-300 italic font-normal">
                                      none defined
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                  Target Frame
                                </div>
                                <div className="text-[11px] font-medium text-slate-600 bg-white border border-slate-200 p-2.5 truncate rounded-lg shadow-sm">
                                  {link.target || (
                                    <span className="text-slate-300 italic font-normal">
                                      _self (default)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredLinks.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                      {searchQuery
                        ? `No matches for "${searchQuery}"`
                        : `No ${linkFilter} links found.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <nav className="sticky top-[65px] z-100 bg-white border-b border-slate-200">
        <div className="flex justify-around items-center px-1">
          {TABS.map((Tab) => {
            const Icon = Tab.icon;
            const isActive = activeTab === Tab.id;
            return (
              <button
                key={Tab.id}
                onClick={() => setActiveTab(Tab.id)}
                className={`flex flex-wrap justify-center items-center flex-1 py-3 px-1 transition-all border-b-2 gap-1.5 ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  {Tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="py-6 min-h-0 overflow-y-auto">{renderTabContent()}</main>
    </div>
  );
};

const IssueCard: React.FC<{ issue: AuditIssue }> = ({ issue }) => {
  const isSuccess = issue.severity === "Success";

  const badgeStyles = {
    Critical: "bg-red-500 text-white",
    High: "bg-orange-500 text-white",
    Medium: "bg-amber-500 text-white",
    Low: "bg-blue-500 text-white",
    Success: "bg-emerald-500 text-white",
  };

  return (
    <div
      className={`mb-4 overflow-hidden rounded-2xl border bg-white transition-all ${
        isSuccess ? "border-emerald-100" : "border-slate-200"
      }`}
    >
      <div
        className={`h-1.5 w-full ${
          isSuccess
            ? "bg-emerald-500"
            : issue.severity === "Critical"
            ? "bg-red-500"
            : issue.severity === "High"
            ? "bg-orange-500"
            : issue.severity === "Medium"
            ? "bg-amber-500"
            : "bg-blue-500"
        }`}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="text-sm font-bold text-slate-800 leading-tight flex-1">
            {issue.name}
          </h4>
          <span
            className={`text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wider whitespace-nowrap rounded-md ${
              badgeStyles[issue.severity]
            }`}
          >
            {issue.severity}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
            <div className="text-[11px] leading-relaxed text-slate-600">
              <span className="font-bold text-slate-800 mr-1">
                Why it matters:
              </span>
              {issue.importance}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Finding
            </div>
            <div className="text-[11px] text-slate-700 font-medium italic">
              "{issue.finding}"
            </div>
          </div>

          {!isSuccess && (
            <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl">
              <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-1">
                Actionable Fix
              </div>
              <div className="text-[11px] text-slate-800 leading-relaxed font-medium">
                {issue.fix}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
