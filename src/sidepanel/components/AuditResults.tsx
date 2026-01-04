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

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-center py-6 bg-white border-b border-slate-100 mb-4">
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
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-all text-left shadow-sm group"
                    >
                      <span className="text-sm font-semibold text-slate-700">
                        {cat}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severityColor}`}
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
        const contentIssues = [
          ...(report.categories["Content"] || []),
          ...(report.categories["Metadata"] || []),
        ];
        return (
          <div className="px-4 animate-in fade-in duration-300">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Content Analysis
            </h3>
            {contentIssues.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
          </div>
        );

      case "Links":
        const linkIssues = [
          ...(report.categories["Crawlability"] || []),
          ...(report.categories["Security"] || []),
          ...(report.categories["Mobile"] || []),
        ];
        return (
          <div className="px-4 animate-in fade-in duration-300">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Technical & Performance
            </h3>
            {linkIssues.map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
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
    Critical: "bg-red-100 text-red-700",
    High: "bg-orange-100 text-orange-700",
    Medium: "bg-amber-100 text-amber-700",
    Low: "bg-blue-100 text-blue-700",
    Success: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div
      className={`mb-4 overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
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
            className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider whitespace-nowrap ${
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

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              Finding
            </div>
            <div className="text-[11px] text-slate-700 font-medium italic">
              "{issue.finding}"
            </div>
          </div>

          {!isSuccess && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3">
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
