import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface AccountData {
  name: string;
  email: string;
  phone: string;
}

interface AccountContextType {
  isLoggedIn: boolean;
  accountData: AccountData | null;
  wishlist: number[];
  savedAddresses: Address[];
  login: (name: string, email: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<AccountData>) => void;
  addToWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  addAddress: (addr: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("luxe_logged_in") === "true";
  });
  
  const [accountData, setAccountData] = useState<AccountData | null>(() => {
    const data = localStorage.getItem("luxe_account");
    return data ? JSON.parse(data) : null;
  });
  
  const [wishlist, setWishlist] = useState<number[]>(() => {
    const data = localStorage.getItem("luxe_wishlist");
    return data ? JSON.parse(data) : [];
  });
  
  const [savedAddresses, setSavedAddresses] = useState<Address[]>(() => {
    const data = localStorage.getItem("luxe_addresses");
    return data ? JSON.parse(data) : [];
  });

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("luxe_logged_in", String(isLoggedIn));
    if (accountData) localStorage.setItem("luxe_account", JSON.stringify(accountData));
    else localStorage.removeItem("luxe_account");
  }, [isLoggedIn, accountData]);

  useEffect(() => {
    localStorage.setItem("luxe_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("luxe_addresses", JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  const login = (name: string, email: string) => {
    setIsLoggedIn(true);
    setAccountData({ name, email, phone: "" });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setAccountData(null);
  };

  const updateProfile = (data: Partial<AccountData>) => {
    setAccountData(prev => prev ? { ...prev, ...data } : null);
  };

  const addToWishlist = (productId: number) => {
    if (!wishlist.includes(productId)) {
      setWishlist(prev => [...prev, productId]);
    }
  };

  const removeFromWishlist = (productId: number) => {
    setWishlist(prev => prev.filter(id => id !== productId));
  };

  const isInWishlist = (productId: number) => {
    return wishlist.includes(productId);
  };

  const addAddress = (addr: Omit<Address, "id">) => {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    const newAddr = { ...addr, id };
    
    setSavedAddresses(prev => {
      // If it's the first address or set as default, update others
      if (newAddr.isDefault || prev.length === 0) {
        newAddr.isDefault = true;
        return [newAddr, ...prev.map(a => ({ ...a, isDefault: false }))];
      }
      return [...prev, newAddr];
    });
  };

  const removeAddress = (id: string) => {
    setSavedAddresses(prev => {
      const filtered = prev.filter(a => a.id !== id);
      // If we removed the default and there are others left, make the first one default
      if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  };

  const setDefaultAddress = (id: string) => {
    setSavedAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
  };

  return (
    <AccountContext.Provider value={{
      isLoggedIn, accountData, wishlist, savedAddresses,
      login, logout, updateProfile, addToWishlist, removeFromWishlist,
      isInWishlist, addAddress, removeAddress, setDefaultAddress
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
