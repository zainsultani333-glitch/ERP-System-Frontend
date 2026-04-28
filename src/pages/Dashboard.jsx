import { useEffect, useState } from "react";
import { getAdminDashboard } from "../Service/Api";
import { FiBriefcase, FiUsers, FiShield, FiBell, FiMail, FiCalendar, FiAlertTriangle, FiUserPlus, FiClock } from "react-icons/fi";
import { FaBuilding, FaUserGraduate, FaChartLine, FaBell } from "react-icons/fa";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await getAdminDashboard();
      setData(res.data);
    } catch (error) {
      console.log("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin':
        return "bg-purple-100 text-purple-700";
      case 'manager':
        return "bg-blue-100 text-blue-700";
      case 'user':
        return "bg-green-100 text-green-700";
      case 'superadmin':
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="w-8 h-8 text-danger" />
          </div>
          <p className="text-danger text-lg font-semibold">Failed to load dashboard data</p>
          <button 
            onClick={loadDashboard}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary, recentUsers, recentNotifications } = data;

  const statsCards = [
    {
      title: "Total Companies",
      value: summary.totalCompanies,
      icon: FaBuilding,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Total Users",
      value: summary.totalUsers,
      icon: FiUsers,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Total Roles",
      value: summary.totalRoles,
      icon: FiShield,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Total Notifications",
      value: summary.totalNotifications,
      icon: FaBell,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
            <FaChartLine className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              System Administration Overview
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {card.value}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                {card.title}
              </div>
            </div>
            <div className={`h-1 bg-gradient-to-r ${card.color} transform origin-left group-hover:scale-x-100 scale-x-0 transition-transform duration-300`} />
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Users Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <FiUsers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-primary">Recent Users</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Latest user registrations
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Total: {summary.totalUsers}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {recentUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiUsers className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No users found</p>
                <p className="text-sm text-gray-400 mt-1">Users will appear here once registered</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user, idx) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                        <FiUserPlus className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {user.name || "Unnamed User"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <FiMail className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {user.email || "No email provided"}
                          </p>
                        </div>
                        {user.company && (
                          <div className="flex items-center gap-2 mt-1">
                            <FiBriefcase className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500">
                              {user.company.name || "No company"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                        {user.role || "User"}
                      </span>
                      <div className="flex items-center gap-1 mt-2 justify-end">
                        <FiCalendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Notifications Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FaBell className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-orange-700">Recent Notifications</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Latest system notifications
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Total: {summary.totalNotifications}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaBell className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No notifications</p>
                <p className="text-sm text-gray-400 mt-1">Notifications will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentNotifications.map((notification, idx) => (
                  <div
                    key={notification._id}
                    className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiBell className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        {notification.message || "No message"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <FiClock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">ACTIVE COMPANIES</p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                {summary.totalCompanies}
              </p>
              <p className="text-xs text-green-600 mt-1">Total registered companies</p>
            </div>
            <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
              <FaBuilding className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">ACTIVE USERS</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {summary.totalUsers}
              </p>
              <p className="text-xs text-green-600 mt-1">Total system users</p>
            </div>
            <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
              <FaUserGraduate className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">ROLES CONFIGURED</p>
              <p className="text-xl font-bold text-purple-600 mt-1">
                {summary.totalRoles}
              </p>
              <p className="text-xs text-green-600 mt-1">Access control roles</p>
            </div>
            <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
              <FiShield className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;