import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const EggProduction = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [eggProductions, setEggProductions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;
    const [editingRow, setEditingRow] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);
    const [batchInfo, setBatchInfo] = useState(null);
    const [showStats, setShowStats] = useState(false);
    const [productionStats, setProductionStats] = useState({
        totalEggs: 0,
        avgDaily: 0,
        avgEfficiency: 0,
        brokenPercentage: 0
    });
    
    const { token } = useSelector((state) => state.auth);
    const batchId = id;
    
    // State for new egg production record
    const [newEggProduction, setNewEggProduction] = useState({
        date: new Date().toISOString().split('T')[0],
        morningEggs: 0,
        noonEggs: 0,
        eveningEggs: 0,
        brokenEggs: 0
    });
    
    // State for edit form
    const [editFormData, setEditFormData] = useState({
        date: "",
        morningEggs: 0,
        noonEggs: 0,
        eveningEggs: 0,
        brokenEggs: 0
    });

    const fetchEggProductions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/egg-production/batch/${batchId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setEggProductions(response.data);
            calculateStats(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching egg production records:', err);
            setError('Failed to fetch egg production records. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchBatchInfo = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/chickens/${batchId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setBatchInfo(response.data);
        } catch (err) {
            console.error('Error fetching batch information:', err);
        }
    };

    // Calculate stats from egg production data
    const calculateStats = (data) => {
        if (!data || data.length === 0) {
            setProductionStats({
                totalEggs: 0,
                avgDaily: 0,
                avgEfficiency: 0,
                brokenPercentage: 0
            });
            return;
        }

        const totalEggs = data.reduce((sum, record) => {
            return sum + (record.morningEggs + record.noonEggs + record.eveningEggs);
        }, 0);

        const totalBroken = data.reduce((sum, record) => sum + record.brokenEggs, 0);
        
        const avgDaily = totalEggs / data.length;
        
        const avgEfficiency = data.reduce((sum, record) => {
            return sum + record.productionPercentage;
        }, 0) / data.length;

        const brokenPercentage = totalEggs > 0 ? (totalBroken / totalEggs) * 100 : 0;

        setProductionStats({
            totalEggs,
            avgDaily: parseFloat(avgDaily.toFixed(2)),
            avgEfficiency: parseFloat(avgEfficiency.toFixed(2)),
            brokenPercentage: parseFloat(brokenPercentage.toFixed(2))
        });
    };

    useEffect(() => {
        if (token && batchId) {
            fetchEggProductions();
            fetchBatchInfo();
        } else {
            setError('Authentication token not found or invalid batch ID.');
            setLoading(false);
        }
    }, [token, batchId]);

    // Calculate pagination
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = eggProductions.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(eggProductions.length / recordsPerPage);

    // Handle adding new egg production record
    const handleAddEggProduction = async () => {
        try {
            if (parseInt(newEggProduction.brokenEggs) > 
                (parseInt(newEggProduction.morningEggs) + 
                parseInt(newEggProduction.noonEggs) + 
                parseInt(newEggProduction.eveningEggs))) {
                alert("Broken eggs cannot exceed total eggs collected.");
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/api/egg-production', 
                {
                    ...newEggProduction,
                    batchId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            setEggProductions([response.data.eggProduction, ...eggProductions]);
            calculateStats([response.data.eggProduction, ...eggProductions]);
            
            setNewEggProduction({
                date: new Date().toISOString().split('T')[0],
                morningEggs: 0,
                noonEggs: 0,
                eveningEggs: 0,
                brokenEggs: 0
            });
            setShowAddModal(false);
        } catch (err) {
            console.error('Error adding new egg production record:', err);
            if (err.response && err.response.data && err.response.data.message) {
                alert(`Failed to add new record: ${err.response.data.message}`);
            } else {
                alert('Failed to add new egg production record. Please try again.');
            }
        }
    };

    // Handle edit click
    const handleEditClick = (record) => {
        setEditingRow(record._id);
        
        // Format date for the form
        const date = record.date ? new Date(record.date).toISOString().split('T')[0] : '';
        
        setEditFormData({
            date: date,
            morningEggs: record.morningEggs,
            noonEggs: record.noonEggs,
            eveningEggs: record.eveningEggs,
            brokenEggs: record.brokenEggs
        });
    };

    // Handle edit form changes
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    // Save edited record
    const handleSaveClick = async (id) => {
        try {
            if (parseInt(editFormData.brokenEggs) > 
                (parseInt(editFormData.morningEggs) + 
                parseInt(editFormData.noonEggs) + 
                parseInt(editFormData.eveningEggs))) {
                alert("Broken eggs cannot exceed total eggs collected.");
                return;
            }

            const response = await axios.put(
                `http://localhost:5000/api/egg-production/${id}`,
                editFormData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const updatedRecords = eggProductions.map(record => 
                record._id === id ? response.data.eggProduction : record
            );
            
            setEggProductions(updatedRecords);
            calculateStats(updatedRecords);
            
            // Exit edit mode
            setEditingRow(null);
        } catch (err) {
            console.error('Error updating egg production record:', err);
            alert('Failed to update egg production record. Please try again.');
        }
    };

    // Cancel edit
    const handleCancelClick = () => {
        setEditingRow(null);
    };

    // Handle delete click
    const handleDeleteClick = (id) => {
        setRowToDelete(id);
        setShowDeleteModal(true);
    };

    // Confirm delete
    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/egg-production/${rowToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const updatedRecords = eggProductions.filter(record => record._id !== rowToDelete);
            setEggProductions(updatedRecords);
            calculateStats(updatedRecords);
            
            setShowDeleteModal(false);
            setRowToDelete(null);
        } catch (err) {
            console.error('Error deleting egg production record:', err);
            alert('Failed to delete egg production record. Please try again.');
        }
    };

    // Handle new egg production form change
    const handleNewEggProductionChange = (e) => {
        const { name, value } = e.target;
        setNewEggProduction({
            ...newEggProduction,
            [name]: value
        });
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading egg production records...</p>
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
                        <h1 className="text-2xl md:text-3xl font-bold text-green-800">Egg Production Management</h1>
                        <p className="text-gray-600">
                            {batchInfo && 
                                `Track and manage egg records for ${batchInfo.name} (${batchInfo.breedType})`}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowStats(!showStats)}
                            className={`${showStats ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} font-medium py-2 px-4 rounded-lg flex items-center transition shadow-md hover:shadow-lg`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            {showStats ? "Hide Stats" : "Show Statistics"}
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition shadow-md hover:shadow-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Production Record
                        </button>
                    </div>
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

                {/* Statistics Section */}
                {showStats && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                        <div className="bg-blue-50 p-4 border-b border-blue-100">
                            <h2 className="text-lg font-semibold text-blue-800">Production Statistics</h2>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-green-50 rounded-lg p-4 shadow-sm">
                                    <h3 className="text-sm font-medium text-gray-500 uppercase">Total Eggs</h3>
                                    <p className="text-3xl font-bold text-green-700">{productionStats.totalEggs}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
                                    <h3 className="text-sm font-medium text-gray-500 uppercase">Avg. Daily Collection</h3>
                                    <p className="text-3xl font-bold text-blue-700">{productionStats.avgDaily}</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 shadow-sm">
                                    <h3 className="text-sm font-medium text-gray-500 uppercase">Avg. Efficiency</h3>
                                    <p className="text-3xl font-bold text-purple-700">{productionStats.avgEfficiency}%</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-4 shadow-sm">
                                    <h3 className="text-sm font-medium text-gray-500 uppercase">Broken Egg Rate</h3>
                                    <p className="text-3xl font-bold text-red-700">{productionStats.brokenPercentage}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Egg Production Records Table */}
                {eggProductions.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No egg production records added yet</h3>
                        <p className="text-gray-600 mb-4">Add your first egg production record to start tracking productivity</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg"
                        >
                            Add First Production Record
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Morning</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Noon</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evening</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Broken</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efficiency</th>
                                        <th className="py-3 px-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentRecords.map((record) => (
                                        <tr key={record._id} className="bg-white hover:bg-gray-50 transition-colors">
                                            {editingRow === record._id ? (
                                                // Edit mode
                                                <>
                                                    <td className="py-2 px-4">
                                                        <input
                                                            type="date"
                                                            name="date"
                                                            value={editFormData.date}
                                                            onChange={handleEditFormChange}
                                                            className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        <input
                                                            type="number"
                                                            name="morningEggs"
                                                            value={editFormData.morningEggs}
                                                            onChange={handleEditFormChange}
                                                            min="0"
                                                            className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        <input
                                                            type="number"
                                                            name="noonEggs"
                                                            value={editFormData.noonEggs}
                                                            onChange={handleEditFormChange}
                                                            min="0"
                                                            className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        <input
                                                            type="number"
                                                            name="eveningEggs"
                                                            value={editFormData.eveningEggs}
                                                            onChange={handleEditFormChange}
                                                            min="0"
                                                            className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        <input
                                                            type="number"
                                                            name="brokenEggs"
                                                            value={editFormData.brokenEggs}
                                                            onChange={handleEditFormChange}
                                                            min="0"
                                                            className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        {/* Efficiency is calculated on the server */}
                                                        {record.productionPercentage.toFixed(2)}%
                                                    </td>
                                                    <td className="py-2 px-4 text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <button 
                                                                onClick={() => handleSaveClick(record._id)}
                                                                className="text-green-600 hover:text-green-800 focus:outline-none"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </button>
                                                            <button 
                                                                onClick={handleCancelClick}
                                                                className="text-red-600 hover:text-red-800 focus:outline-none"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                // View mode
                                                <>
                                                    <td className="py-4 px-4 font-medium">{formatDate(record.date)}</td>
                                                    <td className="py-4 px-4">{record.morningEggs}</td>
                                                    <td className="py-4 px-4">{record.noonEggs}</td>
                                                    <td className="py-4 px-4">{record.eveningEggs}</td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-2 py-1 rounded ${record.brokenEggs > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                            {record.brokenEggs}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center">
                                                            <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                                                <div 
                                                                    className={`h-2.5 rounded-full ${record.productionPercentage >= 90 ? 'bg-green-600' : record.productionPercentage >= 70 ? 'bg-yellow-400' : 'bg-red-500'}`} 
                                                                    style={{ width: `${record.productionPercentage}%` }}>
                                                                </div>
                                                            </div>
                                                            <span>{record.productionPercentage.toFixed(2)}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            <button 
                                                                onClick={() => handleEditClick(record)}
                                                                className="text-gray-600 hover:text-blue-600 focus:outline-none"
                                                                title="Edit"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteClick(record._id)}
                                                                className="text-gray-600 hover:text-red-600 focus:outline-none"
                                                                title="Delete"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
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

                {/* Add New Egg Production Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">Add Egg Production Record</h3>
                                <button 
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={newEggProduction.date}
                                        onChange={handleNewEggProductionChange}
                                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Morning Collection</label>
                                        <input
                                            type="number"
                                            name="morningEggs"
                                            min="0"
                                            value={newEggProduction.morningEggs}
                                            onChange={handleNewEggProductionChange}
                                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Noon Collection</label>
                                        <input
                                            type="number"
                                            name="noonEggs"
                                            min="0"
                                            value={newEggProduction.noonEggs}
                                            onChange={handleNewEggProductionChange}
                                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Evening Collection</label>
                                        <input
                                            type="number"
                                            name="eveningEggs"
                                            min="0"
                                            value={newEggProduction.eveningEggs}
                                            onChange={handleNewEggProductionChange}
                                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Broken Eggs</label>
                                        <input
                                            type="number"
                                            name="brokenEggs"
                                            min="0"
                                            value={newEggProduction.brokenEggs}
                                            onChange={handleNewEggProductionChange}
                                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                </div>
                                
                                <div className="pt-4">
                                    <button
                                        onClick={handleAddEggProduction}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                                    >
                                        Add Record
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <div className="mb-4">
                                <div className="flex items-center justify-center bg-red-100 w-16 h-16 rounded-full mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl text-center font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
                                <p className="text-gray-600 text-center">Are you sure you want to delete this egg production record? This action cannot be undone.</p>
                            </div>
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
            </div>
        </div>
    );
};

export default EggProduction;
