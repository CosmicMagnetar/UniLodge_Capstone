"use client";

import { useState } from "react";
import { ChatWidget } from "@/features/chat";

/**
 * Example Chat Page
 *
 * This is an example of how to use the ChatWidget component.
 * You can copy this file to apps/frontend/src/app/chat/page.tsx
 * or any other page route.
 *
 * Then visit http://localhost:3000/chat to see the chat interface.
 */

export default function ChatPage() {
  const [showChat, setShowChat] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          AI Assistant for Student Accommodations
        </h1>
        <p className="text-xl text-gray-600">
          Ask our AI anything about finding the perfect room for your needs
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Widget */}
        <div className="lg:col-span-2">
          {showChat ? (
            <ChatWidget />
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Chat is currently hidden</p>
              <button
                onClick={() => setShowChat(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Show Chat
              </button>
            </div>
          )}
        </div>

        {/* Sidebar with Quick Actions */}
        <div className="space-y-4">
          {/* Quick Questions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Quick Questions
            </h2>
            <div className="space-y-2">
              <QuickQuestion text="What amenities should I look for?" />
              <QuickQuestion text="How do I choose a room on budget?" />
              <QuickQuestion text="What's important in a dorm?" />
              <QuickQuestion text="Any tips for first-time renters?" />
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Tips</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Ask about specific locations</li>
              <li>✓ Mention your budget upfront</li>
              <li>✓ Ask about nearby amenities</li>
              <li>✓ Request room comparisons</li>
              <li>✓ Ask for lease advice</li>
            </ul>
          </div>

          {/* About */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ℹ️ About</h2>
            <p className="text-sm text-gray-600">
              Our AI assistant uses OpenRouter to provide intelligent
              recommendations for student accommodations. Get personalized
              advice in seconds!
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-12 text-center text-gray-600">
        <p className="text-sm">
          Need help? Our AI is here to assist you 24/7. Ask anything about
          rooms, locations, prices, or amenities.
        </p>
      </div>
    </div>
  );
}

/**
 * QuickQuestion Component
 * Shows a button for pre-filled questions
 */
function QuickQuestion({ text }: { text: string }) {
  return (
    <button className="w-full px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-left text-sm font-medium transition-colors">
      {text}
    </button>
  );
}
