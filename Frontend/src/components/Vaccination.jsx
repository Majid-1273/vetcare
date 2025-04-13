import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Vaccination = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [vaccinations, setVaccinations] = useState([]);
    const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;
    const [editingRow, setEditingRow] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);
    const [showUpcoming, setShowUpcoming] = useState(false);
    
    const { token } = useSelector((state) => state.auth);
    const batchId = id;
    
    // State for new vaccination
    const [newVaccination, setNewVaccination] = useState({
        vaccinationType: "",
        dateGiven: new Date().toISOString().split('T')[0],
        nextDoseDate: "",
        petName: ""
    });
    
    // State for edit form
    const [editFormData, setEditFormData] = useState({
        vaccinationType: "",
        dateGiven: "",
        nextDoseDate: "",
        petName: ""
    });

    // Available vaccination types
    const vaccinationTypes = [
        "Newcastle Disease",
        "Infectious Bronchitis",
        "Marek's Disease",
        "Fowl Pox",
        "Avian Influenza",
        "Infectious Bursal Disease (Gumboro)",
        "Fowl Cholera",
        "Coccidiosis",
        "Infectious Coryza",
        "Egg Drop Syndrome"
    ];

    const fetchVaccinations = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5000/api/vaccinations/batch/${batchId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setVaccinations(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching vaccinations:', err);
            setError('Failed to fetch vaccination records. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUpcomingVaccinations = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/vaccinations/upcoming', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUpcomingVaccinations(response.data);
        } catch (err) {
            console.error('Error fetching upcoming vaccinations:', err);
        }
    };

    useEffect(() => {
        if (token && batchId) {
            fetchVaccinations();
            fetchUpcomingVaccinations();
        } else {
            setError('Authentication token not found or invalid batch ID.');
            setLoading(false);
        }
    }, [token, batchId]);

    // Calculate pagination
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = vaccinations.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(vaccinations.length / recordsPerPage);

    // Handle adding new vaccination
    const handleAddVaccination = async () => {
        try {
            const response = await axios.post(
                'http://localhost:5000/api/vaccinations', 
                {
                    ...newVaccination,
                    batchId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            setVaccinations([...vaccinations, response.data.vaccination]);
            fetchUpcomingVaccinations(); // Refresh upcoming vaccinations
            
            // Reset form and close modal
            setNewVaccination({
                vaccinationType: "",
                dateGiven: new Date().toISOString().split('T')[0],
                nextDoseDate: "",
                petName: ""
            });
            setShowAddModal(false);
        } catch (err) {
            console.error('Error adding new vaccination:', err);
            alert('Failed to add new vaccination. Please try again.');
        }
    };

    // Handle edit click
    const handleEditClick = (record) => {
        setEditingRow(record._id);
        
        // Format dates for the form
        const dateGiven = record.dateGiven ? new Date(record.dateGiven).toISOString().split('T')[0] : '';
        const nextDoseDate = record.nextDoseDate ? new Date(record.nextDoseDate).toISOString().split('T')[0] : '';
        
        setEditFormData({
            vaccinationType: record.vaccinationType,
            dateGiven: dateGiven,
            nextDoseDate: nextDoseDate,
            petName: record.petName || ""
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
                `http://localhost:5000/api/vaccinations/${id}`,
                editFormData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            setVaccinations(vaccinations.map(vaccination => 
                vaccination._id === id ? response.data.vaccination : vaccination
            ));
            
            // Refresh upcoming vaccinations as they might have changed
            fetchUpcomingVaccinations();
            
            // Exit edit mode
            setEditingRow(null);
        } catch (err) {
            console.error('Error updating vaccination:', err);
            alert('Failed to update vaccination record. Please try again.');
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
            await axios.delete(`http://localhost:5000/api/vaccinations/${rowToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            setVaccinations(vaccinations.filter(vaccination => vaccination._id !== rowToDelete));
            fetchUpcomingVaccinations(); // Refresh upcoming vaccinations
            
            setShowDeleteModal(false);
            setRowToDelete(null);
        } catch (err) {
            console.error('Error deleting vaccination:', err);
            alert('Failed to delete vaccination record. Please try again.');
        }
    };

    // Handle new vaccination form change
    const handleNewVaccinationChange = (e) => {
        const { name, value } = e.target;
        setNewVaccination({
            ...newVaccination,
            [name]: value
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading vaccination records...</p>
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
                        <h1 className="text-2xl md:text-3xl font-bold text-green-800">Vaccination Management</h1>
                        <p className="text-gray-600">Track and manage vaccination records for your flock</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowUpcoming(!showUpcoming)}
                            className={`${showUpcoming ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} font-medium py-2 px-4 rounded-lg flex items-center transition shadow-md hover:shadow-lg`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {showUpcoming ? "Hide Upcoming" : "Upcoming Vaccinations"}
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition shadow-md hover:shadow-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Vaccination
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

                {/* Upcoming Vaccinations Section */}
                {showUpcoming && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                        <div className="bg-blue-50 p-4 border-b border-blue-100">
                            <h2 className="text-lg font-semibold text-blue-800">Upcoming Vaccinations (Next 7 Days)</h2>
                        </div>
                        
                        {upcomingVaccinations.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-gray-600">No upcoming vaccinations in the next 7 days.</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-blue-50">
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Name</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaccination Type</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">petName</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {upcomingVaccinations.map((vaccination) => (
                                        <tr key={vaccination._id} className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4 font-medium">{vaccination.batchName}</td>
                                            <td className="py-4 px-4">{vaccination.vaccinationType}</td>
                                            <td className="py-4 px-4">{new Date(vaccination.nextDoseDate).toLocaleDateString()}</td>
                                            <td className="py-4 px-4">{vaccination.petName || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Vaccination Records Table */}
                {vaccinations.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No vaccination records added yet</h3>
                        <p className="text-gray-600 mb-4">Add your first vaccination record to start tracking health status</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg"
                        >
                            Add First Vaccination
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaccination Type</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Given</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Dose Due</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">petName</th>
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
                                                        <select
                                                            name="vaccinationType"
                                                            value={editFormData.vaccinationType}
                                                            onChange={handleEditFormChange}
                                                            className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        >
                                                            {vaccinationTypes.map(type => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        <input
                                                            type="date"
                                                            name="dateGiven"
                                                            value={editFormData.dateGiven}
                                                            onChange={handleEditFormChange}
                                                            className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        <input
                                                            type="date"
                                                            name="nextDoseDate"
                                                            value={editFormData.nextDoseDate}
                                                            onChange={handleEditFormChange}
                                                            className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        <input
                                                            type="text"
                                                            name="petName"
                                                            value={editFormData.petName}
                                                            onChange={handleEditFormChange}
                                                            className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                                                            placeholder="Add petName"
                                                        />
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
                                                    <td className="py-4 px-4 font-medium">{record.vaccinationType}</td>
                                                    <td className="py-4 px-4">{new Date(record.dateGiven).toLocaleDateString()}</td>
                                                    <td className="py-4 px-4">
                                                        {record.nextDoseDate ? (
                                                            <span className={`px-2 py-1 rounded ${
                                                                new Date(record.nextDoseDate) < new Date() 
                                                                    ? 'bg-red-100 text-red-800' 
                                                                    : 'bg-green-100 text-green-800'
                                                            }`}>
                                                                {new Date(record.nextDoseDate).toLocaleDateString()}
                                                            </span>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="py-4 px-4">{record.petName || '-'}</td>
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

                {/* Add New Vaccination Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                            <h3 className="text-xl font-semibold mb-4">Add New Vaccination Record</h3>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-gray-700 mb-1">Vaccination Type</label>
                                    <select
                                        name="vaccinationType"
                                        value={newVaccination.vaccinationType}
                                        onChange={handleNewVaccinationChange}
                                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    >
                                        <option value="">Select vaccination type</option>
                                        {vaccinationTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 mb-1">Date Given</label>
                                    <input
                                        type="date"
                                        name="dateGiven"
                                        value={newVaccination.dateGiven}
                                        onChange={handleNewVaccinationChange}
                                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 mb-1">Next Dose Date (optional)</label>
                                    <input
                                        type="date"
                                        name="nextDoseDate"
                                        value={newVaccination.nextDoseDate}
                                        onChange={handleNewVaccinationChange}
                                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 mb-1">petName</label>
                                    <textarea
                                        name="petName"
                                        value={newVaccination.petName}
                                        onChange={handleNewVaccinationChange}
                                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        rows="3"
                                        placeholder="Enter your petName"
                                    ></textarea>
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
                                    onClick={handleAddVaccination} 
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    Add Vaccination
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
                            <p className="mb-6 text-gray-600">Are you sure you want to delete this vaccination record? This action cannot be undone.</p>
                            <div className="flex justify-end space-x-3">
                            <button 
                                    onClick={() => setShowDeleteModal(false)} 
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete} 
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
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

export default Vaccination;