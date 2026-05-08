/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Letters from "./pages/Letters";
import Complaints from "./pages/Complaints";
import Profile from "./pages/Profile";
import UsersPage from "./pages/Users";
import Sidebar from "./components/layout/Sidebar";
import Navbar from "./components/layout/Navbar";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) {}
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN_KELURAHAN";

  return (
    <Router>
      <div className="flex h-screen bg-[#f4f6f9] font-sans text-[#212529] overflow-hidden">
        <Sidebar user={user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar user={user} onLogout={handleLogout} />
          <main className="flex-1 overflow-y-auto p-6 flex flex-col min-h-0">
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/letters" element={<Letters user={user} />} />
                <Route path="/complaints" element={<Complaints user={user} />} />
                <Route path="/profile" element={<Profile user={user} />} />
                {isAdmin && <Route path="/users" element={<UsersPage user={user} />} />}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>

            <footer className="h-12 bg-white border-t border-gray-200 mt-8 -mx-6 -mb-6 px-6 flex items-center justify-between text-[10px] text-gray-400 shrink-0 font-mono">
              <div>
                <strong>Copyright &copy; 2026 <span className="text-blue-600">SIWARGA Cloud</span>.</strong> All rights reserved.
              </div>
              <div className="uppercase tracking-widest">
                <b>Versi</b> 2.0.0-PRO (Fullstack Node.js)
              </div>
            </footer>
          </main>
        </div>
      </div>
    </Router>
  );
}
