/**
 * Dependency Injection Container
 * Factory Pattern + Singleton Pattern
 * Manages all dependencies and their creation
 * DIP: Central place where abstractions meet concrete implementations
 */

import mongoose from 'mongoose';
import { Model } from 'mongoose';

// Domain
import { PricingService, StandardPricingStrategy } from './domain/services/PricingService';
import { AvailabilityService } from './domain/services/AvailabilityService';
import {
  IBookingRepository,
  IRoomRepository,
  IUserRepository,
} from './domain/repositories';

// Application
import { CreateBookingUseCase } from './application/booking/CreateBookingUseCase';
import { ConfirmBookingUseCase } from './application/booking/ConfirmBookingUseCase';

// Infrastructure
import { MongoBookingRepository } from './infrastructure/persistence/mongoose/MongoBookingRepository';
import { MongoRoomRepository } from './infrastructure/persistence/mongoose/MongoRoomRepository';
import { MongoUserRepository } from './infrastructure/persistence/mongoose/MongoUserRepository';
import { BookingController } from './infrastructure/http/controllers/BookingController';

/**
 * DIContainer using Singleton Pattern
 * Only one instance exists in the application
 */
export class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, any> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Register a service
   */
  register(name: string, service: any): void {
    this.services.set(name, service);
  }

  /**
   * Get a registered service
   */
  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not registered in container`);
    }
    return service as T;
  }

  /**
   * Check if service is registered
   */
  has(name: string): boolean {
    return this.services.has(name);
  }
}

/**
 * Setup function - Called once on application startup
 * FACTORY PATTERN: Centralizes object creation
 */
export async function setupDIContainer(): Promise<DIContainer> {
  const container = DIContainer.getInstance();

  // ============ REPOSITORIES ============
  // Get mongoose models (from existing setup)
  const BookingModel = mongoose.model('Booking');
  const RoomModel = mongoose.model('Room');
  const UserModel = mongoose.model('User');

  // Create repository instances
  const bookingRepository: IBookingRepository = new MongoBookingRepository(BookingModel);
  const roomRepository: IRoomRepository = new MongoRoomRepository(RoomModel);
  const userRepository: IUserRepository = new MongoUserRepository(UserModel);

  container.register('BookingRepository', bookingRepository);
  container.register('RoomRepository', roomRepository);
  container.register('UserRepository', userRepository);

  // ============ DOMAIN SERVICES ============
  // PricingService with default strategy (can be changed at runtime)
  const pricingService = new PricingService(new StandardPricingStrategy());
  container.register('PricingService', pricingService);

  // AvailabilityService depends on BookingRepository
  const availabilityService = new AvailabilityService(bookingRepository);
  container.register('AvailabilityService', availabilityService);

  // ============ APPLICATION SERVICES (USE CASES) ============
  // CreateBookingUseCase depends on repositories and domain services
  const createBookingUseCase = new CreateBookingUseCase(
    bookingRepository,
    roomRepository,
    userRepository,
    pricingService,
    availabilityService
  );
  container.register('CreateBookingUseCase', createBookingUseCase);

  // ConfirmBookingUseCase
  const confirmBookingUseCase = new ConfirmBookingUseCase(bookingRepository);
  container.register('ConfirmBookingUseCase', confirmBookingUseCase);

  // ============ HTTP CONTROLLERS ============
  // BookingController depends on use cases
  const bookingController = new BookingController(
    createBookingUseCase,
    confirmBookingUseCase,
    bookingRepository
  );
  container.register('BookingController', bookingController);

  return container;
}

/**
 * Factory for Repository Creation
 * FACTORY PATTERN: Encapsulates which repository to create based on config
 */
export class RepositoryFactory {
  /**
   * Create appropriate booking repository based on config
   */
  static createBookingRepository(type: 'mongo' | 'postgres' = 'mongo'): IBookingRepository {
    switch (type) {
      case 'mongo': {
        const BookingModel = mongoose.model('Booking');
        return new MongoBookingRepository(BookingModel);
      }
      case 'postgres':
        // TODO: Implement PostgresBookingRepository
        throw new Error('PostgreSQL repository not yet implemented');
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }

  /**
   * Create appropriate room repository based on config
   */
  static createRoomRepository(type: 'mongo' | 'postgres' = 'mongo'): IRoomRepository {
    switch (type) {
      case 'mongo': {
        const RoomModel = mongoose.model('Room');
        return new MongoRoomRepository(RoomModel);
      }
      case 'postgres':
        throw new Error('PostgreSQL repository not yet implemented');
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }
}

/**
 * Service Locator Pattern (not recommended but useful for certain scenarios)
 * Use dependency injection instead when possible
 */
export class ServiceLocator {
  private static instance: DIContainer;

  static setContainer(container: DIContainer): void {
    ServiceLocator.instance = container;
  }

  static getService<T>(name: string): T {
    if (!ServiceLocator.instance) {
      throw new Error('Container not configured. Call setContainer first.');
    }
    return ServiceLocator.instance.get<T>(name);
  }
}
