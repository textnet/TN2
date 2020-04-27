import { BookServer } from "../model/book"
import * as model    from "../model/interfaces"
import * as sprites  from "../model/sprites"
import * as physics  from "../model/physics"
import * as geo      from "../model/geometry"
import * as attempts from "../behaviour/attempts"

// what should server do (messages sent by renderer)
export const SERVER = {
    LOG:         "log",
    PLANE:       "loadPlane",
    MOVE_START:  "startMoving",
    MOVE_FINISH: "stopMoving",
    PLACE:       "reposition",
    ATTEMPT:     "attempt",    // attempt different actions, see below
    TRANSFER_UP: "transferUp", // go up in the stack
}

export const ATTEMPT = attempts.ATTEMPT;

// what should renderer do (messages sent by server)
export const RENDER = {
    ENTER_PLANE: "enterPlane",
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
    thing: ThingRenderData;
    ownerId: string;
}
export interface UnEquip extends Message {
    thingId: string;
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
    format: string;
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
}

export async function renderThingData(B: BookServer, thing: string|model.ThingData, 
                                      equipmentOwnerId?: string) {
    if (!thing["id"]) return renderThingData(B, await B.things.load(thing as string));
    thing = thing as model.ThingData;
    const plane = await B.planes.load(thing.hostPlaneId);
    if (!thing.physics.box.anchor) {
        thing.physics.box.anchor = { x:0, y: 0 };
    }
    return {
        id: thing.id,
        hostPlaneId: thing.hostPlaneId,
        name: thing.name,
        constraints: thing.constraints,
        sprite: (equipmentOwnerId && thing.spriteEquipped)? 
                 thing.spriteEquipped : thing.sprite,
        physics: physics.patchThingPhysics(thing.physics),
        position: plane.things[thing.id],
    } as ThingRenderData;
}

export async function renderPlaneData(B: BookServer, plane: string|model.PlaneData) {
    if (!plane["id"]) return renderPlaneData(B, await B.planes.load(plane as string));
    plane = plane as model.PlaneData;
    const thing = await B.things.load(plane.ownerId);
    return {
        id: plane.id,
        ownerId: plane.ownerId,
        name: thing.name,
        colors: thing.colors,
        text: plane.text,
        format: plane.format,
        physics: physics.patchPlanePhysics(plane.physics),
    } as PlaneRenderData;
}