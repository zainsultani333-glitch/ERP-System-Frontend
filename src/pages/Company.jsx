import { useEffect, useState, useRef } from "react";
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../Service/Api";
import { FiPlus, FiEye, FiEdit3, FiTrash2, FiHome, FiMail, FiPhone, FiMapPin, FiGlobe, FiFileText, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import gsap from "gsap";

const CompanyPage = () => {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    taxNumber: "",
  });
  const [editId, setEditId] = useState(null);
  const [viewCompany, setViewCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isView, setIsView] = useState(false);
  const sliderRef = useRef(null);

  // ================= FETCH =================
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await getCompanies();
      setCompanies(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
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

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      toast.error("Company name is required");
      return;
    }
    
    try {
      setLoading(true);
      if (editId) {
        await updateCompany(editId, form);
        toast.success("Company updated successfully");
      } else {
        await createCompany(form);
        toast.success("Company created successfully");
      }
      
      setForm({
        name: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        taxNumber: "",
      });
      setEditId(null);
      setIsEdit(false);
      setIsView(false);
      setIsSliderOpen(false);
      fetchCompanies();
    } catch (err) {
      console.error(err);
      toast.error(editId ? "Failed to update company" : "Failed to create company");
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
        text: `Company "${name}" will be deleted.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteCompany(id);
            fetchCompanies();
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Company deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete company.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Company is safe 🙂",
            "error"
          );
        }
      });
  };

  // ================= EDIT =================
  const handleEdit = (company) => {
    setForm({
      name: company.name || "",
      address: company.address || "",
      phone: company.phone || "",
      email: company.email || "",
      website: company.website || "",
      taxNumber: company.taxNumber || "",
    });
    setEditId(company._id);
    setIsEdit(true);
    setIsView(false);
    setIsSliderOpen(true);
  };

  // ================= VIEW =================
  const handleView = (company) => {
    setViewCompany(company);
    setIsView(true);
    setIsEdit(false);
    setIsSliderOpen(true);
  };

  // ================= OPEN CREATE MODAL =================
  const openCreateModal = () => {
    setForm({
      name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      taxNumber: "",
    });
    setEditId(null);
    setIsEdit(false);
    setIsView(false);
    setViewCompany(null);
    setIsSliderOpen(true);
  };

  // ================= CLOSE MODAL =================
  const closeModal = () => {
    setIsSliderOpen(false);
    setIsEdit(false);
    setIsView(false);
    setViewCompany(null);
    setEditId(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaBuilding className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-primary">Companies</h1>
            <p className="text-gray-500 text-sm">Manage your business companies</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2"
            onClick={openCreateModal}
          >
            <FiPlus className="w-4 h-4" />
            Add Company
          </button>
        </div>
      </div>

      {/* Companies Table */}
      <div className="rounded-xl shadow-lg p-6 border border-gray-200 w-full overflow-hidden bg-white">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[1000px]">
            {/* Table Headers */}
            <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr] gap-4 bg-gradient-to-r from-gray-50 to-gray-100 py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 rounded-t-lg">
              <div>Company Name</div>
              <div>Contact Info</div>
              <div>Phone</div>
              <div className="text-center">Status</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Companies List */}
            <div className="flex flex-col">
              {companies.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No companies found. Click "Add Company" to create one.
                </div>
              ) : (
                companies.map((company, index) => (
                  <div
                    key={company._id}
                    className={`grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr] gap-4 items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    {/* Company Name */}
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                          <FiHome className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {company.name}
                          </div>
                          {company.taxNumber && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              Tax: {company.taxNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiMail className="w-3 h-3 text-gray-400" />
                        <span>{company.email}</span>
                      </div>
                      {company.website && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <FiGlobe className="w-3 h-3 text-gray-400" />
                          <span className="text-xs">{company.website}</span>
                        </div>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FiPhone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{company.phone}</span>
                      </div>
                      {company.address && (
                        <div className="flex items-center gap-2 mt-1">
                          <FiMapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 truncate">{company.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex justify-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1 ${
                          company.active
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {company.active ? (
                          <FiCheckCircle className="w-3 h-3" />
                        ) : (
                          <FiXCircle className="w-3 h-3" />
                        )}
                        {company.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 justify-end">
                      {/* VIEW ICON */}
                      <button
                        onClick={() => handleView(company)}
                        className="text-blue-600 hover:bg-blue-100 bg-blue-50 p-2 rounded-md transition"
                        title="View Company"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {/* EDIT ICON */}
                      <button
                        onClick={() => handleEdit(company)}
                        className="text-green-600 hover:bg-green-100 bg-green-50 p-2 rounded-md transition"
                        title="Edit Company"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      {/* DELETE ICON */}
                      <button
                        onClick={() => handleDelete(company._id, company.name)}
                        className="text-red-600 hover:bg-red-100 bg-red-50 p-2 rounded-md transition"
                        title="Delete Company"
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
        {companies.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-500">
            Total Companies: {companies.length}
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
                    <FaBuilding className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary">
                      {isView ? "View Company" : isEdit ? "Edit Company" : "Add New Company"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {isView 
                        ? "View company details" 
                        : isEdit 
                        ? "Update company information" 
                        : "Create a new company"}
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
            {isView && viewCompany ? (
              // View Mode
              <div className="space-y-6">
                <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gray-100/40">
                  <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">Company Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Company Name</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                        {viewCompany.name}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                        {viewCompany.email}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                        {viewCompany.phone}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Address</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                        {viewCompany.address || "—"}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Website</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                        {viewCompany.website || "—"}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tax Number</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                        {viewCompany.taxNumber || "—"}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1 ${
                          viewCompany.active ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                        }`}>
                          {viewCompany.active ? <FiCheckCircle className="w-3 h-3" /> : <FiXCircle className="w-3 h-3" />}
                          {viewCompany.active ? "Active" : "Inactive"}
                        </span>
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
                  {/* Section: Company Details */}
                  <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gray-100/40 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-2">
                      <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">Company Information</h3>
                    </div>

                    <div className="space-y-6">
                      {/* Company Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiHome className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            placeholder="Enter company name"
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
                          Email <span className="text-red-500">*</span>
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

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiPhone className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="phone"
                            placeholder="Enter phone number"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400"
                            required
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                            <FiMapPin className="w-5 h-5 text-gray-400" />
                          </div>
                          <textarea
                            name="address"
                            placeholder="Enter company address"
                            value={form.address}
                            onChange={handleChange}
                            rows="3"
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 resize-none"
                            required
                          />
                        </div>
                      </div>

                      {/* Website */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Website</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiGlobe className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="url"
                            name="website"
                            placeholder="Enter website URL"
                            value={form.website}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400"
                          />
                        </div>
                      </div>

                      {/* Tax Number */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tax Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiFileText className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="taxNumber"
                            placeholder="Enter tax number"
                            value={form.taxNumber}
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
                            {loading ? "Updating..." : "Update Company"}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {loading ? "Creating..." : "Create Company"}
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

export default CompanyPage;