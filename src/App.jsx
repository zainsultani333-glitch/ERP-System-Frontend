import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/Login";

import AdminDashboard from "./pages/Dashboard";
import Company from "./pages/Company";
import Roles from "./pages/Role";
import Users from "./pages/User";
import Notifications from "./pages/Notifications";

import HRDashboard from "./pages/HR/HR-Dashboard";
import Employees from "./pages/HR/Employee";
import Documents from "./pages/HR/Document";

import AccountsDashboard from "./pages/Sales & Purchase/AccountsDashbord";
import Categories from "./pages/Sales & Purchase/Category";
import Products from "./pages/Sales & Purchase/Products";
import Purchases from "./pages/Sales & Purchase/Purchase";
import Sales from "./pages/Sales & Purchase/Sale";
import Suppliers from "./pages/Sales & Purchase/Supplier";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (token && role) {
      setUserRole(role.toLowerCase().trim());
      setIsLoggedIn(true);
    }
    setLoading(false); // done checking localStorage
  }, []);

  const handleLogin = (role) => {
    setUserRole(role.toLowerCase().trim()); // ✅ FIX
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserRole(null);
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="flex h-screen">
        {isLoggedIn && <Sidebar userRole={userRole} />}

        <div className="flex-1 flex flex-col">
          {isLoggedIn && <Navbar handleLogout={handleLogout} />}

          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full text-gray-500 text-lg">
                Loading...
              </div>
            ) : (
              <Routes>

                {/* ROOT REDIRECT */}
                <Route
                  path="/"
                  element={
                    isLoggedIn ? (
                      userRole === "admin" ? <Navigate to="/admin-dashboard" /> :
                        userRole === "hr" ? <Navigate to="/hr-dashboard" /> :
                          userRole === "accounts" ? <Navigate to="/accounts-dashboard" /> :
                            <Navigate to="/login" />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />

                {/* PUBLIC */}
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* ADMIN ROUTES */}
                <Route path="/admin-dashboard" element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/company" element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={["admin"]}>
                    <Company />
                  </ProtectedRoute>
                } />
                <Route path="/roles" element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={["admin"]}>
                    <Roles />
                  </ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={["admin"]}>
                    <Users />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={["admin"]}>
                    <Notifications />
                  </ProtectedRoute>
                } />

                {/* HR ROUTES */}
                <Route path="/hr-dashboard" element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={["hr", "admin"]}>
                    <HRDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/employees" element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={["hr", "admin"]}>
                    <Employees />
                  </ProtectedRoute>
                } />
                <Route path="/documents" element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={["hr", "admin"]}>
                    <Documents />
                  </ProtectedRoute>
                } />

                {/* ACCOUNTS ROUTES */}
                <Route path="/accounts-dashboard" element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={["accounts", "admin"]}>
                    <AccountsDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/categories" element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={["accounts", "admin"]}>
                    <Categories />
                  </ProtectedRoute>
                } />
                <Route path="/products" element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={["accounts", "admin"]}>
                    <Products />
                  </ProtectedRoute>
                } />
                <Route path="/purchases" element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={["accounts", "admin"]}>
                    <Purchases />
                  </ProtectedRoute>
                } />
                <Route path="/sales" element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={["accounts", "admin"]}>
                    <Sales />
                  </ProtectedRoute>
                } />
                <Route path="/suppliers" element={
                  <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={["accounts", "admin"]}>
                    <Suppliers />
                  </ProtectedRoute>
                } />

                {/* FALLBACK */}
                <Route path="*" element={<Navigate to="/" />} />

              </Routes>
            )}
        </div>
      </div>
    </div>
    </Router >
  );
}

export default App;