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

  const handleLocateImage = useCallback(async (src: string, alt?: string) => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) return;

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (imageSrc: string, imageAlt?: string) => {
          const findImage = () => {
            const imgs = Array.from(document.querySelectorAll("img"));

            // 1. Exact match on currentSrc or src + alt
            let found = imgs.find(
              (i) =>
                (i.currentSrc === imageSrc || i.src === imageSrc) &&
                (!imageAlt || i.alt === imageAlt)
            );
            if (found) return found;

            // 2. Responsive match
            found = imgs.find((i) => i.currentSrc === imageSrc);
            if (found) return found;

            // 3. Absolute path match
            try {
              const targetPath = new URL(imageSrc).pathname;
              found = imgs.find((i) => {
                try {
                  return new URL(i.src).pathname === targetPath;
                } catch {
                  return false;
                }
              });
              if (found) return found;
            } catch {}

            return imgs.find((i) => i.src === imageSrc);
          };

          const target = findImage();

          if (target) {
            console.log("[Audit Pro] Spotlighting image:", target);
            target.scrollIntoView({ behavior: "smooth", block: "center" });

            // Cleanup any existing locator
            const cleanup = () => {
              const el = document.getElementById("seo-audit-spotlight-root");
              if (el) el.remove();
            };
            cleanup();

            const root = document.createElement("div");
            root.id = "seo-audit-spotlight-root";
            Object.assign(root.style, {
              position: "fixed",
              top: "0",
              left: "0",
              width: "100vw",
              height: "100vh",
              zIndex: "2147483647",
              pointerEvents: "none",
              transition: "opacity 0.5s ease",
              opacity: "0",
            });

            const backdrop = document.createElement("div");
            Object.assign(backdrop.style, {
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
            });

            const createPulse = (delay: number) => {
              const p = document.createElement("div");
              Object.assign(p.style, {
                position: "absolute",
                border: "4px solid #4f46e5",
                borderRadius: "50%",
                pointerEvents: "none",
                opacity: "0",
                transform: "translate(-50%, -50%) scale(0.1)",
              });

              const style = document.createElement("style");
              const animName = `seo-pulse-${delay.toString().replace(".", "")}`;
              style.textContent = `
                @keyframes ${animName} {
                  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
                  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
                }
              `;
              document.head.appendChild(style);
              p.style.animation = `${animName} 1.5s infinite ${delay}s linear`;
              return { p, style };
            };

            const pulse1 = createPulse(0);
            const pulse2 = createPulse(0.5);
            const pulse3 = createPulse(1.0);

            root.appendChild(backdrop);
            root.appendChild(pulse1.p);
            root.appendChild(pulse2.p);
            root.appendChild(pulse3.p);
            document.body.appendChild(root);

            const updateSpotlight = () => {
              const rect = target.getBoundingClientRect();
              const cx = rect.left + rect.width / 2;
              const cy = rect.top + rect.height / 2;
              const radius = Math.max(rect.width, rect.height) / 1.5 + 20;

              backdrop.style.background = `radial-gradient(circle ${radius}px at ${cx}px ${cy}px, transparent 100%, rgba(0,0,0,0.7) 100%)`;

              [pulse1.p, pulse2.p, pulse3.p].forEach((p) => {
                p.style.top = `${cy}px`;
                p.style.left = `${cx}px`;
                p.style.width = `${radius * 2}px`;
                p.style.height = `${radius * 2}px`;
              });
            };

            let active = true;
            const sync = () => {
              if (!active) return;
              updateSpotlight();
              requestAnimationFrame(sync);
            };
            requestAnimationFrame(sync);

            requestAnimationFrame(() => (root.style.opacity = "1"));

            setTimeout(() => {
              active = false;
              root.style.opacity = "0";
              setTimeout(() => {
                root.remove();
                [pulse1.style, pulse2.style, pulse3.style].forEach((s) =>
                  s.remove()
                );
              }, 500);
            }, 2500);
          } else {
            console.warn("[Audit Pro] Image not found:", imageSrc);
          }
        },
        args: [src, alt],
      });
    } catch (error) {
      console.error("Locate failed:", error);
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
    <div className="flex flex-col min-h-screen bg-slate-100">
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
              className="text-[11px] text-slate-500 mt-1 line-clamp-1 truncate block"
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
        <AuditResults report={report} onLocateImage={handleLocateImage} />
      ) : (
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
          <RefreshCw size={40} className="animate-spin text-indigo-600 mb-4" />
          <p className="text-sm font-medium">Analyzing Page Architecture...</p>
        </main>
      )}
    </div>
  );
};
