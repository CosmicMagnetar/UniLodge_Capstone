import { PriceSuggestion, Room } from "../types";
import { api } from "./api"; // Ensure api is exported from api.ts or use fetch

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Gets a one-time price suggestion via the backend.
 */
export async function getPriceSuggestion(
  roomDetails: Partial<Room>
): Promise<PriceSuggestion> {
  const prompt = `
    Based on the following room details for a college guesthouse, suggest an optimal nightly price.
    Room Type: ${roomDetails.type}
    Amenities: ${roomDetails.amenities?.join(", ")}
    Current Base Price: $${roomDetails.price}

    Consider demand, mid-semester season, and amenities.
    Respond ONLY with a JSON object:
    { "suggestedPrice": number, "reasoning": string }
  `;

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: prompt }),
    });

    if (!response.ok) throw new Error("Failed to fetch price suggestion");
    const data = await response.json();
    
    // Attempt to parse JSON from AI response
    try {
      const jsonStr = data.response.match(/\{[\s\S]*\}/)?.[0] || data.response;
      return JSON.parse(jsonStr);
    } catch (e) {
      return {
        suggestedPrice: roomDetails.price || 50,
        reasoning: data.response,
      };
    }
  } catch (err) {
    console.error("Price suggestion failed:", err);
    return {
      suggestedPrice: roomDetails.price || 50,
      reasoning: "An error occurred while fetching suggestions.",
    };
  }
}

/**
 * Creates a new chat session using the backend proxy.
 */
export const createAiChat = (systemInstruction: string) => {
  return {
    sendMessage: async (msg: string) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: msg, context: systemInstruction }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Error ${response.status}`);
      }

      const data = await response.json();
      return {
        response: {
          text: () => data.response,
        },
      };
    },

    // Simulate streaming by returning the whole response at once
    sendMessageStream: async (msg: string) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: msg, context: systemInstruction }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Error ${response.status}`);
      }

      const data = await response.json();

      async function* streamGenerator() {
        yield { text: () => data.response };
      }

      return { stream: streamGenerator() };
    },
  };
};
