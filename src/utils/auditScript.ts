export const runPageAudit = () => {
  const getMeta = (name: string) => {
    return (
      document
        .querySelector(`meta[name="${name}"], meta[property="${name}"]`)
        ?.getAttribute("content") || ""
    );
  };

  const getHeadings = () => {
    const headings: { tag: string; text: string }[] = [];
    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
      headings.push({
        tag: el.tagName,
        text: (el.textContent || "").trim(),
      });
    });
    return headings;
  };

  const getImages = () => {
    const imgs = Array.from(document.querySelectorAll("img"));
    return imgs.map((img) => ({
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      isVisible: img.offsetParent !== null,
    }));
  };

  const getLinks = () => {
    const links = Array.from(document.querySelectorAll("a"));
    const currentHost = window.location.hostname;
    return links
      .filter((a) => {
        const href = a.getAttribute("href");
        return href && !href.startsWith("#");
      })
      .map((a) => ({
        href: a.href,
        text: (a.textContent || "").trim(),
        isInternal: a.hostname === currentHost,
        isExternal: a.hostname !== currentHost && a.hostname !== "",
        rel: a.rel || "",
        target: a.target || "",
      }));
  };

  const getStructuredData = () => {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    );
    return scripts
      .map((script) => {
        try {
          return JSON.parse(script.textContent || "{}");
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  };

  const getPerformanceMetrics = () => {
    const nav = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType("paint");

    return {
      loadTime: nav ? nav.loadEventEnd : 0,
      domReady: nav ? nav.domContentLoadedEventEnd : 0,
      firstPaint: paint.find((p) => p.name === "first-paint")?.startTime || 0,
      firstContentfulPaint:
        paint.find((p) => p.name === "first-contentful-paint")?.startTime || 0,
      resources: performance.getEntriesByType("resource").length,
    };
  };

  const getMobileSignals = () => {
    const viewport = getMeta("viewport");
    const fontSize = window.getComputedStyle(document.body).fontSize;
    return {
      viewport,
      fontSize,
      hasTouchEvents: "ontouchstart" in window,
    };
  };

  const getSecuritySignals = () => {
    return {
      isHttps: window.location.protocol === "https:",
      hasCsp: !!getMeta("content-security-policy"),
    };
  };

  return {
    url: window.location.href,
    title: document.title,
    description: getMeta("description") || getMeta("og:description"),
    canonical:
      document.querySelector('link[rel="canonical"]')?.getAttribute("href") ||
      "",
    lang: document.documentElement.lang,
    charset: document.characterSet,
    robots: getMeta("robots"),
    ogTags: {
      title: getMeta("og:title"),
      type: getMeta("og:type"),
      image: getMeta("og:image"),
    },
    headings: getHeadings(),
    images: getImages(),
    links: getLinks(),
    structuredData: getStructuredData(),
    performance: getPerformanceMetrics(),
    mobile: getMobileSignals(),
    security: getSecuritySignals(),
  };
};
