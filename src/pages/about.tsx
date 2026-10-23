import { Github, Instagram, Youtube, Mail, Camera, Pencil, Guitar, Code } from "lucide-react";
import { SEO } from "@/components/seo";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function AboutPage() {
  const settings = useSiteSettings();

  const interests = [
    { icon: <Camera className="h-5 w-5" />, label: "Photography" },
    { icon: <Pencil className="h-5 w-5" />, label: "Drawing & Sketching" },
    { icon: <Guitar className="h-5 w-5" />, label: "Music & Guitar" },
    { icon: <Code className="h-5 w-5" />, label: "Technology & Code" },
  ];

  const socials = [
    { url: settings.data?.github_url, icon: <Github className="h-5 w-5" />, label: "GitHub" },
    { url: settings.data?.instagram_url, icon: <Instagram className="h-5 w-5" />, label: "Instagram" },
    { url: settings.data?.youtube_url, icon: <Youtube className="h-5 w-5" />, label: "YouTube" },
    { url: settings.data?.email ? `mailto:${settings.data.email}` : null, icon: <Mail className="h-5 w-5" />, label: "Email" },
  ].filter((s) => s.url);

  return (
    <>
      <SEO title="About" description="About Nexreff — photographer, artist, guitarist, and developer." />

      <div className="container-page py-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-display-xl font-bold text-foreground">About</h1>

          {/* Profile */}
          <div className="mt-8">
            <h2 className="font-display text-2xl text-foreground">Nexreff</h2>
            <div className="mt-4 space-y-4 text-pretty text-muted leading-relaxed">
              <p>
                I'm Nexreff — a photographer, artist, guitarist, and developer based in
                Bengkulu, Indonesia. This space is where I share everything I create, from
                the photographs I take to the sketches I draw, the guitar sessions I record,
                and the code I write.
              </p>
              <p>
                Every piece here tells a story. Whether it's a portrait captured in the
                golden hour, a quick pencil sketch from a quiet afternoon, a fingerstyle
                cover of a favorite song, or a new web project built from scratch —
                this is my creative journal, my gallery, and my archive.
              </p>
              <p>
                Feel free to explore the collections, read the journal, or reach out through
                any of the links below.
              </p>
            </div>
          </div>

          {/* Interests */}
          <div className="mt-12">
            <h2 className="font-display text-xl text-foreground">Creative Interests</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {interests.map((interest) => (
                <div
                  key={interest.label}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4"
                >
                  <span className="text-accent">{interest.icon}</span>
                  <span className="text-sm font-medium text-foreground">{interest.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social links */}
          <div className="mt-12">
            <h2 className="font-display text-xl text-foreground">Connect</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              {socials.length > 0 ? (
                socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url!}
                    target={social.label === "Email" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground hover:border-accent/30 hover:text-accent transition-colors"
                  >
                    {social.icon}
                    {social.label}
                  </a>
                ))
              ) : (
                <p className="text-sm text-muted">Social links will appear here once configured.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
