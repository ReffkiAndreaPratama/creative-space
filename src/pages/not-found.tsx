import { Link } from "react-router-dom";
import { SEO } from "@/components/seo";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <>
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." />
      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
        <p className="font-display text-display-2xl font-bold text-accent">404</p>
        <h1 className="mt-4 font-display text-2xl text-foreground">Page not found</h1>
        <p className="mt-2 max-w-md text-muted text-pretty">
          The page you're looking for may have been moved, deleted, or never existed.
        </p>
        <div className="mt-8 flex gap-3">
          <Button onClick={() => (window.location.href = "/")}>Go Home</Button>
          <Link to="/search">
            <Button variant="outline">Search</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
