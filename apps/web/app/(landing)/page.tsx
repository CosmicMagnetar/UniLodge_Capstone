/**
 * Home Page Component
 * Landing page with featured rooms, testimonials, and CTA
 */

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { RoomCard } from "@/components/room/RoomCard";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { FeatureCard } from "@/components/features/FeatureCard";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

async function getFeaturedRooms() {
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("is_available", true)
    .order("rating", { ascending: false })
    .limit(6);

  return rooms || [];
}

export default async function HomePage() {
  const featuredRooms = await getFeaturedRooms();

  const features = [
    {
      title: "Easy Booking",
      description: "Find and book your perfect room in just a few clicks",
      icon: "🎯",
    },
    {
      title: "Secure Payments",
      description: "Safe and secure payment options with multiple methods",
      icon: "🔒",
    },
    {
      title: "24/7 Support",
      description: "Get help anytime you need it from our support team",
      icon: "💬",
    },
    {
      title: "Verified Reviews",
      description: "Read authentic reviews from real guests",
      icon: "⭐",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Student",
      content:
        "UniLodge made finding accommodation so easy. The site is user-friendly and the booking process was quick!",
      image: "/testimonials/sarah.jpg",
      rating: 5,
    },
    {
      name: "John Smith",
      role: "Warden",
      content:
        "Managing my properties through UniLodge is seamless. Great platform for landlords!",
      image: "/testimonials/john.jpg",
      rating: 5,
    },
    {
      name: "Emily Davis",
      role: "Student",
      content:
        "Found my ideal room quickly. The filtering options are amazing. Highly recommended!",
      image: "/testimonials/emily.jpg",
      rating: 5,
    },
  ];

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animation-pulse"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Find Your Perfect
            <span className="block text-blue-200">Student Accommodation</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Discover, compare, and book verified student housing with
            confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
            >
              Start Searching
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition transform hover:scale-105"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose UniLodge?
            </h2>
            <p className="text-xl text-gray-600">
              The most trusted platform for student accommodation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Featured Rooms
              </h2>
              <p className="text-gray-600">
                Top-rated properties available for booking
              </p>
            </div>
            <Link
              href="/rooms"
              className="text-blue-600 font-semibold hover:text-blue-800"
            >
              View All →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          {featuredRooms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No featured rooms available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Student Reviews
            </h2>
            <p className="text-xl text-gray-600">
              What our users are saying about UniLodge
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Home?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of students who have found their ideal accommodation
          </p>
          <Link
            href="/search"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
          >
            Browse Available Rooms
          </Link>
        </div>
      </section>
    </main>
  );
}
