import bcrypt from 'bcryptjs';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { TokenFactory, TokenPair } from '../factories/TokenFactory';
import { UnauthorizedError, ConflictError, NotFoundError } from '../errors/AppError';

/**
 * AuthService — Service Layer (SRP)
 * 
 * Single Responsibility: Handles ALL authentication business logic.
 * Previously this logic was scattered across authController.ts.
 * 
 * DIP: Depends on IUserRepository interface, not Mongoose User model directly.
 * The repository is injected via constructor (Dependency Injection).
 */

export interface AuthResult {
  tokens: TokenPair;
  user: { id: string; name: string; email: string; role: string };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  building?: string;
  organization?: string;
  createdAt: any;
}

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository, // DIP — injected abstraction
    private readonly tokenFactory: TokenFactory        // DIP — injected factory
  ) {}

  /**
   * Register a new user
   */
  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    const user = await this.userRepository.create({
      name,
      email,
      password, // Model's pre-save hook will hash it
      role: 'GUEST',
    });

    const tokens = this.tokenFactory.createTokenPair(
      (user as any)._id.toString(),
      user.email,
      user.role
    );

    return {
      tokens,
      user: {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Authenticate an existing user
   */
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = this.tokenFactory.createTokenPair(
      (user as any)._id.toString(),
      user.email,
      user.role
    );

    return {
      tokens,
      user: {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Refresh the access token using a refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const decoded = this.tokenFactory.verifyRefreshToken(refreshToken);
    return this.tokenFactory.createTokenPair(
      decoded.userId,
      decoded.email,
      decoded.role
    );
  }

  /**
   * Get the current user's profile
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    return {
      id: (user as any)._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      building: (user as any).building,
      organization: (user as any).organization,
      createdAt: (user as any).createdAt,
    };
  }

  /**
   * Get all wardens (admin function)
   */
  async getWardens(): Promise<UserProfile[]> {
    const wardens = await this.userRepository.findByRole('WARDEN');
    return wardens.map(warden => ({
      id: (warden as any)._id.toString(),
      name: warden.name,
      email: warden.email,
      role: warden.role,
      building: (warden as any).building,
      organization: (warden as any).organization,
      createdAt: (warden as any).createdAt,
    }));
  }
}
