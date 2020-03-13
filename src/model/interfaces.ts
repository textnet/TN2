import { Position, Direction, Box, DIRECTION } from "./geometry"
import { Sprite } from "./sprites"
import { ThingPhysics, PlanePhysics, PLANE_PHYSICS_DEFAULT } from "./physics"
import { deepCopy } from "../utils"

// Structures that are saved in the Book storage.
// Should not have circular references or references to deeper objects.

export interface BookData {
    id: string;
    thingId?: string;
}

export interface ConsoleData {
    id: string;
    thingId?: string;
}

export interface ThingData {
    id: string;
    hostPlaneId: string;
    lostPlaneId?: string;
    name: string;
    colors: Record<string,string>; // e.g. text, floor, title, skin, eyes. use constants as keys!
    constraints?: Record<string,boolean|ThingConstraint>; // constraints like "pushable" etc. true/false or min mass
    sprite: Sprite;
    physics: ThingPhysics;
    planes:  Record<string, string>;    // name:planeId
    visits?: Record<string, Position>; // position of the previous visit to planeIds.
    API?: string[];
}

export interface ThingConstraint {
    massName: string;
    criticalMass: number;
}

export interface PlaneData {
    id: string;
    ownerId: string;
    physics?: PlanePhysics;
    things: Record<string, Position>;
    text: string;
    format?: string;
    spawn?: Position;
}

export interface ThingTemplate {
    name:  string;
    thing: ThingData,
    plane: PlaneData,
}

export function fixThingDefaults(data) {
    data.constraints = data.constraints || deepCopy(CONSTRAINTS_DEFAULT);
    data.visits = data.visits || {};
    data.API = deepCopy(API);
}
export function fixPlaneDefaults(data) {
    data.physics = data.physics   || deepCopy(PLANE_PHYSICS_DEFAULT);
    data.format  = data.format    || FORMAT_DEFAULT;
    data.spawn   = data.spawn     || deepCopy(SPAWN_DEFAULT);
}

export const SPAWN_DEFAULT: Position = {
    x:100, y:100, z:0,
    direction: DIRECTION.DOWN,
}

export const SAY = {
    WHISPER:   0,
    SHOUT:    -1,
    SAY:     200, // distance of normal voice
}

export const CONSTRAINTS = {
    PUSHABLE: "pushable", // Can this thing be pushed?
    PASSABLE: "passable", // Can this thing be passed through?
    PICKABLE: "pickable", // Can this thing be picked up?
    LOCKED:   "locked",   // Can someone enter inside this thing?"
}
export const CONSTRAINTS_DEFAULT = {
    pushable: true,
    passable: false,
    pickable: true,
    locked:   false,
}

export const FORMAT = {
    MARKDOWN: "markdown",
    WRITTEN:  "lua",
}
export const FORMAT_DEFAULT = FORMAT.MARKDOWN;

const API = [ "name",
              "constraints",
              "colors", 
              "physics",
              "API",
            ];


export const PLANE = {
    LIMBO:     "limbo",    // Limbo plane where all lost things are.
    MATERIAL:  "material", // Material plane that everybody starts with. See: Democritus
    THOUGHT:   "thought",  // Thought plane is where thinking mechanics happens. See: Schedrovitski.
}
export const PLANE_DEFAULT = PLANE.MATERIAL;

export const COLOR = {
    TEXT:  "#CDECF7",
    FLOOR: "#444444",
    TITLE: "#1E76EC",
    NAME:  "#FFFFFF",
}
