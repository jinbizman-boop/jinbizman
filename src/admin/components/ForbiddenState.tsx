import { navigate } from "../../lib/router";
import { StatePanel } from "./StatePanel";

export function ForbiddenState({ description = "현재 계정으로는 이 기능에 접근할 수 없습니다." }: { description?: string }) {
  return <StatePanel
    kind="forbidden"
    title="권한이 없습니다."
    description={description}
    action={<div className="admin-state-actions"><button type="button" className="button" onClick={() => history.back()}>이전 화면</button><button type="button" className="button primary" onClick={() => navigate("/admin/dashboard")}>대시보드로 이동</button></div>}
  />;
}
