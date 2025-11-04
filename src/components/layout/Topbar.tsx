import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Topbar(){
  const { isAuthed, logout } = useAuth();
  const loc = useLocation();
  return (
    <div className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container-app px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold">Trọ Hub</Link>
        <nav className="flex gap-3 text-sm items-center">
          <Link to="/listings/new" className="btn btn-ghost">Đăng tin</Link>
          <Link to="/favorites" className="btn btn-ghost">Yêu thích</Link>
          <Link to="/matching" className="btn btn-ghost">Gợi ý</Link>
          <Link to="/profile" className="btn btn-ghost">Hồ sơ</Link>
          {!isAuthed
            ? <Link to="/auth" state={{from:loc.pathname}} className="btn btn-primary">Đăng nhập</Link>
            : <button className="btn btn-ghost" onClick={logout}>Đăng xuất</button>}
        </nav>
      </div>
    </div>
  );
}
