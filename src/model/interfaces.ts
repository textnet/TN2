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
    visitsStack?: string[]; // history of going deeper
    _isLimboPortal?: boolean;
    API?: string[];
}

export interface ThingConstraint {
    massName: string;
    criticalMass: number;
}

export function checkConstraint(thing: ThingPhysics, c: ThingConstraint|boolean|undefined) {
    if (c === undefined) return true;
    if (c === true || c === false) return c;
    c = c as ThingConstraint;
    return thing.mass[c.massName] && thing.mass[c.massName] >= c.criticalMass;
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
    data.visitsStack = data.visitsStack || [];
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
    PUSHABLE:  "pushable", // Can this thing be pushed?
    PASSABLE:  "passable", // Can this thing be passed through?
    PICKABLE:  "pickable", // Can this thing be picked up?
    ENTERABLE: "enterable",   // Can someone enter inside this thing?"
}
export const CONSTRAINTS_DEFAULT = {
    pushable:    true,
    passable:    false,
    pickable:    true,
    enterable:   true,
}

export const FORMAT = {
    MARKDOWN: "markdown",
    WRITTEN:  "lua",
}
export const FORMAT_DEFAULT = FORMAT.MARKDOWN;

export const API = [ 
              "name",
              "constraints",
              "colors", 
              "physics",
              "API",
            ];


export const PLANE = {
    LIMBO:     "limbo",      // Limbo plane where all lost things are.
    MATERIAL:  "material",   // Material plane that everybody starts with. See: Democritus
    THOUGHT:   "thought",    // Thought plane is where thinking mechanics happens. See: Schedrovitski.
}
export const PLANE_DEFAULT = PLANE.MATERIAL;
export const LIMBO_PORTAL_TEMPLATE  = "<LimboPortal>"

export const COLORS = {
    TEXT:  "text",
    FLOOR: "floor",
    TITLE: "title",
    NAME:  "name",
}

export const COLORS_DEFAULT = {
    "text":  "#CDECF7",
    "floor": "#444444",
    "title": "#1E76EC",
    "name":  "#FFFFFF",
}
