// src/pages/Products.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getSuppliers,
} from "../../Service/Api";
import { 
  FiPlus, 
  FiCheckCircle, 
  FiXCircle, 
  FiEdit3, 
  FiTrash2, 
  FiPackage,
  FiDollarSign,
  FiBox,
  FiTag,
  FiFileText,
  FiHash,
  FiEye,
} from "react-icons/fi";
import { FaBoxes, FaBuilding, FaListAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import gsap from "gsap";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    supplier: "",
    sku: "",
    active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isView, setIsView] = useState(false);
  const sliderRef = useRef(null);

  // Fetch products, categories, suppliers
  const fetchData = async () => {
    try {
      setLoading(true);
      const productsRes = await getProducts();
      const categoriesRes = await getCategories();
      const suppliersRes = await getSuppliers();

      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setSuppliers(suppliersRes.data);
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

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await updateProduct(editingId, formData);
        toast.success("Product updated successfully");
      } else {
        await createProduct(formData);
        toast.success("Product added successfully");
      }
      setFormData({
        name: "",
        price: "",
        stock: "",
        category: "",
        description: "",
        supplier: "",
        sku: "",
        active: true,
      });
      setEditingId(null);
      setIsSliderOpen(false);
      setIsView(false);
      fetchData();
    } catch (err) {
      console.error("Error saving product", err);
      toast.error("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category?._id || "",
      description: product.description || "",
      supplier: product.supplier?._id || "",
      sku: product.sku || "",
      active: product.active,
    });
    setEditingId(product._id);
    setIsView(false);
    setIsSliderOpen(true);
  };

  // Handle view
  const handleView = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category?._id || "",
      description: product.description || "",
      supplier: product.supplier?._id || "",
      sku: product.sku || "",
      active: product.active,
    });
    setEditingId(product._id);
    setIsView(true);
    setIsSliderOpen(true);
  };

  // Handle delete
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
        text: `You won't be able to revert this! Product "${name}" will be deleted.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteProduct(id);
            fetchData();
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Product deleted successfully.",
              "success"
            );
          } catch (error) {
            console.error("Error deleting product", error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete product.",
              "error"
            );
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithTailwindButtons.fire(
            "Cancelled",
            "Product is safe 🙂",
            "error"
          );
        }
      });
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      price: "",
      stock: "",
      category: "",
      description: "",
      supplier: "",
      sku: "",
      active: true,
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
      name: "",
      price: "",
      stock: "",
      category: "",
      description: "",
      supplier: "",
      sku: "",
      active: true,
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

  // Get stock status color
  const getStockStatusColor = (stock) => {
    if (stock === 0) return 'text-red-600 bg-red-50';
    if (stock < 10) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  // Get stock status text
  const getStockStatusText = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  };

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
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
            <h1 className="text-2xl font-bold text-primary">Products</h1>
            <p className="text-gray-500 text-sm">Manage your product inventory</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2"
            onClick={openAddModal}
          >
            <FiPlus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl shadow-lg p-6 border border-gray-200 w-full overflow-hidden bg-white">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[1400px]">
            {/* Table Headers */}
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1.5fr_1fr_1fr_1.2fr] gap-4 bg-gradient-to-r from-gray-50 to-gray-100 py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 rounded-t-lg">
              <div>Product Name</div>
              <div>SKU</div>
              <div>Price</div>
              <div>Stock</div>
              <div>Category</div>
              <div>Supplier</div>
              <div className="text-center">Status</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Products List */}
            <div className="flex flex-col">
              {products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No products found. Click "Add Product" to create one.
                </div>
              ) : (
                products.map((prod, index) => (
                  <div
                    key={prod._id}
                    className={`grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1.5fr_1fr_1fr_1.2fr] gap-4 items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    {/* Product Name */}
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                          <FiPackage className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-sm font-semibold text-gray-900 line-clamp-1" title={prod.name}>
                          {prod.name}
                        </div>
                      </div>
                    </div>

                    {/* SKU */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FiHash className="w-3 h-3 text-gray-400" />
                        <div className="text-sm font-mono text-gray-600">
                          {prod.sku || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="w-3 h-3 text-gray-400" />
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(prod.price)}
                        </div>
                      </div>
                    </div>

                    {/* Stock */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FiBox className="w-3 h-3 text-gray-400" />
                        <div className={`text-sm font-semibold px-2 py-1 rounded-full ${getStockStatusColor(prod.stock)}`}>
                          {prod.stock} units
                          <span className="text-xs ml-1">({getStockStatusText(prod.stock)})</span>
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FaListAlt className="w-3 h-3 text-gray-400" />
                        <div className="text-sm text-gray-600 line-clamp-1" title={prod.category?.name}>
                          {prod.category?.name || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Supplier */}
                    <div>
                      <div className="flex items-center gap-2">
                        <FaBuilding className="w-3 h-3 text-gray-400" />
                        <div className="text-sm text-gray-600 line-clamp-1" title={prod.supplier?.name}>
                          {prod.supplier?.name || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex justify-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1 ${
                          prod.active
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {prod.active ? (
                          <FiCheckCircle className="w-3 h-3" />
                        ) : (
                          <FiXCircle className="w-3 h-3" />
                        )}
                        {prod.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 justify-end">
                      {/* VIEW ICON */}
                      <button
                        onClick={() => handleView(prod)}
                        className="text-blue-600 hover:bg-blue-100 bg-blue-50 p-2 rounded-md transition"
                        title="View Product"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {/* EDIT ICON */}
                      <button
                        onClick={() => handleEdit(prod)}
                        className="text-green-600 hover:bg-green-100 bg-green-50 p-2 rounded-md transition"
                        title="Edit Product"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      {/* DELETE ICON */}
                      <button
                        onClick={() => handleDelete(prod._id, prod.name)}
                        className="text-red-600 hover:bg-red-100 bg-red-50 p-2 rounded-md transition"
                        title="Delete Product"
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
        {products.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-500">
            Total Products: {products.length}
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
                      {isView ? "View Product" : editingId ? "Edit Product" : "Add New Product"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {isView 
                        ? "View product details" 
                        : editingId 
                        ? "Update product information" 
                        : "Add a new product to your inventory"}
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
                {/* Section: Product Information */}
                <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gray-100/40 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800">Product Information</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Product Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiPackage className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter product name"
                          disabled={isView}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          required
                        />
                      </div>
                    </div>

                    {/* SKU */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        SKU (Stock Keeping Unit)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiHash className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          name="sku"
                          value={formData.sku}
                          onChange={handleChange}
                          placeholder="Enter SKU"
                          disabled={isView}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed font-mono"
                        />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiDollarSign className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="price"
                          step="0.01"
                          value={formData.price}
                          onChange={handleChange}
                          placeholder="Enter price"
                          disabled={isView}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          required
                        />
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Stock Quantity <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiBox className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleChange}
                          placeholder="Enter stock quantity"
                          disabled={isView}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          required
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaListAlt className="w-5 h-5 text-gray-400" />
                        </div>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          disabled={isView}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none bg-white"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
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

                    {/* Supplier */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Supplier
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaBuilding className="w-5 h-5 text-gray-400" />
                        </div>
                        <select
                          name="supplier"
                          value={formData.supplier}
                          onChange={handleChange}
                          disabled={isView}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none bg-white"
                        >
                          <option value="">Select Supplier</option>
                          {suppliers.map((sup) => (
                            <option key={sup._id} value={sup._id}>
                              {sup.name}
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

                    {/* Description */}
                    <div className="space-y-2 col-span-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Description
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                          <FiFileText className="w-5 h-5 text-gray-400" />
                        </div>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Enter product description"
                          disabled={isView}
                          rows="4"
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
                            name="active"
                            checked={formData.active}
                            onChange={handleChange}
                            disabled={isView}
                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/30 disabled:cursor-not-allowed"
                          />
                          <span className="text-sm text-gray-700">Active</span>
                        </label>
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${formData.active ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}>
                          {formData.active ? "Active" : "Inactive"}
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
                        {editingId ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {loading ? "Updating..." : "Update Product"}
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {loading ? "Adding..." : "Add Product"}
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

export default Products;