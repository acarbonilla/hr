"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getHRToken } from "@/lib/auth-hr";
import { Plus, Edit2, Trash2, Save, X, Briefcase } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Position {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  order: number;
}

export default function PositionsManagementPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    address: "",
    employment_type: "Full-time",
    salary: "",
    key_responsibilities: "",
    required_skills: "",
    qualifications: "",
    is_active: true,
    order: 0,
  });

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      const token = getHRToken();
      if (!token) {
        router.push("/hr-login");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/position-types/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPositions(response.data.results || response.data);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching positions:", err);
      setError(err.response?.data?.detail || "Failed to load positions");
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      address: "",
      employment_type: "Full-time",
      salary: "",
      key_responsibilities: "",
      required_skills: "",
      qualifications: "",
      is_active: true,
      order: positions.length,
    });
    setEditingPosition(null);
    setShowAddModal(true);
  };

  const handleEdit = (position: Position) => {
    setFormData({
      code: position.code,
      name: position.name,
      description: position.description,
      address: position.address || "",
      employment_type: position.employment_type || "Full-time",
      salary: position.salary || "",
      key_responsibilities: position.key_responsibilities || "",
      required_skills: position.required_skills || "",
      qualifications: position.qualifications || "",
      is_active: position.is_active,
      order: position.order,
    });
    setEditingPosition(position);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getHRToken();
      if (!token) {
        router.push("/hr-login");
        return;
      }

      if (editingPosition) {
        // Update existing position
        await axios.put(`${API_BASE_URL}/position-types/${editingPosition.id}/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create new position
        await axios.post(`${API_BASE_URL}/position-types/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowAddModal(false);
      fetchPositions();
    } catch (err: any) {
      console.error("Error saving position:", err);
      setError(err.response?.data?.detail || "Failed to save position");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this position? This may affect existing interviews.")) {
      return;
    }

    try {
      const token = getHRToken();
      if (!token) {
        router.push("/hr-login");
        return;
      }

      await axios.delete(`${API_BASE_URL}/position-types/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchPositions();
    } catch (err: any) {
      console.error("Error deleting position:", err);
      setError(err.response?.data?.detail || "Failed to delete position");
    }
  };

  const toggleActive = async (position: Position) => {
    try {
      const token = getHRToken();
      if (!token) {
        router.push("/hr-login");
        return;
      }

      await axios.patch(
        `${API_BASE_URL}/position-types/${position.id}/`,
        { is_active: !position.is_active },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchPositions();
    } catch (err: any) {
      console.error("Error updating position:", err);
      setError(err.response?.data?.detail || "Failed to update position");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Briefcase className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Position Management</h1>
                <p className="text-gray-600">Manage job positions and their configurations</p>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Position</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
            <button onClick={() => setError("")} className="float-right font-bold">
              ×
            </button>
          </div>
        )}

        {/* Positions List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {positions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.order}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{position.code}</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{position.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">{position.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(position)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${position.is_active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                    >
                      {position.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(position)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(position.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {positions.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No positions found. Add your first position to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPosition ? "Edit Position" : "Add New Position"}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., virtual-assistant, IT, customer-service"
                  required
                  disabled={!!editingPosition}
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier (cannot be changed after creation)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Position Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Virtual Assistant, IT Support Specialist"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Remote, New York, Manila, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., $15-20/hr, $2000/month, etc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About the Role</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the position..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Responsibilities</label>
                <textarea
                  value={formData.key_responsibilities}
                  onChange={(e) => setFormData({ ...formData, key_responsibilities: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                  placeholder="List key responsibilities..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
                <textarea
                  value={formData.required_skills}
                  onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                  placeholder="List required skills..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
                <textarea
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                  placeholder="List qualifications..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.is_active ? "active" : "inactive"}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "active" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingPosition ? "Update" : "Create"} Position</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
