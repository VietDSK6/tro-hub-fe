import { Outlet } from "react-router-dom";
import Topbar from "@/components/layout/Topbar";
import { ToastProvider } from "@/contexts/ToastContext";
import { AuthModalProvider, useAuthModal } from "@/contexts/AuthModalContext";
import AuthModal from "@/components/layout/AuthModal";

function ShellContent() {
  const { showAuthModal, authModalTab, closeAuthModal } = useAuthModal();
  
  return (
    <>
      <div className="min-h-dvh">
        <Topbar/>
        <Outlet/>
      </div>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={closeAuthModal}
        defaultTab={authModalTab}
      />
    </>
  );
}

export default function Shell(){
  return (
    <ToastProvider>
      <AuthModalProvider>
        <ShellContent />
      </AuthModalProvider>
    </ToastProvider>
  );
}
