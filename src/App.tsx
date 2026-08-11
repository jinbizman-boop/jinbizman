import React from "react";
import { useRoute } from "./lib/router";
import { publicCopies } from "./content/public";
import { PublicShell } from "./public/PublicShell";
import { HomePage } from "./public/pages/HomePage";
import { CompanyPage } from "./public/pages/CompanyPage";
import { BusinessPage } from "./public/pages/BusinessPage";
import { ContactPage } from "./public/pages/ContactPage";
import { NewsletterPage, NewsDetailPage } from "./public/pages/NewsletterPage";
import { ProjectPage, NotFoundPage } from "./public/pages/ProjectPage";
import { LegalPage } from "./public/pages/LegalPage";
import { AdminLoginPage } from "./admin/AdminLoginPage";
import { AdminShell } from "./admin/AdminShell";
import { ApprovalPage, DailyWorkPage, DashboardPage, EvaluationPage, MediaPage, ModulePage, ProjectWbsPage, SiteContentPage } from "./admin/pages";

function PublicRoute() {
  const route = useRoute();
  const path = route.publicPath.replace(/\/+$/, "") || "/";
  const locale = route.locale;
  const copy = publicCopies[locale];
  let page: React.ReactNode;
  if (path === "/") page = <HomePage locale={locale} />;
  else if (path === "/company") page = <CompanyPage locale={locale} />;
  else if (path === "/business") page = <BusinessPage locale={locale} />;
  else if (path === "/newsletter") page = <NewsletterPage locale={locale} />;
  else if (path.startsWith("/newsletter/")) page = <NewsDetailPage locale={locale} slug={decodeURIComponent(path.split("/").pop() || "")} />;
  else if (path === "/contact") page = <ContactPage locale={locale} />;
  else if (path === "/privacy") page = <LegalPage locale={locale} kind="privacy" />;
  else if (path === "/terms") page = <LegalPage locale={locale} kind="terms" />;
  else if (path === "/email-policy") page = <LegalPage locale={locale} kind="email-policy" />;
  else if (path.startsWith("/project/") || path.startsWith("/projects/")) page = <ProjectPage locale={locale} slug={decodeURIComponent(path.split("/").pop() || "")} />;
  else page = <NotFoundPage locale={locale} />;
  return <PublicShell>{page}</PublicShell>;
}

function AdminRoute() {
  const route = useRoute();
  if (route.pathname === "/admin/login") return <AdminLoginPage />;
  const key = route.pathname.replace(/^\/admin\/?/, "") || "dashboard";
  let page: React.ReactNode;
  if (key === "dashboard") page = <DashboardPage />;
  else if (key === "projects") page = <ProjectWbsPage />;
  else if (key === "daily-work") page = <DailyWorkPage />;
  else if (key === "approvals") page = <ApprovalPage />;
  else if (key === "evaluations") page = <EvaluationPage />;
  else if (key === "site-content") page = <SiteContentPage />;
  else if (key === "media") page = <MediaPage />;
  else page = <ModulePage moduleKey={key} />;
  return <AdminShell>{page}</AdminShell>;
}

export default function App() {
  const route = useRoute();
  return route.isAdmin ? <AdminRoute /> : <PublicRoute />;
}
