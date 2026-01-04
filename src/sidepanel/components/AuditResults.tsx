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

        const handleExportCSV = () => {
          const headers = ["Text", "URL", "Type", "Rel", "Target"];
          const rows = filteredLinks.map((l) => [
            `"${(l.text || "No anchor text").replace(/"/g, '""')}"`,
            `"${l.href.replace(/"/g, '""')}"`,
            l.isInternal ? "Internal" : "External",
            `"${(l.rel || "").replace(/"/g, '""')}"`,
            `"${(l.target || "").replace(/"/g, '""')}"`,
          ]);

          const csvContent = [
            headers.join(","),
            ...rows.map((r) => r.join(",")),
          ].join("\n");

          const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute(
            "download",
            `seo_links_export_${new Date().getTime()}.csv`
          );
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        return (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between px-4 pb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-[17px] font-bold text-slate-800 tracking-tight leading-none mb-1.5 flex items-center gap-2">
                  Link Inventory
                </h3>
                <p className="text-[11px] font-medium text-slate-500">
                  {report.raw.links.length} Discovered URLs on Page
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-900 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <Download size={13} strokeWidth={2.5} />
                Export CSV
              </button>
            </div>
            <div className="bg-white border-y border-slate-100">
              <div className="p-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setLinkFilter("all")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight transition-all ${
                      linkFilter === "all"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    All ({report.raw.links.length})
                  </button>
                  <button
                    onClick={() => setLinkFilter("internal")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight transition-all border-x border-slate-100 ${
                      linkFilter === "internal"
                        ? "bg-slate-800 text-white shadow-sm border-transparent"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Int ({internalLinks.length})
                  </button>
                  <button
                    onClick={() => setLinkFilter("external")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight transition-all ${
                      linkFilter === "external"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Ext ({externalLinks.length})
                  </button>
                </div>

                <div className="relative flex-1 max-w-[150px]">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search links..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 pl-8 pr-3 py-1.5 text-[12px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 rounded-md transition-all"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-50 max-h-[550px] overflow-y-auto">
                {filteredLinks.map((link, idx) => {
                  const isExpanded = expandedLinkId === idx;
                  return (
                    <div key={idx} className="flex flex-col">
                      <button
                        onClick={() =>
                          setExpandedLinkId(isExpanded ? null : idx)
                        }
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 transition-colors text-left group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[14px] font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                              {link.text || (
                                <span className="text-slate-400 italic font-normal">
                                  No anchor text
                                </span>
                              )}
                            </span>
                            {link.isInternal ? (
                              <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                Internal
                              </span>
                            ) : (
                              <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-tighter border border-amber-100/50">
                                External
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate font-normal">
                            {link.href}
                          </div>
                        </div>
                        <div
                          className={`transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          <ChevronDown
                            size={16}
                            className={`${
                              isExpanded
                                ? "text-indigo-500"
                                : "text-slate-300 group-hover:text-slate-400"
                            }`}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="bg-slate-50/50 p-4 border-t border-slate-50 space-y-4 animate-in slide-in-from-top-1 duration-200">
                          <div className="grid gap-4">
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                Destination URL
                              </div>
                              <div className="flex items-start gap-2">
                                <div className="text-[12px] text-slate-600 break-all bg-white border border-slate-100 p-2.5 flex-1 rounded-md font-medium leading-relaxed">
                                  {link.href}
                                </div>
                                <a
                                  href={link.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all rounded-md shadow-sm"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                  Rel Attribute
                                </div>
                                <div className="text-[12px] font-medium text-slate-600 bg-white border border-slate-100 p-2.5 truncate rounded-md">
                                  {link.rel || (
                                    <span className="text-slate-300 italic font-normal">
                                      none
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                  Target
                                </div>
                                <div className="text-[12px] font-medium text-slate-600 bg-white border border-slate-100 p-2.5 truncate rounded-md">
                                  {link.target || (
                                    <span className="text-slate-300 italic font-normal">
                                      _self
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
                  <div className="py-20 text-center bg-white">
                    <p className="text-slate-400 text-[13px] font-medium">
                      {searchQuery
                        ? `No matches for "${searchQuery}"`
                        : `No content to display.`}
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
