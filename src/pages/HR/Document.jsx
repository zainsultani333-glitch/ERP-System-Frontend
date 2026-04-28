import { useEffect, useState } from "react";
import {
  getEmployees,
  createDocument,
  getDocuments,
  deleteDocument,
} from "../../Service/Api";

export default function EmployeeDocumentPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [docs, setDocs] = useState([]);
  const [tempDocs, setTempDocs] = useState([]);

  // 👇 MODAL STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    loadEmployees();
    loadDocs();
  }, []);

  const loadEmployees = async () => {
    const res = await getEmployees();
    setEmployees(res.data);
  };

  const loadDocs = async () => {
    const res = await getDocuments();
    setDocs(res.data);
  };

  const handleAddDoc = (type, file) => {
    if (!file) return;
    setTempDocs((prev) => [...prev, { type, file }]);
  };

  const removeTemp = (index) => {
    const updated = [...tempDocs];
    updated.splice(index, 1);
    setTempDocs(updated);
  };

  const handleSave = async () => {
    if (!selectedEmployee) return alert("Select Employee");

    const formData = new FormData();
    formData.append("relatedTo", selectedEmployee);

    tempDocs.forEach((doc) => {
      formData.append(doc.type, doc.file);
    });

    await createDocument(formData);

    setTempDocs([]);
    setSelectedEmployee("");
    loadDocs();
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

  // OPEN MODAL
  const handleView = (group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  // CLOSE MODAL
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Employee Document Manager
      </h2>

      {/* SELECT EMPLOYEE */}
      <select
        className="border p-2 rounded mb-4"
        value={selectedEmployee}
        onChange={(e) => setSelectedEmployee(e.target.value)}
      >
        <option value="">Select Employee</option>
        {employees.map((e) => (
          <option key={e._id} value={e._id}>
            {e.name}
          </option>
        ))}
      </select>

      {/* FILE UPLOADS */}
      <div className="space-y-2 mb-4">
        <input type="file" onChange={(e) => handleAddDoc("Resume", e.target.files[0])} />
        <input type="file" onChange={(e) => handleAddDoc("CNIC_FRONT", e.target.files[0])} />
        <input type="file" onChange={(e) => handleAddDoc("CNIC_BACK", e.target.files[0])} />
        <input type="file" onChange={(e) => handleAddDoc("Education", e.target.files[0])} />
      </div>

      {/* TEMP DOCS */}
      <div className="mb-4">
        {tempDocs.map((d, i) => (
          <div key={i} className="flex justify-between bg-white p-2 mb-2 rounded shadow">
            <span>{d.type}</span>
            <button
              className="text-red-500"
              onClick={() => removeTemp(i)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        Save All
      </button>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-left">Documents</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {Object.values(groupedDocs).map((group) => (
              <tr key={group.employee?._id} className="border-t">
                <td className="p-3 font-medium">
                  {group.employee?.name}
                </td>

                <td className="p-3 text-gray-600">
                  {group.documents.length} files
                </td>

                <td className="p-3 space-x-2">
                  {/* VIEW BUTTON */}
                  <button
                    onClick={() => handleView(group)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    View
                  </button>

                  <button className="bg-yellow-500 text-white px-3 py-1 rounded">
                    Edit
                  </button>

                  <button
                    onClick={async () => {
                      for (let doc of group.documents) {
                        await deleteDocument(doc._id);
                      }
                      loadDocs();
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-3xl rounded-lg p-6 relative">

            {/* CLOSE */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-500 text-xl"
            >
              ✖
            </button>

            <h2 className="text-xl font-bold mb-4">
              {selectedGroup.employee?.name} Documents
            </h2>

            {/* DOCUMENT LIST */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedGroup.documents.map((doc) => (
                <div
                  key={doc._id}
                  className="flex justify-between items-center border p-3 rounded"
                >
                  <div>
                    <p className="font-medium">{doc.documentType}</p>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      className="text-blue-600 text-sm"
                    >
                      Open File
                    </a>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}