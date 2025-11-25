export function useAuth(){
  const userId = localStorage.getItem("userId") || "";
  const role = localStorage.getItem("userRole") || "USER";
  const isAuthed = !!userId;
  const isAdmin = role === "ADMIN";
  const logout = ()=> { 
    localStorage.removeItem("userId"); 
    localStorage.removeItem("userRole");
    location.href="/"; 
  };
  return { userId, role, isAuthed, isAdmin, logout };
}
