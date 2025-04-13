import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const FlockManagement = () => {
    const navigate = useNavigate();
    const [flocks, setFlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedFlockId, setExpandedFlockId] = useState(null);
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
            setFlocks(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching flock data:', err);
            setError('Failed to fetch batches. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlocks();

        if (token) {
            fetchFlocks();
        } else {
            setError('Authentication token not found. Please log in again.');
            setLoading(false);
        }
    }, [token]);

    // Handler for adding a new flock
// Handler for adding a new flock
const handleAddFlock = async (e) => {
    e.preventDefault();
    
    try {
        // First, create the new flock
        const response = await axios.post(
            'http://localhost:5000/api/chickens/batches', 
            newFlock,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Format the date for the mortality record
        const isoDate = response.data.batch.placementDate;
        const formattedDate = new Date(isoDate).toISOString().split('T')[0];

        // Then create the initial mortality record
        await axios.post(
            'http://localhost:5000/api/mortality',
            {
                batchId: response.data.batch._id,
                date: formattedDate,
                totalBirdsCount: response.data.batch.initialCount,
                deadBirdsCount: 0
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Update state and reset form
        setFlocks([...flocks, response.data.batch]);
        setNewFlock({
            name: "",
            breed: "",
            breedType: "layer",
            placementDate: "",
            initialCount: "",
        });
        
        setShowNewFlockForm(false);
        fetchFlocks(); // Refresh the list to include the new flock
    } catch (err) {
        console.error('Error adding new flock:', err);
        alert('Failed to add new batch. Please try again.');
    }
};

    // Handler for changing breed type
    const handleBreedChange = (e) => {
        const selectedBreed = e.target.value;
        const selectedBreedType = breedOptions.find(breed => breed.value === selectedBreed)?.category.toLowerCase() || "layer";
        
        setNewFlock({
            ...newFlock,
            breed: selectedBreed,
            breedType: selectedBreedType
        });
    };

    // Handler for removing a flock
    const handleRemoveFlock = async (e, flockId) => {
        e.stopPropagation(); // Prevent the click from triggering the navigation
        if (window.confirm("Are you sure you want to remove this batch?")) {
            try {
                await axios.delete(`http://localhost:5000/api/chickens/batches/${flockId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                setFlocks(flocks.filter(flock => flock._id !== flockId));
                if (expandedFlockId === flockId) {
                    setExpandedFlockId(null);
                }
            } catch (err) {
                console.error('Error removing flock:', err);
                alert('Failed to remove batch. Please try again.');
            }
        }
    };

    // Handler for navigating to detail page based on flock type
    const navigateToFlockDetails = (flock) => {
        const isLayer = flock.breedType === "layer";
        const route = isLayer ? `/layer/${flock._id}` : `/broiler/${flock._id}`;
        navigate(route);
    };

    // Calculate mortality rate
    const calculateMortalityRate = (flock) => {
        if (!flock.initialCount) return "0.00";
        const mortalityCount = flock.initialCount - (flock.currentCount || flock.initialCount);
        return ((mortalityCount / flock.initialCount) * 100).toFixed(2);
    };

    // Calculate age in days
    const calculateAge = (placementDate) => {
        const today = new Date();
        const placement = new Date(placementDate);
        
        // If placement date is in the future, return 0 days
        if (placement > today) {
            return 0;
        }
        
        // Otherwise calculate the difference in days
        return Math.floor((today - placement) / (1000 * 60 * 60 * 24));
    };

    // Function to get gradient color based on flock type
    const getFlockTypeColor = (breedType) => {
        return breedType === "layer"
            ? "from-amber-500 to-amber-400"  // Layer type
            : "from-blue-500 to-blue-400";   // Broiler type
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading batches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-green-800">Flock Management</h1>
                        <p className="text-gray-600">Manage your poultry batches and track performance</p>
                    </div>
                    <button
                        onClick={() => setShowNewFlockForm(!showNewFlockForm)}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition shadow-md hover:shadow-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New Batch
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

                {/* New Flock Form */}
                {showNewFlockForm && (
                    <div className="mb-8 bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500 animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-green-800">Add New Batch</h2>
                            <button
                                onClick={() => setShowNewFlockForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleAddFlock} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                                <input
                                    type="text"
                                    value={newFlock.name}
                                    onChange={(e) => setNewFlock({ ...newFlock, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Spring Layers 2025"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                                <select
                                    value={newFlock.breed}
                                    onChange={handleBreedChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select breed</option>
                                    <optgroup label="Layer Breeds">
                                        {breedOptions.filter(breed => breed.category === "Layer").map(breed => (
                                            <option key={breed.value} value={breed.value}>{breed.value}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Broiler Breeds">
                                        {breedOptions.filter(breed => breed.category === "Broiler").map(breed => (
                                            <option key={breed.value} value={breed.value}>{breed.value}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Placement Date</label>
                                <input
                                    type="date"
                                    value={newFlock.placementDate}
                                    onChange={(e) => setNewFlock({ ...newFlock, placementDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Count</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newFlock.initialCount}
                                    onChange={(e) => setNewFlock({ ...newFlock, initialCount: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Number of birds placed"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition shadow-md hover:shadow-lg"
                                >
                                    Add Batch
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Flocks Display */}
                {flocks.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No batches added yet</h3>
                        <p className="text-gray-600 mb-4">Add your first batch to start tracking your flock performance</p>
                        <button
                            onClick={() => setShowNewFlockForm(true)}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg"
                        >
                            Add First Batch
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {flocks.map(flock => (
                            <div
                                key={flock._id}
                                className={`bg-white rounded-xl shadow-md overflow-hidden transform transition hover:-translate-y-1 hover:shadow-lg border-l-4 ${flock.breedType === "layer" ? "border-amber-500" : "border-blue-500"}`}
                            >
                                {/* Flock Card */}
                                <div className="relative">
                                    {/* Colored accent at the top of the card */}
                                    <div className={`h-2 bg-gradient-to-r ${getFlockTypeColor(flock.breedType)} w-full absolute top-0`}></div>

                                    {/* Card Content */}
                                    <div
                                        className="flex flex-col md:flex-row justify-between items-stretch cursor-pointer pt-4"
                                        onClick={() => navigateToFlockDetails(flock)}
                                    >
                                        {/* Left Column - Basic Info */}
                                        <div className="bg-white p-4 md:p-6 flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center">
                                                        <h3 className="font-bold text-lg text-gray-900">{flock.name}</h3>
                                                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                                                            Active
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">ID: {flock._id}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`inline-flex items-center justify-center rounded-full ${flock.breedType === "layer"
                                                            ? "text-amber-700 bg-amber-50"
                                                            : "text-blue-700 bg-blue-50"
                                                        } px-2 py-1 text-xs`}>
                                                        {flock.breedType === "layer" ? "Layer" : "Broiler"}
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleRemoveFlock(e, flock._id)}
                                                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded-full transition-colors"
                                                        title="Remove batch"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 mt-4">
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <span className="text-xs font-medium text-gray-500 uppercase block">Breed</span>
                                                    <span className="text-sm font-medium">{flock.breed}</span>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <span className="text-xs font-medium text-gray-500 uppercase block">Placement</span>
                                                    <span className="text-sm font-medium">{new Date(flock.placementDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-3">
                                                    <span className="text-xs font-medium text-gray-500 uppercase block">Age</span>
                                                    <span className="text-sm font-medium">{calculateAge(flock.placementDate)} days</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column - Stats */}
                                        <div className={`md:w-1/3 p-4 md:p-6 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-200 ${parseFloat(calculateMortalityRate(flock)) > 5
                                                ? 'bg-red-50'
                                                : parseFloat(calculateMortalityRate(flock)) > 2
                                                    ? 'bg-amber-50'
                                                    : 'bg-green-50'
                                            }`}>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                                                    <span className="text-xs font-medium text-gray-500 uppercase block">Initial</span>
                                                    <span className="text-lg font-bold text-gray-900">{flock.initialCount}</span>
                                                </div>
                                                <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                                                    <span className="text-xs font-medium text-gray-500 uppercase block">Current</span>
                                                    <span className="text-lg font-bold text-gray-900">{flock.currentCount || flock.initialCount}</span>
                                                </div>
                                                <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                                                    <span className="text-xs font-medium text-gray-500 uppercase block">Mortality</span>
                                                    <span className={`text-lg font-bold ${parseFloat(calculateMortalityRate(flock)) > 5
                                                            ? 'text-red-600'
                                                            : parseFloat(calculateMortalityRate(flock)) > 2
                                                                ? 'text-amber-600'
                                                                : 'text-green-600'
                                                        }`}>
                                                        {calculateMortalityRate(flock)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlockManagement;