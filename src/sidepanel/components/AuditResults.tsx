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
              <h3 className="text-[14px] font-bold text-slate-600 uppercase tracking-widest mb-5">
                Audit Summary
              </h3>
              <div className="grid gap-3">
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
                      className="flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-indigo-300 transition-all text-left group rounded-xl"
                    >
                      <span className="text-[15px] font-semibold text-slate-700">
                        {cat}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[12px] font-bold px-2.5 py-1 border rounded-md ${severityColor}`}
                        >
                          {issues.length} Issues
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-slate-500 group-hover:text-indigo-400 transition-colors"
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
            <h3 className="text-[14px] font-bold text-slate-600 uppercase tracking-widest mb-5">
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
              <h3 className="text-[14px] font-bold text-slate-600 uppercase tracking-widest mb-5">
                Headings Structure
              </h3>
              <div className="bg-white border border-slate-200 overflow-hidden rounded-xl">
                {report.raw.headings.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-[12px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 uppercase shrink-0 rounded-md">
                      {h.tag}
                    </span>
                    <span className="text-[15px] text-slate-700 font-medium leading-relaxed">
                      {h.text}
                    </span>
                  </div>
                ))}
                {report.raw.headings.length === 0 && (
                  <div className="p-8 text-center text-slate-500 italic text-sm">
                    No headings found on this page.
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-[14px] font-bold text-slate-600 uppercase tracking-widest mb-5">
                Images Analysis ({report.raw.images.length})
              </h3>
              <div className="grid gap-4">
                {report.raw.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 bg-white border border-slate-200 hover:border-indigo-200 transition-all rounded-xl shadow-sm"
                  >
                    <div className="w-14 h-14 bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center border border-slate-100 rounded-lg">
                      {img.src ? (
                        <img
                          src={img.src}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={24} className="text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className="text-[12px] font-bold text-slate-500 shrink-0 uppercase tracking-tight">
                            ALT:
                          </span>
                          <span
                            className={`text-[13px] font-semibold truncate ${
                              img.alt ? "text-slate-800" : "text-red-600 italic"
                            }`}
                          >
                            {img.alt || "Missing alternative text"}
                          </span>
                        </div>
                        {img.width && img.height && (
                          <span className="text-[11px] text-slate-500 font-mono font-medium shrink-0">
                            {img.width}×{img.height}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate font-medium">
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
          <div className="animate-in fade-in duration-300">
            <div className="bg-slate-50/30 border-b border-slate-100 flex px-4 pb-4">
              <div className="text-[14px] font-bold text-slate-600 uppercase tracking-widest">
                Link Details & Metadata
              </div>
            </div>
            <div className="bg-white">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                  <button
                    onClick={() => setLinkFilter("all")}
                    className={`p-2.5 text-[11px] font-bold uppercase tracking-tight transition-all rounded-l-md ${
                      linkFilter === "all"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    All ({report.raw.links.length})
                  </button>
                  <button
                    onClick={() => setLinkFilter("internal")}
                    className={`p-2.5 text-[11px] font-bold uppercase tracking-tight transition-all ${
                      linkFilter === "internal"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Int ({internalLinks.length})
                  </button>
                  <button
                    onClick={() => setLinkFilter("external")}
                    className={`p-2.5 text-[11px] font-bold uppercase tracking-tight transition-all rounded-r-md ${
                      linkFilter === "external"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Ext ({externalLinks.length})
                  </button>
                </div>

                <div className="relative flex-1 max-w-[140px]">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    placeholder="Search links..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 pl-8 pr-3 py-2 text-[13px] font-medium text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-md"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {filteredLinks.map((link, idx) => {
                  const isExpanded = expandedLinkId === idx;
                  return (
                    <div key={idx} className="flex flex-col">
                      <button
                        onClick={() =>
                          setExpandedLinkId(isExpanded ? null : idx)
                        }
                        className="flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[15px] font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                              {link.text || (
                                <span className="text-slate-500 italic font-normal">
                                  No anchor text
                                </span>
                              )}
                            </span>
                            {link.isInternal ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                INT
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                EXT
                              </span>
                            )}
                          </div>
                          <div className="text-[12px] text-slate-400 truncate">
                            {link.href}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={18} className="text-indigo-500" />
                        ) : (
                          <ChevronDown
                            size={18}
                            className="text-slate-500 group-hover:text-slate-500"
                          />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="bg-slate-100 p-5 border-t border-slate-100 space-y-5 animate-in slide-in-from-top-1 duration-200">
                          <div className="grid gap-4">
                            <div>
                              <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                Full Destination URL
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-[13px] text-slate-700 break-all bg-white border border-slate-200 p-3 block flex-1 rounded-lg font-medium">
                                  {link.href}
                                </span>
                                <a
                                  href={link.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all rounded-lg"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                  Rel Attribute
                                </div>
                                <div className="text-[13px] font-medium text-slate-700 bg-white border border-slate-200 p-3 truncate rounded-lg">
                                  {link.rel || (
                                    <span className="text-slate-500 italic font-normal">
                                      none defined
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                  Target Frame
                                </div>
                                <div className="text-[13px] font-medium text-slate-700 bg-white border border-slate-200 p-3 truncate rounded-lg">
                                  {link.target || (
                                    <span className="text-slate-500 italic font-normal">
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
                    <p className="text-slate-500 text-sm font-medium">
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
                className={`flex flex-wrap justify-center items-center flex-1 py-2.5 px-1 transition-all border-b-2 gap-2 ${
                  isActive
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[11px] font-bold uppercase tracking-tighter">
                  {Tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="py-4 min-h-0 overflow-y-auto">{renderTabContent()}</main>
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

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h4 className="text-[15px] font-bold text-slate-800 leading-tight flex-1">
            {issue.name}
          </h4>
          <span
            className={`text-[11px] font-black px-2 py-1 uppercase tracking-wider whitespace-nowrap rounded-md ${
              badgeStyles[issue.severity]
            }`}
          >
            {issue.severity}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2.5">
            <Info size={16} className="text-slate-500 mt-0.5 shrink-0" />
            <div className="text-[13px] leading-relaxed text-slate-700">
              <span className="font-bold text-slate-900 mr-1.5">
                Why it matters:
              </span>
              {issue.importance}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">
              Finding
            </div>
            <div className="text-[13px] text-slate-800 font-semibold italic">
              "{issue.finding}"
            </div>
          </div>

          {!isSuccess && (
            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
              <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest mb-1.5">
                Actionable Fix
              </div>
              <div className="text-[13px] text-slate-900 leading-relaxed font-semibold">
                {issue.fix}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
