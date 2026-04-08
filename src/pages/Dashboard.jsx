// App.jsx - Single Page Dashboard
import React, { useState, useEffect } from 'react';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalEmployees: 0,
      totalSales: 0,
      totalPurchases: 0,
      totalProducts: 0
    },
    salesData: [],
    recentOrders: [],
    topProducts: []
  });

  const maxPurchasesValue = Math.max(...dashboardData.salesData.map(d => d.purchases));
  // Simulate API call - Replace this with your actual API
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      // Replace this dummy data with your actual API call
      // Example: const response = await fetch('/api/dashboard');
      // const data = await response.json();

      const data = {
        stats: {
          totalEmployees: 156,
          totalSales: 89450,
          totalPurchases: 62340,
          totalProducts: 48
        },
        salesData: [
          { month: 'Jan', sales: 12500, purchases: 8900 },
          { month: 'Feb', sales: 15000, purchases: 10200 },
          { month: 'Mar', sales: 13800, purchases: 9500 },
          { month: 'Apr', sales: 16800, purchases: 11500 },
          { month: 'May', sales: 14200, purchases: 9800 },
          { month: 'Jun', sales: 18900, purchases: 12400 }
        ],
        recentOrders: [
          { id: '#ORD-001', customer: 'John Smith', amount: 1250, status: 'Completed', date: '2024-01-15' },
          { id: '#ORD-002', customer: 'Sarah Johnson', amount: 3450, status: 'Processing', date: '2024-01-14' },
          { id: '#ORD-003', customer: 'Mike Brown', amount: 890, status: 'Pending', date: '2024-01-14' },
          { id: '#ORD-004', customer: 'Emma Wilson', amount: 2340, status: 'Completed', date: '2024-01-13' },
          { id: '#ORD-005', customer: 'David Lee', amount: 1780, status: 'Shipped', date: '2024-01-13' }
        ],
        topProducts: [
          { name: 'Wireless Headphones', sales: 234, revenue: 23400, growth: 12.5 },
          { name: 'Smart Watch', sales: 189, revenue: 37800, growth: 8.3 },
          { name: 'Bluetooth Speaker', sales: 156, revenue: 12480, growth: -3.2 },
          { name: 'Laptop Stand', sales: 134, revenue: 5360, growth: 15.7 },
          { name: 'USB-C Hub', sales: 98, revenue: 3920, growth: 5.1 }
        ]
      };

      setDashboardData(data);
      setLoading(false);
    }, 1000);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate trend
  const calculateTrend = (current, previous) => {
    return ((current - previous) / previous) * 100;
  };

  // StatCard Component
  const StatCard = ({ title, value, icon, color, isCurrency = false, trend = 0 }) => {
    const getIcon = () => {
      const icons = {
        users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        sales: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        purchases: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
        products: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
      };
      return icons[icon] || icons.users;
    };

    const getBgColor = () => {
      const colors = {
        primary: 'bg-primary/10',
        success: 'bg-success/10',
        danger: 'bg-danger/10',
        accent: 'bg-accent/10'
      };
      return colors[color] || 'bg-primary/10';
    };

    const getTextColor = () => {
      const colors = {
        primary: 'text-primary',
        success: 'text-success',
        danger: 'text-danger',
        accent: 'text-accent'
      };
      return colors[color] || 'text-primary';
    };

    const getTrendColor = () => {
      if (trend > 0) return 'text-success';
      if (trend < 0) return 'text-danger';
      return 'text-accent';
    };

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {isCurrency ? formatCurrency(value) : value.toLocaleString()}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getBgColor()}`}>
            <svg className={`w-6 h-6 ${getTextColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIcon()} />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center text-sm font-medium ${getTrendColor()}`}>
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              {trend > 0 ? (
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              ) : trend < 0 ? (
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
              )}
            </svg>
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500">vs last month</span>
        </div>
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate trends
  const trends = {
    employees: calculateTrend(dashboardData.stats.totalEmployees, 148),
    sales: calculateTrend(dashboardData.stats.totalSales, 82300),
    purchases: calculateTrend(dashboardData.stats.totalPurchases, 58900),
    products: calculateTrend(dashboardData.stats.totalProducts, 52)
  };

  // Calculate max value for chart scaling
  const maxSalesValue = Math.max(...dashboardData.salesData.map(d => Math.max(d.sales, d.purchases)));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Monitor your business performance in real-time</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-secondary px-4 py-2 rounded-full text-sm font-medium text-gray-700 flex items-center gap-2 shadow-sm">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <button className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-teal-500 text-white font-semibold flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <span>AD</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Employees"
            value={dashboardData.stats.totalEmployees}
            icon="users"
            color="primary"
            trend={trends.employees}
          />
          <StatCard
            title="Total Sales"
            value={dashboardData.stats.totalSales}
            icon="sales"
            color="success"
            isCurrency={true}
            trend={trends.sales}
          />
          <StatCard
            title="Total Purchases"
            value={dashboardData.stats.totalPurchases}
            icon="purchases"
            color="danger"
            isCurrency={true}
            trend={trends.purchases}
          />
          <StatCard
            title="Total Products"
            value={dashboardData.stats.totalProducts}
            icon="products"
            color="accent"
            trend={trends.products}
          />
        </div>

        {/* Charts Section - Two Charts Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Sales Overview</h2>
              <div className="bg-success/10 px-3 py-1 rounded-full">
                <span className="text-success text-xs font-medium">+12.5%</span>
              </div>
            </div>

            <div className="relative h-48">
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 py-1">
                <span>$20k</span>
                <span>$15k</span>
                <span>$10k</span>
                <span>$5k</span>
                <span>$0</span>
              </div>

              <div className="ml-12 h-full flex items-end gap-2">
                {[
                  { month: 'Jan', value: 12500 },
                  { month: 'Feb', value: 15000 },
                  { month: 'Mar', value: 13800 },
                  { month: 'Apr', value: 16800 },
                  { month: 'May', value: 14200 },
                  { month: 'Jun', value: 18900 }
                ].map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full flex justify-center">
                      <div
                        className="w-full bg-success rounded-t-lg transition-all duration-300 hover:bg-success/80"
                        style={{ height: `${(item.value / 20000) * 160}px` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity">
                          ${item.value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 mt-2">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Purchases Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Purchases Overview</h2>
              <div className="bg-danger/10 px-3 py-1 rounded-full">
                <span className="text-danger text-xs font-medium">+8.3%</span>
              </div>
            </div>

            <div className="relative h-48">
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 py-1">
                <span>$15k</span>
                <span>$12k</span>
                <span>$9k</span>
                <span>$6k</span>
                <span>$3k</span>
                <span>$0</span>
              </div>

              <div className="ml-12 h-full flex items-end gap-2">
                {[
                  { month: 'Jan', value: 8900 },
                  { month: 'Feb', value: 10200 },
                  { month: 'Mar', value: 9500 },
                  { month: 'Apr', value: 11500 },
                  { month: 'May', value: 9800 },
                  { month: 'Jun', value: 12400 }
                ].map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full flex justify-center">
                      <div
                        className="w-full bg-primary rounded-t-lg transition-all duration-300 hover:bg-primary/80"
                        style={{ height: `${(item.value / 15000) * 160}px` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity">
                          ${item.value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 mt-2">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <button className="text-primary text-sm font-medium hover:text-teal-600 transition-colors">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {dashboardData.recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{order.id}</span>
                      <span className="text-sm text-gray-600">{order.customer}</span>
                    </div>
                    <span className="text-xs text-gray-500">{order.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">{formatCurrency(order.amount)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Completed' ? 'bg-success/10 text-success' :
                      order.status === 'Processing' ? 'bg-primary/10 text-primary' :
                        order.status === 'Pending' ? 'bg-accent/10 text-accent' :
                          'bg-secondary text-gray-700'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Top Products</h2>
              <button className="text-primary text-sm font-medium hover:text-teal-600 transition-colors">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {dashboardData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} units sold</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">{formatCurrency(product.revenue)}</span>
                    <span className={`flex items-center text-sm font-medium ${product.growth > 0 ? 'text-success' : 'text-danger'
                      }`}>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        {product.growth > 0 ? (
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                        )}
                      </svg>
                      {Math.abs(product.growth)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-primary/5 to-teal-500/5 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-center group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Add Product</span>
            </button>
            <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-center group">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-success/20 transition-colors">
                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">New Order</span>
            </button>
            <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-center group">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-accent/20 transition-colors">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Generate Report</span>
            </button>
            <button className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-center group">
              <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-danger/20 transition-colors">
                <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;