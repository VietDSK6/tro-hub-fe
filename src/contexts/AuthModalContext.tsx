import { createContext, useContext, useState, ReactNode } from "react";

interface AuthModalContextType {
  showAuthModal: boolean;
  authModalTab: "login" | "register";
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  const openLoginModal = () => {
    setAuthModalTab("login");
    setShowAuthModal(true);
  };

  const openRegisterModal = () => {
    setAuthModalTab("register");
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <AuthModalContext.Provider
      value={{
        showAuthModal,
        authModalTab,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
}
