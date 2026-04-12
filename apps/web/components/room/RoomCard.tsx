/**
 * Room Card Component
 * Displays a single room listing with image, price, amenities, and rating
 */

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Users, Wifi } from "lucide-react";

interface RoomCardProps {
  id: string;
  room_number: string;
  base_price: number;
  image_url?: string;
  university?: string;
  type?: string;
  capacity?: number;
  amenities?: string[];
  rating?: number;
  reviewCount?: number;
}

export function RoomCard({
  id,
  room_number,
  base_price,
  image_url,
  university,
  type,
  capacity,
  amenities = [],
  rating = 0,
  reviewCount = 0,
}: RoomCardProps) {
  const displayAmenities = amenities.slice(0, 3);

  return (
    <Link href={`/rooms/${id}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105 cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {image_url ? (
            <Image
              src={image_url}
              alt={room_number}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
              <span className="text-gray-600 text-4xl">🏠</span>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            ${base_price}/mo
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {room_number}
          </h3>

          {/* Location */}
          {university && (
            <div className="flex items-center text-gray-600 text-sm mb-3">
              <MapPin size={16} className="mr-2" />
              {university}
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.round(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            {reviewCount > 0 && (
              <span className="text-sm text-gray-600 ml-2">
                ({reviewCount})
              </span>
            )}
          </div>

          {/* Type and Capacity */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            {type && <span className="capitalize">{type}</span>}
            {capacity && (
              <div className="flex items-center gap-1">
                <Users size={16} />
                {capacity} guests
              </div>
            )}
          </div>

          {/* Amenities */}
          {displayAmenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {displayAmenities.map((amenity) => (
                <span
                  key={amenity}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="text-xs text-gray-600 px-2 py-1">
                  +{amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto pt-4 border-t">
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
