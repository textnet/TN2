import { Position, Direction, Box } from "./geometry"
import { Sprite } from "./sprites"


export interface BookData {
    id: string;
}

export interface ConsoleData {
    id: string;
    thingId?: string;
}

export interface ThingData {
    id: string;
    hostPlaneId: string;
    name: string;
    sprite: Sprite;
    planes: Record<string, PlaneData>;
}

export interface PlaneData {
    id: string;
    ownerId: string;
    things: Record<string, Position>;
}

