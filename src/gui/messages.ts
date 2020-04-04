import { BookServer } from "../model/book"
import * as model   from "../model/interfaces"
import * as sprites from "../model/sprites"
import * as physics from "../model/physics"
import * as geo     from "../model/geometry"



// what should server do
export const SERVER = {
    LOG:   "log",
    PLANE: "loadPlane",
}

// what should renderer do
export const RENDER = {
    ENTER: "enter",
}


export interface Message {}
export interface EnterPlane extends Message {
    animaId: string;
    plane: PlaneRenderData;
    things: Record<string, ThingRenderData>;
}


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

export async function renderThingData(B: BookServer, thing: string|model.ThingData) {
    if (!thing["id"]) return renderThingData(B, await B.things.load(thing as string));
    thing = thing as model.ThingData;
    const plane = await B.planes.load(thing.hostPlaneId);
    if (!thing.physics.box.anchor) {
        thing.physics.box.anchor = { x:0, y: 0 };
    }
    console.log('render thing', thing.id)
    return {
        id: thing.id,
        hostPlaneId: thing.hostPlaneId,
        name: thing.name,
        constraints: thing.constraints,
        sprite: thing.sprite,
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