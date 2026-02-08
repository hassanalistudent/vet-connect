import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaTrash, 
  FaEdit, 
  FaCheck, 
  FaEye, 
  FaSearch, 
  FaFilter,
  FaUser,
  FaUserMd,
  FaUserShield,
  FaPaw,
  FaTimes
} from "react-icons/fa";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../redux/api/userApiSlice";
import Message from "../../components/Message";
import AdminMenu from "../../components/AdminMenu";

export const UserList = () => {
  const {
    data: users = [],
    refetch,
    isLoading,
    error,
  } = useGetUsersQuery();

  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  // State for editable user
  const [editableUserId, setEditableUserId] = useState(null);
  const [editableFullName, setEditableFullName] = useState("");
  const [editableUserEmail, setEditableUserEmail] = useState("");
  const [editableUserRole, setEditableUserRole] = useState("");

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Refetch on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Filter and sort users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user._id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    switch(sortBy) {
      case "newest":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case "oldest":
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case "name":
        return (a.fullName || "").localeCompare(b.fullName || "");
      default:
        return 0;
    }
  });

  const deleteHandler = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      try {
        await deleteUser(id).unwrap();
        toast.success("User deleted successfully");
        refetch();
      } catch (error) {
        toast.error(error?.data?.message || error?.error || "Delete failed");
      }
    }
  };

  const toggleEdit = (id, fullName, email, role) => {
    setEditableUserId(id);
    setEditableFullName(fullName);
    setEditableUserEmail(email);
    setEditableUserRole(role);
  };

  const cancelEdit = () => {
    setEditableUserId(null);
    setEditableFullName("");
    setEditableUserEmail("");
    setEditableUserRole("");
  };

  const updateHandler = async (id) => {
    if (!editableFullName.trim() || !editableUserEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      await updateUser({
        userId: id,
        fullName: editableFullName.trim(),
        email: editableUserEmail.trim(),
        role: editableUserRole,
      }).unwrap();

      setEditableUserId(null);
      refetch();
      toast.success("User updated successfully");
    } catch (error) {
      toast.error(error?.data?.message || error?.error || "Update failed");
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case "Admin": return <FaUserShield className="text-purple-500" />;
      case "Doctor": return <FaUserMd className="text-blue-500" />;
      case "PetOwner": return <FaPaw className="text-green-500" />;
      default: return <FaUser className="text-gray-500" />;
    }
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case "Admin": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Doctor": return "bg-blue-100 text-blue-800 border-blue-200";
      case "PetOwner": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Message variant="danger">
            {error?.data?.message || error.message || "Failed to load users"}
          </Message>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <AdminMenu />
            
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">User Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Users</span>
                  <span className="font-semibold">{users.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-600">Admins</span>
                  <span className="font-semibold">
                    {users.filter(u => u.role === "Admin").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600">Doctors</span>
                  <span className="font-semibold">
                    {users.filter(u => u.role === "Doctor").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">Pet Owners</span>
                  <span className="font-semibold">
                    {users.filter(u => u.role === "PetOwner").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Regular Users</span>
                  <span className="font-semibold">
                    {users.filter(u => !["Admin", "Doctor", "PetOwner"].includes(u.role)).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                  <p className="text-gray-600 mt-2">
                    Manage all system users ({filteredUsers.length} of {users.length} shown)
                  </p>
                </div>
                
                {/* Export/Import buttons could go here */}
              </div>

              {/* Filters and Search */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <FaTimes className="text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Role Filter */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFilter className="text-gray-400" />
                  </div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray appearance-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Doctor">Doctor</option>
                    <option value="PetOwner">Pet Owner</option>
                    <option value="User">Regular User</option>
                  </select>
                </div>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                >
                  <option value="newest">Sort by: Newest First</option>
                  <option value="oldest">Sort by: Oldest First</option>
                  <option value="name">Sort by: Name A-Z</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaUser className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">
                  {searchTerm || roleFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "No users have been added yet"}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Table Header */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          {/* User Column */}
                          <td className="px-6 py-4">
                            {editableUserId === user._id ? (
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {getRoleIcon(editableUserRole)}
                                </div>
                                <input
                                  type="text"
                                  value={editableFullName}
                                  onChange={(e) => setEditableFullName(e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                                  placeholder="Full Name"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {getRoleIcon(user.role)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{user.fullName}</div>
                                  <div className="text-sm text-gray-500 font-mono">ID: {user._id.slice(-8)}</div>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Email Column */}
                          <td className="px-6 py-4">
                            {editableUserId === user._id ? (
                              <input
                                type="email"
                                value={editableUserEmail}
                                onChange={(e) => setEditableUserEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                                placeholder="Email"
                              />
                            ) : (
                              <div className="text-gray-900">{user.email}</div>
                            )}
                          </td>

                          {/* Role Column */}
                          <td className="px-6 py-4">
                            {editableUserId === user._id ? (
                              <div className="flex items-center space-x-2">
                                <select
                                  value={editableUserRole}
                                  onChange={(e) => setEditableUserRole(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                                >
                                  <option value="User">User</option>
                                  <option value="PetOwner">Pet Owner</option>
                                  <option value="Doctor">Doctor</option>
                                  <option value="Admin">Admin</option>
                                </select>
                              </div>
                            ) : (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeClass(user.role)}`}>
                                {getRoleIcon(user.role)}
                                <span className="ml-1">{user.role}</span>
                              </span>
                            )}
                          </td>

                          {/* Actions Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              {editableUserId === user._id ? (
                                <>
                                  <button
                                    onClick={() => updateHandler(user._id)}
                                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center"
                                    title="Save changes"
                                  >
                                    <FaCheck className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
                                    title="Cancel"
                                  >
                                    <FaTimes className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => toggleEdit(user._id, user.fullName, user.email, user.role)}
                                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                    title="Edit user"
                                  >
                                    <FaEdit className="w-4 h-4" />
                                  </button>
                                  <Link
                                    to={`/${user._id}`}
                                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors flex items-center"
                                    title="View profile"
                                  >
                                    <FaEye className="w-4 h-4" />
                                  </Link>
                                  {user.role !== "Admin" && (
                                    <button
                                      onClick={() => deleteHandler(user._id, user.fullName)}
                                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                      title="Delete user"
                                    >
                                      <FaTrash className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>
                      Showing <span className="font-semibold">{filteredUsers.length}</span> of{" "}
                      <span className="font-semibold">{users.length}</span> users
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setRoleFilter("all");
                          setSortBy("newest");
                        }}
                        className="text-navigray hover:text-navigray-dark font-medium"
                      >
                        Clear filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;