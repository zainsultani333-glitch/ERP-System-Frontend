import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const Sidebar = ({ userRole = "admin" }) => {
  const role = userRole?.toLowerCase().trim();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Define sections for different roles
  const getNavSections = () => {
    switch (role) {
      case "admin":
        return [
          {
            title: "ADMIN",
            items: [
              { path: "/admin-dashboard", name: "Admin Dashboard", icon: "📊" },
              { path: "/company", name: "Company", icon: "🏢" },
              { path: "/roles", name: "Role", icon: "🔐" },
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
        className={`${isCollapsed ? 'w-20' : 'w-80'} bg-secondary text-gray-800 shadow-2xl flex flex-col fixed top-0 left-0 h-screen overflow-y-auto transition-all duration-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']`}
      >
        <div className="p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-secondary z-10">
          <h1 className={`text-2xl font-bold text-primary ${isCollapsed ? 'hidden' : 'block'}`}>
            TMS
          </h1>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-primary transition-colors"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-6 h-6" />
            ) : (
              <ChevronLeftIcon className="w-6 h-6" />
            )}
          </button>
        </div>

        <nav className="flex-1 mt-4 mb-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="mb-6">
              {!isCollapsed && (
                <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              <ul className="space-y-2 px-3">
                {section.items.map((item) => (
                  <li key={item.path} className="relative">
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                    ${location.pathname === item.path
                          ? 'bg-primary/20 text-primary shadow-lg font-semibold'
                          : 'text-gray-700 hover:bg-primary/10 hover:text-primary'
                        }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className={`${isCollapsed ? 'hidden' : 'block'} font-medium`}>
                        {item.name}
                      </span>
                      {isCollapsed && (
                        <div className="absolute left-20 hidden group-hover:block bg-primary text-white px-2 py-1 rounded text-sm whitespace-nowrap z-50 shadow-lg">
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

        <div className="p-4 border-t border-gray-200 text-xs text-gray-400 text-center sticky bottom-0 bg-secondary">
          {!isCollapsed && (
            <div>
              <span>© 2024 TMS v1.0</span>
              <div className="mt-1 capitalize">Logged in as: {userRole}</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`${isCollapsed ? 'ml-20' : 'ml-80'} flex-1`}>
        {/* Your page content goes here */}
      </div>
    </div>
  );
};

export default Sidebar;