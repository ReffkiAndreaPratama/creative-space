import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

/**
 * Updates document title and meta tags for SEO and social sharing.
 * This is a client-side approach suitable for SPA. For production
 * SSR/prerender, consider adding a build-time sitemap generator.
 */
export function SEO({ title, description, image, url, type = "website" }: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} — Nexreff Creative Space` : "Nexreff Creative Space";
    document.title = fullTitle;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const [name] = selector.match(/content="([^"]+)"/)?.slice(1) ?? [];
        if (selector.includes("property")) {
          el.setAttribute("property", name || "");
        } else {
          el.setAttribute("name", name || "");
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    if (description) {
      setMeta('meta[name="description"]', "content", description);
      setMeta('meta[property="og:description"]', "content", description);
    }

    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[property="og:type"]', "content", type);

    if (image) {
      setMeta('meta[property="og:image"]', "content", image);
    }
    if (url) {
      setMeta('meta[property="og:url"]', "content", url);
    }
  }, [title, description, image, url, type]);

  return null;
}
