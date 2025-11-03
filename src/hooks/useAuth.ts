export function useAuth(){
  const userId = localStorage.getItem("userId") || "";
  const isAuthed = !!userId;
  const logout = ()=> { localStorage.removeItem("userId"); location.href="/auth"; };
  return { userId, isAuthed, logout };
}
