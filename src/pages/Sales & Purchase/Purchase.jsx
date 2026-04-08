// src/pages/Purchases.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getSuppliers,
  getProducts,
} from "../../Service/Api";
import { 
  FiPlus, 
  FiTrash2, 
  FiShoppingCart, 
  FiPackage, 
  FiDollarSign,
  FiCalendar,
  FiHash,
  FiEdit3,
  FiEye
} from "react-icons/fi";
import { FaBoxes, FaBuilding } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import gsap from "gsap";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    supplier: "",
    products: [{ product: "", quantity: 1, price: 0 }],
    total: 0,
  });

  const [loading, setLoading] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isView, setIsView] = useState(false);
  const sliderRef = useRef(null);

  // Fetch suppliers, products, and purchases
  const fetchData = async () => {
    try {
      setLoading(true);
      const [purchasesRes, suppliersRes, productsRes] = await Promise.all([
        getPurchases(),
        getSuppliers(),
        getProducts(),
      ]);

      // Populate supplier and product names manually if backend doesn't populate
      const populatedPurchases = purchasesRes.data.map((p) => ({
        ...p,
        supplierName:
          suppliersRes.data.find((s) => s._id === p.supplier)?.name || "-",
        products: p.products.map((prod) => ({
          ...prod,
          productName:
            productsRes.data.find((pr) => pr._id === prod.product)?.name || "-",
        })),
      }));

      setPurchases(populatedPurchases);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  // Handle supplier change
  const handleSupplierChange = (e) => {
    setFormData((prev) => ({ ...prev, supplier: e.target.value }));
  };

  // Handle product input change
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index][field] =
      field === "quantity" || field === "price" ? Number(value) : value;
    setFormData((prev) => ({ ...prev, products: updatedProducts }));
  };

  // Add a new product row
  const addProductRow = () => {
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { product: "", quantity: 1, price: 0 }],
    }));
  };

  // Remove a product row
  const removeProductRow = (index) => {
    const updatedProducts = [...formData.products];
    updatedProducts.splice(index, 1);
    setFormData((prev) => ({ ...prev, products: updatedProducts }));
  };

  // Calculate total
  const calculateTotal = () => {
    return formData.products.reduce(
      (sum, p) => sum + p.quantity * p.price,
      0
    );
  };

  // Handle form submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = { ...formData, total: calculateTotal() };

      if (editingId) {
        await updatePurchase(editingId, data);
        setEditingId(null);
        toast.success("Purchase updated successfully");
      } else {
        await createPurchase(data);
        toast.success("Purchase created successfully");
      }

      setFormData({
        supplier: "",
        products: [{ product: "", quantity: 1, price: 0 }],
        total: 0,
      });
      setIsSliderOpen(false);
      setIsView(false);
      fetchData();
    } catch (err) {
      console.error("Error saving purchase", err);
      toast.error("Failed to save purchase");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (purchase) => {
    setFormData({
      supplier: purchase.supplier,
      products: purchase.products.map((p) => ({
        product: p.product,
        quantity: p.quantity,
        price: p.price,
      })),
      total: purchase.total,
    });
    setEditingId(purchase._id);
    setIsView(false);
    setIsSliderOpen(true);
  };

  // Handle delete
  const handleDelete = async (id, supplierName) => {
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
        text: `You won't be able to revert this! Purchase from "${supplierName}" will be deleted.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deletePurchase(id);
            fetchData();
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Purchase deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Error deleting purchase", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete purchase.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Purchase is safe 🙂",
            "error"
          );
        }
      });
  };

  // Handle view
  const handleView = (purchase) => {
    setFormData({
      supplier: purchase.supplier,
      products: purchase.products.map((p) => ({
        product: p.product,
        quantity: p.quantity,
        price: p.price,
      })),
      total: purchase.total,
    });
    setEditingId(purchase._id);
    setIsView(true);
    setIsSliderOpen(true);
  };

  const openAddModal = () => {
    setFormData({
      supplier: "",
      products: [{ product: "", quantity: 1, price: 0 }],
      total: 0,
    });
    setEditingId(null);
    setIsView(false);
    setIsSliderOpen(true);
  };

  const reState = () => {
    setIsSliderOpen(false);
    setIsView(false);
    setEditingId(null);
    setFormData({
      supplier: "",
      products: [{ product: "", quantity: 1, price: 0 }],
      total: 0,
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading && purchases.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaBoxes className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-primary">Purchases</h1>
            <p className="text-gray-500 text-sm">Manage your purchase orders</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2"
            onClick={openAddModal}
          >
            <FiPlus className="w-4 h-4" />
            Create Purchase
          </button>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="rounded-xl shadow-lg p-6 border border-gray-200 w-full overflow-hidden bg-white">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[1400px]">
            {/* Table Headers */}
            <div className="grid grid-cols-[1.5fr_2.5fr_1.2fr_1.5fr_1fr] gap-4 bg-gradient-to-r from-gray-50 to-gray-100 py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 rounded-t-lg">
              <div>Supplier</div>
              <div>Products</div>
              <div>Total</div>
              <div>Purchase Date</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Purchases List */}
            <div className="flex flex-col">
              {purchases.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No purchases found. Click "Create Purchase" to create one.
                </div>
              ) : (
                purchases.map((purchase, index) => (
                  <div
                    key={purchase._id}
                    className={`grid grid-cols-[1.5fr_2.5fr_1.2fr_1.5fr_1fr] gap-4 items-start px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    {/* Supplier */}
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                          <FaBuilding className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {purchase.supplierName}
                        </div>
                      </div>
                    </div>

                    {/* Products */}
                    <div>
                      <div className="space-y-2">
                        {purchase.products.map((prod, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <FiPackage className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="font-medium">{prod.productName}</span>
                            <span className="text-gray-400">×</span>
                            <span>{prod.quantity}</span>
                            <span className="text-gray-400">@</span>
                            <span>{formatCurrency(prod.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="w-4 h-4 text-primary" />
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(purchase.total)}
                        </div>
                      </div>
                    </div>

                    {/* Purchase Date */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-3 h-3 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          {formatDate(purchase.purchaseDate)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 justify-end">
                      {/* VIEW ICON */}
                      <button
                        onClick={() => handleView(purchase)}
                        className="text-blue-600 hover:bg-blue-100 bg-blue-50 p-2 rounded-md transition"
                        title="View Purchase"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {/* EDIT ICON */}
                      <button
                        onClick={() => handleEdit(purchase)}
                        className="text-green-600 hover:bg-green-100 bg-green-50 p-2 rounded-md transition"
                        title="Edit Purchase"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      {/* DELETE ICON */}
                      <button
                        onClick={() => handleDelete(purchase._id, purchase.supplierName)}
                        className="text-red-600 hover:bg-red-100 bg-red-50 p-2 rounded-md transition"
                        title="Delete Purchase"
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
        {purchases.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-500">
            Total Purchases: {purchases.length}
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
                    <FaBoxes className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary">
                      {isView ? "View Purchase" : editingId ? "Edit Purchase" : "Create New Purchase"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {isView 
                        ? "View purchase order details" 
                        : editingId 
                        ? "Update purchase order information" 
                        : "Add a new purchase order to your inventory"}
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
                {/* Section 1: Supplier Information */}
                <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gray-100/40 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">Supplier Information</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Supplier */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Supplier <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaBuilding className="w-5 h-5 text-gray-400" />
                        </div>
                        <select
                          value={formData.supplier}
                          onChange={handleSupplierChange}
                          required
                          disabled={isView}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">Select Supplier</option>
                          {suppliers.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Products */}
                <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gray-100/40 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">Products</h3>
                  </div>

                  <div className="space-y-4">
                    {formData.products.map((p, index) => (
                      <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-xl bg-white/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-700">Product {index + 1}</span>
                          {formData.products.length > 1 && !isView && (
                            <button
                              type="button"
                              className="text-red-600 hover:bg-red-100 bg-red-50 p-2 rounded-md transition"
                              onClick={() => removeProductRow(index)}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          {/* Product Select */}
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600">Product</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiPackage className="w-4 h-4 text-gray-400" />
                              </div>
                              <select
                                value={p.product}
                                onChange={(e) =>
                                  handleProductChange(index, "product", e.target.value)
                                }
                                required
                                disabled={isView}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                              >
                                <option value="">Select Product</option>
                                {products.map((prod) => (
                                  <option key={prod._id} value={prod._id}>
                                    {prod.name}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600">Quantity</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiHash className="w-4 h-4 text-gray-400" />
                              </div>
                              <input
                                type="number"
                                placeholder="Quantity"
                                min={1}
                                value={p.quantity}
                                onChange={(e) =>
                                  handleProductChange(index, "quantity", e.target.value)
                                }
                                disabled={isView}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                required
                              />
                            </div>
                          </div>

                          {/* Price */}
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600">Price</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiDollarSign className="w-4 h-4 text-gray-400" />
                              </div>
                              <input
                                type="number"
                                placeholder="Price"
                                min={0}
                                step="0.01"
                                value={p.price}
                                onChange={(e) =>
                                  handleProductChange(index, "price", e.target.value)
                                }
                                disabled={isView}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {!isView && (
                      <button
                        type="button"
                        className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
                        onClick={addProductRow}
                      >
                        <FiPlus className="w-4 h-4" />
                        Add Another Product
                      </button>
                    )}
                  </div>
                </div>

                {/* Section 3: Total */}
                <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                      <h3 className="text-xl font-bold text-gray-800">Total Amount</h3>
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      {formatCurrency(calculateTotal())}
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
                        <FiShoppingCart className="w-5 h-5" />
                        {loading 
                          ? (editingId ? "Updating..." : "Creating...") 
                          : (editingId ? "Update Purchase" : "Create Purchase")}
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

export default Purchases;