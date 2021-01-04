import { BookServer } from "../model/book"
import * as model     from "../model/interfaces"
import * as sprites   from "../model/sprites"
import * as physics   from "../model/physics"
import * as geo       from "../model/geometry"
import * as equipment from "../model/equipment"
import * as attempts  from "../behaviour/attempts"

// what should server do (messages sent by renderer)
export const SERVER = {
    LOG:         "log",
    PLANE:       "loadPlane",
    MOVE_START:  "startMoving",
    MOVE_FINISH: "stopMoving",
    PLACE:       "reposition",
    ATTEMPT:     "attempt",    // attempt different actions, see below
    EQUIPMENT:   "loadEquipment",  // show equipment
    TRANSFER_UP: "transferUp", // go up in the stack
}

export const ATTEMPT = attempts.ATTEMPT;

// what should renderer do (messages sent by server)
export const RENDER = {
    ENTER_PLANE: "enterPlane",
    EQUIPMENT:   "equipment",
    PLACE: "reposition",
    MOVE:  "move",
    LEAVE: "leave",
    ENTER: "enter",
    READY: "ready",
    EQUIP: "equip",
    UN_EQUIP: "unEquip",
}

export interface Message {
    animaThingId?: string; // used to tell who the player is
    event?:   string;   
}
export interface MessageReady extends Message {
    isReady: boolean;
}
export interface MessageLog extends Message {
    data: any;
}
export interface EnterPlane extends Message {
    asObserver: boolean;
    plane: PlaneRenderData;
    things: Record<string, ThingRenderData>;
    equipment: Record<string, ThingRenderData>;
}
export interface Place extends Message {
    position: geo.Position;
    thingId?: string; 
}
export interface Leave extends Message {
    thingId: string; 
}
export interface Enter extends Message {
    thing: ThingRenderData;
    equipped: ThingRenderData;
}
export interface Equip extends Message {
    slotName: string;
    equipmentMap: Record<string, string>;
    thing: ThingRenderData;
    ownerId: string;
}
export interface UnEquip extends Message {
    thingId: string;
}
export interface RequestEquipment extends Message {
    ownerId: string;
    slotName?: string;
}
export interface Equipment extends Message {
    contents: EquipmentRenderData;
}
export interface TransferUp extends Message {}
export interface Attempt extends Message {
    direction: geo.Direction;
    attempt: string;
}
export interface Move extends Message {
    thingId?: string;
    isStart?: boolean;
}
export interface MoveStart extends Move {}
export interface MoveEnd   extends Move {}


export interface PlaneRenderData {
    id: string;
    ownerId: string;
    name: string;
    colors: Record<string,string>;
    text: string;
    textAnchor: geo.Position;
    format: string;
    equipment: model.ThingEquipmentMap;
    physics: physics.PlanePhysics;
}

export interface ThingRenderData {
    id: string;
    hostPlaneId: string;
    name: string;
    constraints: Record<string,boolean|model.ThingConstraint>;
    sprite: sprites.Sprite;
    physics: physics.ThingPhysics;
    position: geo.Position;
    equipment: model.ThingEquipmentMap;
    slotId?: string;
}

export interface EquipmentRenderData {
    ownerId: string;
    slotName?: string;
    slots?: Record<string, ThingRenderData>;
    things: Record<string, ThingRenderData>;
    plane: PlaneRenderData;
}

export async function renderThingData(B: BookServer, thing: string|model.ThingData, 
                                      slot?: model.SlotData) {
    if (!thing["id"]) return renderThingData(B, await B.things.load(thing as string), slot) as ThingRenderData;
    thing = thing as model.ThingData;
    const plane = await B.planes.load(thing.hostPlaneId);
    if (!thing.physics.box.anchor) {
        thing.physics.box.anchor = { x:0, y: 0 };
    }
    let renderPhysics = physics.patchThingPhysics(thing.physics);
    let renderSprite = thing.sprite;
    if (slot) {
        if (thing.equipment.thingSprite) {
            renderSprite = thing.equipment.thingSprite;
        }
        if (thing.equipment.thingScale) {
            renderSprite.visualScale = geo.deriveBoxScale(thing.physics.box, slot.physics.box);
            if (renderSprite.visualScale > 1) {
                renderSprite.visualScale = 1;
            }
            renderPhysics.box =  model.getThingBox(thing, slot.physics.box);
        }
    }
    return {
        id: thing.id,
        hostPlaneId: thing.hostPlaneId,
        name: thing.name,
        constraints: thing.constraints,
        sprite: renderSprite,
        physics: renderPhysics,
        equipment: thing.equipment,
        position: plane.things[thing.id]
    } as ThingRenderData;
}

export async function renderPlaneData(B: BookServer, plane: string|model.PlaneData) {
    if (!plane["id"]) return renderPlaneData(B, await B.planes.load(plane as string)) as PlaneRenderData;
    plane = plane as model.PlaneData;
    const thing = await B.things.load(plane.ownerId);
    return {
        id: plane.id,
        ownerId: plane.ownerId,
        name: thing.name,
        colors: thing.colors,
        text: plane.text,
        textAnchor: plane.textAnchor,
        format: plane.format,
        equipment: thing.equipment,
        physics: physics.patchPlanePhysics(plane.physics),
    } as PlaneRenderData;
}

