import { useEffect, useState, useRef } from "react";
import {
  getEmployees,
  createDocument,
  getDocuments,
  deleteDocument,
  updateDocument,
} from "../../Service/Api";
import { FiPlus, FiTrash2, FiFileText, FiUser, FiSave, FiUsers, FiFolder, FiEye, FiEdit2, FiX, FiDownload, FiImage, FiFile } from "react-icons/fi";
import { FaFileUpload, FaUserTie, FaFilePdf, FaImage, FaFolderOpen, FaRegEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import gsap from "gsap";

export default function EmployeeDocumentPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [docs, setDocs] = useState([]);
  const [tempDocs, setTempDocs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [editDocumentType, setEditDocumentType] = useState("");

  // Upload Slider State
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    loadEmployees();
    loadDocs();
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

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load employees");
    }
  };

  const loadDocs = async () => {
    try {
      const res = await getDocuments();
      setDocs(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load documents");
    }
  };

  const handleAddDoc = (type, file) => {
    if (!file) return;
    setTempDocs((prev) => [...prev, { type, file }]);
    toast.success(`${type} document added to pending list`);
  };

  const removeTemp = (index, type) => {
    Swal.fire({
      title: "Remove Document?",
      text: `Remove "${type}" from pending documents?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = [...tempDocs];
        updated.splice(index, 1);
        setTempDocs(updated);
        toast.info("Document removed from pending list");
      }
    });
  };

  const handleSave = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee first");
      return;
    }
    if (tempDocs.length === 0) {
      toast.error("No documents to save. Please add some documents first");
      return;
    }

    const formData = new FormData();
    formData.append("relatedTo", selectedEmployee);

    tempDocs.forEach((doc) => {
      formData.append(doc.type, doc.file);
    });

    try {
      setLoading(true);
      await createDocument(formData);
      toast.success(`Successfully uploaded ${tempDocs.length} document(s)`);
      setTempDocs([]);
      setSelectedEmployee("");
      setIsSliderOpen(false);
      await loadDocs();
    } catch (err) {
      console.log(err);
      toast.error("Failed to upload documents");
    } finally {
      setLoading(false);
    }
  };

  // GROUP BY EMPLOYEE
  const groupedDocs = docs.reduce((acc, doc) => {
    const empId = doc.relatedTo?._id;

    if (!acc[empId]) {
      acc[empId] = {
        employee: doc.relatedTo,
        documents: [],
      };
    }

    acc[empId].documents.push(doc);
    return acc;
  }, {});

  // OPEN VIEW MODAL
  const handleView = (group) => {
    setSelectedGroup(group);
    setIsViewModalOpen(true);
  };

  // CLOSE VIEW MODAL
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedGroup(null);
  };

  // OPEN EDIT MODAL
  const handleEditDocument = (doc) => {
    setEditingDocument(doc);
    setEditDocumentType(doc.documentType || "Resume");
    setEditFile(null);
    setIsEditModalOpen(true);
  };

  // CLOSE EDIT MODAL
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingDocument(null);
    setEditFile(null);
    setEditDocumentType("");
  };

  // UPDATE DOCUMENT
  const handleUpdateDocument = async () => {
    if (!editFile && editDocumentType === editingDocument?.documentType) {
      toast.info("No changes to update");
      closeEditModal();
      return;
    }

    const formData = new FormData();
    if (editFile) {
      formData.append("file", editFile);
    }
    if (editDocumentType !== editingDocument?.documentType) {
      formData.append("documentType", editDocumentType);
    }

    try {
      setLoading(true);
      await updateDocument(editingDocument._id, formData);
      toast.success("Document updated successfully");
      await loadDocs();
      closeEditModal();
    } catch (err) {
      console.log(err);
      toast.error("Failed to update document");
    } finally {
      setLoading(false);
    }
  };

  // DELETE SINGLE DOCUMENT
  const handleDeleteDocument = async (docId, docType) => {
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
        text: `Document "${docType || 'this'}" will be deleted permanently.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteDocument(docId);
            await loadDocs();
            swalWithTailwindButtons.fire(
              "Deleted!",
              "Document deleted successfully.",
              "success"
            );
          } catch (error) {
            console.log(error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete document.",
              "error"
            );
          }
        }
      });
  };

  // DELETE ALL DOCUMENTS FOR EMPLOYEE
  const handleDeleteAll = async (employeeId, employeeName, documents) => {
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
        text: `All documents for "${employeeName}" will be deleted permanently.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete all!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            for (let doc of documents) {
              await deleteDocument(doc._id);
            }
            await loadDocs();
            swalWithTailwindButtons.fire(
              "Deleted!",
              "All documents deleted successfully.",
              "success"
            );
          } catch (error) {
            console.log(error);
            swalWithTailwindButtons.fire(
              "Error!",
              "Failed to delete documents.",
              "error"
            );
          }
        }
      });
  };

  // Open upload slider
  const openUploadSlider = () => {
    setIsSliderOpen(true);
  };

  // Close upload slider
  const closeUploadSlider = () => {
    if (tempDocs.length > 0) {
      Swal.fire({
        title: "Unsaved Changes",
        text: "You have pending documents. Are you sure you want to close?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, close",
        cancelButtonText: "No, stay",
      }).then((result) => {
        if (result.isConfirmed) {
          setTempDocs([]);
          setSelectedEmployee("");
          setIsSliderOpen(false);
        }
      });
    } else {
      setIsSliderOpen(false);
      setSelectedEmployee("");
    }
  };

  // FIXED: Added null checks for documentType
  const getDocumentTypeIcon = (type) => {
    if (!type) return <FiFileText className="w-4 h-4" />;
    if (type === "Resume") return <FaFilePdf className="w-4 h-4" />;
    if (type === "Education") return <FiFile className="w-4 h-4" />;
    if (type.includes("CNIC")) return <FaImage className="w-4 h-4" />;
    return <FiFileText className="w-4 h-4" />;
  };

  // FIXED: Added null checks for documentType
  const getDocumentTypeColor = (type) => {
    if (!type) return "text-gray-600 bg-gray-50";
    if (type === "Resume") return "text-red-600 bg-red-50";
    if (type === "Education") return "text-blue-600 bg-blue-50";
    if (type.includes("CNIC")) return "text-purple-600 bg-purple-50";
    return "text-gray-600 bg-gray-50";
  };

  // FIXED: Get display name for document type
  const getDocumentDisplayName = (type) => {
    if (!type) return "Unknown Document";
    if (type === "CNIC_FRONT") return "CNIC Front";
    if (type === "CNIC_BACK") return "CNIC Back";
    return type;
  };

  const totalDocuments = Object.values(groupedDocs).reduce(
    (total, group) => total + group.documents.length,
    0
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaFolderOpen className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold text-primary">Employee Document Manager</h1>
            <p className="text-gray-500 text-sm">Manage employee documents grouped by employee</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2"
            onClick={openUploadSlider}
          >
            <FiPlus className="w-4 h-4" />
            Upload Documents
          </button>
        </div>
      </div>

      {/* Grouped Documents Table */}
      <div className="rounded-xl shadow-lg p-6 border border-gray-200 w-full overflow-hidden bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiFolder className="text-primary w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-800">Employee Documents</h2>
          </div>
          <div className="text-sm text-gray-500">
            Total: {Object.keys(groupedDocs).length} employees | {totalDocuments} documents
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[800px]">
            {/* Table Headers */}
            <div className="grid grid-cols-[1.5fr_2.5fr_1.5fr] gap-4 bg-gradient-to-r from-gray-50 to-gray-100 py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 rounded-t-lg">
              <div>Employee</div>
              <div>Documents</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Grouped Documents List */}
            <div className="flex flex-col">
              {Object.keys(groupedDocs).length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaFileUpload className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No documents found</p>
                  <p className="text-sm text-gray-400 mt-1">Click "Upload Documents" to add employee documents</p>
                </div>
              ) : (
                Object.values(groupedDocs).map((group, index) => (
                  <div
                    key={group.employee?._id}
                    className={`grid grid-cols-[1.5fr_2.5fr_1.5fr] gap-4 items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                  >
                    {/* Employee */}
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                          <FaUserTie className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {group.employee?.name || "Unknown Employee"}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {group.documents.length} document(s)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Documents Summary */}
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {group.documents.slice(0, 3).map((doc) => (
                          <span
                            key={doc._id}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${getDocumentTypeColor(doc.documentType)}`}
                          >
                            {getDocumentTypeIcon(doc.documentType)}
                            {getDocumentDisplayName(doc.documentType)}
                          </span>
                        ))}
                        {group.documents.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{group.documents.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => {
                          closeViewModal();
                          handleEditDocument(doc);
                        }}
                        className="text-green-600 hover:bg-green-100 bg-green-50 p-2 rounded-md transition"
                        title="Edit Document"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleView(group)}
                        className="text-blue-600 hover:bg-blue-100 bg-blue-50 p-2 rounded-md transition"
                        title="View Documents"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAll(group.employee?._id, group.employee?.name, group.documents)}
                        className="text-red-600 hover:bg-red-100 bg-red-50 p-2 rounded-md transition"
                        title="Delete All Documents"
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
      </div>

      {/* ================= VIEW DOCUMENTS MODAL ================= */}
      {isViewModalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <FaUserTie className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary">
                    {selectedGroup.employee?.name}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedGroup.documents.length} document(s)
                  </p>
                </div>
              </div>
              <button
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Document List */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-3">
                {selectedGroup.documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getDocumentTypeColor(doc.documentType)}`}>
                        {getDocumentTypeIcon(doc.documentType)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{getDocumentDisplayName(doc.documentType)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          ID: {doc._id?.slice(-6)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        <FiDownload className="w-3 h-3" />
                        Open File
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={closeViewModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT DOCUMENT MODAL ================= */}
      {isEditModalOpen && editingDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <FaRegEdit className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-primary">Edit Document</h2>
              </div>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Document Type
                </label>
                <select
                  value={editDocumentType}
                  onChange={(e) => setEditDocumentType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="Resume">Resume / CV</option>
                  <option value="CNIC_FRONT">CNIC Front</option>
                  <option value="CNIC_BACK">CNIC Back</option>
                  <option value="Education">Education Certificate</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Replace File (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setEditFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {editingDocument.fileUrl && !editFile && (
                  <p className="text-xs text-gray-500 mt-2">
                    Current file: {editingDocument.fileUrl.split('/').pop()}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDocument}
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Document"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= UPLOAD SLIDER ================= */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${isSliderOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-gray-600/70 backdrop-blur-0 transition-opacity duration-300 ${isSliderOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={closeUploadSlider}
        />

        {/* Slider Content */}
        <div
          ref={sliderRef}
          className={`relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl transform transition-all duration-500 ease-out ${isSliderOpen ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
            }`}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gray-200 px-8 py-4 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <FaFileUpload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary">Upload Documents</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Add multiple documents for an employee
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="p-1 hover:bg-white/20 bg-white/10 rounded-xl transition-all duration-300 group backdrop-blur-sm hover:scale-105"
                onClick={closeUploadSlider}
              >
                <svg className="w-6 h-6 text-white bg-primary rounded-lg group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-6 overflow-y-auto max-h-[80vh]">
            <div className="space-y-8 pb-2">
              {/* Employee Selection */}
              <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gray-100/40">
                <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-2">
                  <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-800">Select Employee</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiUsers className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((e) => (
                        <option key={e._id} value={e._id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Document Uploads */}
              <div className="space-y-6 p-6 border border-gray-300/60 rounded-2xl bg-gray-100/40">
                <div className="flex items-center gap-3 mb-2 border-b border-gray-300 pb-2">
                  <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-800">Add Documents</h3>
                </div>

                <div className="space-y-4">
                  {[
                    { type: "Resume", label: "Resume / CV", icon: <FaFilePdf className="text-gray-400" /> },
                    { type: "CNIC_FRONT", label: "CNIC Front", icon: <FaImage className="text-gray-400" /> },
                    { type: "CNIC_BACK", label: "CNIC Back", icon: <FaImage className="text-gray-400" /> },
                    { type: "Education", label: "Education Certificate", icon: <FiFileText className="text-gray-400" /> },
                  ].map((doc) => (
                    <div key={doc.type} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700">{doc.label}</label>
                        <input
                          type="file"
                          onChange={(e) => handleAddDoc(doc.type, e.target.files[0])}
                          className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </div>
                      {doc.icon}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Documents */}
              {tempDocs.length > 0 && (
                <div className="space-y-4 p-6 border border-primary/30 rounded-2xl bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h3 className="text-lg font-semibold text-primary">Pending Documents</h3>
                    <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                      {tempDocs.length} items
                    </span>
                  </div>

                  <div className="space-y-2">
                    {tempDocs.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          {getDocumentTypeIcon(d.type)}
                          <div>
                            <p className="text-sm font-medium text-gray-800">{getDocumentDisplayName(d.type)}</p>
                            <p className="text-xs text-gray-500">{d.file.name}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeTemp(i, d.type)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded-md transition"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={loading || !selectedEmployee || tempDocs.length === 0}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-xl hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-3">
                    <FiSave className="w-5 h-5" />
                    {loading ? "Saving..." : `Save All Documents (${tempDocs.length})`}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={closeUploadSlider}
                  className="px-8 py-4 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}