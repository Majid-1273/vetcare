import React, { useState } from 'react';

function Vaccination() {
  // Sample vaccination data
  const [vaccinationData, setVaccinationData] = useState([
    { id: 1, vaccineType: 'Newcastle Disease', dateGiven: '2025-04-01', batchNumber: 'B001', nextDoseDue: '2025-07-01', selected: true },
    { id: 2, vaccineType: 'Infectious Bronchitis', dateGiven: '2025-04-02', batchNumber: 'B002', nextDoseDue: '2025-07-02', selected: true },
    { id: 3, vaccineType: 'Avian Influenza', dateGiven: '2025-04-03', batchNumber: 'B003', nextDoseDue: '2025-07-03', selected: false },
    { id: 4, vaccineType: 'Fowl Pox', dateGiven: '2025-04-04', batchNumber: 'B004', nextDoseDue: '2025-07-04', selected: false }
  ]);

  // Current page for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 6; // Assuming 6 pages for demonstration

  // State for edit mode
  const [editingRow, setEditingRow] = useState(null);
  const [editFormData, setEditFormData] = useState({
    vaccineType: '',
    dateGiven: '',
    batchNumber: '',
    nextDoseDue: ''
  });

  // State for modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  // State for add new record modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecordData, setNewRecordData] = useState({
    vaccineType: '',
    dateGiven: new Date().toISOString().split('T')[0],
    batchNumber: '',
    nextDoseDue: ''
  });

  // Check if all rows are selected
  const areAllSelected = vaccinationData.every(row => row.selected);

  // Toggle all row selections
  const toggleAllRowsSelection = () => {
    const newSelectState = !areAllSelected;
    setVaccinationData(vaccinationData.map(row => ({ ...row, selected: newSelectState })));
  };

  // Toggle row selection
  const toggleRowSelection = (id) => {
    setVaccinationData(vaccinationData.map(row =>
      row.id === id ? { ...row, selected: !row.selected } : row
    ));
  };

  // Delete row handler
  const handleDeleteClick = (id) => {
    setRowToDelete(id);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    setVaccinationData(vaccinationData.filter(row => row.id !== rowToDelete));
    setShowDeleteModal(false);
    setRowToDelete(null);
  };

  // Edit row handler
  const handleEditClick = (row) => {
    setEditingRow(row.id);
    setEditFormData({
      vaccineType: row.vaccineType,
      dateGiven: row.dateGiven,
      batchNumber: row.batchNumber,
      nextDoseDue: row.nextDoseDue
    });
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Save edited row
  const handleSaveClick = (id) => {
    // Update the row
    setVaccinationData(vaccinationData.map(row => {
      if (row.id === id) {
        return {
          ...row,
          vaccineType: editFormData.vaccineType,
          dateGiven: editFormData.dateGiven,
          batchNumber: editFormData.batchNumber,
          nextDoseDue: editFormData.nextDoseDue
        };
      }
      return row;
    }));

    // Exit edit mode
    setEditingRow(null);
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
      [name]: value
    });
  };

  // Add new record
  const handleAddRecord = () => {
    // Create new record
    const newRecord = {
      id: vaccinationData.length + 1, // Simple ID assignment
      vaccineType: newRecordData.vaccineType,
      dateGiven: newRecordData.dateGiven,
      batchNumber: newRecordData.batchNumber,
      nextDoseDue: newRecordData.nextDoseDue,
      selected: false
    };

    // Add to data
    setVaccinationData([...vaccinationData, newRecord]);

    // Reset form and close modal
    setNewRecordData({
      vaccineType: '',
      dateGiven: new Date().toISOString().split('T')[0],
      batchNumber: '',
      nextDoseDue: ''
    });
    setShowAddModal(false);
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Vaccination Schedule</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition shadow-md hover:shadow-lg"
          >
            <span className="mr-2 text-lg">+</span> Add Vaccination Record
          </button>
        </div>

        {/* Vaccination data table */}
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
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaccine Type</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Given</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Dose Due</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vaccinationData.map((row) => (
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
                          type="text"
                          name="vaccineType"
                          value={editFormData.vaccineType}
                          onChange={handleEditFormChange}
                          className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
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
                          type="text"
                          name="batchNumber"
                          value={editFormData.batchNumber}
                          onChange={handleEditFormChange}
                          className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          type="date"
                          name="nextDoseDue"
                          value={editFormData.nextDoseDue}
                          onChange={handleEditFormChange}
                          className="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </td>
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
                      <td className="py-4 px-4 font-medium">{row.vaccineType}</td>
                      <td className="py-4 px-4">{row.dateGiven}</td>
                      <td className="py-4 px-4">{row.batchNumber}</td>
                      <td className="py-4 px-4">{row.nextDoseDue}</td>
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
              <h3 className="text-xl font-semibold mb-4">Add New Vaccination Record</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-700 mb-1">Vaccine Type</label>
                  <input
                    type="text"
                    name="vaccineType"
                    value={newRecordData.vaccineType}
                    onChange={handleNewRecordChange}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Newcastle Disease"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Date Given</label>
                    <input
                      type="date"
                      name="dateGiven"
                      value={newRecordData.dateGiven}
                      onChange={handleNewRecordChange}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Batch Number</label>
                    <input
                      type="text"
                      name="batchNumber"
                      value={newRecordData.batchNumber}
                      onChange={handleNewRecordChange}
                      className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. B001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Next Dose Due</label>
                  <input
                    type="date"
                    name="nextDoseDue"
                    value={newRecordData.nextDoseDue}
                    onChange={handleNewRecordChange}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
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

export default Vaccination;