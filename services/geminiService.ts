import { PriceSuggestion, Room } from "../types";

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Base URL for OpenRouter
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const DEFAULT_MODEL = "arcee-ai/trinity-mini:free";

const generationConfig = {
  temperature: 0.7,
};

/**
 * Helper: Send a POST request to OpenRouter
 */
async function openRouterRequest(body: any) {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin, // Required by OpenRouter
      "X-Title": "UniLodge", // Optional
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please check your OpenRouter credits or try again later.");
    }
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  return response;
}

/**
 * Gets a one-time price suggestion.
 */
export async function getPriceSuggestion(
  roomDetails: Partial<Room>
): Promise<PriceSuggestion> {
  // Mock fallback
  if (!API_KEY) {
    await new Promise((res) => setTimeout(res, 1000));
    return {
      suggestedPrice: 75,
      reasoning:
        "This is a mock response. Demand is average for this 'Suite' room type.",
    };
  }

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
    const response = await openRouterRequest({
      model: DEFAULT_MODEL,
      messages: [{ role: "user", content: prompt }],
      ...generationConfig,
    });

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content;

    return JSON.parse(text);
  } catch (err) {
    console.error("Price suggestion failed:", err);
    return {
      suggestedPrice: roomDetails.price || 50,
      reasoning: "An error occurred while fetching suggestions.",
    };
  }
}

/**
 * Creates a new chat session using OpenRouter.
 */
export const createAiChat = (systemInstruction: string) => {
  if (!API_KEY) {
    // Mock chat (no key)
    return {
      sendMessage: async () => ({
        response: {
          text: () =>
            "This is a mock AI response because OpenRouter API key is missing.",
        },
      }),

      sendMessageStream: async () => {
        return {
          stream: (async function* () {
            const msg =
              "This is a mock AI response. Configure your OpenRouter API key.";
            const words = msg.split(" ");
            for (const w of words) {
              await new Promise((r) => setTimeout(r, 50));
              yield { text: () => w + " " };
            }
          })(),
        };
      },
    };
  }

  /**
   * REAL CHAT SESSION (OpenRouter)
   */
  const history: { role: string; content: string }[] = [
    { role: "system", content: systemInstruction },
  ];

  return {
    sendMessage: async (msg: string) => {
      history.push({ role: "user", content: msg });

      const response = await openRouterRequest({
        model: DEFAULT_MODEL,
        messages: history,
        ...generationConfig,
      });

      const data = await response.json();
      const content = data.choices[0].message.content;

      history.push({ role: "assistant", content });

      return {
        response: {
          text: () => content,
        },
      };
    },

    sendMessageStream: async (msg: string) => {
      history.push({ role: "user", content: msg });

      const response = await openRouterRequest({
        model: DEFAULT_MODEL,
        messages: history,
        stream: true,
        ...generationConfig,
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      async function* streamGenerator() {
        let buffer = "";

        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;

          buffer += decoder.decode(chunk.value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (!part.startsWith("data:")) continue;

            const data = part.replace("data: ", "");
            if (data === "[DONE]") return;

            try {
              const json = JSON.parse(data);
              const text = json.choices?.[0]?.delta?.content;
              if (text) yield { text: () => text };
            } catch { }
          }
        }
      }

      return { stream: streamGenerator() };
    },
  };
};
