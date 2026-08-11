import { useState, type FormEvent } from "react";
import { login } from "../lib/auth";
import { navigate } from "../lib/router";

export function AdminLoginPage() {
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setLoading(true); setError(""); const fd = new FormData(e.currentTarget); try { await login(String(fd.get("email")||""), String(fd.get("password")||"")); navigate("/admin/dashboard", true); } catch (err) { setError(err instanceof Error ? err.message : "로그인에 실패했습니다."); } finally { setLoading(false); } }
  return <div className="admin-login-page"><div className="admin-login-brand"><span>JINBIZ</span><strong>MANAGEMENT</strong><p>Integrated Operations ERP</p></div><form className="admin-login-card" onSubmit={submit}><span className="eyebrow">SECURE ACCESS</span><h1>관리자 로그인</h1><p>고정 데모 계정은 제공하지 않습니다. 운영 환경에서 생성된 관리자 계정을 사용하세요.</p><label>이메일<input name="email" type="email" autoComplete="username" required /></label><label>비밀번호<input name="password" type="password" autoComplete="current-password" required /></label><button className="btn btn-primary" disabled={loading}>{loading ? "확인 중…" : "로그인"}</button>{error ? <div className="form-error">{error}</div> : null}<small>5회 이상 실패 시 계정이 일시 잠금됩니다.</small></form></div>;
}
