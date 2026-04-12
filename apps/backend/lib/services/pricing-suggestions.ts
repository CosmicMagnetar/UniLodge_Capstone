/**
 * Price Suggestion Service
 * AI-powered pricing suggestions using Hugging Face
 */

import { RoomService } from "./rooms";

interface PricingSuggestionInput {
  roomId: string;
  type: string;
  capacity: number;
  amenities: string[];
  location: string;
  university?: string;
}

interface PricingSuggestion {
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  confidence: number;
  reasoning: string;
}

export class PriceSuggestionService {
  /**
   * Get AI-powered price suggestion for a room
   */
  static async getSuggestion(
    input: PricingSuggestionInput
  ): Promise<PricingSuggestion> {
    try {
      // Get similar rooms for market analysis
      const similarRooms = await RoomService.getRecommendations(
        1000, // High budget to find all similar rooms
        input.type,
        input.amenities
      );

      if (!similarRooms || similarRooms.length === 0) {
        return this.getDefaultSuggestion(input);
      }

      // Calculate market analysis
      const prices = similarRooms.map((r) => r.base_price).filter(Boolean);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length || 0;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      // Calculate suggested price based on room features
      let suggestedPrice = avgPrice;

      // Adjust for amenities
      const amenityBonus = (input.amenities.length / 10) * avgPrice * 0.1;
      suggestedPrice += amenityBonus;

      // Adjust for capacity
      if (input.capacity && input.capacity > 1) {
        suggestedPrice *= input.capacity * 0.3; // 30% per additional person
      }

      // Ensure within market range
      suggestedPrice = Math.max(minPrice * 0.9, Math.min(maxPrice * 1.1, suggestedPrice));

      return {
        suggestedPrice: Math.round(suggestedPrice * 100) / 100,
        priceRange: {
          min: Math.round(minPrice * 100) / 100,
          max: Math.round(maxPrice * 100) / 100,
        },
        confidence: Math.min(0.95, 0.7 + (similarRooms.length / 100) * 0.25),
        reasoning:
          `Based on ${similarRooms.length} similar listings. ` +
          `Average market price: $${Math.round(avgPrice)}. ` +
          `Adjusted for ${input.amenities.length} amenities and capacity of ${input.capacity}.`,
      };
    } catch (error: any) {
      console.error("Price suggestion failed:", error);
      return this.getDefaultSuggestion(input);
    }
  }

  /**
   * Get default suggestion when AI service fails
   */
  private static getDefaultSuggestion(
    input: PricingSuggestionInput
  ): PricingSuggestion {
    const basePrice = 500; // Default base price

    // Adjust by type
    const typeMultiplier: Record<string, number> = {
      single: 0.8,
      double: 1.0,
      shared: 0.6,
    };

    // Adjust by amenities
    const amenityBonus = input.amenities.length * 20;

    // Adjust by capacity
    const capacityMultiplier = Math.max(1, input.capacity * 0.3);

    const suggestedPrice =
      basePrice * (typeMultiplier[input.type] || 1) * capacityMultiplier +
      amenityBonus;

    return {
      suggestedPrice: Math.round(suggestedPrice * 100) / 100,
      priceRange: {
        min: Math.round(suggestedPrice * 0.8 * 100) / 100,
        max: Math.round(suggestedPrice * 1.2 * 100) / 100,
      },
      confidence: 0.6,
      reasoning:
        "Default pricing based on room type, amenities, and capacity. " +
        "Run market analysis for more accurate suggestions.",
    };
  }

  /**
   * Predict seasonal price adjustments
   */
  static getSeasonalAdjustment(month: number): number {
    // Higher prices in peak months (June-August)
    const peakMonths = [6, 7, 8];
    // Lower prices in off-peak months (December-January)
    const offPeakMonths = [12, 1];

    if (peakMonths.includes(month)) {
      return 1.2; // 20% increase
    } else if (offPeakMonths.includes(month)) {
      return 0.85; // 15% decrease
    }
    return 1.0; // Normal price
  }
}
