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
    const [itemsPerPage] = useState(5);
    
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
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRecords = mortalityData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(mortalityData.length / itemsPerPage);

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

    // Handle download function
    const handleDownload = () => {
        console.log("Download initiated");
        alert("Download feature will be implemented soon");
    };

    // Pagination
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading mortality data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[90vh] bg-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Mortality Tracking</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#A8E6CF] text-white px-4 py-2 rounded-md flex items-center"
                    >
                        <span className="mr-1">+</span> Add Mortality Record
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Mortality Records Table */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Birds
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deaths
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mortality %
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cumulative Loss
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                                            No mortality records found. Add your first record to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    currentRecords.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(row.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {row.totalBirds}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-medium">
                                                {row.deaths}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {row.mortalityPercent.toFixed(2)}%
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {row.cumulativeLoss}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Container for pagination and download button */}
                <div className="mt-4 flex justify-between items-center">
                    {/* Pagination */}
                    <div className="flex-1 flex justify-center">
                        {totalPages > 1 && (
                            <div className="flex items-center">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                    <button
                                        key={number}
                                        onClick={() => paginate(number)}
                                        className={`px-3 py-1 mx-1 ${
                                            currentPage === number
                                                ? 'bg-gray-200 text-gray-700 rounded-md text-sm border border-gray-200'
                                                : ' hover:bg-gray-100 rounded-md text-sm '
                                        } `}
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Download button */}
                <button
                    onClick={handleDownload}
                    className="bg-[#A8E6CF] text-white px-4 py-2 rounded-md flex items-center mt-4"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                </button>

                {/* Add New Record Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Add New Mortality Record</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={newRecordData.date}
                                        onChange={handleNewRecordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deaths</label>
                                    <input
                                        type="number"
                                        name="deadBirdsCount"
                                        value={newRecordData.deadBirdsCount}
                                        onChange={handleNewRecordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                        min="0"
                                        placeholder="Number of deaths"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Calculated Values</label>
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

                                <div>
                                    <button
                                        onClick={handleAddRecord}
                                        className="bg-[#A8E6CF] text-white font-medium py-2 px-6 rounded-md"
                                        disabled={!newRecordData.deadBirdsCount}
                                    >
                                        Add Record
                                    </button>
                                    <button 
                                        onClick={() => setShowAddModal(false)} 
                                        className="ml-3 text-gray-600 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
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

export default MortalityTracking;