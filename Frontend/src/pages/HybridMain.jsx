import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const HybridMain = () => {
    const navigate = useNavigate();
    const [flocks, setFlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFlocks, setSelectedFlocks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [showNewFlockForm, setShowNewFlockForm] = useState(false);

    const { token } = useSelector((state) => state.auth);

    const [newFlock, setNewFlock] = useState({
        name: "",
        breed: "",
        breedType: "layer",
        placementDate: "",
        initialCount: "",
    });

    // Available breed options
    const breedOptions = [
        { value: "ISA Brown", category: "Layer" },
        { value: "Hyline", category: "Layer" },
        { value: "Lohmann Brown", category: "Layer" },
        { value: "Rhode Island Red", category: "Layer" },
        { value: "Cobb 500", category: "Broiler" },
        { value: "Ross 308", category: "Broiler" },
        { value: "Arbor Acres", category: "Broiler" }
    ];

    const fetchFlocks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/chickens/batches', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const hybridFlocks = response.data.filter(flock => flock.breedType === 'hybrid');
            setFlocks(hybridFlocks);
            setError(null);
        } catch (err) {
            console.error('Error fetching flock data:', err);
            setError('Failed to fetch batches. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        if (token) {
            fetchFlocks();
        } else {
            setError('Authentication token not found. Please log in again.');
            setLoading(false);
        }
    }, [token]);

    // Handle checkbox selection
    const handleCheckboxChange = (e, flockId) => {
        e.stopPropagation(); // Prevent row click when checking the checkbox
        setSelectedFlocks(prev => {
            if (prev.includes(flockId)) {
                return prev.filter(id => id !== flockId);
            } else {
                return [...prev, flockId];
            }
        });
    };

    // Handle delete flock
    const handleDeleteFlock = async (e, flockId) => {
        e.stopPropagation(); // Prevent row click when deleting
        if (window.confirm("Are you sure you want to delete this batch?")) {
            try {
                await axios.delete(`http://localhost:5000/api/chickens/batches/${flockId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setFlocks(flocks.filter(flock => flock._id !== flockId));
                setSelectedFlocks(selectedFlocks.filter(id => id !== flockId));
            } catch (err) {
                console.error('Error deleting flock:', err);
                alert('Failed to delete batch. Please try again.');
            }
        }
    };

    // Calculate remaining birds
    const calculateRemainingBirds = (flock) => {
        return flock.currentCount || flock.initialCount;
    };

    // Calculate mortality rate
    const calculateMortality = (flock) => {
        if (!flock.initialCount) return "0.00%";
        const mortalityCount = flock.initialCount - (flock.currentCount || flock.initialCount);
        return ((mortalityCount / flock.initialCount) * 100).toFixed(2) + "%";
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFlocks = flocks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(flocks.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Download function
    const handleDownload = () => {
        // Implement CSV download logic here
        console.log("Download initiated");
        alert("Download feature will be implemented soon");
    };

    // Handler for navigating to detail page based on flock type
    const navigateToFlockDetails = (flock) => {
        const isLayer = flock.breedType === "layer";
        const route = isLayer ? `/layer/${flock._id}` : `/broiler/${flock._id}`;
        navigate(route);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading batches...</p>
                </div>
            </div>
        );
    }

    return (
        <>
        {/* Top Navigation/Search Bar */}
      <div className="p-4 bg-white border-b flex items-center justify-between sticky top-0 z-10">
        <div className="relative w-64">
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

    </div>
        <div className="h-[90vh] bg-white p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Dual-Purpose Chicken Details</h1>
                    
                </div>

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
                                                e.stopPropagation(); // Prevent row click propagation
                                                if (selectedFlocks.length === flocks.length) {
                                                    setSelectedFlocks([]);
                                                } else {
                                                    setSelectedFlocks(flocks.map(flock => flock._id));
                                                }
                                            }}
                                            checked={selectedFlocks.length > 0 && selectedFlocks.length === flocks.length}
                                        />
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Batch ID
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Breed Type
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Placement Date
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Number of Chicks Placed
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Initial Count
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mortality
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Remaining Birds
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentFlocks.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-4 text-center text-gray-500">
                                            No batches found. Add your first batch to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    currentFlocks.map((flock) => (
                                        <tr 
                                            key={flock._id} 
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => navigateToFlockDetails(flock)}
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-green-500 border-gray-300 rounded"
                                                    checked={selectedFlocks.includes(flock._id)}
                                                    onChange={(e) => handleCheckboxChange(e, flock._id)}
                                                    onClick={(e) => e.stopPropagation()} // Prevent row click when clicking the checkbox
                                                />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {flock.name || flock._id.substring(0, 8)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {flock.breed} ({flock.breedType === "layer" ? "Layer" : "Broiler"})
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(flock.placementDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {flock.initialCount}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {flock.initialCount}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {calculateMortality(flock)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                {calculateRemainingBirds(flock)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={(e) => handleDeleteFlock(e, flock._id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                        className="bg-[#A8E6CF] text-white px-4 py-2 rounded-md flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </button>
            </div>
        </div>
        </>
    );
};

export default HybridMain;