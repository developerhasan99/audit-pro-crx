export type Severity = "Critical" | "High" | "Medium" | "Low" | "Success";

export interface AuditIssue {
  name: string;
  severity: Severity;
  importance: string;
  finding: string;
  fix: string;
  category: string;
}

export interface AuditReport {
  score: number;
  categories: {
    [key: string]: AuditIssue[];
  };
  raw: {
    links: any[];
    headings: any[];
    images: any[];
  };
}

export const evaluateAudit = (data: any): AuditReport => {
  const issues: AuditIssue[] = [];

  // --- Crawlability & Indexability ---
  const crawlability: AuditIssue[] = [];
  if (!data.canonical) {
    crawlability.push({
      category: "Crawlability",
      name: "Missing Canonical Tag",
      severity: "High",
      importance:
        "Canonical tags prevent duplicate content issues by telling search engines which version of a URL is the primary one.",
      finding: 'No rel="canonical" link found on this page.',
      fix: 'Add a <link rel="canonical" href="..."> tag to the <head> of this page.',
    });
  }
  if (data.robots?.toLowerCase().includes("noindex")) {
    crawlability.push({
      category: "Crawlability",
      name: "Noindex Tag Found",
      severity: "Critical",
      importance:
        "A noindex tag prevents search engines from indexing the page, meaning it will not appear in search results.",
      finding: `Page has robots meta tag: "${data.robots}"`,
      fix: 'Remove "noindex" from your robots meta tag if you want this page to be searchable.',
    });
  }

  // --- Metadata ---
  const metadata: AuditIssue[] = [];
  if (!data.title) {
    metadata.push({
      category: "Metadata",
      name: "Missing Page Title",
      severity: "Critical",
      importance:
        "The title tag is one of the most important on-page SEO factors and is displayed in search results.",
      finding: "No <title> tag found.",
      fix: "Add a descriptive title tag between 50-60 characters.",
    });
  } else if (data.title.length < 30 || data.title.length > 60) {
    metadata.push({
      category: "Metadata",
      name: "Title Length Issue",
      severity: "Medium",
      importance:
        "Titles that are too short may not be descriptive enough, while too long titles get truncated in SERPs.",
      finding: `Title length is ${data.title.length} characters.`,
      fix: "Aim for a title between 30 and 60 characters.",
    });
  }

  if (!data.description) {
    metadata.push({
      category: "Metadata",
      name: "Missing Meta Description",
      severity: "High",
      importance:
        "Meta descriptions influence click-through rates from search results.",
      finding: "No meta description found.",
      fix: "Add a unique meta description between 120-160 characters.",
    });
  }

  // --- Headings & Content ---
  const content: AuditIssue[] = [];
  const h1s = data.headings.filter((h: any) => h.tag === "H1");
  if (h1s.length === 0) {
    content.push({
      category: "Content",
      name: "Missing H1 Heading",
      severity: "High",
      importance:
        "The H1 tag helps search engines and users understand the main topic of the page.",
      finding: "No H1 tag found.",
      fix: "Wrap your main page heading in an <h1> tag. Use only one per page.",
    });
  } else if (h1s.length > 1) {
    content.push({
      category: "Content",
      name: "Multiple H1 Headings",
      severity: "Medium",
      importance: "Multiple H1 tags can dilute the topical focus of the page.",
      finding: `${h1s.length} H1 tags found.`,
      fix: "Restructure your page to use only one primary <h1> tag, using <h2>-<h6> for sub-sections.",
    });
  }

  const imagesMissingAlt = data.images.filter(
    (img: any) => img.type === "img" && !img.alt && img.isVisible
  );
  if (imagesMissingAlt.length > 0) {
    content.push({
      category: "Content",
      name: "Images Missing Alt Text",
      severity: "Medium",
      importance:
        "Alt text is crucial for accessibility and helps search engines understand image content.",
      finding: `${imagesMissingAlt.length} visible images are missing alt attributes.`,
      fix: "Add descriptive alt text to all <img> tags that convey meaningful information.",
    });
  }

  // --- Security ---
  const security: AuditIssue[] = [];
  if (!data.security.isHttps) {
    security.push({
      category: "Security",
      name: "Non-HTTPS Connection",
      severity: "Critical",
      importance:
        "HTTPS is a ranking signal and essential for user privacy and security.",
      finding: "The page is served over insecure HTTP.",
      fix: "Redirect all HTTP traffic to HTTPS and install a valid SSL certificate.",
    });
  }

  // --- Mobile ---
  const mobile: AuditIssue[] = [];
  if (!data.mobile.viewport) {
    mobile.push({
      category: "Mobile",
      name: "Missing Viewport Tag",
      severity: "High",
      importance:
        "The viewport meta tag tells browsers how to render the page on mobile devices.",
      finding: "No viewport meta tag found.",
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your <head>.',
    });
  }

  // Combine categories
  const report: { [key: string]: AuditIssue[] } = {
    Crawlability: crawlability,
    Metadata: metadata,
    Content: content,
    Security: security,
    Mobile: mobile,
  };

  // Add "Success" entries for categories with no issues to improve UX
  Object.keys(report).forEach((cat) => {
    if (report[cat].length === 0) {
      report[cat].push({
        category: cat,
        name: `Optimized ${cat}`,
        severity: "Success",
        importance: "This area follow SEO best practices.",
        finding: "No major issues detected.",
        fix: "Keep up the good work.",
      });
    }
  });

  // Calculate generic score
  let deductions = 0;
  issues.concat(...Object.values(report)).forEach((issue) => {
    if (issue.severity === "Critical") deductions += 20;
    if (issue.severity === "High") deductions += 10;
    if (issue.severity === "Medium") deductions += 5;
    if (issue.severity === "Low") deductions += 2;
  });

  return {
    score: Math.max(0, 100 - deductions),
    categories: report,
    raw: {
      links: data.links || [],
      headings: data.headings || [],
      images: data.images || [],
    },
  };
};
