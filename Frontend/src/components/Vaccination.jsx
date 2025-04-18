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
    const [selectedItems, setSelectedItems] = useState([]);
    
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
            setVaccinations([]); // Ensure empty array on error
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
    const totalPages = Math.ceil(Math.max(vaccinations.length, 1) / recordsPerPage);
    
    // Get current records
    const getCurrentRecords = () => {
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        return vaccinations.slice(startIndex, endIndex);
    };
    
    const currentRecords = getCurrentRecords();

    // Toggle item selection
    const toggleItemSelection = (id) => {
        if (!id) return;
        
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(item => item !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

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
        if (!record || !record._id) return;
        
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
        if (!id) return;
        
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
    
    // Handle download function
    const handleDownload = () => {
        console.log("Download button clicked");
        alert("Download feature will be implemented soon");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading vaccination records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[90vh] bg-white p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Vaccination Schedule</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#A8E6CF] text-white px-4 py-2 rounded-md flex items-center"
                    >
                        <span className="mr-1">+</span> Add Vaccination Record
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* Table */}
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
                                                if (selectedItems.length === vaccinations.length) {
                                                    setSelectedItems([]);
                                                } else {
                                                    setSelectedItems(vaccinations.map(vaccination => vaccination._id));
                                                }
                                            }}
                                            checked={vaccinations.length > 0 && selectedItems.length === vaccinations.length}
                                        />
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaccine Type</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Given</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Dose Due</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                                            No vaccination records found. Add your first vaccination record to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    currentRecords.map((record) => (
                                        <tr key={record._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-green-500 border-gray-300 rounded"
                                                    checked={selectedItems.includes(record._id)}
                                                    onChange={() => toggleItemSelection(record._id)}
                                                />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.vaccinationType}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {record.dateGiven ? new Date(record.dateGiven).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.batchId}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {record.nextDoseDate ? new Date(record.nextDoseDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex space-x-2 justify-end">
                                                    <button
                                                        onClick={() => handleEditClick(record)}
                                                        className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                                                        title="Edit"
                                                    >
                                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(record._id)}
                                                        className="text-red-500 hover:text-red-700"
                                                        title="Delete"
                                                    >
                                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination and Download Button */}
                <div className="mt-4 flex justify-between items-center">
                    {/* Pagination */}
                    <div className="flex-1 flex justify-center">
                        {totalPages > 1 && (
                            <div className="flex items-center">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                    <button
                                        key={number}
                                        onClick={() => setCurrentPage(number)}
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
                    className="bg-[#A8E6CF] text-white px-4 py-2 rounded-md flex items-center mt-4"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                </button>

                {/* Add New Vaccination Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Add New Vaccination Record</h3>
                                <button 
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vaccination Type</label>
                                    <select
                                        name="vaccinationType"
                                        value={newVaccination.vaccinationType}
                                        onChange={handleNewVaccinationChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    >
                                        <option value="">Select vaccination type</option>
                                        {vaccinationTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Given</label>
                                    <input
                                        type="date"
                                        name="dateGiven"
                                        value={newVaccination.dateGiven}
                                        onChange={handleNewVaccinationChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Dose Date (optional)</label>
                                    <input
                                        type="date"
                                        name="nextDoseDate"
                                        value={newVaccination.nextDoseDate}
                                        onChange={handleNewVaccinationChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        name="petName"
                                        value={newVaccination.petName}
                                        onChange={handleNewVaccinationChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        rows="3"
                                        placeholder="Enter your notes"
                                    ></textarea>
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
                                    onClick={handleAddVaccination} 
                                    className="px-4 py-2 bg-[#A8E6CF] text-white rounded-md hover:bg-green-500"
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
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete} 
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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