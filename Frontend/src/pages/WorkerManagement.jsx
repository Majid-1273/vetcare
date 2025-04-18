import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const WorkerManagement = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddWorkerForm, setShowAddWorkerForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [selectedWorkers, setSelectedWorkers] = useState([]);
    const [editingWorkerIds, setEditingWorkerIds] = useState([]);
    const [editableWorkers, setEditableWorkers] = useState({});

    const { token } = useSelector((state) => state.auth);

    const [newWorker, setNewWorker] = useState({
        username: "",
        email: "",
        password: "",
    });

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/auth/workers', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setWorkers(response.data.workers);
            setError(null);
        } catch (err) {
            console.error('Error fetching workers data:', err);
            setError('Failed to fetch workers. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchWorkers();
        } else {
            setError('Authentication token not found. Please log in again.');
            setLoading(false);
        }
    }, [token]);

    // Handler for adding a new worker
    const handleAddWorker = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                'http://localhost:5000/api/auth/worker/add',
                newWorker,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update state and reset form
            setWorkers([...workers, response.data.worker]);
            setNewWorker({
                username: "",
                email: "",
                password: "",
            });

            setShowAddWorkerForm(false);
            fetchWorkers(); // Refresh the list to include the new worker
        } catch (err) {
            console.error('Error adding new worker:', err);
            alert('Failed to add new worker. Please try again.');
        }
    };

    // Start editing a worker inline
    const handleStartEditing = (e, worker) => {
        e.stopPropagation(); // Prevent row click propagation
        
        // Create editable copy of the worker
        setEditableWorkers({
            ...editableWorkers,
            [worker._id]: {
                username: worker.username,
                email: worker.email,
                password: ""
            }
        });
        
        // Add worker ID to editing state
        setEditingWorkerIds([...editingWorkerIds, worker._id]);
    };

    // Handle input change for inline editing
    const handleEditableInputChange = (workerId, field, value) => {
        setEditableWorkers({
            ...editableWorkers,
            [workerId]: {
                ...editableWorkers[workerId],
                [field]: value
            }
        });
    };

    // Cancel editing a worker
    const handleCancelEditing = (e, workerId) => {
        e.stopPropagation(); // Prevent row click propagation
        
        // Remove worker from editing state
        setEditingWorkerIds(editingWorkerIds.filter(id => id !== workerId));
        
        // Remove editable data
        const updatedEditables = {...editableWorkers};
        delete updatedEditables[workerId];
        setEditableWorkers(updatedEditables);
    };

    // Save changes for a worker
    const handleSaveWorker = async (e, workerId) => {
        e.stopPropagation(); // Prevent row click propagation
        
        try {
            const workerData = {
                workerId: workerId,
                username: editableWorkers[workerId].username,
                email: editableWorkers[workerId].email,
            };
            
            // Only include password if it was changed (not empty)
            if (editableWorkers[workerId].password) {
                workerData.password = editableWorkers[workerId].password;
            }
            
            await axios.put(
                'http://localhost:5000/api/auth/worker/update',
                workerData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Remove worker from editing state
            setEditingWorkerIds(editingWorkerIds.filter(id => id !== workerId));
            
            // Remove editable data
            const updatedEditables = {...editableWorkers};
            delete updatedEditables[workerId];
            setEditableWorkers(updatedEditables);
            
            // Refresh workers list
            fetchWorkers();
        } catch (err) {
            console.error('Error updating worker:', err);
            alert('Failed to update worker. Please try again.');
        }
    };

    // Handle checkbox selection
    const handleCheckboxChange = (e, workerId) => {
        e.stopPropagation(); // Prevent row click propagation
        setSelectedWorkers(prev => {
            if (prev.includes(workerId)) {
                return prev.filter(id => id !== workerId);
            } else {
                return [...prev, workerId];
            }
        });
    };

    // Handle delete worker
    const handleDeleteWorker = async (e, workerId) => {
        e.stopPropagation(); // Prevent row click propagation
        if (window.confirm("Are you sure you want to delete this worker?")) {
            try {
                await axios.delete(`http://localhost:5000/api/auth/worker/delete/${workerId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setWorkers(workers.filter(worker => worker._id !== workerId));
                setSelectedWorkers(selectedWorkers.filter(id => id !== workerId));
            } catch (err) {
                console.error('Error deleting worker:', err);
                alert('Failed to delete worker. Please try again.');
            }
        }
    };

    // Download function
    const handleDownload = () => {
        // Implement CSV download logic here
        console.log("Download initiated");
        alert("Download feature will be implemented soon");
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentWorkers = workers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(workers.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading workers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[90vh] bg-white p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Worker Management</h1>
                    <button
                        onClick={() => setShowAddWorkerForm(true)}
                        className="bg-[#A8E6CF] text-white px-4 py-2 rounded-md flex items-center"
                    >
                        <span className="mr-1">+</span> Add New Worker
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Add Worker Form */}
                {showAddWorkerForm && (
                    <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Add New Worker</h2>
                            <button
                                onClick={() => setShowAddWorkerForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddWorker} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={newWorker.username}
                                    onChange={(e) => setNewWorker({ ...newWorker, username: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newWorker.email}
                                    onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={newWorker.password}
                                    onChange={(e) => setNewWorker({ ...newWorker, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    className="bg-[#A8E6CF] text-white font-medium py-2 px-6 rounded-md"
                                >
                                    Add Worker
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Workers Table */}
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
                                                if (selectedWorkers.length === workers.length) {
                                                    setSelectedWorkers([]);
                                                } else {
                                                    setSelectedWorkers(workers.map(worker => worker._id));
                                                }
                                            }}
                                            checked={selectedWorkers.length > 0 && selectedWorkers.length === workers.length}
                                        />
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Password
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date Added
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentWorkers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                                            No workers found. Add your first worker to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    currentWorkers.map((worker) => (
                                        <tr 
                                            key={worker._id} 
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-green-500 border-gray-300 rounded"
                                                    checked={selectedWorkers.includes(worker._id)}
                                                    onChange={(e) => handleCheckboxChange(e, worker._id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {editingWorkerIds.includes(worker._id) ? (
                                                    <input
                                                        type="text"
                                                        value={editableWorkers[worker._id].username}
                                                        onChange={(e) => handleEditableInputChange(worker._id, 'username', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                        required
                                                    />
                                                ) : (
                                                    worker.username
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {editingWorkerIds.includes(worker._id) ? (
                                                    <input
                                                        type="email"
                                                        value={editableWorkers[worker._id].email}
                                                        onChange={(e) => handleEditableInputChange(worker._id, 'email', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                        required
                                                    />
                                                ) : (
                                                    worker.email
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {editingWorkerIds.includes(worker._id) ? (
                                                    <input
                                                        type="password"
                                                        value={editableWorkers[worker._id].password}
                                                        onChange={(e) => handleEditableInputChange(worker._id, 'password', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                                        placeholder="Leave blank to keep unchanged"
                                                    />
                                                ) : (
                                                    "••••••••"
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {worker.createdAt ? new Date(worker.createdAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    {editingWorkerIds.includes(worker._id) ? (
                                                        <>
                                                            <button
                                                                onClick={(e) => handleSaveWorker(e, worker._id)}
                                                                className="text-green-500 hover:text-green-700"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleCancelEditing(e, worker._id)}
                                                                className="text-gray-500 hover:text-gray-700"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={(e) => handleStartEditing(e, worker)}
                                                                className="hover:text-blue-500"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeleteWorker(e, worker._id)}
                                                                className="hover:text-red-700 text-red-500"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
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
                                                : 'hover:bg-gray-100 rounded-md text-sm'
                                        }`}
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
                    className="bg-[#A8E6CF] text-white px-4 py-2 rounded-md flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                </button>
            </div>
        </div>
    );
};

export default WorkerManagement;