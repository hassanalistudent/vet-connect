import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit, FaCheck, FaEye } from "react-icons/fa";
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

  const [editableUserId, setEditableUserId] = useState(null);
  const [editableFullName, setEditableFullName] = useState("");
  const [editableUserEmail, setEditableUserEmail] = useState("");
  const [editableUserRole, setEditableUserRole] = useState("");

  // Optional: keep a local copy if you want instant UI updates without waiting for refetch
  // const [localUsers, setLocalUsers] = useState([]);
  // useEffect(() => {
  //   if (users) setLocalUsers(users);
  // }, [users]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure?")) {
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

  const updateHandler = async (id) => {
    try {
      const updated = await updateUser({
        userId: id,
        fullName: editableFullName,
        email: editableUserEmail,
        role: editableUserRole,
      }).unwrap();

      // Clear editing state
      setEditableUserId(null);

      // Option 1: rely on refetch (simpler, but slightly delayed)
      refetch();

      // Option 2 (optional): update local state instantly if you maintain localUsers
      // setLocalUsers((prev) =>
      //   prev.map((u) => (u._id === updated._id ? updated : u))
      // );

      toast.success("User updated successfully");
    } catch (error) {
      toast.error(error?.data?.message || error?.error || "Update failed");
    }
  };

  return (
    <div className="p-4">
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.message}
        </Message>
      ) : (
        <div className="flex flex-col md:flex-row">
          <AdminMenu />
          <table className="w-full md:w-4/5 mx-auto border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">FULL NAME</th>
                <th className="px-4 py-2 text-left">EMAIL</th>
                <th className="px-4 py-2 text-left">ROLE</th>
                <th className="px-4 py-2 text-left">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-4 py-2 text-xs md:text-sm">
                    {user._id}
                  </td>

                  {/* Editable Full Name */}
                  <td className="px-4 py-2">
                    {editableUserId === user._id ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={editableFullName}
                          onChange={(e) =>
                            setEditableFullName(e.target.value)
                          }
                          className="w-full p-2 border rounded-lg"
                        />
                        <button
                          onClick={() => updateHandler(user._id)}
                          className="ml-2 bg-blue-500 text-white py-2 px-3 rounded-lg"
                        >
                          <FaCheck />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {user.fullName}
                        <button
                          onClick={() =>
                            toggleEdit(
                              user._id,
                              user.fullName,
                              user.email,
                              user.role
                            )
                          }
                        >
                          <FaEdit className="ml-4" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Editable Email */}
                  <td className="px-4 py-2">
                    {editableUserId === user._id ? (
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={editableUserEmail}
                          onChange={(e) =>
                            setEditableUserEmail(e.target.value)
                          }
                          className="w-full p-2 border rounded-lg"
                        />
                        <button
                          onClick={() => updateHandler(user._id)}
                          className="ml-2 bg-blue-500 text-white py-2 px-3 rounded-lg"
                        >
                          <FaCheck />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {user.email}
                        <button
                          onClick={() =>
                            toggleEdit(
                              user._id,
                              user.fullName,
                              user.email,
                              user.role
                            )
                          }
                        >
                          <FaEdit className="ml-4" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Editable Role */}
                  <td className="px-4 py-2">
                    {editableUserId === user._id ? (
                      <div className="flex items-center">
                        <select
                          value={editableUserRole}
                          onChange={(e) =>
                            setEditableUserRole(e.target.value)
                          }
                          className="w-full p-2 border rounded-lg"
                        >
                          <option value="User">User</option>
                          <option value="Doctor">Doctor</option>
                          <option value="PetOwner">Pet Owner</option>
                          <option value="Admin">Admin</option>
                        </select>
                        <button
                          onClick={() => updateHandler(user._id)}
                          className="ml-2 bg-blue-500 text-white py-2 px-3 rounded-lg"
                        >
                          <FaCheck />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {user.role}
                        <button
                          onClick={() =>
                            toggleEdit(
                              user._id,
                              user.fullName,
                              user.email,
                              user.role
                            )
                          }
                        >
                          <FaEdit className="ml-4" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Actions: View + Delete */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {/* View details link */}
                      <Link
                        to={`/${user._id}`}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 rounded flex items-center text-xs md:text-sm"
                      >
                        <FaEye className="mr-1" /> View
                      </Link>

                      {/* Delete (hide for admins if needed) */}
                      {user.role !== "Admin" && (
                        <button
                          onClick={() => deleteHandler(user._id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;
