import { useState, useEffect, useRef } from "react";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../../Service/Api";
import { 
  FiPlus, 
  FiCheckCircle, 
  FiXCircle, 
  FiEdit3, 
  FiTrash2, 
  FiEye,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiPackage
} from "react-icons/fi";
import { FaUsers, FaBuilding, FaUserTie } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import gsap from "gsap";

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isView, setIsView] = useState(false);
  const [editId, setEditId] = useState(null);
  const sliderRef = useRef(null);

  // Fetch suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
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

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await getSuppliers();
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Supplier name is required");
      return;
    }
    
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    
    try {
      setLoading(true);
      await createSupplier({ name, contactPerson, phone, email, address, active });
      setName("");
      setContactPerson("");
      setPhone("");
      setEmail("");
      setAddress("");
      setActive(true);
      setIsSliderOpen(false);
      setIsEdit(false);
      setIsView(false);
      fetchSuppliers();
      toast.success("Supplier added successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Supplier name is required");
      return;
    }
    
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    
    try {
      setLoading(true);
      await updateSupplier(editId, { name, contactPerson, phone, email, address, active });
      setIsSliderOpen(false);
      setIsEdit(false);
      setIsView(false);
      fetchSuppliers();
      toast.success("Supplier updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (isEdit) {
      handleUpdateSupplier(e);
    } else {
      handleAddSupplier(e);
    }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setIsView(false);
    setName("");
    setContactPerson("");
    setPhone("");
    setEmail("");
    setAddress("");
    setActive(true);
    setEditId(null);
    setIsSliderOpen(true);
  };

  const handleView = (supplier) => {
    setIsView(true);
    setIsEdit(false);
    setName(supplier.name);
    setContactPerson(supplier.contactPerson || "");
    setPhone(supplier.phone || "");
    setEmail(supplier.email || "");
    setAddress(supplier.address || "");
    setActive(supplier.active);
    setEditId(supplier._id);
    setIsSliderOpen(true);
  };

  const handleEdit = (supplier) => {
    setIsEdit(true);
    setIsView(false);
    setName(supplier.name);
    setContactPerson(supplier.contactPerson || "");
    setPhone(supplier.phone || "");
    setEmail(supplier.email || "");
    setAddress(supplier.address || "");
    setActive(supplier.active);
    setEditId(supplier._id);
    setIsSliderOpen(true);
  };

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
        text: `You won't be able to revert this! Supplier "${name}" will be deleted.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteSupplier(id);
            fetchSuppliers();
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Supplier deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete supplier.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Supplier is safe 🙂",
            "error"
          );
        }
      });
  };

  const reState = () => {
    setIsSliderOpen(false);
    setIsEdit(false);
    setIsView(false);
    setName("");
    setContactPerson("");
    setPhone("");
    setEmail("");
    setAddress("");
    setActive(true);
    setEditId(null);
  };

  // Loading state
  if (loading && suppliers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaUsers className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-primary">Suppliers</h1>
            <p className="text-gray-500 text-sm">Manage your product suppliers and vendors</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2"
            onClick={openAddModal}
          >
            <FiPlus className="w-4 h-4" />
            Add Supplier
          </button>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="rounded-xl shadow-lg p-6 border border-gray-200 w-full overflow-hidden bg-white">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[1200px]">
            {/* Table Headers */}
            <div className="grid grid-cols-[1.5fr_1.5fr_1.5fr_2fr_1.5fr_1fr] gap-4 bg-gradient-to-r from-gray-50 to-gray-100 py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 rounded-t-lg">
              <div>Supplier Name</div>
              <div>Contact Person</div>
              <div>Phone</div>
              <div>Email</div>
              <div className="text-center">Status</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Suppliers List */}
            <div className="flex flex-col">
              {suppliers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No suppliers found. Click "Add Supplier" to create one.
                </div>
              ) : (
                suppliers.map((supplier, index) => (
                  <div
                    key={supplier._id}
                    className={`grid grid-cols-[1.5fr_1.5fr_1.5fr_2fr_1.5fr_1fr] gap-4 items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    {/* Supplier Name */}
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                          <FaBuilding className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-sm font-semibold text-gray-900 line-clamp-1" title={supplier.name}>
                          {supplier.name}
                        </div>
                      </div>
                    </div>

                    {/* Contact Person */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FaUserTie className="w-3 h-3 text-gray-400" />
                        <div className="text-sm text-gray-600 line-clamp-1" title={supplier.contactPerson}>
                          {supplier.contactPerson || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FiPhone className="w-3 h-3 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          {supplier.phone || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FiMail className="w-3 h-3 text-gray-400" />
                        <div className="text-sm text-gray-600 line-clamp-1" title={supplier.email}>
                          {supplier.email || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex justify-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1 ${
                          supplier.active
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {supplier.active ? (
                          <FiCheckCircle className="w-3 h-3" />
                        ) : (
                          <FiXCircle className="w-3 h-3" />
                        )}
                        {supplier.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 justify-end">
                      {/* VIEW ICON */}
                      <button
                        onClick={() => handleView(supplier)}
                        className="text-blue-600 hover:bg-blue-100 bg-blue-50 p-2 rounded-md transition"
                        title="View Supplier"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {/* EDIT ICON */}
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="text-green-600 hover:bg-green-100 bg-green-50 p-2 rounded-md transition"
                        title="Edit Supplier"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      {/* DELETE ICON */}
                      <button
                        onClick={() => handleDelete(supplier._id, supplier.name)}
                        className="text-red-600 hover:bg-red-100 bg-red-50 p-2 rounded-md transition"
                        title="Delete Supplier"
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
        
        {/* Show total count */}
        {suppliers.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-500">
            Total Suppliers: {suppliers.length}
          </div>
        )}
      </div>

      {/* Slider/Modal */}
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
          onClick={reState}
        />

        {/* Slider Content */}
        <div
          ref={sliderRef}
          className={`relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl transform transition-all duration-500 ease-out ${
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
                      {isView ? "View Supplier" : isEdit ? "Edit Supplier" : "Add New Supplier"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {isView 
                        ? "View supplier details" 
                        : isEdit 
                        ? "Update supplier information" 
                        : "Add a new supplier to your inventory"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="p-1 hover:bg-white/20 bg-white/10 rounded-xl transition-all duration-300 group backdrop-blur-sm hover:scale-105"
                onClick={reState}
              >
                <svg className="w-6 h-6 text-white bg-primary rounded-lg group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-6 overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-hide scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <form onSubmit={handleSubmit}>
              <div className="space-y-8 pb-2">
                {/* Section 1: Basic Information */}
                <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gray-100/40 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Supplier Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Supplier Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaBuilding className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Enter supplier name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={isView}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          required={!isView}
                        />
                      </div>
                    </div>

                    {/* Contact Person */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Contact Person
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaUserTie className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Enter contact person name"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          disabled={isView}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiPhone className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          placeholder="Enter phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={isView}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          required={!isView}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiMail className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          placeholder="Enter email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isView}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Address
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                          <FiMapPin className="w-5 h-5 text-gray-400" />
                        </div>
                        <textarea
                          placeholder="Enter complete address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          disabled={isView}
                          rows="3"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="flex items-center gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            disabled={isView}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/30 disabled:cursor-not-allowed"
                          />
                          <span className="text-sm text-gray-700">Active</span>
                        </label>
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${active ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}>
                          {active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isView && (
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
                            {loading ? "Updating..." : "Update Supplier"}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {loading ? "Adding..." : "Add Supplier"}
                          </>
                        )}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={reState}
                      className="px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {isView && (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={reState}
                      className="flex-1 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierPage;