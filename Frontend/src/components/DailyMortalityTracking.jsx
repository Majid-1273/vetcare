import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DailyMortalityTracking() {
  const [mortalityData, setMortalityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
const location = window.location.pathname;
const batchId = location.split('/').pop();

  // Current page for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // State for edit mode
  const [editingRow, setEditingRow] = useState(null);
  const [editFormData, setEditFormData] = useState({
    date: '',
    totalBirdsCount: 0,
    deadBirdsCount: 0
  });

  // State for modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  // State for add new record modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecordData, setNewRecordData] = useState({
    batchId: batchId,
    date: new Date().toISOString().split('T')[0],
    totalBirdsCount: 0,
    deadBirdsCount: 0
  });
  
// Fetch mortality data from API
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/mortality/batch/${batchId}`);
      
      // Transform API data to match our component's format
      const formattedData = response.data.map(item => ({
        id: item._id,
        batchId: item.batchId,
        date: new Date(item.date).toISOString().split('T')[0],
        totalBirds: item.totalBirdsCount,
        deaths: item.deadBirdsCount,
        mortalityPercent: item.mortalityRate,
        cumulativeLoss: item.cumulativeLoss,
        selected: false,
        // Keep original data for reference
        originalData: item
      }));
      
      // Ensure data is sorted by date
      formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setMortalityData(formattedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching mortality data:", err);
      setError("Failed to load mortality data. Please try again later.");
      setLoading(false);
    }
  };

  fetchData();
}, [batchId]);

  // Get current records for pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = mortalityData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(mortalityData.length / recordsPerPage);

  // Check if all rows are selected
  const areAllSelected = currentRecords.length > 0 && currentRecords.every(row => row.selected);

  // Toggle all row selections
  const toggleAllRowsSelection = () => {
    const newSelectState = !areAllSelected;
    setMortalityData(mortalityData.map((row, index) => {
      if (index >= indexOfFirstRecord && index < indexOfLastRecord) {
        return { ...row, selected: newSelectState };
      }
      return row;
    }));
  };

  // Toggle row selection
  const toggleRowSelection = (id) => {
    setMortalityData(mortalityData.map(row =>
      row.id === id ? { ...row, selected: !row.selected } : row
    ));
  };

  // Delete row handler
  const handleDeleteClick = (id) => {
    setRowToDelete(id);
    setShowDeleteModal(true);
  };

  // Confirm delete - in a real app, you would call an API to delete the record
  const confirmDelete = async () => {
    try {
      // Here you would typically make a DELETE API call
      // await axios.delete(`http://localhost:5000/api/mortality/${rowToDelete}`);
      
      // For now, just remove from local state
      setMortalityData(mortalityData.filter(row => row.id !== rowToDelete));
      setShowDeleteModal(false);
      setRowToDelete(null);
    } catch (err) {
      console.error("Error deleting record:", err);
      setError("Failed to delete record. Please try again.");
    }
  };

  // Edit row handler
  const handleEditClick = (row) => {
    setEditingRow(row.id);
    setEditFormData({
      date: row.date,
      totalBirdsCount: row.totalBirds,
      deadBirdsCount: row.deaths
    });
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === 'date' ? value : parseInt(value) || 0
    });
  };

  // Save edited row - in a real app, you would call an API to update the record
  const handleSaveClick = async (id) => {
    try {
      // Here you would typically make a PUT/PATCH API call
      // Update would usually be handled by the backend
      
      // For now, just update in local state
      const mortalityPercent = (editFormData.deadBirdsCount / editFormData.totalBirdsCount * 100);
      
      // Find the row and its index
      const rowIndex = mortalityData.findIndex(row => row.id === id);
      
      // Update local state
      const updatedData = [...mortalityData];
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        date: editFormData.date,
        totalBirds: editFormData.totalBirdsCount,
        deaths: editFormData.deadBirdsCount,
        mortalityPercent: mortalityPercent
        // Note: cumulativeLoss would typically be recalculated by the backend
      };
      
      setMortalityData(updatedData);
      setEditingRow(null);
    } catch (err) {
      console.error("Error updating record:", err);
      setError("Failed to update record. Please try again.");
    }
  };

  // Cancel edit
  const handleCancelClick = () => {
    setEditingRow(null);
  };

  // Handle new record form change
  const handleNewRecordChange = (e) => {
    const { name, value } = e.target;
    setNewRecordData({
      ...newRecordData,
      [name]: name === 'date' ? value : parseInt(value) || 0
    });
  };
  
