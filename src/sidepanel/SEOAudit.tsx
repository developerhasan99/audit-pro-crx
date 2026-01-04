import React, { useState, useEffect, useCallback } from "react";
import { AuditResults } from "./components/AuditResults";
import { runPageAudit } from "@/utils/auditScript";
import { evaluateAudit, AuditReport } from "@/utils/auditEngine";
import { RefreshCw, Layout } from "lucide-react";
import "./index.css";

export const SEOAudit: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");

  const handleRunAudit = useCallback(async () => {
    setLoading(true);
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id || tab.url?.startsWith("chrome://")) {
        setLoading(false);
        return;
      }

      const [response] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: runPageAudit,
      });

      if (response?.result) {
        const processedReport = evaluateAudit(response.result);
        setReport(processedReport);
        setCurrentUrl(response.result.url);
      }
    } catch (error) {
      console.error("Audit failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleRunAudit();

    const tabListener = (_tabId: number, changeInfo: any, tab: any) => {
      if (changeInfo.status === "complete" && tab.active) {
        handleRunAudit();
      }
    };

    const activeListener = (_activeInfo: any) => {
      handleRunAudit();
    };

    chrome.tabs.onUpdated.addListener(tabListener);
    chrome.tabs.onActivated.addListener(activeListener);

    return () => {
      chrome.tabs.onUpdated.removeListener(tabListener);
      chrome.tabs.onActivated.removeListener(activeListener);
    };
  }, [handleRunAudit]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="sticky top-0 z-200 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1 rounded">
                <Layout size={16} className="text-white" />
              </div>
              <h1 className="text-lg font-black text-indigo-600 tracking-tight">
                AUDIT PRO
              </h1>
            </div>
            <p
              className="text-[11px] text-slate-400 mt-1 line-clamp-1 truncate block"
              title={currentUrl}
            >
              {currentUrl || "Initializing analyzer..."}
            </p>
          </div>
          <button
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg p-2 transition-colors"
            onClick={handleRunAudit}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {report ? (
        <AuditResults report={report} />
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <RefreshCw size={40} className="animate-spin text-indigo-600 mb-4" />
          <p className="text-sm font-medium">Analyzing Page Architecture...</p>
        </main>
      )}
    </div>
  );
};
