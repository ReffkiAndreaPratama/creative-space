import { type ReactNode, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ScrollToTop } from "./scroll-to-top";
import { ErrorBoundary } from "@/components/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";

export function Layout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 pt-16">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="container-page py-20">
                <Skeleton className="h-8 w-48" />
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full" />
                  ))}
                </div>
              </div>
            }
          >
            {children ?? <Outlet />}
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
