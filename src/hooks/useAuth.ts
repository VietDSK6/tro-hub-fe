export function useAuth(){
  const userId = localStorage.getItem("userId") || "";
  const isAuthed = !!userId;
  const logout = ()=> { localStorage.removeItem("userId"); location.href="/login"; };
  return { userId, isAuthed, logout };
}
