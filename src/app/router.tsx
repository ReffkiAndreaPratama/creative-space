import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Providers } from "./providers";
import { Layout } from "@/components/layout/layout";
import { AdminLayout } from "@/pages/admin/admin-layout";

// Lazy-loaded public pages for code splitting
const HomePage = lazy(() => import("@/pages/home").then((m) => ({ default: m.HomePage })));
const PhotographyPage = lazy(() => import("@/pages/photography").then((m) => ({ default: m.PhotographyPage })));
const ArtPage = lazy(() => import("@/pages/art").then((m) => ({ default: m.ArtPage })));
const GuitarPage = lazy(() => import("@/pages/guitar").then((m) => ({ default: m.GuitarPage })));
const VideosPage = lazy(() => import("@/pages/videos").then((m) => ({ default: m.VideosPage })));
const JournalPage = lazy(() => import("@/pages/journal").then((m) => ({ default: m.JournalPage })));
const JournalDetailPage = lazy(() => import("@/pages/journal-detail").then((m) => ({ default: m.JournalDetailPage })));
const ProjectsPage = lazy(() => import("@/pages/projects").then((m) => ({ default: m.ProjectsPage })));
const AboutPage = lazy(() => import("@/pages/about").then((m) => ({ default: m.AboutPage })));
const CollectionsPage = lazy(() => import("@/pages/collections").then((m) => ({ default: m.CollectionsPage })));
const CollectionDetailPage = lazy(() => import("@/pages/collections").then((m) => ({ default: m.CollectionDetailPage })));
const SearchPage = lazy(() => import("@/pages/search").then((m) => ({ default: m.SearchPage })));
const NotFoundPage = lazy(() => import("@/pages/not-found").then((m) => ({ default: m.NotFoundPage })));

// Admin pages
const AdminLoginPage = lazy(() => import("@/pages/admin/login").then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import("@/pages/admin/dashboard").then((m) => ({ default: m.AdminDashboardPage })));
const AdminMediaManagerPage = lazy(() => import("@/pages/admin/media-manager").then((m) => ({ default: m.AdminMediaManagerPage })));
const AdminUploadPage = lazy(() => import("@/pages/admin/upload").then((m) => ({ default: m.AdminUploadPage })));
const AdminJournalPage = lazy(() => import("@/pages/admin/journal-editor").then((m) => ({ default: m.AdminJournalPage })));
const AdminCollectionsPage = lazy(() => import("@/pages/admin/collections-manager").then((m) => ({ default: m.AdminCollectionsPage })));
const AdminSettingsPage = lazy(() => import("@/pages/admin/settings").then((m) => ({ default: m.AdminSettingsPage })));

export function App() {
  return (
    <Providers>
      <Routes>
        {/* Admin routes (no public layout) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="media" element={<AdminMediaManagerPage />} />
          <Route path="upload" element={<AdminUploadPage />} />
          <Route path="journal" element={<AdminJournalPage />} />
          <Route path="collections" element={<AdminCollectionsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Public routes (with navbar + footer) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="photography" element={<PhotographyPage />} />
          <Route path="art" element={<ArtPage />} />
          <Route path="guitar" element={<GuitarPage />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="journal/:slug" element={<JournalDetailPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="collections/:slug" element={<CollectionDetailPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Providers>
  );
}
