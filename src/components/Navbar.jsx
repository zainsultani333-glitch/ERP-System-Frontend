import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = ({ handleLogout }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ NEW STATES
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("");

  const location = useLocation();
  const currentPage = location.pathname.split('/')[1] || 'dashboard';
  const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  // ✅ GET DATA FROM LOCALSTORAGE
  useEffect(() => {
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("userRole");

    if (name) setUserName(name);
    if (role) setUserRole(role);
  }, []);

  const handleLogoutClick = () => {
    handleLogout();
    navigate("/login");
  };

  // ✅ GENERATE INITIALS
  const getInitials = (name) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-secondary shadow-lg border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {pageTitle}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, let's manage your tasks efficiently
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative text-gray-600 hover:text-primary transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            3
          </span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 hover:bg-primary/10 rounded-lg px-3 py-2 transition-colors"
          >
            {/* ✅ Dynamic Initials */}
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold shadow-md">
              {getInitials(userName)}
            </div>

            <div className="text-left hidden md:block">
              {/* ✅ Dynamic Name */}
              <p className="text-sm font-semibold text-gray-700">{userName}</p>

              {/* ✅ Dynamic Role */}
              <p className="text-xs text-primary capitalize">{userRole}</p>
            </div>

            <svg className="w-4 h-4 text-gray-500 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-secondary rounded-xl shadow-xl border border-gray-200 py-2 z-50">
              <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">
                Profile Settings
              </a>
              <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">
                Account Settings
              </a>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={handleLogoutClick}
                className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;