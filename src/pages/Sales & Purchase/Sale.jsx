import { useEffect, useState, useRef } from "react";
import {
  getSales,
  createSale,
  deleteSale,
  updateSale,
  getProducts,
} from "../../Service/Api";
import { FiPlus, FiEye, FiEdit3, FiTrash2, FiShoppingCart, FiUser, FiPackage, FiDollarSign, FiCalendar, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";
import { FaTasks } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import gsap from "gsap";

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    customer: "",
    products: [{ product: "", quantity: 1, price: 0 }],
  });

  const [errors, setErrors] = useState({});
  const [viewSale, setViewSale] = useState(null);
  const [editSale, setEditSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isView, setIsView] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const sliderRef = useRef(null);

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchSales();
    fetchProducts();
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

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await getSales();
      setSales(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch sales");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    }
  };

  // ================= HANDLE PRODUCT CHANGE =================
  const handleProductChange = (index, field, value, isEdit = false) => {
    const target = isEdit ? editSale : form;
    const updated = [...target.products];

    updated[index][field] = value;

    // auto price
    if (field === "product") {
      const selected = products.find((p) => p._id === value);
      if (selected) {
        updated[index].price = selected.price || 0;
      }
    }

    // stock validation
    const selected = products.find((p) => p._id === updated[index].product);

    if (selected && updated[index].quantity > selected.stock) {
      setErrors((prev) => ({
        ...prev,
        [index]: `Only ${selected.stock} in stock`,
      }));
    } else {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[index];
        return newErr;
      });
    }

    if (isEdit) {
      setEditSale({ ...editSale, products: updated });
    } else {
      setForm({ ...form, products: updated });
    }
  };

  // ================= ADD ROW =================
  const addProductRow = (isEdit = false) => {
    const newRow = { product: "", quantity: 1, price: 0 };

    if (isEdit) {
      setEditSale({
        ...editSale,
        products: [...editSale.products, newRow],
      });
    } else {
      setForm({
        ...form,
        products: [...form.products, newRow],
      });
    }
  };

  // ================= REMOVE ROW =================
  const removeProductRow = (index, isEdit = false) => {
    if (isEdit) {
      const updated = editSale.products.filter((_, i) => i !== index);
      setEditSale({ ...editSale, products: updated });
    } else {
      const updated = form.products.filter((_, i) => i !== index);
      setForm({ ...form, products: updated });
    }
  };

  // ================= TOTAL =================
  const calculateTotal = (data) =>
    data.products.reduce((sum, item) => sum + item.quantity * item.price, 0);

  // ================= CREATE SALE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0) {
      toast.error("Fix stock errors first");
      return;
    }

    if (!form.customer.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (form.products.length === 0 || !form.products[0].product) {
      toast.error("At least one product is required");
      return;
    }

    try {
      setLoading(true);
      await createSale({
        ...form,
        total: calculateTotal(form),
      });

      await fetchSales();
      await fetchProducts();

      setErrors({});
      setForm({
        customer: "",
        products: [{ product: "", quantity: 1, price: 0 }],
      });
      setIsSliderOpen(false);
      toast.success("Sale created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create sale");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id, customer) => {
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
        text: `Sale for "${customer}" will be deleted.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteSale(id);
            await fetchSales();
            await fetchProducts();
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Sale deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Delete error:", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete sale.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Sale is safe 🙂",
            "error"
          );
        }
      });
  };

  // ================= STATUS =================
  const handleStatusChange = async (id, status) => {
    try {
      await updateSale(id, { status });
      fetchSales();
      toast.success(`Sale status updated to ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  // ================= UPDATE SALE =================
  const handleUpdateSale = async () => {
    if (Object.keys(errors).length > 0) {
      toast.error("Fix stock errors first");
      return;
    }

    if (!editSale.customer.trim()) {
      toast.error("Customer name is required");
      return;
    }

    try {
      setLoading(true);
      await updateSale(editSale._id, {
        ...editSale,
        total: calculateTotal(editSale),
      });

      await fetchSales();
      await fetchProducts();

      setErrors({});
      setEditSale(null);
      setIsSliderOpen(false);
      setIsEdit(false);
      toast.success("Sale updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update sale");
    } finally {
      setLoading(false);
    }
  };

  // ================= OPEN MODALS =================
  const openCreateModal = () => {
    setIsEdit(false);
    setIsView(false);
    setEditSale(null);
    setForm({
      customer: "",
      products: [{ product: "", quantity: 1, price: 0 }],
    });
    setErrors({});
    setIsSliderOpen(true);
  };

  const handleView = (sale) => {
    setIsView(true);
    setIsEdit(false);
    setViewSale(sale);
    setIsSliderOpen(true);
  };

  const handleEdit = (sale) => {
    setIsEdit(true);
    setIsView(false);
    setEditSale(sale);
    setErrors({});
    setIsSliderOpen(true);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <FiCheckCircle className="w-3 h-3" />;
      case 'canceled':
        return <FiXCircle className="w-3 h-3" />;
      default:
        return <FiClock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return "bg-success/10 text-success";
      case 'canceled':
        return "bg-danger/10 text-danger";
      default:
        return "bg-warning/10 text-warning";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaTasks className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-primary">Sales</h1>
            <p className="text-gray-500 text-sm">Manage your sales transactions</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2"
            onClick={openCreateModal}
          >
            <FiPlus className="w-4 h-4" />
            Create Sale
          </button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="rounded-xl shadow-lg p-6 border border-gray-200 w-full overflow-hidden bg-white">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[1000px]">
            {/* Table Headers */}
            <div className="grid grid-cols-[1.5fr_2fr_1fr_1.5fr_1.5fr_1.5fr] gap-4 bg-gradient-to-r from-gray-50 to-gray-100 py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 rounded-t-lg">
              <div>Customer</div>
              <div>Products</div>
              <div className="text-center">Total</div>
              <div className="text-center">Status</div>
              <div className="text-center">Date</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Sales List */}
            <div className="flex flex-col">
              {sales.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No sales found. Click "Create Sale" to add one.
                </div>
              ) : (
                sales.map((sale, index) => (
                  <div
                    key={sale._id}
                    className={`grid grid-cols-[1.5fr_2fr_1fr_1.5fr_1.5fr_1.5fr] gap-4 items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    {/* Customer */}
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {sale.customer}
                        </div>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="text-sm text-gray-600">
                      {sale.products.map((p, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <FiPackage className="w-3 h-3 text-gray-400" />
                          <span>
                            {p.product?.name} ({p.quantity})
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FiDollarSign className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-gray-900">
                          {sale.total}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex justify-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1 ${getStatusColor(sale.status)}`}
                      >
                        {getStatusIcon(sale.status)}
                        {sale.status}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FiCalendar className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {new Date(sale.saleDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 justify-end">
                      <button
                        onClick={() => handleView(sale)}
                        className="text-blue-600 hover:bg-blue-100 bg-blue-50 p-2 rounded-md transition"
                        title="View Sale"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(sale)}
                        className="text-green-600 hover:bg-green-100 bg-green-50 p-2 rounded-md transition"
                        title="Edit Sale"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sale._id, sale.customer)}
                        className="text-red-600 hover:bg-red-100 bg-red-50 p-2 rounded-md transition"
                        title="Delete Sale"
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
        {sales.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-500">
            Total Sales: {sales.length}
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
          onClick={() => {
            setIsSliderOpen(false);
            setIsEdit(false);
            setIsView(false);
            setEditSale(null);
            setViewSale(null);
          }}
        />

        {/* Slider Content */}
        <div
          ref={sliderRef}
          className={`relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl transform transition-all duration-500 ease-out ${
            isSliderOpen ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
          }`}
        >
          {/* Header with gradient */}
          <div className="sticky top-0 z-10 bg-gray-200 px-8 py-4 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <FiShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary">
                      {isView ? "View Sale" : isEdit ? "Edit Sale" : "Create New Sale"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {isView 
                        ? "View sale details" 
                        : isEdit 
                        ? "Update sale information" 
                        : "Record a new sale transaction"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="p-1 hover:bg-white/20 bg-white/10 rounded-xl transition-all duration-300 group backdrop-blur-sm hover:scale-105"
                onClick={() => {
                  setIsSliderOpen(false);
                  setIsEdit(false);
                  setIsView(false);
                  setEditSale(null);
                  setViewSale(null);
                }}
              >
                <svg className="w-6 h-6 text-white bg-primary rounded-lg group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-6 overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-hide scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {isView && viewSale ? (
              // View Mode
              <div className="space-y-6">
                <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gray-100/40">
                  <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">Sale Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Customer Name</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                        {viewSale.customer}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Products</label>
                      <div className="mt-1 space-y-2">
                        {viewSale.products.map((p, i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium">{p.product?.name}</div>
                            <div className="text-sm text-gray-600">Quantity: {p.quantity}</div>
                            <div className="text-sm text-gray-600">Price: ${p.price}</div>
                            <div className="text-sm font-semibold text-primary">Subtotal: ${p.quantity * p.price}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Total Amount</label>
                      <div className="mt-1 p-3 bg-primary/10 rounded-lg text-primary font-bold text-xl">
                        ${viewSale.total}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1 ${getStatusColor(viewSale.status)}`}>
                          {getStatusIcon(viewSale.status)}
                          {viewSale.status}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sale Date</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">
                        {new Date(viewSale.saleDate).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsSliderOpen(false);
                    setIsView(false);
                    setViewSale(null);
                  }}
                  className="w-full px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Close
                </button>
              </div>
            ) : (
              // Create/Edit Form
              <form onSubmit={isEdit ? (e) => { e.preventDefault(); handleUpdateSale(); } : handleSubmit}>
                <div className="space-y-8 pb-2">
                  {/* Section: Sale Details */}
                  <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gray-100/40 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-2">
                      <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                      <h3 className="text-lg font-semibold text-gray-800">Sale Information</h3>
                    </div>

                    <div className="space-y-6">
                      {/* Customer Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          Customer Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiUser className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="Enter customer name"
                            value={isEdit ? editSale?.customer || "" : form.customer}
                            onChange={(e) => isEdit 
                              ? setEditSale({ ...editSale, customer: e.target.value })
                              : setForm({ ...form, customer: e.target.value })
                            }
                            disabled={isView}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            required
                          />
                        </div>
                      </div>

                      {/* Products Section */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          Products <span className="text-red-500">*</span>
                        </label>
                        
                        {(isEdit ? editSale?.products : form.products).map((item, index) => (
                          <div key={index} className="space-y-2 p-4 border border-gray-200 rounded-xl bg-white">
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <select
                                  value={item.product}
                                  onChange={(e) =>
                                    handleProductChange(
                                      index,
                                      "product",
                                      e.target.value,
                                      isEdit
                                    )
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                >
                                  <option value="">Select Product</option>
                                  {products.map((p) => (
                                    <option key={p._id} value={p._id}>
                                      {p.name} (Stock: {p.stock} | Price: ${p.price})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="w-32">
                                <input
                                  type="number"
                                  placeholder="Qty"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleProductChange(
                                      index,
                                      "quantity",
                                      Number(e.target.value),
                                      isEdit
                                    )
                                  }
                                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/30 ${
                                    errors[index] ? "border-red-500" : "border-gray-300"
                                  }`}
                                />
                              </div>
                              
                              <div className="w-32">
                                <input
                                  type="number"
                                  placeholder="Price"
                                  value={item.price}
                                  onChange={(e) =>
                                    handleProductChange(
                                      index,
                                      "price",
                                      Number(e.target.value),
                                      isEdit
                                    )
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30"
                                />
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => removeProductRow(index, isEdit)}
                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {errors[index] && (
                              <p className="text-red-500 text-sm mt-1">{errors[index]}</p>
                            )}
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={() => addProductRow(isEdit)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                          <FiPlus className="w-4 h-4" />
                          Add Product
                        </button>
                      </div>

                      {/* Total */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                          <span className="text-2xl font-bold text-primary">
                            ${isEdit ? calculateTotal(editSale) : calculateTotal(form)}
                          </span>
                        </div>
                      </div>

                      {/* Status (Edit only) */}
                      {isEdit && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Status</label>
                          <select
                            value={editSale?.status || "pending"}
                            onChange={(e) => setEditSale({ ...editSale, status: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="canceled">Canceled</option>
                          </select>
                        </div>
                      )}
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
                            {loading ? "Updating..." : "Update Sale"}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {loading ? "Creating..." : "Create Sale"}
                          </>
                        )}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSliderOpen(false);
                        setIsEdit(false);
                        setIsView(false);
                        setEditSale(null);
                        setViewSale(null);
                      }}
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

export default SalesPage;