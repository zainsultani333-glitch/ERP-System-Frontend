import { useEffect, useState, useRef } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../Service/Api";
import { FiPlus, FiEye, FiEdit3, FiTrash2, FiUser, FiPhone, FiMail, FiBriefcase, FiDollarSign, FiCalendar, FiCreditCard, FiUsers } from "react-icons/fi";
import { FaUserTie } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import gsap from "gsap";

const initialState = {
  name: "",
  cnic: "",
  phone: "",
  department: "",
  designation: "",
  email: "",
  salary: "",
  dateOfJoining: "",
};

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isView, setIsView] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);
  const sliderRef = useRef(null);

  // 🔄 Load employees
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
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

  // ✍️ handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ➕ Add Employee
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Employee name is required");
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await updateEmployee(editingId, form);
        toast.success("Employee updated successfully");
      } else {
        await createEmployee(form);
        toast.success("Employee created successfully");
      }

      setForm(initialState);
      setEditingId(null);
      setIsEdit(false);
      setIsView(false);
      setIsSliderOpen(false);
      loadEmployees();
    } catch (err) {
      console.log(err);
      toast.error(editingId ? "Failed to update employee" : "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Edit
  const handleEdit = (emp) => {
    setForm(emp);
    setEditingId(emp._id);
    setIsEdit(true);
    setIsView(false);
    setIsSliderOpen(true);
  };

  // 👁️ View
  const handleView = (emp) => {
    setViewEmployee(emp);
    setIsView(true);
    setIsEdit(false);
    setIsSliderOpen(true);
  };

  // ❌ Delete
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
        text: `Employee "${name}" will be deleted.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteEmployee(id);
            loadEmployees();
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Employee deleted successfully.",
              "success"
            );
          } catch (error) {
            console.log(error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete employee.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Employee is safe 🙂",
            "error"
          );
        }
      });
  };

  // 🚪 Open create modal
  const openCreateModal = () => {
    setForm(initialState);
    setEditingId(null);
    setIsEdit(false);
    setIsView(false);
    setViewEmployee(null);
    setIsSliderOpen(true);
  };

  // 🔒 Close modal
  const closeModal = () => {
    setIsSliderOpen(false);
    setIsEdit(false);
    setIsView(false);
    setViewEmployee(null);
    setEditingId(null);
    setForm(initialState);
  };

  // Format salary
  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaUserTie className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-primary">Employee Management</h1>
            <p className="text-gray-500 text-sm">Manage your workforce and employee records</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2"
            onClick={openCreateModal}
          >
            <FiPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="rounded-xl shadow-lg p-6 border border-gray-200 w-full overflow-hidden bg-white">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[1200px]">
            {/* Table Headers */}
            <div className="grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr_1.5fr] gap-4 bg-gradient-to-r from-gray-50 to-gray-100 py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 rounded-t-lg">
              <div>Name</div>
              <div>CNIC</div>
              <div>Contact</div>
              <div>Department</div>
              <div>Designation</div>
              <div>Salary</div>
              <div>Joining Date</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Employees List */}
            <div className="flex flex-col">
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  Loading employees...
                </div>
              ) : employees.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No employees found. Click "Add Employee" to create one.
                </div>
              ) : (
                employees.map((employee, index) => (
                  <div
                    key={employee._id}
                    className={`grid grid-cols-[1.5fr_1fr_1.5fr_1.5fr_1.5fr_1.5fr_1fr_1.5fr] gap-4 items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    {/* Name */}
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            ID: {employee._id?.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CNIC */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FiCreditCard className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{employee.cnic || "—"}</span>
                      </div>
                    </div>

                    {/* Contact */}
                    <div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <FiPhone className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{employee.phone || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMail className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{employee.email || "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Department */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FiBriefcase className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{employee.department || "—"}</span>
                      </div>
                    </div>

                    {/* Designation */}
                    <div>
                      <span className="text-sm text-gray-600">{employee.designation || "—"}</span>
                    </div>

                    {/* Salary */}
                    <div>
                      <div className="flex items-center gap-1">
                        <FiDollarSign className="w-3 h-3 text-success" />
                        <span className="text-sm font-semibold text-success">
                          {employee.salary ? formatSalary(employee.salary) : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Joining Date */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={() => handleView(employee)}
                        className="text-blue-600 hover:bg-blue-100 bg-blue-50 p-2 rounded-md transition"
                        title="View Employee"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-green-600 hover:bg-green-100 bg-green-50 p-2 rounded-md transition"
                        title="Edit Employee"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id, employee.name)}
                        className="text-red-600 hover:bg-red-100 bg-red-50 p-2 rounded-md transition"
                        title="Delete Employee"
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
        {employees.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-500">
            Total Employees: {employees.length}
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
                    <FaUserTie className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary">
                      {isView ? "View Employee" : isEdit ? "Edit Employee" : "Add New Employee"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {isView 
                        ? "View employee details" 
                        : isEdit 
                        ? "Update employee information" 
                        : "Add a new employee to the system"}
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
            {isView && viewEmployee ? (
              // View Mode
              <div className="space-y-6">
                <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gray-100/40">
                  <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">Employee Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Full Name</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-primary" />
                        {viewEmployee.name}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">CNIC</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                        <FiCreditCard className="w-4 h-4 text-primary" />
                        {viewEmployee.cnic || "—"}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                        <FiPhone className="w-4 h-4 text-primary" />
                        {viewEmployee.phone || "—"}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email Address</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                        <FiMail className="w-4 h-4 text-primary" />
                        {viewEmployee.email || "—"}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Department</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                        <FiBriefcase className="w-4 h-4 text-primary" />
                        {viewEmployee.department || "—"}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Designation</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                        {viewEmployee.designation || "—"}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Salary</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                        <FiDollarSign className="w-4 h-4 text-success" />
                        <span className="font-semibold text-success">
                          {viewEmployee.salary ? formatSalary(viewEmployee.salary) : "—"}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Date of Joining</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-primary" />
                        {viewEmployee.dateOfJoining ? new Date(viewEmployee.dateOfJoining).toLocaleDateString() : "—"}
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
                  {/* Section: Employee Details */}
                  <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gray-100/40 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-2">
                      <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
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

                      {/* CNIC */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">CNIC</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiCreditCard className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="cnic"
                            placeholder="Enter CNIC number"
                            value={form.cnic}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiPhone className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            placeholder="Enter phone number"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
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
                          />
                        </div>
                      </div>

                      {/* Department */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Department</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiBriefcase className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="department"
                            placeholder="Enter department"
                            value={form.department}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400"
                          />
                        </div>
                      </div>

                      {/* Designation */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Designation</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaUserTie className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="designation"
                            placeholder="Enter designation"
                            value={form.designation}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400"
                          />
                        </div>
                      </div>

                      {/* Salary */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Salary</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiDollarSign className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            name="salary"
                            placeholder="Enter salary amount"
                            value={form.salary}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400"
                          />
                        </div>
                      </div>

                      {/* Date of Joining */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Date of Joining</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiCalendar className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            name="dateOfJoining"
                            value={form.dateOfJoining}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400"
                          />
                        </div>
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
                            {loading ? "Updating..." : "Update Employee"}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {loading ? "Creating..." : "Create Employee"}
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
}