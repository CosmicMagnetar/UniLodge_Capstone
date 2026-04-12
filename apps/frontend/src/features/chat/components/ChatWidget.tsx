"use client";

import { useState } from "react";
import { useChat } from "../hooks/useChat";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const { sendMessage, loading, error, reset } = useChat({
    onComplete: (response) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");

    try {
      await sendMessage(userMessage);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
    reset();
  };

  return (
    <div className="flex flex-col h-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <h2 className="text-xl font-bold">AI Assistant</h2>
        <p className="text-blue-100 text-sm">
          Ask about rooms, get recommendations, and more
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && !error && (
          <div className="text-center text-gray-500 py-12">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-semibold">Start a conversation</p>
            <p className="text-sm">
              Ask me anything about student accommodation
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg whitespace-pre-wrap break-words ${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-3 rounded-lg">
              <div className="flex space-x-2">
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg max-w-xs text-center">
              <p className="font-semibold">❌ Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer with actions */}
      {messages.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-2 bg-gray-100">
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear Chat
          </button>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 p-4 bg-white"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatWidget;
