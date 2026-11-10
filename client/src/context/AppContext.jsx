import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadinguser, setloadingUser] = useState(true);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Fetch current user session
  const fetchUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
      }
      setUser(null);
    } finally {
      setloadingUser(false);
    }
  };

  // Fetch user projects
  const fetchProjects = async () => {
    try {
      const res = await api.get("/api/projects");
      if (Array.isArray(res.data)) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      // ignore
    } finally {
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
    }
  }, [user]);

  const value = {
    user,
    setUser,
    loadinguser,
    setloadingUser,
    projects,
    setProjects,
    fetchProjects,
    activeProject,
    setActiveProject,
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    logout,
  };

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
