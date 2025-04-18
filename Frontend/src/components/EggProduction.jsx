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
    const [itemsPerPage] = useState(5);
    const [editingRow, setEditingRow] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);
    const [batchInfo, setBatchInfo] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    
    const { token } = useSelector((state) => state.auth);
    const batchId = id;
    
    // State for new egg production record
    const [newEggProduction, setNewEggProduction] = useState({
        date: new Date().toISOString().split('T')[0],
        week: 0,
        morningEggs: 0,
        midmorningEggs: 0,
        afternoonEggs: 0,
        brokenEggs: 0
    });
    
    // State for edit form
    const [editFormData, setEditFormData] = useState({
        date: "",
        week: 0,
        morningEggs: 0,
        midmorningEggs: 0,
        afternoonEggs: 0,
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
            // Map the response to match our new field names
            const mappedData = response.data.map(item => ({
                ...item,
                midmorningEggs: item.noonEggs,
                afternoonEggs: item.eveningEggs,
                totalEggs: item.morningEggs + item.noonEggs + item.eveningEggs
            }));
            setEggProductions(mappedData);
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
    const indexOfLastRecord = currentPage * itemsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
    const currentRecords = eggProductions.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(eggProductions.length / itemsPerPage);

    // Handle adding new egg production record
    const handleAddEggProduction = async () => {
        try {
            if (parseInt(newEggProduction.brokenEggs) > 
                (parseInt(newEggProduction.morningEggs) + 
                parseInt(newEggProduction.midmorningEggs) + 
                parseInt(newEggProduction.afternoonEggs))) {
                alert("Broken eggs cannot exceed total eggs collected.");
                return;
            }

            // Map back to the API's expected field names
            const apiData = {
                date: newEggProduction.date,
                week: parseInt(newEggProduction.week),
                morningEggs: parseInt(newEggProduction.morningEggs),
                noonEggs: parseInt(newEggProduction.midmorningEggs),
                eveningEggs: parseInt(newEggProduction.afternoonEggs),
                brokenEggs: parseInt(newEggProduction.brokenEggs),
                batchId
            };

            const response = await axios.post(
                'http://localhost:5000/api/egg-production', 
                apiData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Add totalEggs field to the new record
            const newRecord = {
                ...response.data.eggProduction,
                midmorningEggs: response.data.eggProduction.noonEggs,
                afternoonEggs: response.data.eggProduction.eveningEggs,
                totalEggs: response.data.eggProduction.morningEggs + 
                           response.data.eggProduction.noonEggs + 
                           response.data.eggProduction.eveningEggs
            };
            
            setEggProductions([newRecord, ...eggProductions]);
            
            setNewEggProduction({
                date: new Date().toISOString().split('T')[0],
                week: 0,
                morningEggs: 0,
                midmorningEggs: 0,
                afternoonEggs: 0,
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
            week: record.week || 0,
            morningEggs: record.morningEggs,
            midmorningEggs: record.midmorningEggs || record.noonEggs,
            afternoonEggs: record.afternoonEggs || record.eveningEggs,
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
                parseInt(editFormData.midmorningEggs) + 
                parseInt(editFormData.afternoonEggs))) {
                alert("Broken eggs cannot exceed total eggs collected.");
                return;
            }

            // Map back to the API's expected field names
            const apiData = {
                date: editFormData.date,
                week: parseInt(editFormData.week),
                morningEggs: parseInt(editFormData.morningEggs),
                noonEggs: parseInt(editFormData.midmorningEggs),
                eveningEggs: parseInt(editFormData.afternoonEggs),
                brokenEggs: parseInt(editFormData.brokenEggs)
            };

            const response = await axios.put(
                `http://localhost:5000/api/egg-production/${id}`,
                apiData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const updatedRecord = {
                ...response.data.eggProduction,
                midmorningEggs: response.data.eggProduction.noonEggs,
                afternoonEggs: response.data.eggProduction.eveningEggs,
                totalEggs: response.data.eggProduction.morningEggs + 
                           response.data.eggProduction.noonEggs + 
                           response.data.eggProduction.eveningEggs
            };
            
            const updatedRecords = eggProductions.map(record => 
                record._id === id ? updatedRecord : record
            );
            
            setEggProductions(updatedRecords);
            
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

    // Handle row selection
    const handleRowSelect = (id) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter(rowId => rowId !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };

    // Handle download
    const handleDownload = () => {
        // This would be connected to your export logic
        console.log("Download initiated");
        alert("Download feature will be implemented soon");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading egg production records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[90vh] bg-white p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Daily Egg Production</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#A8E6CF] text-white px-4 py-2 rounded-md flex items-center"
                    >
                        <span className="mr-1">+</span> Add Egg Production Record
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

{eggProductions.length === 0 ? (
    <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="w-12 px-4 py-3">
                            <input 
                                type="checkbox" 
                                className="h-4 w-4 text-green-500 border-gray-300 rounded"
                                onChange={(e) => {
                                    e.stopPropagation();
                                    if (selectedRows.length === currentRecords.length) {
                                        setSelectedRows([]);
                                    } else {
                                        setSelectedRows(currentRecords.map(r => r._id));
                                    }
                                }}
                                checked={selectedRows.length > 0 && selectedRows.length === currentRecords.length}
                            />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Morning</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Midmorning</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Afternoon</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Eggs</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Broken Eggs</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Production %</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                        <td colSpan="10" className="px-4 py-4 text-center text-gray-500">
                            No egg production records found. Add your first record to get started.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
) : (
    <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="w-12 px-4 py-3">
                            <input 
                                type="checkbox" 
                                className="h-4 w-4 text-green-500 border-gray-300 rounded"
                                onChange={(e) => {
                                    e.stopPropagation();
                                    if (selectedRows.length === currentRecords.length) {
                                        setSelectedRows([]);
                                    } else {
                                        setSelectedRows(currentRecords.map(r => r._id));
                                    }
                                }}
                                checked={selectedRows.length > 0 && selectedRows.length === currentRecords.length}
                            />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Morning</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Midmorning</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Afternoon</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Eggs</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Broken Eggs</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Production %</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {currentRecords.map((record) => {
                        const isSelected = selectedRows.includes(record._id);
                        return (
                            <tr key={record._id} className={`${isSelected ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-50 cursor-pointer`}>
                                {editingRow === record._id ? (
                                    // Edit mode
                                    <>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <input 
                                                type="checkbox" 
                                                className="h-4 w-4 text-green-500 border-gray-300 rounded"
                                                checked={isSelected}
                                                onChange={() => handleRowSelect(record._id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <input
                                                type="date"
                                                name="date"
                                                value={editFormData.date}
                                                onChange={handleEditFormChange}
                                                className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <input
                                                type="number"
                                                name="week"
                                                value={editFormData.week}
                                                onChange={handleEditFormChange}
                                                min="0"
                                                className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <input
                                                type="number"
                                                name="morningEggs"
                                                value={editFormData.morningEggs}
                                                onChange={handleEditFormChange}
                                                min="0"
                                                className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <input
                                                type="number"
                                                name="midmorningEggs"
                                                value={editFormData.midmorningEggs}
                                                onChange={handleEditFormChange}
                                                min="0"
                                                className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <input
                                                type="number"
                                                name="afternoonEggs"
                                                value={editFormData.afternoonEggs}
                                                onChange={handleEditFormChange}
                                                min="0"
                                                className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {parseInt(editFormData.morningEggs) + 
                                             parseInt(editFormData.midmorningEggs) + 
                                             parseInt(editFormData.afternoonEggs)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <input
                                                type="number"
                                                name="brokenEggs"
                                                value={editFormData.brokenEggs}
                                                onChange={handleEditFormChange}
                                                min="0"
                                                className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {record.productionPercentage.toFixed(2)}%
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
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
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <input 
                                                type="checkbox" 
                                                className="h-4 w-4 text-green-500 border-gray-300 rounded"
                                                checked={isSelected}
                                                onChange={() => handleRowSelect(record._id)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(record.date)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.week || '-'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.morningEggs}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.midmorningEggs || record.noonEggs}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.afternoonEggs || record.eveningEggs}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {record.totalEggs || 
                                             (record.morningEggs + (record.midmorningEggs || record.noonEggs) + 
                                              (record.afternoonEggs || record.eveningEggs))}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {record.brokenEggs}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {record.productionPercentage.toFixed(2)}%
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button 
                                                    onClick={() => handleEditClick(record)}
                                                    className="text-gray-400 hover:text-blue-600 focus:outline-none"
                                                    title="Edit"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(record._id)}
                                                    className="text-gray-400 hover:text-red-600 focus:outline-none"
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
                        )
                    })}
                </tbody>
            </table>
        </div>
    </div>
)}

                {/* Container for pagination and download button */}
                <div className="mt-4 flex justify-between items-center">
                    {/* Pagination */}
                    <div className="flex-1 flex justify-center">
                        {totalPages > 1 && (
                            <div className="flex items-center">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                    <button
                                        key={number}
                                        onClick={() => setCurrentPage(number)}
                                        className={`px-3 py-1 mx-1 ${currentPage === number
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
                    
                    {/* Download button */}
                    <button
                        onClick={handleDownload}
                        className="bg-[#A8E6CF] text-white px-4 py-2 rounded-md flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </button>
                </div>

              
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
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={newEggProduction.date}
                                        onChange={handleNewEggProductionChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Week</label>
                                    <input
                                        type="number"
                                        name="week"
                                        value={newEggProduction.week}
                                        onChange={handleNewEggProductionChange}
                                        min="0"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Morning Eggs</label>
                                    <input
                                        type="number"
                                        name="morningEggs"
                                        value={newEggProduction.morningEggs}
                                        onChange={handleNewEggProductionChange}
                                        min="0"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Midmorning Eggs</label>
                                    <input
                                        type="number"
                                        name="midmorningEggs"
                                        value={newEggProduction.midmorningEggs}
                                        onChange={handleNewEggProductionChange}
                                        min="0"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Afternoon Eggs</label>
                                    <input
                                        type="number"
                                        name="afternoonEggs"
                                        value={newEggProduction.afternoonEggs}
                                        onChange={handleNewEggProductionChange}
                                        min="0"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Broken Eggs</label>
                                    <input
                                        type="number"
                                        name="brokenEggs"
                                        value={newEggProduction.brokenEggs}
                                        onChange={handleNewEggProductionChange}
                                        min="0"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div className="pt-2">
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddModal(false)}
                                            className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleAddEggProduction}
                                            className="bg-[#A8E6CF] border border-transparent px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                        >
                                            Add Record
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">Confirm Delete</h3>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <p className="text-gray-500 mb-4">Are you sure you want to delete this egg production record? This action cannot be undone.</p>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="bg-red-600 border border-transparent px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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