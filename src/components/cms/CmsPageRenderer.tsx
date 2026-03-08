"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LegalLayout } from "@/components/layout/LegalLayout";

interface CmsPageData {
  id: string;
  slug: string;
  title: string;
  template: string;
  last_updated: string;
  sections: Array<{ id: string; label: string; content: string }>;
}

interface CmsPageRendererProps {
  /** If provided, uses this data instead of fetching */
  initialData?: CmsPageData | null;
  /** Fallback component to render if CMS data not available */
  fallback?: React.ReactNode;
}

/** Renders a CMS page using the appropriate template */
export const CmsPageRenderer: React.FC<CmsPageRendererProps> = ({ initialData, fallback }) => {
  const pathname = usePathname();
  const [page, setPage] = useState<CmsPageData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (initialData) return;
    fetch(`/api/public/pages?slug=${encodeURIComponent(pathname)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.page?.sections?.length > 0) {
          setPage(d.page);
        } else {
          setUseFallback(true);
        }
      })
      .catch(() => setUseFallback(true))
      .finally(() => setLoading(false));
  }, [pathname, initialData]);

  // If loading or using fallback, render the hardcoded fallback
  if (loading) return null; // Will show the fallback component via parent
  if (useFallback && fallback) return <>{fallback}</>;
  if (!page) return fallback ? <>{fallback}</> : null;

  // Render based on template
  if (page.template === "legal_sidebar") {
    const sectionLinks = page.sections.map((s) => ({ id: s.id, label: s.label }));

    return (
      <LegalLayout title={page.title} lastUpdated={page.last_updated} sections={sectionLinks}>
        <div className="space-y-16">
          {page.sections.map((sec) => (
            <section key={sec.id} id={sec.id} className="scroll-mt-32">
              <h3 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">{sec.label}</h3>
              {renderContent(sec.content)}
            </section>
          ))}
        </div>
      </LegalLayout>
    );
  }

  // Default: simple template
  return (
    <div className="min-h-screen bg-sand-50 dark:bg-wood-900 pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-serif text-4xl text-wood-900 dark:text-sand-100 mb-8">{page.title}</h1>
        {page.sections.map((sec) => (
          <div key={sec.id} className="mb-8">
            <h2 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-4">{sec.label}</h2>
            {renderContent(sec.content)}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Render text content with paragraphs and list support */
function renderContent(text: string) {
  if (!text) return null;
  return text.split("\n\n").map((block, bi) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    const lines = trimmed.split("\n").filter((l) => l.trim());
    const isAllList = lines.length > 0 && lines.every((l) => l.trim().startsWith("- "));
    if (isAllList) {
      return (
        <ul key={bi} className="list-disc pl-5 mt-4 space-y-2 marker:text-wood-900/50 dark:marker:text-sand-100/50">
          {lines.map((l, li) => (
            <li key={li}>{l.trim().substring(2)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={bi} className="mt-4">
        {trimmed}
      </p>
    );
  });
}
