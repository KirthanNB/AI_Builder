import { createContext, useContext, useEffect, useState } from "react";
import api from '../api/api'
const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadinguser, setloadingUser] = useState(false);

  const value = {
    user,
    setUser,
    loadinguser,
    setloadingUser
  };

  const checkSession = async()=>{
    try {
      const {data} = await api.get("/api/auth/me");
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setloadingUser(false);
    }
  }

  useEffect(()=>{checkSession()}, [checkSession])

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function UseAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("UseAppContext must be within an AppContextProvider");
  }
  return context;
}