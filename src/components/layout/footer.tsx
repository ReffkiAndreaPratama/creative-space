import { Link } from "react-router-dom";
import { Github, Instagram, Youtube, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container-page py-12">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          {/* Brand */}
          <div className="text-center md:text-left">
            <Link
              to="/"
              className="font-display text-2xl font-bold text-foreground"
            >
              Nexreff
            </Link>
            <p className="mt-2 max-w-sm text-sm text-muted text-pretty">
              Capturing moments, drawing thoughts, and creating sounds. A
              personal creative space for photography, art, music, and code.
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/ReffkiAndreaPratama"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-accent focus-ring rounded-md p-1"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-muted transition-colors hover:text-accent focus-ring rounded-md p-1"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-muted transition-colors hover:text-accent focus-ring rounded-md p-1"
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="text-muted transition-colors hover:text-accent focus-ring rounded-md p-1"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted">
            &copy; {currentYear} Nexreff Creative Space. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
