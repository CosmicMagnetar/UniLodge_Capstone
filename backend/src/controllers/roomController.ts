import { Request, Response, NextFunction } from 'express';
import { roomService } from '../container';
import { createRoomSchema } from '../validators/schemas';
import { ValidationError } from '../errors/AppError';

/**
 * RoomController — Thin Controller (SRP)
 * 
 * All business logic is in RoomService. Controller only handles:
 * HTTP request parsing → Service delegation → HTTP response formatting
 */

export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, minPrice, maxPrice, available, search } = req.query;
    const rooms = await roomService.getRooms({
      type: type as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      available: available !== undefined ? available === 'true' : undefined,
      search: search as string,
    });
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};

export const getRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createRoomSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors.map(e => e.message).join(', '));
    }

    const room = await roomService.createRoom(parsed.data);
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const room = await roomService.updateRoom(req.params.id, req.body);
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await roomService.deleteRoom(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const approveRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const room = await roomService.approveRoom(req.params.id, userId);
    res.json({ message: 'Room approved successfully', room });
  } catch (error) {
    next(error);
  }
};

export const rejectRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await roomService.rejectRoom(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getPendingRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rooms = await roomService.getPendingRooms();
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};
