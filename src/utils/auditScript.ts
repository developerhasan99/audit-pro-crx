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
    const images: any[] = [];

    // 1. Regular <img> tags
    document.querySelectorAll("img").forEach((img) => {
      const src = img.src || img.getAttribute("src");
      if (!src || src.startsWith("data:") || src === "about:blank") return;

      const perfEntry = performance.getEntriesByName(
        img.src
      )[0] as PerformanceResourceTiming;
      const rect = img.getBoundingClientRect();

      images.push({
        src: img.src,
        alt: img.alt,
        type: "img",
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        renderedWidth: Math.round(rect.width),
        renderedHeight: Math.round(rect.height),
        fileSize: perfEntry ? perfEntry.encodedBodySize : undefined,
        isVisible:
          img.offsetParent !== null &&
          rect.width > 0 &&
          rect.height > 0 &&
          window.getComputedStyle(img).display !== "none" &&
          window.getComputedStyle(img).visibility !== "hidden",
      });
    });

    // 2. Background images
    const allElements = document.querySelectorAll("*");
    allElements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const bgImage = style.backgroundImage;

      if (bgImage && bgImage !== "none" && bgImage.startsWith("url(")) {
        const urlMatch = bgImage.match(/url\(["']?([^"']+)["']?\)/);
        if (urlMatch && urlMatch[1]) {
          const src = urlMatch[1];
          if (!src || src.startsWith("data:") || src === "about:blank") return;

          const rect = el.getBoundingClientRect();
          const perfEntry = performance.getEntriesByName(
            src
          )[0] as PerformanceResourceTiming;

          images.push({
            src: src.startsWith("http")
              ? src
              : new URL(src, window.location.href).href,
            alt: "",
            type: "bg",
            naturalWidth: 0,
            naturalHeight: 0,
            renderedWidth: Math.round(rect.width),
            renderedHeight: Math.round(rect.height),
            fileSize: perfEntry ? perfEntry.encodedBodySize : undefined,
            isVisible:
              rect.width > 0 &&
              rect.height > 0 &&
              style.display !== "none" &&
              style.visibility !== "hidden",
          });
        }
      }
    });

    return images;
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

export const locateImageOnPage = (src: string, alt?: string) => {
  const images = Array.from(document.querySelectorAll("img"));
  const target =
    images.find((img) => img.src === src && (!alt || img.alt === alt)) ||
    images.find((img) => img.src === src);

  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });

    // Add highlight effect
    const originalTransition = target.style.transition;
    const originalOutline = target.style.outline;
    const originalOutlineOffset = target.style.outlineOffset;
    const originalZIndex = target.style.zIndex;

    target.style.transition = "all 0.3s ease";
    target.style.outline = "4px solid #4f46e5";
    target.style.outlineOffset = "4px";
    target.style.zIndex = "9999999";

    setTimeout(() => {
      target.style.outline = "20px solid transparent";
      setTimeout(() => {
        target.style.transition = originalTransition;
        target.style.outline = originalOutline;
        target.style.outlineOffset = originalOutlineOffset;
        target.style.zIndex = originalZIndex;
      }, 300);
    }, 2000);

    return true;
  }
  return false;
};
