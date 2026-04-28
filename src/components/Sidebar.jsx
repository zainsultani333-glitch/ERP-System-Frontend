import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const Sidebar = ({ userRole = "admin" }) => {
  const role = userRole?.toLowerCase().trim();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getNavSections = () => {
    switch (role) {
      case "admin":
        return [
          {
            title: "ADMIN",
            items: [
              { path: "/admin-dashboard", name: "Admin Dashboard", icon: "📊" },
              { path: "/company", name: "Company", icon: "🏢" },
              // { path: "/roles", name: "Role", icon: "🔐" },
              { path: "/users", name: "Users", icon: "👥" },
              { path: "/notifications", name: "Notifications", icon: "🔔" }
            ]
          },
          {
            title: "HR SECTION",
            items: [
              { path: "/hr-dashboard", name: "HR Dashboard", icon: "👔" },
              { path: "/employees", name: "Employee", icon: "👨‍💼" },
              { path: "/documents", name: "Document", icon: "📄" }
            ]
          },
          {
            title: "ACCOUNTS SECTION",
            items: [
              { path: "/accounts-dashboard", name: "Sales & Purchase Dashboard", icon: "💰" },
              { path: "/categories", name: "Category", icon: "📑" },
              { path: "/products", name: "Product", icon: "📦" },
              { path: "/purchases", name: "Purchase", icon: "🛒" },
              { path: "/sales", name: "Sale", icon: "💵" },
              { path: "/suppliers", name: "Supplier", icon: "🚚" }
            ]
          }
        ];

      case "hr":
        return [
          {
            title: "HR DASHBOARD",
            items: [
              { path: "/hr-dashboard", name: "HR Dashboard", icon: "👔" },
              { path: "/employees", name: "Employee", icon: "👨‍💼" },
              { path: "/documents", name: "Document", icon: "📄" }
            ]
          }
        ];

      case "accounts":
        return [
          {
            title: "ACCOUNTS",
            items: [
              { path: "/accounts-dashboard", name: "Sales & Purchase Dashboard", icon: "💰" },
              { path: "/categories", name: "Category", icon: "📑" },
              { path: "/products", name: "Product", icon: "📦" },
              { path: "/purchases", name: "Purchase", icon: "🛒" },
              { path: "/sales", name: "Sale", icon: "💵" },
              { path: "/suppliers", name: "Supplier", icon: "🚚" }
            ]
          }
        ];

      default:
        return [];
    }
  };

  const navSections = getNavSections();

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white shadow-xl flex flex-col fixed top-0 left-0 h-screen overflow-y-auto scrollbar-width: none; -ms-overflow-style: none; transition-all duration-300 ease-in-out [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-thumb:hover]:bg-primary/50`}
      >
        {/* Logo Area */}
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TMS
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Task Management System</p>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-primary transition-all duration-200 p-1.5 rounded-lg hover:bg-secondary"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 mb-4 px-3">
          {navSections.map((section, idx) => (
            <div key={idx} className="mb-7">
              {!isCollapsed && (
                <div className="px-3 mb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path} className="relative">
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                    ${location.pathname === item.path
                          ? 'bg-primary text-white shadow-md'
                          : 'text-gray-600 hover:bg-secondary hover:text-primary'
                        }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className={`${isCollapsed ? 'hidden' : 'block'} text-sm font-medium`}>
                        {item.name}
                      </span>
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 text-white px-2.5 py-1 rounded-md text-xs whitespace-nowrap z-50 shadow-lg">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 text-center sticky bottom-0 bg-white">
          {!isCollapsed ? (
            <div>
              <p>© 2024 TMS v1.0</p>
              <p className="mt-1 capitalize text-primary font-medium text-[11px]">
                Logged in as: {userRole}
              </p>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-full bg-secondary flex items-center justify-center">
              <span className="text-primary text-xs font-bold">T</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Spacer */}
      <div className={`${isCollapsed ? 'ml-20' : 'ml-72'} flex-1 transition-all duration-300 ease-in-out`}>
        {/* Your page content goes here */}
      </div>
    </div>
  );
};

export default Sidebar;