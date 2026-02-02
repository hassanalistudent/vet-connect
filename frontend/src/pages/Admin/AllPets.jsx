import { Link } from "react-router-dom";
import moment from "moment";
import { useGetPetsQuery } from "../../redux/api/petApiSlice";
import AdminMenu from "../../components/AdminMenu";
import Loader from "../../components/Loader";

const AllPets = () => {
  const { data: pets = [], isLoading, isError } = useGetPetsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div>Error loading pets</div>;
  }

  return (
    <div className="container mx-[9rem]">
      <div className="flex flex-col md:flex-row">
        {/* Left: content */}
        <div className="p-3 md:w-3/4">
          <div className="ml-[2rem] text-xl font-bold h-12">
            All Pets ({pets.length})
          </div>

          {/* Grid layout: 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {pets.map((pet) => (
              <div
                key={pet._id}
                className="flex border rounded-lg p-4 shadow-sm"
              >
                {/* ✅ FIXED: Images as STRING - not array */}
                <img
                  src={
                    pet.petImages 
                      ? pet.petImages 
                      : "/images/default-pet.png"
                  }
                  alt={pet.petName || pet.petType}
                  className="w-32 h-32 object-cover rounded-md mr-4"
                />

                {/* Details on the right */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    {/* ✅ NEW: Show pet name prominently */}
                    <div>
                      <h5 className="text-lg font-semibold">
                        {pet.petName || pet.petType || "Unnamed Pet"}
                      </h5>
                      {pet.petType && (
                        <p className="text-sm text-gray-600">
                          {pet.petType} {pet.breed ? `- ${pet.breed}` : ""}
                        </p>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {pet.createdAt
                        ? moment(pet.createdAt).format("MMMM Do YYYY")
                        : ""}
                    </p>
                  </div>

                  <p className="text-sm text-gray-700 mt-1">
                    Age: <span className="font-semibold">{pet.age ?? "N/A"}</span>{" "}
                    | Gender:{" "}
                    <span className="font-semibold">
                      {pet.gender ?? "N/A"}
                    </span>{" "}
                    | Weight:{" "}
                    <span className="font-semibold">
                      {pet.weight ? `${pet.weight} kg` : "N/A"}
                    </span>
                  </p>

                  <p className="text-gray-600 text-sm mt-2 mb-4">
                    Owner:{" "}
                    <span className="font-semibold">
                      {pet.ownerId?.fullName || "Unknown"}
                    </span>{" "}
                    ({pet.ownerId?.email || "No email"})
                  </p>

                  <Link
                    to={`/pet/${pet._id}`}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-pink-700 rounded-lg hover:bg-pink-800 focus:ring-4 focus:outline-none focus:ring-pink-300"
                  >
                    View / Edit Pet
                    <svg
                      className="w-3.5 h-3.5 ml-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M1 5h12m0 0l-4-4m4 4l-4 4"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin menu on the right */}
        <div className="md:w-1/4 p-3 mt-2">
          <AdminMenu />
        </div>
      </div>
    </div>
  );
};

export default AllPets;
