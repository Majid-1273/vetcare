import React, { useState } from 'react';

// Chart components
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const ReportsAndAnalytics = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');
  // State for report type (layer or broiler)
  const [reportType, setReportType] = useState('layer');
  // State for date range
  const [dateRange, setDateRange] = useState('month');
  // State for selected batch
  const [selectedBatch, setSelectedBatch] = useState('BATCH-001');

  // Mock data for charts and tables
  const batchOptions = [
    { id: 'BATCH-001', name: 'Spring Layers 2025' },
    { id: 'BATCH-002', name: 'Broilers March 2025' }
  ];

  // Performance data
  const mortalityData = [
    { day: '1', mortality: 2, expected: 1 },
    { day: '2', mortality: 1, expected: 1 },
    { day: '3', mortality: 0, expected: 1 },
    { day: '4', mortality: 1, expected: 1 },
    { day: '5', mortality: 0, expected: 1 },
    { day: '7', mortality: 2, expected: 1 },
    { day: '10', mortality: 1, expected: 1 },
    { day: '14', mortality: 0, expected: 1 },
    { day: '21', mortality: 2, expected: 1 },
    { day: '28', mortality: 1, expected: 2 },
  ];

  const eggProductionData = [
    { day: '30', collected: 180, damaged: 12, production: 43 },
    { day: '31', collected: 210, damaged: 8, production: 50 },
    { day: '32', collected: 245, damaged: 9, production: 58 },
    { day: '33', collected: 280, damaged: 7, production: 67 },
    { day: '34', collected: 310, damaged: 12, production: 74 },
    { day: '35', collected: 345, damaged: 10, production: 83 },
    { day: '36', collected: 360, damaged: 6, production: 87 },
    { day: '37', collected: 375, damaged: 8, production: 91 },
    { day: '38', collected: 380, damaged: 5, production: 93 },
    { day: '39', collected: 385, damaged: 6, production: 94 },
  ];

  const feedConsumptionData = [
    { week: '1', actual: 12, standard: 15 },
    { week: '2', actual: 18, standard: 20 },
    { week: '3', actual: 25, standard: 24 },
    { week: '4', actual: 36, standard: 35 },
    { week: '5', actual: 45, standard: 42 },
    { week: '6', actual: 50, standard: 52 },
    { week: '7', actual: 58, standard: 60 },
    { week: '8', actual: 65, standard: 68 },
  ];

  // Financial data
  const revenueData = [
    { month: 'Jan', eggs: 12500, culled: 1500, waste: 800 },
    { month: 'Feb', eggs: 14200, culled: 1200, waste: 950 },
    { month: 'Mar', eggs: 15800, culled: 1800, waste: 1100 },
    { month: 'Apr', eggs: 16500, culled: 1400, waste: 1050 },
    { month: 'May', eggs: 18200, culled: 1600, waste: 1200 },
    { month: 'Jun', eggs: 17500, culled: 1300, waste: 1000 },
  ];

  const expenseData = [
    { month: 'Jan', feed: 8500, medication: 1500, labor: 3000 },
    { month: 'Feb', feed: 9200, medication: 1200, labor: 3000 },
    { month: 'Mar', feed: 9800, medication: 1800, labor: 3000 },
    { month: 'Apr', feed: 10500, medication: 1400, labor: 3000 },
    { month: 'May', feed: 11200, medication: 1600, labor: 3000 },
    { month: 'Jun', feed: 10500, medication: 1300, labor: 3000 },
  ];

  const profitabilityData = [
    { month: 'Jan', profit: 1800 },
    { month: 'Feb', profit: 2900 },
    { month: 'Mar', profit: 3000 },
    { month: 'Apr', profit: 2600 },
    { month: 'May', profit: 3200 },
    { month: 'Jun', profit: 3700 },
  ];

  const costBreakdownData = [
    { name: 'Feed', value: 65 },
    { name: 'Medication', value: 12 },
    { name: 'Labor', value: 18 },
    { name: 'Utilities', value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Function to generate financial summary
  const generateFinancialSummary = () => {
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.eggs + item.culled + item.waste, 0);
    const totalExpenses = expenseData.reduce((sum, item) => sum + item.feed + item.medication + item.labor, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(2);
    
    return { totalRevenue, totalExpenses, netProfit, profitMargin };
  };

  // Function to generate performance summary
  const generatePerformanceSummary = () => {
    const avgMortalityRate = (mortalityData.reduce((sum, item) => sum + item.mortality, 0) / 1000 * 100).toFixed(2);
    const peakProduction = Math.max(...eggProductionData.map(item => item.production));
    const avgProduction = (eggProductionData.reduce((sum, item) => sum + item.production, 0) / eggProductionData.length).toFixed(2);
    
    return { avgMortalityRate, peakProduction, avgProduction };
  };

  const summary = generateFinancialSummary();
  const performanceSummary = generatePerformanceSummary();

  return (
    <>
      {/* Top Navigation/Search Bar */}
      <div className="p-4 bg-white border-b flex items-center justify-between sticky top-0 z-10">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <button className="relative p-1 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User Icon */}
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-800">
            US
          </div>
        </div>
      </div>

      {/* Reports and Analytics Content */}
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-green-800">Reports & Analytics</h1>
            <p className="text-gray-600">Track performance metrics and financial data for your poultry operation</p>
          </div>

          {/* Filter Controls */}
          <div className="bg-white p-4 mb-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  {batchOptions.map(batch => (
                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="layer">Layer Chickens</option>
                  <option value="broiler">Broiler Chickens</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition shadow-md hover:shadow-lg">
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'performance'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Performance Analysis
              </button>
              <button
                onClick={() => setActiveTab('financial')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'financial'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Financial Records
              </button>
            </nav>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                      <p className="text-lg font-semibold text-gray-900">${summary.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                      <p className="text-lg font-semibold text-gray-900">${summary.totalExpenses.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Net Profit</p>
                      <p className="text-lg font-semibold text-gray-900">${summary.netProfit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-amber-100 rounded-lg p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Profit Margin</p>
                      <p className="text-lg font-semibold text-gray-900">{summary.profitMargin}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profitability Chart */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Profitability Trend</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={profitabilityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`$${value}`, 'Profit']}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Breakdown</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={costBreakdownData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {costBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Analysis Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Mortality Rate</p>
                      <p className="text-lg font-semibold text-gray-900">{performanceSummary.avgMortalityRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Peak Production</p>
                      <p className="text-lg font-semibold text-gray-900">{performanceSummary.peakProduction}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Avg. Production</p>
                      <p className="text-lg font-semibold text-gray-900">{performanceSummary.avgProduction}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mortality Chart */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Mortality Trend</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mortalityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottomRight', offset: -5 }} />
                        <YAxis label={{ value: 'Birds', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="mortality" name="Actual Mortality" stroke="#EF4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="expected" name="Expected Mortality" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="3 3" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Egg Production Chart (for layers) */}
                {reportType === 'layer' && (
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Egg Production</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={eggProductionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottomRight', offset: -5 }} />
                          <YAxis yAxisId="left" orientation="left" stroke="#10B981" label={{ value: 'Eggs', angle: -90, position: 'insideLeft' }} />
                          <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" label={{ value: 'Production %', angle: 90, position: 'insideRight' }} />
                          <Tooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="collected" name="Eggs Collected" stroke="#10B981" strokeWidth={2} />
                          <Line yAxisId="left" type="monotone" dataKey="damaged" name="Damaged Eggs" stroke="#EF4444" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="production" name="Production %" stroke="#F59E0B" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Weight Gain Chart (for broilers) */}
                {reportType === 'broiler' && (
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Weight Gain</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                      <LineChart
  data={[
    { week: '1', actual: 150, standard: 175 },
    { week: '2', actual: 350, standard: 425 },
    { week: '3', actual: 680, standard: 790 },
    { week: '4', actual: 1250, standard: 1300 },
    { week: '5', actual: 1780, standard: 1850 },
    { week: '6', actual: 2300, standard: 2450 },
  ]}
  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="week" label={{ value: 'Week', position: 'insideBottomRight', offset: -5 }} />
  <YAxis label={{ value: 'Weight (g)', angle: -90, position: 'insideLeft' }} />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="actual" name="Actual Weight" stroke="#10B981" strokeWidth={2} />
  <Line type="monotone" dataKey="standard" name="Standard Weight" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="3 3" />
</LineChart>

</ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Feed Consumption Chart */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Feed Consumption</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={feedConsumptionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" label={{ value: 'Week', position: 'insideBottomRight', offset: -5 }} />
                        <YAxis label={{ value: 'Feed (kg)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="actual" name="Actual Consumption" fill="#10B981" />
                        <Bar dataKey="standard" name="Standard Consumption" fill="#9CA3AF" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Financial Records Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Revenue vs Expenses Chart */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue vs Expenses</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={revenueData.map((item, index) => ({
                        month: item.month,
                        revenue: item.eggs + item.culled + item.waste,
                        expenses: expenseData[index].feed + expenseData[index].medication + expenseData[index].labor
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, '']} />
                      <Legend />
                      <Bar dataKey="revenue" name="Total Revenue" fill="#10B981" />
                      <Bar dataKey="expenses" name="Total Expenses" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue Sources and Expense Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Sources */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Sources</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={revenueData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, '']} />
                        <Legend />
                        <Bar dataKey="eggs" name="Egg Sales" stackId="a" fill="#10B981" />
                        <Bar dataKey="culled" name="Culled Birds" stackId="a" fill="#F59E0B" />
                        <Bar dataKey="waste" name="Waste Products" stackId="a" fill="#6366F1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Breakdown</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={expenseData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, '']} />
                        <Legend />
                        <Bar dataKey="feed" name="Feed Cost" stackId="a" fill="#EF4444" />
                        <Bar dataKey="medication" name="Medication" stackId="a" fill="#F59E0B" />
                        <Bar dataKey="labor" name="Labor Cost" stackId="a" fill="#6366F1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Export/Print Controls */}
              <div className="flex justify-end space-x-4">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Data
                </button>
                <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Report
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ReportsAndAnalytics;