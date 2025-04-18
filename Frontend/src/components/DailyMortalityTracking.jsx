import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const MortalityTracking = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [mortalityData, setMortalityData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    
    const { token } = useSelector((state) => state.auth);
    const batchId = id;
    
    // State for new mortality record
    const [newRecordData, setNewRecordData] = useState({
        batchId: batchId,
        date: new Date().toISOString().split('T')[0],
        deadBirdsCount: 0
    });

    // Fetch mortality data from API
    useEffect(() => {
        if (token && batchId) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(`http://localhost:5000/api/mortality/batch/${batchId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    
                    // Transform API data to match our component's format
                    const formattedData = response.data.map(item => ({
                        id: item._id,
                        batchId: item.batchId,
                        date: new Date(item.date).toISOString().split('T')[0],
                        totalBirds: item.totalBirdsCount,
                        deaths: item.deadBirdsCount,
                        mortalityPercent: item.mortalityRate,
                        cumulativeLoss: item.cumulativeLoss,
                        originalData: item
                    }));
                    
                    // Ensure data is sorted by date
                    formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
                    
                    setMortalityData(formattedData);
                    setError(null);
                    setLoading(false);
                } catch (err) {
                    console.error("Error fetching mortality data:", err);
                    setError("Failed to load mortality data. Please try again later.");
                    setLoading(false);
                }
            };

            fetchData();
        } else {
            setError('Authentication token not found or invalid batch ID.');
            setLoading(false);
        }
    }, [token, batchId]);

    // Get current records for pagination
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = mortalityData.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(mortalityData.length / recordsPerPage);

    // Calculate summary statistics
    const calculateStats = () => {
        if (!mortalityData.length) return { totalBirds: 0, totalDeaths: 0, aliveBirds: 0, avgMortality: 0 };
        
        const latestRecord = mortalityData[mortalityData.length - 1];
        const totalBirds = mortalityData.length > 0 ? mortalityData[0].totalBirds : 0;
        const totalDeaths = latestRecord.cumulativeLoss;
        const aliveBirds = latestRecord.totalBirds - latestRecord.deaths;

        // Calculate average mortality percentage
        const totalMortalityRate = mortalityData.reduce((acc, curr) => acc + curr.mortalityPercent, 0);
        const avgMortality = mortalityData.length > 0 ? (totalMortalityRate / mortalityData.length).toFixed(2) : 0;
        
        return { totalBirds, totalDeaths, aliveBirds, avgMortality };
    };
    
    const stats = calculateStats();

    // Handle new record form change
    const handleNewRecordChange = (e) => {
        const { name, value } = e.target;
        setNewRecordData({
            ...newRecordData,
            [name]: name === 'date' ? value : parseInt(value) || 0
        });
    };
    
    // Add new mortality record via API
    const handleAddRecord = async () => {
        try {
            // Prepare data for API
            const recordToAdd = {
                batchId: batchId,
                date: newRecordData.date,
                deadBirdsCount: newRecordData.deadBirdsCount
            };
            
            // Send to API
            const response = await axios.post('http://localhost:5000/api/mortality', recordToAdd, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // After successful API call, refresh the data
            const refreshResponse = await axios.get(`http://localhost:5000/api/mortality/batch/${batchId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Format data as before
            const formattedData = refreshResponse.data.map(item => ({
                id: item._id,
                batchId: item.batchId,
                date: new Date(item.date).toISOString().split('T')[0],
                totalBirds: item.totalBirdsCount,
                deaths: item.deadBirdsCount,
                mortalityPercent: item.mortalityRate,
                cumulativeLoss: item.cumulativeLoss,
                originalData: item
            }));
            
            // Sort by date
            formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            setMortalityData(formattedData);
            setShowAddModal(false);
            setNewRecordData({
                batchId: batchId,
                date: new Date().toISOString().split('T')[0],
                deadBirdsCount: 0
            });
            setError(null);
        } catch (err) {
            console.error("Error adding record:", err);
            setError(`Failed to add record: ${err.response?.data?.message || 'Please try again.'}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading mortality data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-green-800">Mortality Tracking</h1>
                        <p className="text-gray-600">Monitor daily mortality rates for your flock</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition shadow-md hover:shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Mortality Record
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-5 border border-blue-200 transform transition-all duration-300 hover:scale-105">
                        <h3 className="text-gray-600 text-sm font-medium mb-2">Total Birds</h3>
                        <div className="text-3xl font-bold text-blue-800">{stats.totalBirds}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-5 border border-green-200 transform transition-all duration-300 hover:scale-105">
                        <h3 className="text-gray-600 text-sm font-medium mb-2">Alive Birds</h3>
                        <div className="text-3xl font-bold text-green-700">{stats.aliveBirds}</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md p-5 border border-red-200 transform transition-all duration-300 hover:scale-105">
                        <h3 className="text-gray-600 text-sm font-medium mb-2">Total Deaths</h3>
                        <div className="text-3xl font-bold text-red-700">{stats.totalDeaths}</div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-md p-5 border border-amber-200 transform transition-all duration-300 hover:scale-105">
                        <h3 className="text-gray-600 text-sm font-medium mb-2">Avg. Mortality Rate</h3>
                        <div className="text-3xl font-bold text-amber-700">{stats.avgMortality}%</div>
                    </div>
                </div>

                {/* Mortality Records Table */}
                {mortalityData.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No mortality records added yet</h3>
                        <p className="text-gray-600 mb-4">Add your first mortality record to start tracking flock health</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg"
                        >
                            Add First Record
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Birds</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deaths</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mortality %</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumulative Loss</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentRecords.map((row) => (
                                        <tr key={row.id} className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4 font-medium">{new Date(row.date).toLocaleDateString()}</td>
                                            <td className="py-4 px-4">{row.totalBirds}</td>
                                            <td className="py-4 px-4 text-red-600">{row.deaths}</td>
                                            <td className="py-4 px-4 font-medium">{row.mortalityPercent.toFixed(2)}%</td>
                                            <td className="py-4 px-4">{row.cumulativeLoss}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <nav className="flex items-center space-x-1">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100"
                                        disabled={currentPage === 1}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1 rounded ${
                                                currentPage === page
                                                    ? 'bg-green-600 text-white font-medium'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100"
                                        disabled={currentPage === totalPages}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        )}
                    </>
                )}

                {/* Add New Record Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                            <h3 className="text-xl font-semibold mb-4">Add New Mortality Record</h3>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={newRecordData.date}
                                        onChange={handleNewRecordChange}
                                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 mb-1">Deaths</label>
                                    <input
                                        type="number"
                                        name="deadBirdsCount"
                                        value={newRecordData.deadBirdsCount}
                                        onChange={handleNewRecordChange}
                                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                        min="0"
                                    />
                                </div>

                                {mortalityData.length > 0 && (
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <div className="text-sm text-gray-600 mb-2">
                                            Total birds count will be calculated automatically based on previous records.
                                        </div>
                                        <div className="font-medium">
                                            Current total birds: {mortalityData.length > 0 ? 
                                                mortalityData[mortalityData.length - 1].totalBirds - 
                                                mortalityData[mortalityData.length - 1].deaths : 0}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-gray-700 mb-1">Calculated Values</label>
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        {mortalityData.length > 0 && (
                                            <div className="flex justify-between mb-1">
                                                <span className="text-gray-600">Mortality Rate:</span>
                                                <span className="font-medium">
                                                    {mortalityData.length > 0 && (mortalityData[mortalityData.length - 1].totalBirds - mortalityData[mortalityData.length - 1].deaths) > 0 ?
                                                        (newRecordData.deadBirdsCount / 
                                                            (mortalityData[mortalityData.length - 1].totalBirds - 
                                                            mortalityData[mortalityData.length - 1].deaths) * 100).toFixed(2) : 0}%
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Cumulative Loss:</span>
                                            <span className="font-medium">
                                                {mortalityData.length > 0
                                                    ? mortalityData[mortalityData.length - 1].cumulativeLoss + newRecordData.deadBirdsCount
                                                    : newRecordData.deadBirdsCount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button 
                                    onClick={() => setShowAddModal(false)} 
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAddRecord} 
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    disabled={!newRecordData.deadBirdsCount}
                                >
                                    Add Record
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MortalityTracking;