// Add new record via API
const handleAddRecord = async () => {
  try {
    // Prepare data for API - simplified to just send what's needed
    const recordToAdd = {
      batchId: batchId,
      date: newRecordData.date,
      deadBirdsCount: newRecordData.deadBirdsCount
    };
    
    // Send to API
    const response = await axios.post('http://localhost:5000/api/mortality', recordToAdd);
    
    // After successful API call, refresh the data
    const refreshResponse = await axios.get(`http://localhost:5000/api/mortality/batch/${batchId}`);
    
    // Format data as before
    const formattedData = refreshResponse.data.map(item => ({
      id: item._id,
      batchId: item.batchId,
      date: new Date(item.date).toISOString().split('T')[0],
      totalBirds: item.totalBirdsCount,
      deaths: item.deadBirdsCount,
      mortalityPercent: item.mortalityRate,
      cumulativeLoss: item.cumulativeLoss,
      selected: false,
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
}

  // Handle API errors
  if (error) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <button 
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading mortality data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Daily Mortality Tracking</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition shadow-md hover:shadow-lg"
          >
            <span className="mr-2 text-lg">+</span> Add Mortality Record
          </button>
        </div>

        {/* Mortality data table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left">
                  <input
                    type="checkbox"
                    checked={areAllSelected}
                    onChange={toggleAllRowsSelection}
                    className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                  />
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Birds</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deaths</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mortality %</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cumulative Loss</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRecords.length > 0 ? (
                currentRecords.map((row) => (
                  <tr key={row.id} className={`${row.selected ? 'bg-green-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}>
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={() => toggleRowSelection(row.id)}
                        className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                      />
                    </td>

                    {editingRow === row.id ? (
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
                            name="totalBirdsCount"
                            value={editFormData.totalBirdsCount}
                            onChange={handleEditFormChange}
                            className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            name="deadBirdsCount"
                            value={editFormData.deadBirdsCount}
                            onChange={handleEditFormChange}
                            className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </td>
                        <td className="py-2 px-4 font-medium">
                          {(editFormData.deadBirdsCount / editFormData.totalBirdsCount * 100).toFixed(2)}%
                        </td>
                        <td className="py-2 px-4">{row.cumulativeLoss}</td>
                        <td className="py-2 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleSaveClick(row.id)}
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
                        <td className="py-4 px-4 font-medium">{row.date}</td>
                        <td className="py-4 px-4">{row.totalBirds}</td>
                        <td className="py-4 px-4 text-red-600">{row.deaths}</td>
                        <td className="py-4 px-4 font-medium">{row.mortalityPercent.toFixed(2)}%</td>
                        <td className="py-4 px-4">{row.cumulativeLoss}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditClick(row)}
                              className="text-gray-600 hover:text-blue-600 focus:outline-none"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(row.id)}
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
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-500">
                    No mortality records found. Add a record to get started.
                  </td>
                </tr>
              )}
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
                  className={`px-3 py-1 rounded ${currentPage === page
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
              <p className="mb-6 text-gray-600">Are you sure you want to delete this record? This action cannot be undone.</p>
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
                  {(newRecordData.deadBirdsCount / 
                    (mortalityData[mortalityData.length - 1].totalBirds - 
                     mortalityData[mortalityData.length - 1].deaths) * 100).toFixed(2)}%
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
}

export default DailyMortalityTracking;