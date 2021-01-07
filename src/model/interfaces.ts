import { Position, Direction, Box, DIRECTION } from "./geometry"
import { Sprite } from "./sprites"
import { ThingPhysics, PlanePhysics, PLANE_PHYSICS_DEFAULT } from "./physics"
import { deepCopy } from "../utils"
import * as geo from "./geometry";

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
    isKneeled?: boolean;
    sprite: Sprite;
    physics: ThingPhysics;
    planes:  Record<string, string>;    // name:planeId
    visits?: Record<string, Position>; // position of the previous visit to planeIds.
    visitsStack?: string[]; // history of going deeper
    _isLimboPortal?: boolean;
    API?: string[];
    equipment?: ThingEquipmentMap;
}


export interface ThingEquipmentMap {
    default?:     string;     // which slot is the default for pickup 
    autopicking?: string;     // if there is such a slot, autopickup will work
    everything?:  string;     // which slot encapsulate all slots (serves as a background)
    scaleSlots?:  number;     // should we scale up/down slots when visualising?

    thingSlot?: boolean;      // this thing is actually a slot
    thingBackpack?: boolean;  // this thing is actually a backpack for autopickup
    thingSprite?: Sprite;     // this thing should have a special sprite while equipped
    thingScale?:  boolean;    // this thing should be scaled to the size of the slot while equipped
}

export interface SlotData extends ThingData {
    position: geo.Position;
}

export interface ThingConstraint {
    massName: string;
    criticalMass: number;
    reverse?: boolean;
}

export function checkConstraint(thing: ThingPhysics, c: ThingConstraint|boolean|undefined) {
    if (c === undefined) return true;
    if (c === true || c === false) return c;
    c = c as ThingConstraint;
    let isCapable;
    if (c.reverse) {
        isCapable = thing.mass[c.massName] <= c.criticalMass
    } else {
        isCapable = thing.mass[c.massName] >= c.criticalMass;
    }
    return thing.mass[c.massName] && isCapable;
}
/**
 *   Is SUBJECT capable of doing <smth> with OBJECT.
 *   "_____able" name = default behaviour (check constraint of OBJECT)
 *   "_____ing"  name = useSubjectConstraint = true (check constraint of SUBJECT)
 */
export function isCapable(constraintName: string, subject: ThingData, object: ThingData, useSubjectConstraint?: boolean) {
    if (useSubjectConstraint) {
        return isCapable(constraintName, object, subject);
    } else {
        if (!subject.physics) return true;
        return checkConstraint(subject.physics, object.constraints[constraintName])        
    }
}


export interface PlaneData {
    id: string;
    ownerId: string;
    physics?: PlanePhysics;
    things: Record<string, Position>;
    text: string;
    textAnchor?: Position;
    format?: string;
    spawn?: Position;
}

export interface ThingTemplate {
    name:  string;
    thing: ThingData,
    plane: PlaneData,
    equipment?: PlaneData,
}

export function fixThingDefaults(data) {
    data.constraints = data.constraints || deepCopy(CONSTRAINTS_DEFAULT);
    data.visits = data.visits || {};
    data.visitsStack = data.visitsStack || [];
    data.isKneeled = data.isKneeled || false;
    data.equipment = data.equipment || deepCopy(EQUIPMENT_DEFAULT);
    data.API = deepCopy(API);
}
export function fixPlaneDefaults(data) {
    data.physics    = data.physics    || deepCopy(PLANE_PHYSICS_DEFAULT);
    data.format     = data.format     || FORMAT_DEFAULT;
    data.spawn      = data.spawn      || deepCopy(SPAWN_DEFAULT);
    data.textAnchor = data.textAnchor || deepCopy(SPAWN_DEFAULT);
}
export function getThingBox(thing: ThingData, slotBox?: geo.Box) {
    let baseline = thing.physics.box;
    if (thing.equipment.thingSprite) {
        baseline = thing.equipment.thingSprite.size;
    }
    if (thing.equipment.thingScale && slotBox) {
        return geo.fitBoxInBox(baseline, slotBox)
    } else {
        return baseline;
    }
}

export const SPAWN_DEFAULT: Position = {
    x:0, y:0, z:0,
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
    AUTOPICKING: "autopicking", // Can this thing automatically pickup others
    EDITABLE:  "editable", // Can the texts of this thing be updated
}
export const CONSTRAINTS_DEFAULT = {
    pushable:    true,
    passable:    false,
    pickable:    true,
    enterable:   true,
    autopicking: false,
    editable:    true,
}

export const EQUIPMENT_DEFAULT: ThingEquipmentMap = {
    default:     "Hands",
    autopicking: "Backpack",
    everything:  "Equipment",
    scaleSlots:  1, // 0.75,
    thingSprite: undefined,
    thingScale:  false,
}

export const FORMAT = {
    MARKDOWN: "markdown",
    WRITTEN:  "lua",
}
export const FORMAT_DEFAULT = FORMAT.MARKDOWN

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
    EQUIPMENT: "equipment",
}

export const COLORS_DEFAULT = {
    "text":      "#CDECF7",
    "floor":     "#444444",
    "title":     "#1E76EC40",
    "name":      "#FFFFFF40",
    "equipment": "#25FFFF40"
}
