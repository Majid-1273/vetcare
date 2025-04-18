import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

export default function FeedManagement() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [feedRecords, setFeedRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [editingRow, setEditingRow] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);
    
    const { token } = useSelector((state) => state.auth);
    const batchId = id;
    
    // State for new record - Added day and week fields
    const [newRecordData, setNewRecordData] = useState({
        ageGroup: "",
        feedType: "",
        avgConsumptionPerBird: "",
        totalFeedUsed: "",
        day: 1,
        week: 1
    });
    
    // State for edit form - Added day and week fields
    const [editFormData, setEditFormData] = useState({
        ageGroup: "",
        feedType: "",
        avgConsumptionPerBird: "",
        totalFeedUsed: "",
        day: 1,
        week: 1
    });

    // Available feed types
    const feedTypeOptions = [
        "Starter Mash",
        "Grower Mash",
        "Finisher Mash",
        "Layer Mash",
        "Broiler Mash",
        "Pellets",
        "Crumbles"
    ];

    // Age group options
    const ageGroupOptions = [
        "0-4 weeks",
        "4-8 weeks",
        "8-12 weeks",
        "12-16 weeks",
        "16+ weeks"
    ];

    const fetchFeedRecords = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/feeds/batch/${batchId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setFeedRecords(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching feed records:', err);
            setError('Failed to fetch feed records. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && batchId) {
            fetchFeedRecords();
        } else {
            setError('Authentication token not found or invalid batch ID.');
            setLoading(false);
        }
    }, [token, batchId]);

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRecords = feedRecords.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(feedRecords.length / itemsPerPage);

    // Handle adding new record
    const handleAddRecord = async () => {
        try {
            const response = await axios.post(
                'http://localhost:5000/api/feeds', 
                {
                    ...newRecordData,
                    batchId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            setFeedRecords([...feedRecords, response.data.feedRecord]);
            
            // Reset form and close modal
            setNewRecordData({
                ageGroup: "",
                feedType: "",
                avgConsumptionPerBird: "",
                totalFeedUsed: "",
                day: 1,
                week: 1
            });
            setShowAddModal(false);
        } catch (err) {
            console.error('Error adding new feed record:', err);
            alert('Failed to add new feed record. Please try again.');
        }
    };

    // Handle edit click
    const handleEditClick = (record) => {
        setEditingRow(record._id);
        setEditFormData({
            ageGroup: record.ageGroup,
            feedType: record.feedType,
            avgConsumptionPerBird: record.avgConsumptionPerBird,
            totalFeedUsed: record.totalFeedUsed,
            day: record.day || 1,
            week: record.week || 1
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
            const response = await axios.put(
                `http://localhost:5000/api/feeds/${id}`,
                editFormData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            setFeedRecords(feedRecords.map(record => 
                record._id === id ? response.data.feedRecord : record
            ));
            
            // Exit edit mode
            setEditingRow(null);
        } catch (err) {
            console.error('Error updating feed record:', err);
            alert('Failed to update feed record. Please try again.');
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
            await axios.delete(`http://localhost:5000/api/feeds/${rowToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setFeedRecords(feedRecords.filter(record => record._id !== rowToDelete));
            setShowDeleteModal(false);
            setRowToDelete(null);
        } catch (err) {
            console.error('Error deleting feed record:', err);
            alert('Failed to delete feed record. Please try again.');
        }
    };

    // Handle new record form change
    const handleNewRecordChange = (e) => {
        const { name, value } = e.target;
        setNewRecordData({
            ...newRecordData,
            [name]: value
        });
    };

    // Handle download
    const handleDownload = () => {
        // Implement CSV download logic here
        console.log("Download initiated");
        alert("Download feature will be implemented soon");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading feed records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[90vh] bg-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Feed Management</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#A8E6CF] text-white px-4 py-2 rounded-md flex items-center"
                    >
                        <span className="mr-1">+</span> Add New Feed
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Feed Records Table */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="w-12 px-4 py-3">
                                        <input 
                                            type="checkbox" 
                                            className="h-4 w-4 text-green-500 border-gray-300 rounded"
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                if (feedRecords.length > 0) {
                                                    // Implementation for select all would go here
                                                }
                                            }}
                                        />
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Age Group
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Feed Type
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Avg. Consumption Per Bird (g)
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Feed Used (kg)
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Day
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Week
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                                            No feed records found. Add your first feed record to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    currentRecords.map((record) => (
                                        <tr key={record._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <input 
                                                    type="checkbox" 
                                                    className="h-4 w-4 text-green-500 border-gray-300 rounded"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </td>
                                            {editingRow === record._id ? (
                                                // Edit mode
                                                <>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <select
                                                            name="ageGroup"
                                                            value={editFormData.ageGroup}
                                                            onChange={handleEditFormChange}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                        >
                                                            {ageGroupOptions.map(group => (
                                                                <option key={group} value={group}>{group}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <select
                                                            name="feedType"
                                                            value={editFormData.feedType}
                                                            onChange={handleEditFormChange}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                        >
                                                            {feedTypeOptions.map(type => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            name="avgConsumptionPerBird"
                                                            value={editFormData.avgConsumptionPerBird}
                                                            onChange={handleEditFormChange}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                            min="0"
                                                            step="0.1"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            name="totalFeedUsed"
                                                            value={editFormData.totalFeedUsed}
                                                            onChange={handleEditFormChange}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                            min="0"
                                                            step="0.1"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            name="day"
                                                            value={editFormData.day}
                                                            onChange={handleEditFormChange}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                            min="1"
                                                            step="1"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            name="week"
                                                            value={editFormData.week}
                                                            onChange={handleEditFormChange}
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                            min="1"
                                                            step="1"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <button 
                                                                onClick={() => handleSaveClick(record._id)}
                                                                className="text-green-500 hover:text-green-700"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </button>
                                                            <button 
                                                                onClick={handleCancelClick}
                                                                className="text-red-500 hover:text-red-700"
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
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.ageGroup}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.feedType}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.avgConsumptionPerBird}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.totalFeedUsed}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.day || '-'}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.week || '-'}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={() => handleEditClick(record)}
                                                                className="text-gray-600 hover:text-blue-600"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(record._id)}
                                                                className="text-red-500 hover:text-red-700"
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
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Add New Feed Record</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                                    <select
                                        name="ageGroup"
                                        value={newRecordData.ageGroup}
                                        onChange={handleNewRecordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="">Select age group</option>
                                        {ageGroupOptions.map(group => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Feed Type</label>
                                    <select
                                        name="feedType"
                                        value={newRecordData.feedType}
                                        onChange={handleNewRecordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="">Select feed type</option>
                                        {feedTypeOptions.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Avg. Consumption / Bird (g)</label>
                                    <input
                                        type="number"
                                        name="avgConsumptionPerBird"
                                        value={newRecordData.avgConsumptionPerBird}
                                        onChange={handleNewRecordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Enter consumption per bird"
                                        min="0"
                                        step="0.1"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Feed Used (kg)</label>
                                    <input
                                        type="number"
                                        name="totalFeedUsed"
                                        value={newRecordData.totalFeedUsed}
                                        onChange={handleNewRecordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Enter total feed used"
                                        min="0"
                                        step="0.1"
                                        required
                                    />
                                </div>
                                
                                {/* New fields for day and week */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                                    <input
                                        type="number"
                                        name="day"
                                        value={newRecordData.day}
                                        onChange={handleNewRecordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Enter day"
                                        min="1"
                                        step="1"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Week</label>
                                    <input
                                        type="number"
                                        name="week"
                                        value={newRecordData.week}
                                        onChange={handleNewRecordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Enter week"
                                        min="1"
                                        step="1"
                                        required
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <button
                                        type="button"
                                        onClick={handleAddRecord}
                                        className="bg-[#A8E6CF] text-white font-medium py-2 px-6 rounded-md"
                                    >
                                        Add Record
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                            <p className="mb-6 text-gray-600">Are you sure you want to delete this record? This action cannot be undone.</p>
                            <div className="flex justify-end space-x-3">
                                <button 
                                    onClick={() => setShowDeleteModal(false)} 
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete} 
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
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
}