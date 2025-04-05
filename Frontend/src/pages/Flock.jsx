import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FlockManagement = () => {
    const navigate = useNavigate();
    const [flocks, setFlocks] = useState([
        {
            id: "BATCH-001",
            name: "Spring Layers 2025",
            breed: "ISA Brown",
            placementDate: "2025-03-12",
            initialCount: 1000,
            mortalityRecords: [
                { date: "2025-03-13", count: 2, notes: "Weak chicks" },
                { date: "2025-03-14", count: 1, notes: "Unknown cause" },
            ],
            status: "active"
        },
        {
            id: "BATCH-002",
            name: "Broilers March 2025",
            breed: "Cobb 500",
            placementDate: "2025-03-01",
            initialCount: 500,
            mortalityRecords: [
                { date: "2025-03-02", count: 1, notes: "Transportation stress" },
                { date: "2025-03-05", count: 2, notes: "Heat stress" },
            ],
            status: "active"
        }
    ]);

    const [expandedFlockId, setExpandedFlockId] = useState(null);
    const [showNewFlockForm, setShowNewFlockForm] = useState(false);
    const [newFlock, setNewFlock] = useState({
        name: "",
        breed: "",
        placementDate: "",
        initialCount: "",
        mortalityRecords: []
    });

    // Available breed options
    const breedOptions = [
        { value: "ISA Brown", category: "Layer" },
        { value: "Hyline", category: "Layer" },
        { value: "Lohmann Brown", category: "Layer" },
        { value: "Cobb 500", category: "Broiler" },
        { value: "Ross 308", category: "Broiler" },
        { value: "Arbor Acres", category: "Broiler" }
    ];

    // Handler for adding a new flock
    const handleAddFlock = (e) => {
        e.preventDefault();
        const flockId = `BATCH-${String(flocks.length + 1).padStart(3, '0')}`;

        setFlocks([...flocks, {
            ...newFlock,
            id: flockId,
            status: "active",
            mortalityRecords: []
        }]);

        setNewFlock({
            name: "",
            breed: "",
            placementDate: "",
            initialCount: "",
            mortalityRecords: []
        });

        setShowNewFlockForm(false);
    };



    // Handler for removing a flock
    const handleRemoveFlock = (e, flockId) => {
        e.stopPropagation(); // Prevent the click from triggering the navigation
        if (window.confirm("Are you sure you want to remove this batch?")) {
            setFlocks(flocks.filter(flock => flock.id !== flockId));
            if (expandedFlockId === flockId) {
                setExpandedFlockId(null);
            }
        }
    };

    // Handler for navigating to detail page based on flock type
    const navigateToFlockDetails = (flock) => {
        const isLayer = ["ISA Brown", "Hyline", "Lohmann Brown"].includes(flock.breed);
        const route = isLayer ? `/layer/${flock.id}` : `/broiler/${flock.id}`;
        navigate(route);
    };

    // Calculate current count (initial - mortality)
    const calculateCurrentCount = (flock) => {
        const totalMortality = flock.mortalityRecords.reduce((sum, record) => sum + parseInt(record.count || 0), 0);
        return flock.initialCount - totalMortality;
    };

    // Calculate mortality rate
    const calculateMortalityRate = (flock) => {
        const totalMortality = flock.mortalityRecords.reduce((sum, record) => sum + parseInt(record.count || 0), 0);
        return ((totalMortality / flock.initialCount) * 100).toFixed(2);
    };

    // Calculate age in days
    const calculateAge = (placementDate) => {
        return Math.floor((new Date() - new Date(placementDate)) / (1000 * 60 * 60 * 24));
    };

    // Function to get gradient color based on flock type
    const getFlockTypeColor = (breed) => {
        const layerBreeds = ["ISA Brown", "Hyline", "Lohmann Brown"];
        return layerBreeds.includes(breed)
            ? "from-amber-500 to-amber-400"  // Layer type
            : "from-blue-500 to-blue-400";   // Broiler type
    };

    // Function to determine if a flock is a layer
    const isLayerFlock = (breed) => {
        const layerBreeds = ["ISA Brown", "Hyline", "Lohmann Brown"];
        return layerBreeds.includes(breed);
    };

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
                                    onChange={(e) => setNewFlock({ ...newFlock, breed: e.target.value })}
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
                                key={flock.id}
                                className={`bg-white rounded-xl shadow-md overflow-hidden transform transition hover:-translate-y-1 hover:shadow-lg border-l-4 ${isLayerFlock(flock.breed) ? "border-amber-500" : "border-blue-500"
                                    }`}
                            >
                                {/* Flock Card */}
                                <div className="relative">
                                    {/* Colored accent at the top of the card */}
                                    <div className={`h-2 bg-gradient-to-r ${getFlockTypeColor(flock.breed)} w-full absolute top-0`}></div>

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
                                                        <span className={`ml-2 px-2 py-0.5 text-xs ${flock.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                            } rounded-full font-medium`}>
                                                            {flock.status === 'active' ? 'Active' : 'Completed'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">ID: {flock.id}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`inline-flex items-center justify-center rounded-full ${isLayerFlock(flock.breed)
                                                            ? "text-amber-700 bg-amber-50"
                                                            : "text-blue-700 bg-blue-50"
                                                        } px-2 py-1 text-xs`}>
                                                        {isLayerFlock(flock.breed) ? "Layer" : "Broiler"}
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleRemoveFlock(e, flock.id)}
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
                                                    <span className="text-xs font-medium text-gray-500 uppercase block">Placements</span>
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
                                                    <span className="text-lg font-bold text-gray-900">{calculateCurrentCount(flock)}</span>
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