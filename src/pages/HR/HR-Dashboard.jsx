import { useEffect, useState } from "react";
import { getHRDashboard } from "../../Service/Api";
import { FiUsers, FiFileText, FiUserPlus, FiCalendar, FiMail, FiBriefcase, FiAlertTriangle, FiClock } from "react-icons/fi";
import { FaUsers, FaFileAlt, FaChartLine } from "react-icons/fa";

const HRDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHRDashboard();
  }, []);

  const fetchHRDashboard = async () => {
    try {
      const res = await getHRDashboard();
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.log("HR Dashboard error:", error);
      setLoading(false);
    }
  };

  const getEmployeeRoleColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin':
        return "bg-purple-100 text-purple-700";
      case 'manager':
        return "bg-blue-100 text-blue-700";
      case 'hr':
        return "bg-pink-100 text-pink-700";
      case 'employee':
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading HR Dashboard...</p>
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
          <p className="text-danger text-lg font-semibold">Failed to load HR Dashboard</p>
          <button 
            onClick={fetchHRDashboard}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Employees",
      value: data.employees.totalEmployees,
      icon: FaUsers,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Total Documents",
      value: data.documents.totalDocuments,
      icon: FaFileAlt,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
            <FaUsers className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">HR Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Human Resources Management Overview
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

        {/* Additional Stats Cards from API data */}
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-50 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FiUserPlus className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">
                  {data.employees.recentEmployees?.length || 0}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500 font-medium">Recent Hires</div>
          </div>
          <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600 transform origin-left group-hover:scale-x-100 scale-x-0 transition-transform duration-300" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FiClock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">
                  {data.documents.recentDocuments?.length || 0}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500 font-medium">Recent Documents</div>
          </div>
          <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-600 transform origin-left group-hover:scale-x-100 scale-x-0 transition-transform duration-300" />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Employees Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <FiUsers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-primary">Recent Employees</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Newest members of your team
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Total: {data.employees.totalEmployees}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {data.employees.recentEmployees.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiUsers className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No employees found</p>
                <p className="text-sm text-gray-400 mt-1">Add employees to see them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.employees.recentEmployees.map((emp, idx) => (
                  <div
                    key={emp._id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                        <FiUsers className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {emp.name || "Unnamed Employee"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <FiMail className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {emp.email || "No email provided"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <FiBriefcase className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {emp.department || "No department"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEmployeeRoleColor(emp.role)}`}>
                        {emp.role || "Employee"}
                      </span>
                      <div className="flex items-center gap-1 mt-2 justify-end">
                        <FiCalendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          Joined: {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Documents Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaFileAlt className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-green-700">Recent Documents</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Latest HR documentation
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Total: {data.documents.totalDocuments}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {data.documents.recentDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaFileAlt className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No documents found</p>
                <p className="text-sm text-gray-400 mt-1">Upload documents to see them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.documents.recentDocuments.map((doc, idx) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <FiFileText className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {doc.title || "Untitled Document"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <FiFileText className="w-3 h-3 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            Type: {doc.type || "Document"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <FiClock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleTimeString() : "N/A"}
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
    </div>
  );
};

export default HRDashboard;