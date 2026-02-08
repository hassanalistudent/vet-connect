import { useParams, Link } from "react-router-dom";
import moment from "moment";
import { useGetUserPetsQuery } from "../../redux/api/petApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

const UserPets = () => {
  const { id: userId } = useParams(); // /admin/users/:id/pets
  const {
    data: pets = [],
    isLoading,
    isError,
    error,
  } = useGetUserPetsQuery(userId);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="p-4">
        <Message variant="danger">
          {error?.data?.message || "Error loading user pets"}
        </Message>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pets</h1>
            <p className="mt-2 text-gray-600">
              {pets.length} pet{pets.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          
          {/* Add Pet Button (if appropriate) */}
          <Link
            to="/petowner/createpet"
            className="mt-4 md:mt-0 bg-navigray text-white px-6 py-3 rounded-lg font-medium hover:bg-navigray-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navigray flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Add New Pet
          </Link>
        </div>

        {/* Pets Grid */}
        {pets.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Pets Found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              This user hasn't added any pets yet. Pets will appear here once they are registered.
            </p>
            <Link
              to="/petowner/createpet"
              className="inline-flex items-center bg-navigray text-white px-6 py-3 rounded-lg font-medium hover:bg-navigray-dark transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Add Your First Pet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div
                key={pet._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
              >
                {/* Pet Image */}
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={pet.petImages || "/images/default-pet.png"}
                    alt={pet.petName || pet.petType}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-navigray rounded-full text-sm font-medium">
                      {pet.petType || "Pet"}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Pet Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {pet.petName || pet.petType || "Unnamed Pet"}
                      </h3>
                      {pet.breed && (
                        <p className="text-gray-600">{pet.breed}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Added</div>
                      <div className="text-sm font-medium text-gray-700">
                        {pet.createdAt ? moment(pet.createdAt).format("MMM DD") : "—"}
                      </div>
                    </div>
                  </div>

                  {/* Pet Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-navigray">{pet.age || "—"}</div>
                      <div className="text-xs text-gray-600">Years</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-navigray">{pet.weight || "—"}</div>
                      <div className="text-xs text-gray-600">kg</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-navigray">{pet.gender || "—"}</div>
                      <div className="text-xs text-gray-600">Gender</div>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-navigray/10 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Owner</p>
                        <p className="text-sm font-medium">{pet.ownerId?.fullName || "Unknown"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/pet/${pet._id}`}
                    className="w-full mt-4 bg-navigray text-white py-3 px-4 rounded-lg font-medium hover:bg-navigray-dark transition-colors flex items-center justify-center group-hover:shadow-md"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {pets.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Pets Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-navigray">{pets.length}</div>
                <div className="text-sm text-gray-600">Total Pets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-navigray">
                  {pets.filter(p => p.petType === 'Dog').length}
                </div>
                <div className="text-sm text-gray-600">Dogs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-navigray">
                  {pets.filter(p => p.petType === 'Cat').length}
                </div>
                <div className="text-sm text-gray-600">Cats</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-navigray">
                  {pets.filter(p => p.petType !== 'Dog' && p.petType !== 'Cat').length}
                </div>
                <div className="text-sm text-gray-600">Other Pets</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPets;