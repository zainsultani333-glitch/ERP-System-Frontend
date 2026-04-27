// src/api.js
import axios from "axios";

// Base URL for your backend
const API = axios.create({
  baseURL: "https://erp-system-backend-iota.vercel.app/api", // your Express backend
});

// 🔥 Add this interceptor
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`; // ✅ THIS IS REQUIRED
  }

  return req;
});

// Auth APIs
export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);

// Employee APIs
export const getEmployees = () => API.get("/employees");
export const getEmployee = (id) => API.get(`/employees/${id}`);
export const createEmployee = (data) => API.post("/employees", data);
export const updateEmployee = (id, data) => API.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => API.delete(`/employees/${id}`);

// Category APIs
export const getCategories = () => API.get("/categories");
export const createCategory = (data) => API.post("/categories", data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// Product APIs
export const getProducts = () => API.get("/products");
export const createProduct = (data) => API.post("/products", data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

// Sales APIs
export const getSales = () => API.get("/sales");
export const createSale = (data) => API.post("/sales", data);
export const updateSale = (id, data) => API.put(`/sales/${id}`, data);
export const deleteSale = (id) => API.delete(`/sales/${id}`);

// Purchase APIs
export const getPurchases = () => API.get("/purchases");
export const createPurchase = (data) => API.post("/purchases", data);
export const updatePurchase = (id, data) => API.put(`/purchases/${id}`, data);
export const deletePurchase = (id) => API.delete(`/purchases/${id}`);

// Company APIs
export const getCompanies = () => API.get("/companies");
export const createCompany = (data) => API.post("/companies", data);
export const updateCompany = (id, data) => API.put(`/companies/${id}`, data);
export const deleteCompany = (id) => API.delete(`/companies/${id}`);

// User APIs
export const getUsers = () => API.get("/users");
export const createUser = (data) => API.post("/users", data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// Supplier APIs
export const getSuppliers = () => API.get("/suppliers");
export const createSupplier = (data) => API.post("/suppliers", data);
export const updateSupplier = (id, data) => API.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`);

// Document APIs
export const getDocuments = () => API.get("/documents");
export const createDocument = (data) => API.post("/documents", data);
export const updateDocument = (id, data) => API.put(`/documents/${id}`, data);
export const deleteDocument = (id) => API.delete(`/documents/${id}`);

// Notification APIs
export const getNotifications = () => API.get("/notifications");
export const createNotification = (data) => API.post("/notifications", data);
export const updateNotification = (id, data) => API.put(`/notifications/${id}`, data);
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

// Export the API instance if you need it
export default API;