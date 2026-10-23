import { Github, ExternalLink, Code2 } from "lucide-react";
import { SEO } from "@/components/seo";
import { EmptyState } from "@/components/gallery/empty-state";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/use-projects";
import type { Project } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/supabase";

export function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();

  return (
    <>
      <SEO
        title="Tech Projects"
        description="Coding projects, experiments, and technology built by Nexreff."
      />

      <div className="container-page py-8">
        <header className="mb-8">
          <h1 className="font-display text-display-lg font-bold text-foreground">Tech Projects</h1>
          <p className="mt-2 max-w-2xl text-muted text-pretty">
            Coding projects, experiments, and technology I've built along the way.
          </p>
        </header>

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && (!projects || projects.length === 0) && (
          <EmptyState
            icon={<Code2 className="h-12 w-12" />}
            title={isSupabaseConfigured ? "No projects yet" : "Supabase not configured"}
            description={
              isSupabaseConfigured
                ? "Projects will appear here once added through the admin dashboard."
                : "Add your Supabase credentials to .env to load content."
            }
          />
        )}

        {!isLoading && projects && projects.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: Project) => (
              <article
                key={project.id}
                className="flex flex-col rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent/30"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display text-xl text-foreground">{project.title}</h2>
                    {project.is_featured && (
                      <Badge variant="accent">Featured</Badge>
                    )}
                  </div>

                  {project.description && (
                    <p className="mt-3 text-sm text-muted text-pretty line-clamp-3">
                      {project.description}
                    </p>
                  )}

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.technologies.map((tech: string) => (
                        <span
                          key={tech}
                          className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  {project.repository_url && (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors"
                      aria-label={`${project.title} repository`}
                    >
                      <Github className="h-4 w-4" /> Code
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors"
                      aria-label={`${project.title} demo`}
                    >
                      <ExternalLink className="h-4 w-4" /> Demo
                    </a>
                  )}
                  {project.project_year && (
                    <span className="ml-auto text-xs text-muted">{project.project_year}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
