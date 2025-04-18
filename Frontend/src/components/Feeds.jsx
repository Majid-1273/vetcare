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
    const recordsPerPage = 5;
    const [editingRow, setEditingRow] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);
    
    const { token } = useSelector((state) => state.auth);
    const batchId = id;
    
    // State for new record
    const [newRecordData, setNewRecordData] = useState({
        ageGroup: "",
        feedType: "",
        avgConsumptionPerBird: "",
        totalFeedUsed: ""
    });
    
    // State for edit form
    const [editFormData, setEditFormData] = useState({
        ageGroup: "",
        feedType: "",
        avgConsumptionPerBird: "",
        totalFeedUsed: ""
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
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = feedRecords.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(feedRecords.length / recordsPerPage);

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
                totalFeedUsed: ""
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
            totalFeedUsed: record.totalFeedUsed
        });
    };

    // Handle edit form changes
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: name === 'ageGroup' || name === 'feedType' ? value : value
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-semibold">Daily Feed Consumption</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-400 text-white text-sm px-4 py-2 rounded-md"
                    >
                        + Add New Feed
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Feed Records Table */}
                <div className="bg-white rounded-md shadow-sm mb-4">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="w-12 py-3 px-4">
                                    <input type="checkbox" className="w-4 h-4 accent-green-500" />
                                </th>
                                <th className="py-3 px-4 text-left">Age Group</th>
                                <th className="py-3 px-4 text-left">Feed Type</th>
                                <th className="py-3 px-4 text-left">Avg. Consumption Per Bird (g)</th>
                                <th className="py-3 px-4 text-left">Total Feed Used (kg)</th>
                                <th className="py-3 px-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRecords.map((record) => (
                                <tr key={record._id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <input type="checkbox" className="w-4 h-4 accent-green-500" />
                                    </td>
                                    {editingRow === record._id ? (
                                        // Edit mode
                                        <>
                                            <td className="py-2 px-4">
                                                <select
                                                    name="ageGroup"
                                                    value={editFormData.ageGroup}
                                                    onChange={handleEditFormChange}
                                                    className="border rounded w-full py-1 px-2"
                                                >
                                                    {ageGroupOptions.map(group => (
                                                        <option key={group} value={group}>{group}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-2 px-4">
                                                <select
                                                    name="feedType"
                                                    value={editFormData.feedType}
                                                    onChange={handleEditFormChange}
                                                    className="border rounded w-full py-1 px-2"
                                                >
                                                    {feedTypeOptions.map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-2 px-4">
                                                <input
                                                    type="number"
                                                    name="avgConsumptionPerBird"
                                                    value={editFormData.avgConsumptionPerBird}
                                                    onChange={handleEditFormChange}
                                                    className="border rounded w-full py-1 px-2"
                                                />
                                            </td>
                                            <td className="py-2 px-4">
                                                <input
                                                    type="number"
                                                    name="totalFeedUsed"
                                                    value={editFormData.totalFeedUsed}
                                                    onChange={handleEditFormChange}
                                                    className="border rounded w-full py-1 px-2"
                                                />
                                            </td>
                                            <td className="py-2 px-4 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <button 
                                                        onClick={() => handleSaveClick(record._id)}
                                                        className="text-green-500"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                    <button 
                                                        onClick={handleCancelClick}
                                                        className="text-red-500"
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
                                            <td className="py-3 px-4">{record.ageGroup}</td>
                                            <td className="py-3 px-4">{record.feedType}</td>
                                            <td className="py-3 px-4">{record.avgConsumptionPerBird}</td>
                                            <td className="py-3 px-4">{record.totalFeedUsed}</td>
                                            <td className="py-3 px-4 text-right">
    <div className="flex justify-end space-x-2">
        {/* Edit Button */}
        <button 
            onClick={() => handleEditClick(record)}
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            title="Edit"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        </button>

        {/* Delete Button */}
        <button 
            onClick={() => handleDeleteClick(record._id)}
            className="text-gray-600 hover:text-red-600 transition-colors duration-200"
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
                            {/* Empty rows for consistent layout */}
                            {Array.from({ length: Math.max(0, recordsPerPage - currentRecords.length) }).map((_, idx) => (
                                <tr key={`empty-${idx}`} className="border-b">
                                    <td className="py-3 px-4">
                                        <input type="checkbox" className="w-4 h-4 accent-green-500" />
                                    </td>
                                    <td className="py-3 px-4"></td>
                                    <td className="py-3 px-4"></td>
                                    <td className="py-3 px-4"></td>
                                    <td className="py-3 px-4"></td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button className="text-gray-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button className="text-gray-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
<div className="flex justify-between items-center mt-4">
    <button className="px-4 py-2 bg-green-400 text-white rounded-md">
        Download CSV
    </button>

    <div className="flex-1 flex justify-center">
        <div className="flex flex-wrap justify-center space-x-1">
            {totalPages > 0 ? (
                Array.from({ length: totalPages }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                        <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded border text-sm flex items-center justify-center 
                                ${currentPage === pageNum ? 'border-gray-900 font-medium' : 'border-gray-300'}`}
                        >
                            {pageNum}
                        </button>
                    );
                })
            ) : (
                <button className="w-8 h-8 rounded border border-gray-900 text-sm flex items-center justify-center">
                    1
                </button>
            )}
        </div>
    </div>

    {/* empty spacer to balance layout */}
    <div className="w-[150px]" />
</div>


                {/* Add New Record Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4">Add New Feed Record</h3>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-gray-700 mb-1">Age Group</label>
                                    <select
                                        name="ageGroup"
                                        value={newRecordData.ageGroup}
                                        onChange={handleNewRecordChange}
                                        className="w-full border rounded-md px-3 py-2"
                                    >
                                        <option value="">Select age group</option>
                                        {ageGroupOptions.map(group => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 mb-1">Feed Type</label>
                                    <select
                                        name="feedType"
                                        value={newRecordData.feedType}
                                        onChange={handleNewRecordChange}
                                        className="w-full border rounded-md px-3 py-2"
                                    >
                                        <option value="">Select feed type</option>
                                        {feedTypeOptions.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 mb-1">Avg. Consumption / Bird (g)</label>
                                    <input
                                        type="number"
                                        name="avgConsumptionPerBird"
                                        value={newRecordData.avgConsumptionPerBird}
                                        onChange={handleNewRecordChange}
                                        className="w-full border rounded-md px-3 py-2"
                                        min="0"
                                        step="0.1"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 mb-1">Total Feed Used (kg)</label>
                                    <input
                                        type="number"
                                        name="totalFeedUsed"
                                        value={newRecordData.totalFeedUsed}
                                        onChange={handleNewRecordChange}
                                        className="w-full border rounded-md px-3 py-2"
                                        min="0"
                                        step="0.1"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button 
                                    onClick={() => setShowAddModal(false)} 
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAddRecord} 
                                    className="px-4 py-2 bg-green-400 text-white rounded-md hover:bg-green-500"
                                >
                                    Add Record
                                </button>
                            </div>
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