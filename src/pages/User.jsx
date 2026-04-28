import { useEffect, useState, useRef } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../Service/Api";
import { FiPlus, FiEye, FiEdit3, FiTrash2, FiUser, FiMail, FiLock, FiShield, FiCheckCircle, FiXCircle, FiKey } from "react-icons/fi";
import { FaUsers } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import gsap from "gsap";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "employee",
  permissions: {
    create: false,
    read: true,
    update: false,
    delete: false,
  },
};

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isView, setIsView] = useState(false);
  const sliderRef = useRef(null);

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.log("Fetch users error:", err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Slider animation
  useEffect(() => {
    if (isSliderOpen && sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { scale: 0.7, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [isSliderOpen]);

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= PERMISSION TOGGLE =================
  const handlePermissionChange = (key) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  // ================= SUBMIT (CREATE / UPDATE) =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (editId) {
        await updateUser(editId, form);
        toast.success("User updated successfully");
      } else {
        await createUser(form);
        toast.success("User created successfully");
      }

      setForm(emptyForm);
      setEditId(null);
      setIsEdit(false);
      setIsView(false);
      setIsSliderOpen(false);
      fetchUsers();
    } catch (err) {
      console.log("Save user error:", err);
      toast.error(editId ? "Failed to update user" : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id, name) => {
    const swalWithTailwindButtons = Swal.mixin({
      customClass: {
        actions: "space-x-2",
        confirmButton:
          "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300",
        cancelButton:
          "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300",
      },
      buttonsStyling: false,
    });

    swalWithTailwindButtons
      .fire({
        title: "Are you sure?",
        text: `User "${name}" will be deleted.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteUser(id);
            fetchUsers();
            swalWithTailwindButtons.fire(
              "Deleted!",
              "User deleted successfully.",
              "success"
            );
          } catch (error) {
            console.log(error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete user.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "User is safe 🙂",
            "error"
          );
        }
      });
  };

  // ================= EDIT =================
  const handleEdit = (user) => {
    setEditId(user._id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "employee",
      permissions: {
        create: user.permissions?.create || false,
        read: user.permissions?.read || false,
        update: user.permissions?.update || false,
        delete: user.permissions?.delete || false,
      },
    });
    setIsEdit(true);
    setIsView(false);
    setIsSliderOpen(true);
  };

  // ================= VIEW =================
  const handleView = (user) => {
    setViewUser(user);
    setIsView(true);
    setIsEdit(false);
    setIsSliderOpen(true);
  };

  // ================= OPEN CREATE MODAL =================
  const openCreateModal = () => {
    setForm(emptyForm);
    setEditId(null);
    setIsEdit(false);
    setIsView(false);
    setViewUser(null);
    setIsSliderOpen(true);
  };

  // ================= CLOSE MODAL =================
  const closeModal = () => {
    setIsSliderOpen(false);
    setIsEdit(false);
    setIsView(false);
    setViewUser(null);
    setEditId(null);
    setForm(emptyForm);
  };

  // Get permission count
  const getPermissionCount = (permissions) => {
    return Object.values(permissions || {}).filter(v => v === true).length;
  };

  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin':
        return "bg-purple-100 text-purple-700";
      case 'hr':
        return "bg-pink-100 text-pink-700";
      case 'accounts':
        return "bg-orange-100 text-orange-700";
      case 'employee':
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleDisplayName = (role) => {
    if (role === "accounts") return "Accounts";
    return role;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaUsers className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-primary">User Management</h1>
            <p className="text-gray-500 text-sm">Manage system users and their permissions</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2"
            onClick={openCreateModal}
          >
            <FiPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl shadow-lg p-6 border border-gray-200 w-full overflow-hidden bg-white">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[1000px]">
            {/* Table Headers */}
            <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1.5fr_1.5fr] gap-4 bg-gradient-to-r from-gray-50 to-gray-100 py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 rounded-t-lg">
              <div>User Name</div>
              <div>Email</div>
              <div className="text-center">Role</div>
              <div>Permissions</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Users List */}
            <div className="flex flex-col">
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  Loading users...
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No users found. Click "Add User" to create one.
                </div>
              ) : (
                users.map((user, index) => (
                  <div
                    key={user._id}
                    className={`grid grid-cols-[1.5fr_1.5fr_1fr_1.5fr_1.5fr] gap-4 items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    {/* User Name */}
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            ID: {user._id?.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FiMail className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{user.email}</span>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getRoleBadgeColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>

                    {/* Permissions */}
                    <div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(user.permissions || {}).map(([key, value]) => (
                          value && (
                            <span
                              key={key}
                              className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold capitalize"
                            >
                              {key}
                            </span>
                          )
                        ))}
                        {getPermissionCount(user.permissions) === 0 && (
                          <span className="text-sm text-gray-400">No permissions</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={() => handleView(user)}
                        className="text-blue-600 hover:bg-blue-100 bg-blue-50 p-2 rounded-md transition"
                        title="View User"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-green-600 hover:bg-green-100 bg-green-50 p-2 rounded-md transition"
                        title="Edit User"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id, user.name)}
                        className="text-red-600 hover:bg-red-100 bg-red-50 p-2 rounded-md transition"
                        title="Delete User"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* Total count */}
        {users.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-500">
            Total Users: {users.length}
          </div>
        )}
      </div>

      {/* Slider/Modal for Create/Edit/View */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${
          isSliderOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-gray-600/70 backdrop-blur-0 transition-opacity duration-300 ${
            isSliderOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeModal}
        />

        {/* Slider Content */}
        <div
          ref={sliderRef}
          className={`relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl transform transition-all duration-500 ease-out ${
            isSliderOpen ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
          }`}
        >
          {/* Header with gradient */}
          <div className="sticky top-0 z-10 bg-gray-200 px-8 py-4 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <FaUsers className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary">
                      {isView ? "View User" : isEdit ? "Edit User" : "Add New User"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {isView 
                        ? "View user details and permissions" 
                        : isEdit 
                        ? "Update user information" 
                        : "Create a new system user"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="p-1 hover:bg-white/20 bg-white/10 rounded-xl transition-all duration-300 group backdrop-blur-sm hover:scale-105"
                onClick={closeModal}
              >
                <svg className="w-6 h-6 text-white bg-primary rounded-lg group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-6 overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-hide scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {isView && viewUser ? (
              // View Mode
              <div className="space-y-6">
                <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gray-100/40">
                  <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">User Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Full Name</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-primary" />
                        {viewUser.name}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email Address</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                        <FiMail className="w-4 h-4 text-primary" />
                        {viewUser.email}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <div className="mt-1">
                        <span className={`inline-flex px-3 py-2 rounded-lg text-sm font-semibold capitalize ${getRoleBadgeColor(viewUser.role)}`}>
                          {getRoleDisplayName(viewUser.role)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Permissions</label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(viewUser.permissions || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            {value ? (
                              <FiCheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <FiXCircle className="w-4 h-4 text-danger" />
                            )}
                            <span className={`text-sm capitalize ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                              {key}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Close
                </button>
              </div>
            ) : (
              // Create/Edit Form
              <form onSubmit={handleSubmit}>
                <div className="space-y-8 pb-2">
                  {/* Section: User Details */}
                  <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gray-100/40 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-2">
                      <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">User Information</h3>
                    </div>

                    <div className="space-y-6">
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiUser className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            placeholder="Enter full name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiMail className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            placeholder="Enter email address"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400"
                            required
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          Password {!editId && <span className="text-red-500">*</span>}
                          {editId && <span className="text-xs text-gray-400 ml-2">(Leave blank to keep current)</span>}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiLock className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            name="password"
                            placeholder={editId ? "Enter new password (optional)" : "Enter password"}
                            value={form.password}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400"
                            required={!editId}
                          />
                        </div>
                      </div>

                      {/* Role */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          Role <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiShield className="w-5 h-5 text-gray-400" />
                          </div>
                          <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 appearance-none"
                          >
                            <option value="admin">Admin</option>
                            <option value="hr">HR</option>
                            <option value="accounts">Accounts</option>
                            <option value="employee">Employee</option>
                          </select>
                        </div>
                      </div>

                      {/* Permissions */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <FiKey className="w-4 h-4 text-primary" />
                          Permissions
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {["create", "read", "update", "delete"].map((key) => (
                            <label
                              key={key}
                              className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                                form.permissions[key]
                                  ? "border-primary/50 bg-primary/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={form.permissions[key]}
                                onChange={() => handlePermissionChange(key)}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                              />
                              <span className={`text-sm font-medium capitalize ${form.permissions[key] ? 'text-primary' : 'text-gray-600'}`}>
                                {key}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Select the permissions that this user will have
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-xl hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center gap-3">
                        {isEdit ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {loading ? "Updating..." : "Update User"}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {loading ? "Creating..." : "Create User"}
                          </>
                        )}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;