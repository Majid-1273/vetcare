import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const ReportsAndAnalytics = () => {
  const [activeTab, setActiveTab] = useState('broiler');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for financial data
  const [broilerFinancials, setBroilerFinancials] = useState({
    revenue: { totalRevenue: 0, harvestedCartons: 0, chickenPieces: 0, poultryWaste: 0 },
    costs: {
      broodingMiscellaneous: 0,
      broodingLabour: 0,
      otherLabour: 0,
      feed: 0,
      medicationVet: 0,
      miscellaneous: 0,
      totalCost: 0
    },
    profitLoss: 0
  });

  const [layerFinancials, setLayerFinancials] = useState({
    revenue: { totalRevenue: 0, eggSales: 0, damagedEggs: 0, culledBirds: 0, poultryWaste: 0 },
    costs: {
      chicks: 0,
      broodingMiscellaneous: 0,
      broodingLabour: 0,
      feed: 0,
      medicationVet: 0,
      labour: 0,
      miscellaneous: 0,
      totalCost: 0
    },
    profitLoss: 0
  });

  // State for mortality data
  const [mortalityRecords, setMortalityRecords] = useState([]);
  const [eggRecords, setEggRecords] = useState([]);

  // State for user inputs
  const [fcrInputs, setFcrInputs] = useState({
    feedConsumed: 0,
    weightGain: 0
  });

  // Calculated metrics
  const [broilerMetrics, setBroilerMetrics] = useState({
    mortalityRate: 0,
    costPerBird: 0,
    fcr: 0,
    profitabilityBreakdown: []
  });

  const [layerMetrics, setLayerMetrics] = useState({
    mortalityRate: 0,
    costPerEgg: 0,
    profitabilityBreakdown: []
  });

  const { token } = useSelector((state) => state.auth);

  // Colors for charts
  const COLORS = ['#A8E6CF', '#FFD3B6', '#FFAAA5', '#FF8B94', '#DCEDC1'];

  // Handle FCR input changes
  const handleFcrInputChange = (e) => {
    const { name, value } = e.target;
    setFcrInputs(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  // Calculate FCR from inputs
  const calculateFcr = () => {
    if (fcrInputs.weightGain <= 0) return 0;
    const fcr = fcrInputs.feedConsumed / fcrInputs.weightGain;

    // Update broiler metrics with the new FCR
    setBroilerMetrics(prev => ({
      ...prev,
      fcr
    }));

    return fcr;
  };

  // Calculate total eggs from egg records
  const calculateTotalEggs = (records) => {
    return records.reduce((total, record) => {
      return total + (record.totalEggs || 0);
    }, 0);
  };

  // Calculate total costs for financials
  const calculateTotalCosts = (costs) => {
    return Object.entries(costs)
      .filter(([key]) => key !== 'totalCost')
      .reduce((total, [_, value]) => total + (parseFloat(value) || 0), 0);
  };

  // Calculate total revenue for financials
  const calculateTotalRevenue = (revenue) => {
    return Object.entries(revenue)
      .filter(([key]) => key !== 'totalRevenue')
      .reduce((total, [_, value]) => total + (parseFloat(value) || 0), 0);
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch financial data
      const [broilerResponse, layerResponse, mortalityResponse, eggResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/financial/broiler', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/financial/layer', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/financial/mortality', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/financial/eggRecords', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Calculate total costs and revenue for broiler financials
      const broilerData = broilerResponse.data;
      broilerData.costs.totalCost = calculateTotalCosts(broilerData.costs);
      broilerData.revenue.totalRevenue = calculateTotalRevenue(broilerData.revenue);
      broilerData.profitLoss = broilerData.revenue.totalRevenue - broilerData.costs.totalCost;

      // Calculate total costs and revenue for layer financials
      const layerData = layerResponse.data;
      layerData.costs.totalCost = calculateTotalCosts(layerData.costs);
      layerData.revenue.totalRevenue = calculateTotalRevenue(layerData.revenue);
      layerData.profitLoss = layerData.revenue.totalRevenue - layerData.costs.totalCost;

      setBroilerFinancials(broilerData);
      setLayerFinancials(layerData);

      // Sort mortality records by date (newest first)
      const sortedMortality = mortalityResponse.data.mortalityRecords.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setMortalityRecords(sortedMortality);
      setEggRecords(eggResponse.data.eggRecords);

      // Calculate metrics after data is fetched
      calculateBroilerMetrics(broilerData, sortedMortality);
      calculateLayerMetrics(layerData, sortedMortality, eggResponse.data.eggRecords);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setError('Authentication token not found. Please log in again.');
      setLoading(false);
    }
  }, [token]);

  // Calculate metrics for broilers
  const calculateBroilerMetrics = (financials, mortalityData) => {
    // Filter mortality records for broiler batches
    const broilerMortality = mortalityData.filter(record =>
      record.chickenType === 'broiler'
    );

    // Calculate average mortality rate
    const avgMortalityRate = broilerMortality.length > 0
      ? broilerMortality.reduce((sum, record) => sum + (record.mortalityRate / 100 || 0), 0) / broilerMortality.length
      : 0;

    // Get total birds from mortality records
    const totalBirds = broilerMortality.reduce((sum, record) => sum + (record.totalBirdsCount || 0), 0);

    // Calculate cost per bird
    const costPerBird = totalBirds > 0
      ? financials.costs.totalCost / totalBirds
      : 0;

    // Create profitability breakdown
    const costBreakdown = Object.entries(financials.costs)
      .filter(([key]) => key !== 'totalCost' && parseFloat(financials.costs[key]) > 0)
      .map(([key, value]) => ({
        name: formatCostName(key),
        value: parseFloat(value) || 0
      }));

    // Use default FCR of 1.8 if no inputs provided
    const fcr = (fcrInputs.feedConsumed > 0 && fcrInputs.weightGain > 0)
      ? fcrInputs.feedConsumed / fcrInputs.weightGain
      : 0;

    setBroilerMetrics({
      mortalityRate: avgMortalityRate,
      costPerBird,
      fcr,
      profitabilityBreakdown: costBreakdown.length > 0 ? costBreakdown : []
    });
  };

  // Calculate metrics for layers
  const calculateLayerMetrics = (financials, mortalityData, eggData) => {
    // Filter mortality records for layer batches
    const layerMortality = mortalityData.filter(record =>
      record.chickenType === 'layer'
    );

    // Calculate average mortality rate
    const avgMortalityRate = layerMortality.length > 0
      ? layerMortality.reduce((sum, record) => sum + (record.mortalityRate / 100 || 0), 0) / layerMortality.length
      : 0;

    // Calculate total eggs from egg records
    const totalEggs = calculateTotalEggs(eggData);

    // Calculate cost per egg
    const costPerEgg = totalEggs > 0
      ? financials.costs.totalCost / totalEggs
      : 0;

    // Create profitability breakdown
    const costBreakdown = Object.entries(financials.costs)
      .filter(([key]) => key !== 'totalCost' && parseFloat(financials.costs[key]) > 0)
      .map(([key, value]) => ({
        name: formatCostName(key),
        value: parseFloat(value) || 0
      }));

    setLayerMetrics({
      mortalityRate: avgMortalityRate,
      costPerEgg,
      profitabilityBreakdown: costBreakdown.length > 0 ? costBreakdown : []
    });
  };

  // Helper function to format cost names for display
  const formatCostName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
      .replace(/([a-z])([A-Z])/g, '$1 $2'); // Add space between camelCase words
  };

  // Format number for display
  const formatNumber = (num) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Format percentage
  const formatPercent = (num) => {
    return `${(num * 100).toFixed(2)}%`;
  };

  // Generate profitability data from financials
  const generateProfitabilityData = (financials) => {
    // Extract revenue and cost categories
    const revenueCategories = Object.entries(financials.revenue)
      .filter(([key]) => key !== 'totalRevenue' && parseFloat(financials.revenue[key]) > 0)
      .map(([key, value]) => ({
        name: formatCostName(key),
        value: parseFloat(value) || 0,
        type: 'Revenue'
      }));

    const costCategories = Object.entries(financials.costs)
      .filter(([key]) => key !== 'totalCost' && parseFloat(financials.costs[key]) > 0)
      .map(([key, value]) => ({
        name: formatCostName(key),
        value: -parseFloat(value) || 0, // Negative to show costs
        type: 'Cost'
      }));

    // Add profit/loss as a separate category
    const profitCategory = {
      name: 'Profit/Loss',
      value: financials.profitLoss,
      type: financials.profitLoss >= 0 ? 'Profit' : 'Loss'
    };

    return [...revenueCategories, ...costCategories, profitCategory];
  };

  if (loading) {
    return (

      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

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

      </div>
      <div className="h-full bg-white p-6 overflow-auto">

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('broiler')}
                className={`px-4 py-2 rounded-md ${activeTab === 'broiler'
                  ? 'bg-[#A8E6CF] text-white'
                  : 'bg-gray-200 text-gray-700'
                  }`}
              >
                🐔 Broiler
              </button>
              <button
                onClick={() => setActiveTab('layer')}
                className={`px-4 py-2 rounded-md ${activeTab === 'layer'
                  ? 'bg-[#A8E6CF] text-white'
                  : 'bg-gray-200 text-gray-700'
                  }`}
              >
                🥚 Layer
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Empty state when no data */}
          {!error && broilerFinancials.revenue.totalRevenue === 0 && layerFinancials.revenue.totalRevenue === 0 && mortalityRecords.length === 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
              <h3 className="text-lg font-medium text-blue-700 mb-1">No data available</h3>
              <p className="text-blue-600">
                You don't have any financial or mortality data recorded yet. The charts below show simulated data for demonstration purposes.
                Start by adding your financial records and batch information to see actual performance analytics.
              </p>
            </div>
          )}

          {/* Broiler Performance Analysis */}
          {activeTab === 'broiler' && (
            <div className="space-y-6">
              {/* FCR Input Section */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-md p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Feed Conversion Ratio Calculator</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feed Consumed (kg)
                    </label>
                    <input
                      type="number"
                      name="feedConsumed"
                      value={fcrInputs.feedConsumed}
                      onChange={handleFcrInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight Gain (kg)
                    </label>
                    <input
                      type="number"
                      name="weightGain"
                      value={fcrInputs.weightGain}
                      onChange={handleFcrInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={calculateFcr}
                      className="w-full bg-[#A8E6CF] text-white py-2 px-4 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Calculate FCR
                    </button>
                  </div>
                </div>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mortality Rate Card */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-700">Mortality Rate</h3>
                    <span className="p-2 bg-red-100 text-red-800 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{formatPercent(broilerMetrics.mortalityRate)}</p>
                  <p className="text-sm text-gray-500 mt-1">Average mortality rate across all batches</p>
                </div>

                {/* Cost Per Bird Card */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-700">Cost Per Bird</h3>
                    <span className="p-2 bg-blue-100 text-blue-800 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">${formatNumber(broilerMetrics.costPerBird)}</p>
                  <p className="text-sm text-gray-500 mt-1">Production cost per bird until harvest</p>
                </div>

                {/* FCR Card */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-700">Feed Conversion Ratio</h3>
                    <span className="p-2 bg-green-100 text-green-800 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{broilerMetrics.fcr.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">Feed (kg) per kg weight gain</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profitability Bar Chart */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-md p-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Financial Summary</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Revenue', value: broilerFinancials.revenue.totalRevenue, type: 'Revenue' },
                        { name: 'Costs', value: -broilerFinancials.costs.totalCost, type: 'Cost' },
                        { name: 'Profit/Loss', value: broilerFinancials.profitLoss, type: broilerFinancials.profitLoss >= 0 ? 'Profit' : 'Loss' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${formatNumber(Math.abs(value))}`} />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8">
                          <Cell fill="#A8E6CF" />
                          <Cell fill="#FF8B94" />
                          <Cell fill={broilerFinancials.profitLoss >= 0 ? '#FFCC5C' : '#FF6B6B'} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Cost Distribution Pie Chart */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-md p-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Cost Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={broilerMetrics.profitabilityBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {broilerMetrics.profitabilityBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${formatNumber(value)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-md p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Broiler Performance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="mb-2"><strong>Total Revenue:</strong> ${formatNumber(broilerFinancials.revenue.totalRevenue)}</p>
                    <p className="mb-2"><strong>Total Costs:</strong> ${formatNumber(broilerFinancials.costs.totalCost)}</p>
                    <p className="mb-2"><strong>Profit/Loss:</strong>
                      <span className={broilerFinancials.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${formatNumber(broilerFinancials.profitLoss)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="mb-2"><strong>Profit Margin:</strong>
                      {broilerFinancials.revenue.totalRevenue > 0 ?
                        formatPercent(broilerFinancials.profitLoss / broilerFinancials.revenue.totalRevenue) :
                        '0.00%'}
                    </p>
                    <p className="mb-2"><strong>Return on Investment:</strong>
                      {broilerFinancials.costs.totalCost > 0 ?
                        formatPercent(broilerFinancials.profitLoss / broilerFinancials.costs.totalCost) :
                        '0.00%'}
                    </p>
                    <p className="mb-2"><strong>Break-even Point:</strong>
                      {broilerMetrics.costPerBird > 0 ?
                        `${Math.ceil(broilerFinancials.costs.totalCost / broilerMetrics.costPerBird)} birds` :
                        'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Layer Performance Analysis */}
          {activeTab === 'layer' && (
            <div className="space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mortality Rate Card */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-700">Mortality Rate</h3>
                    <span className="p-2 bg-red-100 text-red-800 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{formatPercent(layerMetrics.mortalityRate)}</p>
                  <p className="text-sm text-gray-500 mt-1">Average mortality rate across all batches</p>
                </div>

                {/* Cost Per Egg Card */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-700">Cost Per Egg</h3>
                    <span className="p-2 bg-blue-100 text-blue-800 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">${formatNumber(layerMetrics.costPerEgg)}</p>
                  <p className="text-sm text-gray-500 mt-1">Production cost per egg</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profitability Bar Chart */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-md p-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Financial Summary</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Revenue', value: layerFinancials.revenue.totalRevenue, type: 'Revenue' },
                        { name: 'Costs', value: -layerFinancials.costs.totalCost, type: 'Cost' },
                        { name: 'Profit/Loss', value: layerFinancials.profitLoss, type: layerFinancials.profitLoss >= 0 ? 'Profit' : 'Loss' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${formatNumber(Math.abs(value))}`} />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8">
                          <Cell fill="#A8E6CF" />
                          <Cell fill="#FF8B94" />
                          <Cell fill={layerFinancials.profitLoss >= 0 ? '#FFCC5C' : '#FF6B6B'} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Cost Distribution Pie Chart */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-md p-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Cost Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={layerMetrics.profitabilityBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {layerMetrics.profitabilityBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${formatNumber(value)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-md p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Layer Performance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="mb-2"><strong>Total Revenue:</strong> ${formatNumber(layerFinancials.revenue.totalRevenue)}</p>
                    <p className="mb-2"><strong>Total Costs:</strong> ${formatNumber(layerFinancials.costs.totalCost)}</p>
                    <p className="mb-2"><strong>Profit/Loss:</strong>
                      <span className={layerFinancials.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${formatNumber(layerFinancials.profitLoss)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="mb-2"><strong>Profit Margin:</strong>
                      {layerFinancials.revenue.totalRevenue > 0 ?
                        formatPercent(layerFinancials.profitLoss / layerFinancials.revenue.totalRevenue) :
                        '0.00%'}
                    </p>
                    <p className="mb-2"><strong>Return on Investment:</strong>
                      {layerFinancials.costs.totalCost > 0 ?
                        formatPercent(layerFinancials.profitLoss / layerFinancials.costs.totalCost) :
                        '0.00%'}
                    </p>
                    <p className="mb-2"><strong>Total Egg Production:</strong>
                      {calculateTotalEggs(eggRecords).toLocaleString()} eggs
                    </p>
                  </div>
                </div>
              </div>

              {/* Egg Quality Analysis */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-md p-6">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Egg Quality Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Damaged Eggs Rate */}
                  <div>
                    <p className="text-lg font-medium text-gray-700">Damaged Eggs Rate</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {calculateTotalEggs(eggRecords) > 0 ?
                        formatPercent(layerFinancials.revenue.damagedEggs / calculateTotalEggs(eggRecords)) :
                        '0.00%'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Percentage of damaged eggs</p>
                  </div>

                  {/* Average Daily Production */}
                  <div>
                    <p className="text-lg font-medium text-gray-700">Avg Daily Production</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {eggRecords.length > 0 ?
                        Math.round(calculateTotalEggs(eggRecords) / eggRecords.length).toLocaleString() :
                        '0'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Average eggs per day</p>
                  </div>

                  {/* Revenue Per Egg */}
                  <div>
                    <p className="text-lg font-medium text-gray-700">Revenue Per Egg</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${calculateTotalEggs(eggRecords) > 0 ?
                        formatNumber(layerFinancials.revenue.eggSales / calculateTotalEggs(eggRecords)) :
                        '0.00'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Average revenue per egg</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default ReportsAndAnalytics;