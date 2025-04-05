import React, { useState } from 'react';
import { Map, MapPin, Phone, Clock, Star, Filter, Heart, Navigation, Search } from 'lucide-react';

const VetLocator = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteVets, setFavoriteVets] = useState([]);

  // Mock data for vets
  const vets = [
    {
      id: 1,
      name: "Pawsome Care Veterinary Clinic",
      address: "123 Animal Lane, Farmington",
      distance: "1.2",
      rating: 4.8,
      reviews: 123,
      hours: "Open · Closes 6 PM",
      phone: "(555) 123-4567",
      specialties: ["Small Animals", "Emergency"],
      image: "/api/placeholder/60/60"
    },
    {
      id: 2,
      name: "Countryside Livestock Veterinary",
      address: "456 Rural Road, Farmington",
      distance: "2.5",
      rating: 4.6,
      reviews: 89,
      hours: "Open · Closes 5 PM",
      phone: "(555) 987-6543",
      specialties: ["Large Animals", "Farm Calls"],
      image: "/api/placeholder/60/60"
    },
    {
      id: 3,
      name: "All Creatures Animal Hospital",
      address: "789 Pet Boulevard, Farmington",
      distance: "3.7",
      rating: 4.9,
      reviews: 215,
      hours: "Open · Closes 8 PM",
      phone: "(555) 456-7890",
      specialties: ["Exotic Pets", "Surgery"],
      image: "/api/placeholder/60/60"
    },
    {
      id: 4,
      name: "FarmVet Mobile Services",
      address: "Serves all of Farmington County",
      distance: "0.8",
      rating: 4.7,
      reviews: 56,
      hours: "Open · Closes 6 PM",
      phone: "(555) 234-5678",
      specialties: ["Mobile", "Farm Calls"],
      image: "/api/placeholder/60/60"
    },
    {
      id: 5,
      name: "Green Pastures Equine Clinic",
      address: "321 Horse Trail, Farmington",
      distance: "4.1",
      rating: 4.5,
      reviews: 78,
      hours: "Open · Closes 5:30 PM",
      phone: "(555) 876-5432",
      specialties: ["Equine", "Reproductive"],
      image: "/api/placeholder/60/60"
    }
  ];

  // Toggle favorite status
  const toggleFavorite = (vetId) => {
    if (favoriteVets.includes(vetId)) {
      setFavoriteVets(favoriteVets.filter(id => id !== vetId));
    } else {
      setFavoriteVets([...favoriteVets, vetId]);
    }
  };

  // Filter vets based on activeFilter and searchTerm
  const filteredVets = vets.filter(vet => {
    // Apply specialty filter
    const passesFilter = activeFilter === 'all' || 
      vet.specialties.some(s => s.toLowerCase().includes(activeFilter.toLowerCase()));
    
    // Apply search term
    const passesSearch = searchTerm === '' || 
      vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return passesFilter && passesSearch;
  });

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

        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <button className="relative p-1 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Icon */}
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-medium text-green-800">
            US
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-72px)]">
        {/* Left Panel - Vet Listings */}
        <div className="w-1/2 p-4 overflow-y-auto border-r">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">Veterinarians Near You</h1>
            <p className="text-gray-600">Find the best veterinary care for your animals</p>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="relative flex-1 mr-2">
                <input
                  type="text"
                  placeholder="Search for vets, specialties, locations..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
              <button className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">
                <Filter className="h-5 w-5 text-gray-600 mr-2" />
                <span>Filters</span>
              </button>
            </div>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1 rounded-full text-sm ${activeFilter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm ${activeFilter === 'small animals' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setActiveFilter('small animals')}
              >
                Small Animals
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm ${activeFilter === 'large animals' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setActiveFilter('large animals')}
              >
                Large Animals
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm ${activeFilter === 'equine' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setActiveFilter('equine')}
              >
                Equine
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm ${activeFilter === 'mobile' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setActiveFilter('mobile')}
              >
                Mobile
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm ${activeFilter === 'emergency' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => setActiveFilter('emergency')}
              >
                Emergency
              </button>
            </div>
          </div>

          {/* Vet Listings */}
          <div className="space-y-4">
            {filteredVets.map(vet => (
              <div key={vet.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex">
                  <img src={vet.image} alt={vet.name} className="w-16 h-16 rounded-lg object-cover mr-4" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-medium text-gray-800">{vet.name}</h2>
                      <button 
                        onClick={() => toggleFavorite(vet.id)} 
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Heart className={`h-5 w-5 ${favoriteVets.includes(vet.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {vet.address}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Clock className="h-4 w-4 mr-1" />
                      {vet.hours}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {vet.specialties.map((specialty, idx) => (
                        <span key={idx} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                          {specialty}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{vet.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({vet.reviews})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100">
                          <Navigation className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredVets.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500">No veterinarians found matching your criteria.</p>
                <button 
                  className="mt-2 text-green-600 hover:text-green-700" 
                  onClick={() => {
                    setActiveFilter('all');
                    setSearchTerm('');
                  }}
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Map View */}
        <div className="w-1/2 bg-gray-100 relative">
          {/* Map Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="text-center">
              <Map className="h-16 w-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Map View</p>
              <p className="text-sm text-gray-400">Shows locations of nearby veterinarians</p>
            </div>
          </div>

          {/* Location Info Card (positioned over map) */}
          <div className="absolute top-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Your Location</h3>
              <span className="text-sm text-green-600">Change</span>
            </div>
            <p className="text-gray-600 text-sm">123 Farmer's Road, Farmington</p>
            <div className="mt-2 pt-2 border-t flex items-center justify-between">
              <span className="text-sm text-gray-500">Showing vets within 10 miles</span>
              <button className="text-sm text-green-600">Expand Search</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VetLocator;