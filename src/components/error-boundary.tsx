import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Nexreff] Error boundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
          <AlertTriangle className="h-12 w-12 text-accent" />
          <h1 className="mt-4 font-display text-2xl text-foreground">
            Something went wrong
          </h1>
          <p className="mt-2 max-w-md text-muted">
            An unexpected error occurred. Try refreshing the page, or navigate
            back to a different section.
          </p>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Go Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
