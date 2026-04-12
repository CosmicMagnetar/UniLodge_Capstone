/**
 * Warden Room Management Page
 * Add, edit, and manage room listings
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Home,
  DollarSign,
  Users,
  Loader,
  Check,
  X,
} from "lucide-react";
import {
  TextField,
  NumberField,
  SelectField,
  TextAreaField,
  CheckboxField,
  FormContainer,
  FormSection,
} from "@/components/forms/FormComponents";

interface Room {
  id: string;
  room_number: string;
  type: string;
  base_price: number;
  capacity: number;
  university: string;
  is_available: boolean;
  amenities: string[];
}

export default function RoomsManagementPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    room_number: "",
    type: "single",
    base_price: 500,
    capacity: 1,
    university: "",
    amenities: [] as string[],
    description: "",
  });

  const amenitiesOptions = [
    { label: "WiFi", value: "WiFi" },
    { label: "AC", value: "AC" },
    { label: "Kitchen", value: "Kitchen" },
    { label: "Balcony", value: "Balcony" },
    { label: "Parking", value: "Parking" },
    { label: "Gym", value: "Gym" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      router.push("/auth/login");
      return;
    }

    fetchRooms(token, userId);
  }, []);

  async function fetchRooms(token: string, userId: string) {
    try {
      // This would call your API endpoint
      // const response = await fetch("/api/warden/rooms", { ... });
      // For now, using mock data
      setRooms([]);
    } catch (err) {
      setError("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    try {
      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId ? `/api/rooms/${editingId}` : "/api/rooms";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (editingId) {
          setRooms((r) =>
            r.map((room) => (room.id === editingId ? data.data : room)),
          );
        } else {
          setRooms((r) => [...r, data.data]);
        }
        resetForm();
      } else {
        setError(data.error || "Failed to save room");
      }
    } catch (err) {
      setError("An error occurred");
    }
  }

  function resetForm() {
    setFormData({
      room_number: "",
      type: "single",
      base_price: 500,
      capacity: 1,
      university: "",
      amenities: [],
      description: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(room: Room) {
    setFormData({
      room_number: room.room_number,
      type: room.type,
      base_price: room.base_price,
      capacity: room.capacity,
      university: room.university,
      amenities: room.amenities,
      description: "",
    });
    setEditingId(room.id);
    setShowForm(true);
  }

  async function handleDelete(roomId: string) {
    const token = localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");

    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
        },
      });

      setRooms((r) => r.filter((room) => room.id !== roomId));
    } catch (err) {
      setError("Failed to delete room");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-blue-600" size={40} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/warden/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Manage Rooms</h1>
          </div>
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            {showForm ? (
              <>
                <X size={20} />
                Cancel
              </>
            ) : (
              <>
                <Plus size={20} />
                Add Room
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {editingId ? "Edit Room" : "Add New Room"}
            </h2>

            <FormContainer
              onSubmit={handleSubmit}
              className="grid md:grid-cols-2 gap-6"
            >
              <TextField
                label="Room Number"
                placeholder="e.g., A101"
                value={formData.room_number}
                onChange={(e) =>
                  setFormData({ ...formData, room_number: e.target.value })
                }
                required
              />

              <SelectField
                label="Room Type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                options={[
                  { label: "Single", value: "single" },
                  { label: "Double", value: "double" },
                  { label: "Shared", value: "shared" },
                ]}
                required
              />

              <NumberField
                label="Base Price (per night)"
                value={formData.base_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    base_price: parseFloat(e.target.value),
                  })
                }
                min={100}
                max={10000}
                required
              />

              <NumberField
                label="Capacity (occupants)"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: parseInt(e.target.value),
                  })
                }
                min={1}
                max={10}
                required
              />

              <TextField
                label="University"
                placeholder="e.g., MIT"
                value={formData.university}
                onChange={(e) =>
                  setFormData({ ...formData, university: e.target.value })
                }
                required
              />

              <div className="md:col-span-2">
                <TextAreaField
                  label="Description"
                  placeholder="Describe the room features and amenities..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="md:col-span-2">
                <FormSection
                  title="Amenities"
                  description="Select available amenities"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {amenitiesOptions.map((option) => (
                      <CheckboxField
                        key={option.value}
                        label={option.label}
                        checked={formData.amenities.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              amenities: [...formData.amenities, option.value],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              amenities: formData.amenities.filter(
                                (a) => a !== option.value,
                              ),
                            });
                          }
                        }}
                      />
                    ))}
                  </div>
                </FormSection>
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  {editingId ? "Update Room" : "Add Room"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </FormContainer>
          </div>
        )}

        {/* Rooms List */}
        {rooms.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Room
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Capacity
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4  font-semibold text-gray-900">
                        {room.room_number}
                      </td>
                      <td className="px-6 py-4 text-gray-600 capitalize">
                        {room.type}
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-600">
                        ${room.base_price}/night
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {room.capacity} person{room.capacity > 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4">
                        {room.is_available ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            <Check size={16} />
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                            <X size={16} />
                            Unavailable
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(room)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Edit room"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Delete room"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <Home className="mx-auto text-gray-400 mb-4" size={40} />
            <p className="text-gray-600 text-lg mb-4">No rooms yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              <Plus className="inline mr-2" size={20} />
              Add Your First Room
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
