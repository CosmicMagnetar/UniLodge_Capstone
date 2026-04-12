/**
 * Room Search & Listing Page
 * Advanced search with filters and room catalog
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, MapPin, DollarSign, Users, Filter } from "lucide-react";
import { RoomCard } from "@/components/room/RoomCard";

interface SearchFilters {
  search: string;
  minPrice: number;
  maxPrice: number;
  type: string;
  university: string;
  page: number;
  limit: number;
}

export default function RoomsPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    minPrice: 0,
    maxPrice: 1000,
    type: "",
    university: "",
    page: 1,
    limit: 12,
  });

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  async function fetchRooms() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: filters.search,
        minPrice: filters.minPrice.toString(),
        maxPrice: filters.maxPrice.toString(),
        type: filters.type,
        university: filters.university,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });

      const response = await fetch(`/api/rooms?${params}`);
      const data = await response.json();

      if (data.success) {
        setRooms(data.data.rooms);
        setPagination({
          total: data.data.pagination.total,
          pages: data.data.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page
    }));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <section className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold mb-6">
            Find Student Accommodation
          </h1>

          {/* Main Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by room number, location, etc."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
            >
              <Filter size={20} />
              Filters
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Room Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">All Types</option>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="shared">Shared</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Min Price
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  University
                </label>
                <input
                  type="text"
                  value={filters.university}
                  onChange={(e) =>
                    handleFilterChange("university", e.target.value)
                  }
                  placeholder="e.g., MIT, Harvard"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : rooms.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Found <span className="font-semibold">{pagination.total}</span>{" "}
                rooms
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() =>
                    handleFilterChange("page", Math.max(1, filters.page - 1))
                  }
                  disabled={filters.page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, filters.page - 2),
                    Math.min(pagination.pages, filters.page + 1),
                  )
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => handleFilterChange("page", page)}
                      className={`px-4 py-2 border rounded-lg ${
                        page === filters.page
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  onClick={() =>
                    handleFilterChange(
                      "page",
                      Math.min(pagination.pages, filters.page + 1),
                    )
                  }
                  disabled={filters.page === pagination.pages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No rooms found matching your criteria.
            </p>
            <p className="text-gray-500">Try adjusting your filters.</p>
          </div>
        )}
      </section>
    </main>
  );
}
