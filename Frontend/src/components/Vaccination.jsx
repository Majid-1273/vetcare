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
    const totalRecords = Math.max(vaccinations.length, recordsPerPage);
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    
    // Get current records with handling empty data
    const getCurrentRecords = () => {
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        
        // If we have real data
        if (vaccinations.length > 0) {
            return vaccinations.slice(startIndex, endIndex);
        }
        
        // If no data, return empty placeholders
        return Array(recordsPerPage).fill(null);
    };
    
    const currentRecords = getCurrentRecords();

    // Toggle item selection - only for actual records
    const toggleItemSelection = (id) => {
        if (!id) return; // Skip if empty row
        
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

    // Handle edit click - only for actual records
    const handleEditClick = (record) => {
        if (!record || !record._id) return; // Skip if empty row
        
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

    // Handle delete click - only for actual records
    const handleDeleteClick = (id) => {
        if (!id) return; // Skip if empty row
        
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
    
    // Dummy download function
    const handleDownload = () => {
        console.log("Download button clicked");
        // This is just a dummy function - no actual download happens
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
        <div className="min-h-screen bg-white p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-medium text-gray-800">Vaccination Schedule</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md"
                    >
                        + Add Vaccination Record
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

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 mb-6">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 text-left">
                                    <input 
                                        type="checkbox" 
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaccine Type</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Given</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Dose Due</th>
                                <th className="py-3 px-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentRecords.map((record, index) => (
                                <tr key={record?._id || `empty-row-${index}`} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300"
                                            checked={record?._id ? selectedItems.includes(record._id) : false}
                                            onChange={() => toggleItemSelection(record?._id)}
                                            disabled={!record}
                                        />
                                    </td>
                                    <td className="py-3 px-4">{record?.vaccinationType || '-'}</td>
                                    <td className="py-3 px-4">{record?.dateGiven ? new Date(record.dateGiven).toLocaleDateString() : '-'}</td>
                                    <td className="py-3 px-4">{record?.batchId || '-'}</td>
                                    <td className="py-3 px-4">
                                        {record?.nextDoseDate ? new Date(record.nextDoseDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="py-3 px-4 text-right">
    <div className="flex justify-end">
        {/* Edit Button */}
        <button
            onClick={() => handleEditClick(record)}
            className={`text-gray-500 hover:text-blue-600 transition-colors duration-200 mr-3 ${
                !record ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!record}
            title="Edit"
        >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        </button>

        {/* Delete Button */}
        <button
            onClick={() => handleDeleteClick(record?._id)}
            className={`text-gray-500 hover:text-red-600 transition-colors duration-200 ${
                !record ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!record}
            title="Delete"
        >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
    </div>
</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

{/* Bottom Controls - Download Button and Pagination */}
<div className="flex items-center justify-between mt-4">
    {/* Download Button - Bottom Left */}
    <button
        onClick={handleDownload}
        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md"
    >
        Download
    </button>

    {/* Pagination - Centered */}
    <div className="flex-1 flex justify-center">
        <div className="flex space-x-1">
            {Array.from({ length: totalPages }).map((_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    disabled={vaccinations.length === 0}
                    className={`h-8 w-8 flex items-center justify-center rounded border ${
                        currentPage === index + 1
                            ? 'border-gray-900 font-medium bg-transparent'
                            : vaccinations.length === 0
                                ? 'text-gray-400 cursor-not-allowed border-gray-300 bg-transparent'
                                : 'text-gray-700 hover:bg-gray-100 border-gray-300 bg-transparent'
                    }`}
                >
                    {index + 1}
                </button>
            ))}
        </div>
    </div>

    {/* Spacer to balance the layout */}
    <div className="w-[150px]" />
</div>


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
                                    <label className="block text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        name="petName"
                                        value={newVaccination.petName}
                                        onChange={handleNewVaccinationChange}
                                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        rows="3"
                                        placeholder="Enter your notes"
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