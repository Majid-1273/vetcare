import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const FinancialManagement = () => {
    const [activeTab, setActiveTab] = useState('broiler');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [broilerFinancials, setBroilerFinancials] = useState({
        revenue: {
            harvestedCartons: 0,
            chickenPieces: 0,
            poultryWaste: 0,
            totalRevenue: 0
        },
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
        revenue: {
            eggSales: 0,
            damagedEggs: 0,
            culledBirds: 0,
            poultryWaste: 0,
            totalRevenue: 0
        },
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

    const { token } = useSelector((state) => state.auth);

    // Fetch financial data
    const fetchFinancialData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch broiler financial data
            const broilerResponse = await axios.get('http://localhost:5000/api/financial/broiler', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setBroilerFinancials(broilerResponse.data);
            
            const layerResponse = await axios.get('http://localhost:5000/api/financial/layer', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLayerFinancials(layerResponse.data);
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching financial data:', err);
            setError('Failed to fetch financial data. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchFinancialData();
        } else {
            setError('Authentication token not found. Please log in again.');
            setLoading(false);
        }
    }, [token]);

    // Calculate totals for broiler financials
    const calculateBroilerTotals = () => {
        const revenue = broilerFinancials.revenue;
        const costs = broilerFinancials.costs;
        
        const totalRevenue = Object.keys(revenue)
            .filter(key => key !== 'totalRevenue')
            .reduce((sum, key) => sum + (parseFloat(revenue[key]) || 0), 0);
            
        const totalCost = Object.keys(costs)
            .filter(key => key !== 'totalCost')
            .reduce((sum, key) => sum + (parseFloat(costs[key]) || 0), 0);
            
        const profitLoss = totalRevenue - totalCost;
        
        setBroilerFinancials({
            ...broilerFinancials,
            revenue: { ...revenue, totalRevenue },
            costs: { ...costs, totalCost },
            profitLoss
        });
    };

    // Calculate totals for layer financials
    const calculateLayerTotals = () => {
        const revenue = layerFinancials.revenue;
        const costs = layerFinancials.costs;
        
        const totalRevenue = Object.keys(revenue)
            .filter(key => key !== 'totalRevenue')
            .reduce((sum, key) => sum + (parseFloat(revenue[key]) || 0), 0);
            
        const totalCost = Object.keys(costs)
            .filter(key => key !== 'totalCost')
            .reduce((sum, key) => sum + (parseFloat(costs[key]) || 0), 0);
            
        const profitLoss = totalRevenue - totalCost;
        
        setLayerFinancials({
            ...layerFinancials,
            revenue: { ...revenue, totalRevenue },
            costs: { ...costs, totalCost },
            profitLoss
        });
    };

    // Update broiler financials
    const handleBroilerChange = (category, field, value) => {
        const numValue = parseFloat(value) || 0;
        
        if (category === 'revenue') {
            setBroilerFinancials({
                ...broilerFinancials,
                revenue: {
                    ...broilerFinancials.revenue,
                    [field]: numValue
                }
            });
        } else if (category === 'costs') {
            setBroilerFinancials({
                ...broilerFinancials,
                costs: {
                    ...broilerFinancials.costs,
                    [field]: numValue
                }
            });
        }
    };

    // Update layer financials
    const handleLayerChange = (category, field, value) => {
        const numValue = parseFloat(value) || 0;
        
        if (category === 'revenue') {
            setLayerFinancials({
                ...layerFinancials,
                revenue: {
                    ...layerFinancials.revenue,
                    [field]: numValue
                }
            });
        } else if (category === 'costs') {
            setLayerFinancials({
                ...layerFinancials,
                costs: {
                    ...layerFinancials.costs,
                    [field]: numValue
                }
            });
        }
    };

    // Save broiler financials
    const saveBroilerFinancials = async () => {
        try {
            calculateBroilerTotals();
            
            await axios.put('http://localhost:5000/api/financial/broiler', 
                {
                    revenue: broilerFinancials.revenue,
                    costs: broilerFinancials.costs
                }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Show success message
            setError(null);
            alert('Broiler financial data saved successfully!');
        } catch (err) {
            console.error('Error saving broiler financial data:', err);
            setError('Failed to save broiler financial data. Please try again.');
        }
    };

    // Save layer financials
    const saveLayerFinancials = async () => {
        try {
            calculateLayerTotals();
            
            await axios.put('http://localhost:5000/api/financial/layer', 
                {
                    revenue: layerFinancials.revenue,
                    costs: layerFinancials.costs
                }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Show success message
            setError(null);
            alert('Layer financial data saved successfully!');
        } catch (err) {
            console.error('Error saving layer financial data:', err);
            setError('Failed to save layer financial data. Please try again.');
        }
    };

    // Format number for display
    const formatNumber = (num) => {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading financial data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[90vh] bg-white p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Financial Management</h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab('broiler')}
                            className={`px-4 py-2 rounded-md ${
                                activeTab === 'broiler' 
                                ? 'bg-[#A8E6CF] text-white' 
                                : 'bg-gray-200 text-gray-700'
                            }`}
                        >
                            🐔 Broiler
                        </button>
                        <button
                            onClick={() => setActiveTab('layer')}
                            className={`px-4 py-2 rounded-md ${
                                activeTab === 'layer' 
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

                {/* Broiler Financial Records */}
                {activeTab === 'broiler' && (
                    <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">🐔 Financial Records – Broilers</h2>
                            
                            {/* Revenue Section */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-700 mb-4">Revenue</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Revenue from Harvested Cartons ($)</label>
                                        <input
                                            type="number"
                                            value={broilerFinancials.revenue.harvestedCartons}
                                            onChange={(e) => handleBroilerChange('revenue', 'harvestedCartons', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Income from full cartons"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Revenue from Chicken Pieces ($)</label>
                                        <input
                                            type="number"
                                            value={broilerFinancials.revenue.chickenPieces}
                                            onChange={(e) => handleBroilerChange('revenue', 'chickenPieces', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Income from chicken parts"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Revenue from Poultry Waste ($)</label>
                                        <input
                                            type="number"
                                            value={broilerFinancials.revenue.poultryWaste}
                                            onChange={(e) => handleBroilerChange('revenue', 'poultryWaste', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Income from waste products"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Revenue ($)</label>
                                    <input
                                        type="text"
                                        value={formatNumber(broilerFinancials.revenue.totalRevenue)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        readOnly
                                    />
                                </div>
                            </div>
                            
                            {/* Costs Section */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-700 mb-4">Costs</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Brooding – Miscellaneous Cost ($)</label>
                                        <input
                                            type="number"
                                            value={broilerFinancials.costs.broodingMiscellaneous}
                                            onChange={(e) => handleBroilerChange('costs', 'broodingMiscellaneous', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Electricity, heating, etc."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Brooding – Labour Cost ($)</label>
                                        <input
                                            type="number"
                                            value={broilerFinancials.costs.broodingLabour}
                                            onChange={(e) => handleBroilerChange('costs', 'broodingLabour', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Labour costs for brooding"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Other Labour Cost ($)</label>
                                        <input
                                            type="number"
                                            value={broilerFinancials.costs.otherLabour}
                                            onChange={(e) => handleBroilerChange('costs', 'otherLabour', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Additional labour costs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Feed Cost ($)</label>
                                        <input
                                            type="number"
                                            value={broilerFinancials.costs.feed}
                                            onChange={(e) => handleBroilerChange('costs', 'feed', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Cost of feed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Medication & Vet ($)</label>
                                        <input
                                            type="number"
                                            value={broilerFinancials.costs.medicationVet}
                                            onChange={(e) => handleBroilerChange('costs', 'medicationVet', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Medical expenses"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Miscellaneous Costs ($)</label>
                                        <input
                                            type="number"
                                            value={broilerFinancials.costs.miscellaneous}
                                            onChange={(e) => handleBroilerChange('costs', 'miscellaneous', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Other expenses"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost ($)</label>
                                    <input
                                        type="text"
                                        value={formatNumber(broilerFinancials.costs.totalCost)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        readOnly
                                    />
                                </div>
                            </div>
                            
                            {/* Profit/Loss Section */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Profit / Loss ($)</label>
                                <input
                                    type="text"
                                    value={formatNumber(broilerFinancials.profitLoss)}
                                    className={`w-full px-3 py-2 border rounded-md bg-gray-50 ${
                                        broilerFinancials.profitLoss >= 0 ? 'border-green-500' : 'border-red-500'
                                    }`}
                                    readOnly
                                />
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex justify-between mt-8">
                                <button
                                    onClick={calculateBroilerTotals}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition duration-200"
                                >
                                    Calculate Totals
                                </button>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={saveBroilerFinancials}
                                        className="bg-[#A8E6CF] hover:bg-[#8FD3C9] text-white px-4 py-2 rounded-md transition duration-200"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Layer Financial Records */}
                {activeTab === 'layer' && (
                    <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden mb-6">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">🥚 Financial Records – Layers</h2>
                            
                            {/* Revenue Section */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-700 mb-4">Revenue</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Egg Sales Revenue ($)</label>
                                        <input
                                            type="number"
                                            value={layerFinancials.revenue.eggSales}
                                            onChange={(e) => handleLayerChange('revenue', 'eggSales', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Income from eggs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Damaged Eggs Sales Revenue ($)</label>
                                        <input
                                            type="number"
                                            value={layerFinancials.revenue.damagedEggs}
                                            onChange={(e) => handleLayerChange('revenue', 'damagedEggs', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Income from damaged eggs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Culled Birds Revenue ($)</label>
                                        <input
                                            type="number"
                                            value={layerFinancials.revenue.culledBirds}
                                            onChange={(e) => handleLayerChange('revenue', 'culledBirds', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Income from old birds"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Poultry Waste Sale Revenue ($)</label>
                                        <input
                                            type="number"
                                            value={layerFinancials.revenue.poultryWaste}
                                            onChange={(e) => handleLayerChange('revenue', 'poultryWaste', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Income from waste products"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Revenue ($)</label>
                                    <input
                                        type="text"
                                        value={formatNumber(layerFinancials.revenue.totalRevenue)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        readOnly
                                    />
                                </div>
                            </div>
                            
                            {/* Costs Section */}
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-700 mb-4">Costs</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cost of Chicks ($)</label>
                                        <input
                                            type="number"
                                            value={layerFinancials.costs.chicks}
                                            onChange={(e) => handleLayerChange('costs', 'chicks', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Purchase cost of chicks"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Brooding – Miscellaneous Cost ($)</label>
                                        <input
                                            type="number"
                                            value={layerFinancials.costs.broodingMiscellaneous}
                                            onChange={(e) => handleLayerChange('costs', 'broodingMiscellaneous', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Bedding, electricity, etc."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Brooding – Labour Cost ($)</label>
                                        <input
                                            type="number"
                                            value={layerFinancials.costs.broodingLabour}
                                            onChange={(e) => handleLayerChange('costs', 'broodingLabour', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Labour costs for brooding"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Feed Cost per Batch ($)</label>
                                        <input
                                            type="number"
                                            value={layerFinancials.costs.feed}
                                            onChange={(e) => handleLayerChange('costs', 'feed', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Cost of feed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Medication & Vet Costs ($)</label>
                                        <input
                                            type="number"
                                            value={layerFinancials.costs.medicationVet}
                                            onChange={(e) => handleLayerChange('costs', 'medicationVet', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Medical expenses"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Labour ($)</label>
                                        <input
                                            type="number"
                                            value={layerFinancials.costs.labour}
                                            onChange={(e) => handleLayerChange('costs', 'labour', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Labour costs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Miscellaneous Costs ($)</label>
                                        <input
                                            type="number"
                                            value={layerFinancials.costs.miscellaneous}
                                            onChange={(e) => handleLayerChange('costs', 'miscellaneous', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Other expenses"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost ($)</label>
                                    <input
                                        type="text"
                                        value={formatNumber(layerFinancials.costs.totalCost)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        readOnly
                                    />
                                </div>
                            </div>
                            
                            {/* Profit/Loss Section */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Profit / Loss ($)</label>
                                <input
                                    type="text"
                                    value={formatNumber(layerFinancials.profitLoss)}
                                    className={`w-full px-3 py-2 border rounded-md bg-gray-50 ${
                                        layerFinancials.profitLoss >= 0 ? 'border-green-500' : 'border-red-500'
                                    }`}
                                    readOnly
                                />
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex justify-between mt-8">
                                <button
                                    onClick={calculateLayerTotals}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition duration-200"
                                >
                                    Calculate Totals
                                </button>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={saveLayerFinancials}
                                        className="bg-[#A8E6CF] hover:bg-[#8FD3C9] text-white px-4 py-2 rounded-md transition duration-200"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialManagement;