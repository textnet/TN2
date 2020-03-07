import { Position, Direction, Box } from "./geometry"
import { Sprite } from "./sprites"
import { ThingPhysics, PlanePhysics } from "./physics"

// Structures that are saved in the Book storage.
// Should not have circular references or references to deeper objects.

export interface BookData {
    id: string;
    setupPlanes?: string[]; // TODO use!
}

export interface ConsoleData {
    id: string;
    thingId?: string;
}

export interface ThingData {
    id: string;
    hostPlaneId: string;
    name: string;
    colors: Record<string,string>; // e.g. text, floor, title, skin, eyes. use constants as keys!
    constraints: Record<string,boolean|ThingConstraint>; // constraints like "pushable" etc. true/false or min mass
    sprite: Sprite;
    physics: ThingPhysics;
    planes: Record<string, PlaneData>;
}

export interface ThingConstraint {
    massName: string;
    criticalMass: number;
}

export interface PlaneData {
    id: string;
    ownerId: string;
    physics: PlanePhysics;
    things: Record<string, Position>;
}

export const CONSTRAINT = {
    pushable: "Can this thing be pushed?",
    passable: "Can this thing be passed through?",
    pickable: "Can this thing be picked up?",
    locked:   "Can someone enter inside this thing?"
}

export const PLANE: Record<string,string> = {
    LIMBO:     "Limbo plane where all lost things are.",
    MATERIAL:  "Material plane that everybody starts with. See: Democritus.",
    THOUGHT:   "Thought plane is where thinking mechanics happens. See: Schedrovitski.",
}
export const PLANE_DEFAULT = PLANE.MATERIAL;

export const COLOR: Record<string,string> = {
    TEXT:  "#CDECF7",
    FLOOR: "#444444",
    TITLE: "#1E76EC",
    NAME:  "#FFFFFF",
}
