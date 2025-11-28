import { Outlet } from "react-router-dom";
import Topbar from "@/components/layout/Topbar";
import VerifyBanner from "@/components/layout/VerifyBanner";
import { ToastProvider } from "@/contexts/ToastContext";
import { AuthModalProvider, useAuthModal } from "@/contexts/AuthModalContext";
import AuthModal from "@/components/layout/AuthModal";

function ShellContent() {
  const { showAuthModal, authModalTab, closeAuthModal } = useAuthModal();
  
  return (
    <>
      <div className="min-h-dvh">
        <Topbar/>
        <VerifyBanner/>
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
