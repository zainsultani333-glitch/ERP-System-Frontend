import { useEffect, useState } from "react";
import { getAccountsDashboard } from "../../Service/Api";
import { FiPackage, FiBox, FiShoppingCart, FiDollarSign, FiTruck, FiUsers, FiAlertTriangle, FiTrendingUp, FiCalendar, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import { FaTasks, FaBoxes, FaChartLine } from "react-icons/fa";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getAccountsDashboard();
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Dashboard error:", error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return "bg-success/10 text-success";
      case 'pending':
        return "bg-warning/10 text-warning";
      case 'canceled':
        return "bg-danger/10 text-danger";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <FiCheckCircle className="w-3 h-3" />;
      case 'pending':
        return <FiClock className="w-3 h-3" />;
      case 'canceled':
        return <FiXCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Dashboard...</p>
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
          <p className="text-danger text-lg font-semibold">Failed to load dashboard</p>
          <button 
            onClick={fetchDashboard}
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
      title: "Total Products",
      value: data.products.totalProducts,
      icon: FiPackage,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Total Stock",
      value: data.products.totalStock,
      icon: FaBoxes,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Total Sales",
      value: data.sales.totalSales,
      icon: FiShoppingCart,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Total Revenue",
      value: `Rs ${data.sales.totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      title: "Total Purchases",
      value: data.purchases.totalPurchases,
      icon: FiTruck,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      title: "Total Suppliers",
      value: data.suppliers.totalSuppliers,
      icon: FiUsers,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600"
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
            <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Low Stock Products */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-danger/10 to-danger/5 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-danger/20 rounded-lg">
                <FiAlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-danger">Low Stock Alert</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Products needing immediate attention
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {data.products.lowStockProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiCheckCircle className="w-8 h-8 text-success" />
                </div>
                <p className="text-success font-semibold">No low stock items!</p>
                <p className="text-sm text-gray-500 mt-1">All products have sufficient stock.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.products.lowStockProducts.map((p, idx) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-danger/20 rounded-lg flex items-center justify-center">
                        <FiPackage className="w-5 h-5 text-danger" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-500">Product ID: {p._id.slice(-6)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-danger">{p.stock}</div>
                      <div className="text-xs text-gray-500">units left</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <FiShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-primary">Recent Sales</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Latest transactions from your store
                </p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {data.sales.recentSales.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No recent sales found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.sales.recentSales.map((sale, idx) => (
                    <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                            <FiUsers className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {sale.customer}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <FiTrendingUp className="w-3 h-3 text-success" />
                          <span className="text-sm font-semibold text-success">
                            Rs {sale.total.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(sale.status)}`}
                        >
                          {getStatusIcon(sale.status)}
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(sale.saleDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">AVERAGE SALE VALUE</p>
              <p className="text-xl font-bold text-blue-600 mt-1">
                Rs {(data.sales.totalRevenue / data.sales.totalSales || 0).toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">STOCK VALUE</p>
              <p className="text-xl font-bold text-purple-600 mt-1">
                Rs {(data.products.totalStock * 100).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
              <FaBoxes className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">COMPLETION RATE</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {((data.sales.recentSales.filter(s => s.status === 'completed').length / data.sales.recentSales.length) * 100 || 0).toFixed(0)}%
              </p>
            </div>
            <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;