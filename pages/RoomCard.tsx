import React from 'react';
import { Room } from '../types.ts';
import { Icons } from './Icons.tsx';
import { Button, Card } from './ui.tsx';

export const RoomCard: React.FC<{ room: Room; onBook: (roomId: string) => void }> = ({ room, onBook }) => (
    <Card className="flex flex-col group">
        <div className="overflow-hidden">
             <img className="h-52 w-full object-cover" src={room.imageUrl} alt={`Room ${room.roomNumber}`} />
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="uppercase tracking-wide text-xs text-gray-500 font-semibold">{room.type}</p>
                    <p className="block mt-1 text-lg leading-tight font-bold text-dark-text">Room {room.roomNumber}</p>
                </div>
                <div className="flex items-center text-sm font-bold text-amber-700 bg-amber-100 px-2 py-1">
                    <Icons.star className="w-4 h-4 mr-1 text-amber-500"/>
                    <span>{room.rating}</span>
                </div>
            </div>
            <p className="mt-4 text-gray-600 text-sm flex-grow">{room.amenities.join(' • ')}</p>
            <div className="mt-6 flex justify-between items-center">
                <p className="text-xl font-bold text-dark-text">${room.price}<span className="text-sm font-medium text-gray-500">/night</span></p>
                {room.isAvailable ? (
                    <Button onClick={() => onBook(room.id)} variant="primary" className="!px-4 !py-2">Book</Button>
                ) : (
                    <span className="px-4 py-2 font-semibold text-sm bg-gray-200 text-gray-600">Unavailable</span>
                )}
            </div>
        </div>
    </Card>
);