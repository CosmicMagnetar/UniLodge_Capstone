/**
 * Room Domain Entity
 */

import { Price } from '../value-objects/Price';

export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Inactive';

export interface RoomProps {
  id: string;
  wardenId: string;
  name: string;
  description: string;
  pricePerNight: Price;
  capacity: number;
  amenities: string[];
  images: string[];
  location: string;
  status: RoomStatus;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DOMAIN ENTITY: Room
 * Business rules for room management
 */
export class Room {
  private readonly id: string;
  private readonly wardenId: string;
  private name: string;
  private description: string;
  private readonly pricePerNight: Price;
  private capacity: number;
  private amenities: string[];
  private images: string[];
  private location: string;
  private status: RoomStatus;
  private isApproved: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: RoomProps) {
    this.id = props.id;
    this.wardenId = props.wardenId;
    this.name = props.name;
    this.description = props.description;
    this.pricePerNight = props.pricePerNight;
    this.capacity = props.capacity;
    this.amenities = props.amenities;
    this.images = props.images;
    this.location = props.location;
    this.status = props.status;
    this.isApproved = props.isApproved;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // ============ GETTERS ============
  getId(): string {
    return this.id;
  }

  getWardenId(): string {
    return this.wardenId;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getPricePerNight(): Price {
    return this.pricePerNight;
  }

  getCapacity(): number {
    return this.capacity;
  }

  getAmenities(): string[] {
    return [...this.amenities];
  }

  getImages(): string[] {
    return [...this.images];
  }

  getLocation(): string {
    return this.location;
  }

  getStatus(): RoomStatus {
    return this.status;
  }

  isApprovedByAdmin(): boolean {
    return this.isApproved;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // ============ BUSINESS RULES ============

  /**
   * RULE: Room can be booked only if available and approved
   */
  canBeBooked(): boolean {
    return this.isApproved && this.status === 'Available';
  }

  /**
   * RULE: Only approved rooms should be visible in listings
   */
  isVisible(): boolean {
    return this.isApproved && this.status !== 'Inactive';
  }

  /**
   * RULE: Calculate total price for stay
   */
  calculateTotalPrice(nights: number): Price {
    if (nights < 1) {
      throw new Error('Number of nights must be at least 1');
    }

    return this.pricePerNight.forNights(nights);
  }

  /**
   * RULE: Check if room has specific amenity
   */
  hasAmenity(amenity: string): boolean {
    return this.amenities.includes(amenity);
  }

  /**
   * RULE: Check if room can accommodate guests
   */
  canAccommodate(guestCount: number): boolean {
    return guestCount <= this.capacity && guestCount > 0;
  }

  // ============ STATE TRANSITIONS ============

  /**
   * ACTION: Approve room for listing
   */
  approve(): void {
    this.isApproved = true;
    this.status = 'Available';
    this.updatedAt = new Date();
  }

  /**
   * ACTION: Reject room approval
   */
  reject(): void {
    this.isApproved = false;
    this.updatedAt = new Date();
  }

  /**
   * ACTION: Mark room as under maintenance
   */
  markForMaintenance(): void {
    this.status = 'Maintenance';
    this.updatedAt = new Date();
  }

  /**
   * ACTION: Mark room as available again
   */
  markAsAvailable(): void {
    if (this.isApproved) {
      this.status = 'Available';
      this.updatedAt = new Date();
    }
  }

  /**
   * ACTION: Deactivate room
   */
  deactivate(): void {
    this.status = 'Inactive';
    this.updatedAt = new Date();
  }

  /**
   * ACTION: Update room details
   */
  update(updates: Partial<{
    name: string;
    description: string;
    capacity: number;
    amenities: string[];
    images: string[];
    location: string;
  }>): void {
    if (updates.name !== undefined) this.name = updates.name;
    if (updates.description !== undefined) this.description = updates.description;
    if (updates.capacity !== undefined) this.capacity = updates.capacity;
    if (updates.amenities !== undefined) this.amenities = updates.amenities;
    if (updates.images !== undefined) this.images = updates.images;
    if (updates.location !== undefined) this.location = updates.location;

    this.updatedAt = new Date();
  }

  /**
   * ACTION: Add image
   */
  addImage(imageUrl: string): void {
    if (!this.images.includes(imageUrl)) {
      this.images.push(imageUrl);
      this.updatedAt = new Date();
    }
  }

  /**
   * ACTION: Remove image
   */
  removeImage(imageUrl: string): void {
    this.images = this.images.filter(img => img !== imageUrl);
    this.updatedAt = new Date();
  }

  // ============ SERIALIZATION ============

  toDTO() {
    return {
      id: this.id,
      wardenId: this.wardenId,
      name: this.name,
      description: this.description,
      pricePerNight: this.pricePerNight.value,
      capacity: this.capacity,
      amenities: this.amenities,
      images: this.images,
      location: this.location,
      status: this.status,
      isApproved: this.isApproved,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromDB(data: any): Room {
    return new Room({
      id: data._id?.toString() || data.id,
      wardenId: data.wardenId?.toString() || data.wardenId,
      name: data.name,
      description: data.description,
      pricePerNight: new Price(data.pricePerNight),
      capacity: data.capacity,
      amenities: data.amenities || [],
      images: data.images || [],
      location: data.location,
      status: data.status || 'Available',
      isApproved: data.isApproved || false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
