import { Position, Direction, Box } from "./geometry"
import { Sprite } from "./sprites"
import { ThingPhysics, PlanePhysics } from "./physics"


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
    physics: ThingPhysics;
    planes: Record<string, PlaneData>;
}

export interface PlaneData {
    id: string;
    ownerId: string;
    physics: PlanePhysics;
    things: Record<string, Position>;
}

