import { useEffect, useMemo, useState, type ReactNode } from "react";
import { adminGroups, adminModules } from "../content/admin";
import { getCurrentUser, logout, type AuthUser } from "../lib/auth";
import { AppLink, navigate, useRoute } from "../lib/router";
import { StatePanel } from "./components/StatePanel";

export function AdminShell({ children }: { children: ReactNode }) {
  const route = useRoute(); const [user, setUser] = useState<AuthUser | null>(null); const [loading, setLoading] = useState(true); const [menu, setMenu] = useState(false);
  useEffect(() => { void getCurrentUser().then(setUser).catch(() => navigate("/admin/login", true)).finally(() => setLoading(false)); }, []);
  useEffect(() => {
    function focusFirstNav(event: KeyboardEvent) {
      if (event.key !== "Tab" || event.shiftKey || document.activeElement !== document.body) return;
      const first = document.querySelector<HTMLAnchorElement>(".admin-sidebar nav a");
      if (!first) return; event.preventDefault(); first.focus();
    }
    document.addEventListener("keydown", focusFirstNav); return () => document.removeEventListener("keydown", focusFirstNav);
  }, []);
  const groups = useMemo(() => adminGroups.map((group) => [group, adminModules.filter((m) => m.group === group)] as const).filter(([,mods]) => mods.length), []);
  const activeModule = adminModules.find((module) => route.pathname === `/admin/${module.key}`) ?? adminModules.find((module) => module.key === "dashboard");
  if (loading) return <div className="admin-loading"><StatePanel kind="loading" title="ERP 세션을 확인하고 있습니다."/></div>;
  if (!user) return null;
  async function signOut() { try { await logout(); } finally { navigate("/admin/login", true); } }
  return <div className="admin-root">
    <a className="admin-skip-link" href="#admin-main">본문으로 건너뛰기</a>
    <aside className={`admin-sidebar${menu ? " is-open" : ""}`}>
      <div className="admin-brand"><span>JINBIZ</span><small>MANAGEMENT SYSTEM</small></div>
      <nav id="admin-navigation" aria-label="ERP 주요 메뉴">{groups.map(([group, modules], groupIndex) => <div className="admin-nav-group" key={group}><span><b>{String(groupIndex+1).padStart(2,"0")}</b>{group}</span>{modules.map((module) => <AppLink key={module.key} href={`/admin/${module.key}`} className={route.pathname === `/admin/${module.key}` || (module.key === "dashboard" && route.pathname === "/admin") ? "is-active" : ""} onClick={() => setMenu(false)}><span>{module.label}</span><small>↗</small></AppLink>)}</div>)}</nav>
      <div className="admin-sidebar-foot"><span>JINBIZ MANAGEMENT</span><strong>Internal operations</strong><small>www.jinbizman.com</small></div>
    </aside>
    <div className="admin-main">
      <header className="admin-topbar admin-commandbar">
        <div className="admin-context"><button className="admin-mobile-menu" type="button" onClick={() => setMenu((v)=>!v)} aria-label="ERP 메뉴 열기" aria-expanded={menu}>☰</button><div><small>{activeModule?.group ?? "운영"}</small><strong>{activeModule?.label ?? "대시보드"}</strong></div></div>
        
        <div className="admin-user-context"><div><span>{user.name || user.email}</span><small>{user.roles?.join(" · ") || "Authorized user"}</small></div><div className="admin-top-actions"><a href="/" target="_blank" rel="noreferrer">공식 홈페이지 ↗</a><button type="button" onClick={signOut}>로그아웃</button></div></div>
      </header>
      <main id="admin-main" className="admin-content" tabIndex={-1}>{children}</main>
    </div>
    {menu ? <button className="admin-sidebar-backdrop" onClick={() => setMenu(false)} aria-label="메뉴 닫기"/> : null}
  </div>;
}
