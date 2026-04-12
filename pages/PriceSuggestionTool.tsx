import React, { useState } from "react";
import { Room, PriceSuggestion } from "../types.ts";
import { getPriceSuggestion } from "../services/geminiService.ts";
import { Button, Input, Card } from "./ui.tsx";

export const PriceSuggestionTool: React.FC<{}> = () => {
  const [roomDetails, setRoomDetails] = useState<Partial<Room>>({
    type: "Single",
    price: 50,
    amenities: ["Wi-Fi"],
  });
  const [suggestion, setSuggestion] = useState<PriceSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    setError("");
    setSuggestion(null);
    try {
      const result = await getPriceSuggestion(roomDetails);
      setSuggestion(result);
    } catch (err) {
      console.error("Error getting price suggestion:", err);
      setError(
        "Failed to get a suggestion. Please check your API key and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8 max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-6 text-dark-text text-center">
        AI Dynamic Pricing
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Type
          </label>
          <select
            value={roomDetails.type}
            onChange={(e) =>
              setRoomDetails({
                ...roomDetails,
                type: e.target.value as "Single" | "Double" | "Suite",
              })
            }
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base bg-white border-subtle-border focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
          >
            <option>Single</option>
            <option>Double</option>
            <option>Suite</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Price ($)
          </label>
          <Input
            type="number"
            value={roomDetails.price || ""}
            onChange={(e) =>
              setRoomDetails({
                ...roomDetails,
                price: parseInt(e.target.value),
              })
            }
          />
        </div>
        <Button
          onClick={handleGetSuggestion}
          disabled={isLoading}
          className="w-full !mt-6"
        >
          {isLoading ? "Getting Suggestion..." : "Get AI Price Suggestion"}
        </Button>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {suggestion && (
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="font-semibold text-amber-800">Suggested Price:</p>
          <p className="text-4xl font-extrabold text-amber-700">
            ${suggestion.suggestedPrice.toFixed(2)}
          </p>
          <p className="mt-3 font-semibold text-amber-800">Reasoning:</p>
          <p className="text-sm text-gray-700">{suggestion.reasoning}</p>
        </div>
      )}
    </Card>
  );
};
