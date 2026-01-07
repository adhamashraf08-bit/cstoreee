
import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Users, ShoppingBag, Globe, ArrowUpRight, ArrowDownRight,
  MapPin, Phone, Instagram, Truck, Calculator
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from './utils';
import { BranchData } from './types';
import { DashboardProvider, useDashboard } from './src/context/DashboardContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AdminPanel } from './src/components/AdminPanel';
import { LoginPage } from './src/components/LoginPage';
import { ViewerDashboard } from './src/components/ViewerDashboard';
import { ProtectedRoute } from './src/components/ProtectedRoute';

// Sub-components
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {trend && (
        <div className={`flex items-center mt-2 text-xs font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
          {trendValue}
        </div>
      )}
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

// Fixed: Explicitly typed BranchDetails as a React.FC to properly handle standard React props like 'key'
const BranchDetails: React.FC<{ branch: BranchData }> = ({ branch }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold text-slate-800 flex items-center">
        <MapPin className="mr-2 text-blue-500" size={20} />
        {branch.name} <span className="text-slate-400 font-normal ml-2">({branch.arabicName})</span>
      </h3>
      <div className="bg-slate-50 px-3 py-1 rounded-full text-xs font-semibold text-slate-500">
        Performance: High
      </div>
    </div>

    <div className="space-y-4">
      {branch.channels.map((channel: any) => (
        <div key={channel.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${channel.name === 'Call Centre' ? 'bg-blue-100 text-blue-600' :
              channel.name === 'Insta' ? 'bg-pink-100 text-pink-600' :
                'bg-orange-100 text-orange-600'
              }`}>
              {channel.name === 'Call Centre' ? <Phone size={16} /> :
                channel.name === 'Insta' ? <Instagram size={16} /> :
                  <Truck size={16} />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">{channel.name}</p>
              <p className="text-xs text-slate-500">{formatNumber(channel.orders)} Orders</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">{formatCurrency(channel.sales)}</p>
            <p className="text-xs text-slate-500">AOV: {formatCurrency(channel.avgOrderValue)}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Total Sales</p>
        <p className="text-lg font-bold text-blue-600">{formatCurrency(branch.totalSales)}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Total Orders</p>
        <p className="text-lg font-bold text-slate-900">{formatNumber(branch.totalOrders)}</p>
      </div>
    </div>
  </div>
);

const DashboardContent: React.FC = () => {
  const { data } = useDashboard();
  const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'website'>('overview');
  const [showAdmin, setShowAdmin] = useState(false);

  // Calculate all data needed for rendering - MUST be before any early returns (React Rules of Hooks)
  const totals = useMemo(() => {
    const branchSales = data.branches.reduce((acc, b) => acc + b.totalSales, 0);
    const totalSales = branchSales + data.website.totalSales;
    const totalOrders = data.branches.reduce((acc, b) => acc + b.totalOrders, 0) + data.website.totalOrders;
    return { totalSales, totalOrders };
  }, [data]);

  const chartData = useMemo(() => {
    return data.branches.map(b => ({
      name: b.name,
      sales: b.totalSales,
      orders: b.totalOrders
    }));
  }, [data]);

  const channelData = useMemo(() => {
    const channelsMap: Record<string, number> = {};
    data.branches.forEach(b => {
      b.channels.forEach(c => {
        channelsMap[c.name] = (channelsMap[c.name] || 0) + c.sales;
      });
    });
    return Object.entries(channelsMap).map(([name, value]) => ({ name, value }));
  }, [data]);

  const COLORS = ['#3b82f6', '#ec4899', '#f97316', '#8b5cf6'];

  // Conditional rendering AFTER all hooks have been called
  if (showAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Panel</h1>
            <button
              onClick={() => setShowAdmin(false)}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              Back to Dashboard
            </button>
          </div>
        </header>
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">C Store Online Sales</h1>
            <p className="text-sm text-slate-500 font-medium">Real-time Sales & Performance Dashboard</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAdmin(true)}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              Admin
            </button>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('branches')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'branches' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Branches
              </button>
              <button
                onClick={() => setActiveTab('website')}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'website' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Website
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totals.totalSales)}
            icon={TrendingUp}
            trend="up"
            trendValue="+12.5% vs LW"
            color="bg-blue-600"
          />
          <StatCard
            title="Total Orders"
            value={formatNumber(totals.totalOrders)}
            icon={ShoppingBag}
            trend="up"
            trendValue="+8.2% vs LW"
            color="bg-violet-600"
          />
          <StatCard
            title="Avg. Ticket Size"
            value={formatCurrency(totals.totalSales / totals.totalOrders)}
            icon={Calculator}
            color="bg-amber-600"
          />
          <StatCard
            title="Web Conversions"
            value={formatPercent(data.website.conversionRate)}
            icon={Globe}
            trend="down"
            trendValue="-0.1% vs LW"
            color="bg-emerald-600"
          />
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Sales by Branch</h3>
                <select className="bg-slate-50 border-none text-xs font-bold text-slate-500 rounded-lg p-2 ring-1 ring-slate-200">
                  <option>Current Month</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: number) => [formatCurrency(val), 'Sales']}
                    />
                    <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Channel Distribution</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: number) => formatCurrency(val)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-3">
                {channelData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-sm text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{formatPercent((item.value / totals.totalSales) * 100)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cancellations Overview Section (Shared between tabs or global) */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl mr-4">
              <ArrowDownRight size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Cancellations Overview</h2>
              <p className="text-slate-500">Lost revenue analysis by channel</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Talabat Cancellations */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg mr-3">
                    <Truck size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Talabat Cancellations</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Loss</p>
                  <p className="text-xl font-black text-rose-600">
                    {formatCurrency(data.branches.reduce((acc, b) => {
                      const talabat = b.channels.find(c => c.name === 'Talabat');
                      return acc + (talabat?.cancelledValue || 0);
                    }, 0))}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {data.branches.map(b => {
                  const talabat = b.channels.find(c => c.name === 'Talabat');
                  const cancelledValue = talabat?.cancelledValue || 0;
                  const cancelledOrders = talabat?.cancelledOrders || 0;
                  if (cancelledOrders === 0 && cancelledValue === 0) return null;

                  return (
                    <div key={b.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <span className="text-sm font-bold text-slate-700">{b.name}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-rose-600">{formatCurrency(cancelledValue)}</p>
                        <p className="text-xs text-slate-500">{cancelledOrders} Orders</p>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </div>

            {/* Instashop Cancellations */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-pink-100 text-pink-600 rounded-lg mr-3">
                    <Instagram size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Instashop Cancellations</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Loss</p>
                  <p className="text-xl font-black text-rose-600">
                    {formatCurrency(data.branches.reduce((acc, b) => {
                      const insta = b.channels.find(c => c.name === 'Insta');
                      return acc + (insta?.cancelledValue || 0);
                    }, 0))}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {data.branches.map(b => {
                  const insta = b.channels.find(c => c.name === 'Insta');
                  const cancelledValue = insta?.cancelledValue || 0;
                  const cancelledOrders = insta?.cancelledOrders || 0;
                  if (cancelledOrders === 0 && cancelledValue === 0) return null;

                  return (
                    <div key={b.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <span className="text-sm font-bold text-slate-700">{b.name}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold text-rose-600">{formatCurrency(cancelledValue)}</p>
                        <p className="text-xs text-slate-500">{cancelledOrders} Orders</p>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'branches' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.branches.map((branch) => (
              <BranchDetails key={branch.name} branch={branch} />
            ))}
          </div>
        )}

        {activeTab === 'website' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
              <div className="flex items-center mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl mr-4">
                  <Globe size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Website Performance</h2>
                  <p className="text-slate-500">Online Store Metrics & Funnel Analysis</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Visits</p>
                  <p className="text-3xl font-extrabold text-slate-900">{formatNumber(data.website.visits)}</p>
                  <div className="h-1 bg-slate-100 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '70%' }}></div>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Conversion Rate</p>
                  <div className="flex items-baseline">
                    <p className="text-3xl font-extrabold text-emerald-600">{formatPercent(data.website.conversionRate)}</p>
                    <span className="ml-2 text-xs text-slate-400 font-bold">AVG 0.85%</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${data.website.conversionRate * 10}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-slate-50 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-slate-700">Order Funnel</h4>
                  <span className="text-xs font-bold text-slate-400">Total: {data.website.totalOrders}</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                      Completed
                    </span>
                    <span className="text-sm font-bold text-slate-900">{data.website.completedOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-rose-500 mr-2"></div>
                      Cancelled
                    </span>
                    <span className="text-sm font-bold text-slate-900">{data.website.cancelledOrders}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">Loss from Cancellations</span>
                    <span className="text-sm font-bold text-rose-600">{formatCurrency(data.website.cancelledValue)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Website Sales Trends</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { day: 'Mon', value: 12000 },
                      { day: 'Tue', value: 19000 },
                      { day: 'Wed', value: 15000 },
                      { day: 'Thu', value: 22000 },
                      { day: 'Fri', value: 30000 },
                      { day: 'Sat', value: 25000 },
                      { day: 'Sun', value: 12591 }
                    ]}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(val: number) => formatCurrency(val)}
                      />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-3xl text-white overflow-hidden relative">
                <div className="relative z-10">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Web Total Revenue</p>
                  <h3 className="text-4xl font-extrabold mb-6 tracking-tight">{formatCurrency(data.website.totalSales)}</h3>
                  <div className="flex items-center text-emerald-400 text-sm font-bold">
                    <ArrowUpRight size={18} className="mr-1" />
                    +15% Growth Since Launch
                  </div>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -left-10 -top-10 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating CTA / Footer Info */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-slate-200 z-50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-tight">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
            System Live
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <p className="text-xs font-semibold text-slate-600">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DashboardProvider>
        <AppRouter />
      </DashboardProvider>
    </AuthProvider>
  );
};

// Router component to handle authentication-based routing
const AppRouter: React.FC = () => {
  const { isAuthenticated, isViewer, isAdmin } = useAuth();

  // Not authenticated - show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Authenticated as viewer - show viewer dashboard
  if (isViewer) {
    return (
      <ProtectedRoute allowedRoles={['viewer']}>
        <ViewerDashboard />
      </ProtectedRoute>
    );
  }

  // Authenticated as admin - show admin dashboard
  if (isAdmin) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <DashboardContent />
      </ProtectedRoute>
    );
  }

  // Fallback - should not happen
  return <LoginPage />;
};

export default App;
