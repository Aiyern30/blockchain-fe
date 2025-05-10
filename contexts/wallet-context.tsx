import { createContext, useContext, useState } from "react";

const WalletDropdownContext = createContext<{
  isOpen: boolean;
  toggleDropdown: () => void;
} | null>(null);

export const WalletDropdownProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  return (
    <WalletDropdownContext.Provider value={{ isOpen, toggleDropdown }}>
      {children}
    </WalletDropdownContext.Provider>
  );
};

export const useWalletDropdown = () => {
  const context = useContext(WalletDropdownContext);
  if (!context) {
    throw new Error(
      "useWalletDropdown must be used within WalletDropdownProvider"
    );
  }
  return context;
};
