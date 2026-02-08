import { Link } from "react-router-dom";
import moment from "moment";
import { useGetPetsQuery } from "../../redux/api/petApiSlice";
import AdminMenu from "../../components/AdminMenu";
import Loader from "../../components/Loader";
import { 
  FaDog, 
  FaCat, 
  FaPaw, 
  FaBirthdayCake, 
  FaWeight, 
  FaVenusMars,
  FaUser,
  FaCalendar,
  FaSearch,
  FaFilter
} from "react-icons/fa";
import { useState } from "react";

const AllPets = () => {
  const { data: pets = [], isLoading, isError } = useGetPetsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const getPetTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'dog': return <FaDog className="text-blue-500" />;
      case 'cat': return <FaCat className="text-orange-500" />;
      default: return <FaPaw className="text-gray-500" />;
    }
  };

  const getPetTypeColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'dog': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cat': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter pets based on search and filter
  const filteredPets = pets.filter(pet => {
    const matchesSearch = 
      pet.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.petType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      typeFilter === "all" || 
      pet.petType?.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  // Sort pets by creation date (newest first) - Create a copy first!
  const sortedPets = [...filteredPets].sort((a, b) => {
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  // Get recently added pets (first 3) - Also create a copy
  const recentPets = [...pets]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Pets</h3>
            <p className="text-gray-600 mb-6">Unable to load pet information. Please try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-navigray text-white rounded-lg hover:bg-navigray-dark transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">All Pets</h1>
                  <p className="text-gray-600 mt-2">
                    Manage all registered pets in the system ({sortedPets.length} of {pets.length} shown)
                  </p>
                </div>
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search pets by name, type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                    />
                  </div>
                  <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                  >
                    <option value="all">All Types</option>
                    <option value="dog">Dogs</option>
                    <option value="cat">Cats</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pet Cards Grid */}
            {sortedPets.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaPaw className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pets Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || typeFilter !== "all" 
                    ? "No pets match your search criteria. Try adjusting your filters." 
                    : "No pets have been registered in the system yet."}
                </p>
                <Link 
                  to="/admin/add-pet" 
                  className="inline-flex items-center px-6 py-3 bg-navigray text-white rounded-lg hover:bg-navigray-dark transition-colors"
                >
                  <FaPaw className="mr-2" />
                  Add First Pet
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedPets.map((pet) => (
                  <div key={pet._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Pet Image */}
                    <div className="h-48 bg-gray-100 relative">
                      <img
                        src={pet.petImages || "/images/default-pet.png"}
                        alt={pet.petName || pet.petType}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPetTypeColor(pet.petType)}`}>
                          {getPetTypeIcon(pet.petType)}
                          <span className="ml-1">{pet.petType || "Pet"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Pet Info */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 truncate">
                          {pet.petName || "Unnamed Pet"}
                        </h3>
                        {pet.breed && (
                          <p className="text-sm text-gray-600 mt-1">{pet.breed}</p>
                        )}
                      </div>

                      {/* Pet Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <FaBirthdayCake className="w-4 h-4 mr-3 text-gray-400" />
                          <span>{pet.age || "Unknown"} years old</span>
                        </div>
                        {pet.gender && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaVenusMars className="w-4 h-4 mr-3 text-gray-400" />
                            <span>{pet.gender}</span>
                          </div>
                        )}
                        {pet.weight && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaWeight className="w-4 h-4 mr-3 text-gray-400" />
                            <span>{pet.weight} kg</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <FaUser className="w-4 h-4 mr-3 text-gray-400" />
                          <span className="truncate">{pet.ownerId?.fullName || "Unknown Owner"}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FaCalendar className="w-4 h-4 mr-3 text-gray-400" />
                          <span>Added {moment(pet.createdAt).format("MMM D, YYYY")}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <Link
                          to={`/pet/${pet._id}`}
                          className="flex-1 mr-2 px-4 py-2 bg-navigray text-white rounded-lg hover:bg-navigray-dark transition-colors text-center font-medium"
                        >
                          View Details
                        </Link>
                        <Link
                          to={`/admin/edit-pet/${pet._id}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats Summary */}
            {sortedPets.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <FaDog className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Dogs</div>
                      <div className="text-xl font-semibold">
                        {pets.filter(p => p.petType?.toLowerCase() === 'dog').length}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <FaCat className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Cats</div>
                      <div className="text-xl font-semibold">
                        {pets.filter(p => p.petType?.toLowerCase() === 'cat').length}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <FaPaw className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Other Pets</div>
                      <div className="text-xl font-semibold">
                        {pets.filter(p => !['dog', 'cat'].includes(p.petType?.toLowerCase())).length}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <FaUser className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Active Owners</div>
                      <div className="text-xl font-semibold">
                        {[...new Set(pets.map(p => p.ownerId?._id).filter(Boolean))].length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4">
            <AdminMenu />
            
            {/* Quick Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Pets</span>
                  <span className="font-semibold">{pets.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Age</span>
                  <span className="font-semibold">
                    {pets.length > 0 
                      ? (pets.reduce((sum, pet) => sum + (parseFloat(pet.age) || 0), 0) / pets.length).toFixed(1)
                      : 0
                    } yrs
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pets with Owners</span>
                  <span className="font-semibold">
                    {pets.filter(p => p.ownerId).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Registered Today</span>
                  <span className="font-semibold">
                    {pets.filter(p => moment(p.createdAt).isSame(moment(), 'day')).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/admin/add-pet"
                  className="block w-full px-4 py-3 bg-navigray text-white rounded-lg hover:bg-navigray-dark transition-colors text-center font-medium"
                >
                  Add New Pet
                </Link>
                <Link
                  to="/admin/pets/import"
                  className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Import Pets
                </Link>
                <button
                  onClick={() => window.print()}
                  className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Export List
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            {recentPets.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recently Added</h3>
                <div className="space-y-4">
                  {recentPets.map((pet) => (
                    <div key={pet._id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={pet.petImages || "/images/default-pet.png"}
                          alt={pet.petName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {pet.petName || "Unnamed"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {pet.petType} • {moment(pet.createdAt).fromNow()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllPets;