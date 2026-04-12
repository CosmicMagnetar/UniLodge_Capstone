import { Role } from '../types';

/**
 * Permission utility functions for role-based access control
 */

export function canViewAllBookings(role: Role): boolean {
    return role === Role.ADMIN;
}

export function canApproveRequests(role: Role): boolean {
    return role === Role.ADMIN;
}

export function canManageUsers(role: Role): boolean {
    return role === Role.ADMIN;
}

export function canCheckInOut(role: Role): boolean {
    return role === Role.ADMIN || role === Role.WARDEN;
}

export function canViewAnalytics(role: Role): boolean {
    return role === Role.ADMIN;
}

export function canCreateRooms(role: Role): boolean {
    return role === Role.ADMIN;
}

export function canViewPendingRooms(role: Role): boolean {
    return role === Role.ADMIN;
}

export function canViewWardenList(role: Role): boolean {
    return role === Role.ADMIN;
}

export function canViewAllPayments(role: Role): boolean {
    return role === Role.ADMIN;
}

export function canSubmitBookingRequest(role: Role): boolean {
    return role === Role.GUEST;
}

export function canViewRoomMaps(role: Role): boolean {
    return role === Role.ADMIN || role === Role.WARDEN || role === Role.GUEST;
}

export function canViewMessCardDetails(role: Role): boolean {
    return role === Role.ADMIN || role === Role.WARDEN || role === Role.GUEST;
}

export function getAccessDeniedMessage(): string {
    return "Your role does not have access to that information.";
}
