/**
 * Testimonial Card Component
 * Displays user testimonial with image, rating, and review
 */

import Image from "next/image";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  image: string;
  rating: number;
}

export function TestimonialCard({
  name,
  role,
  content,
  image,
  rating,
}: TestimonialCardProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-700 mb-6 italic">"{content}"</p>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden">
          <Image src={image} alt={name} fill className="object-cover" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
    </div>
  );
}
