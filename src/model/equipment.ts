import * as cl from "../commandline/commandline"
import { deepCopy } from "../utils"
import { BookServer } from "./book"
import { ThingData, PlaneData } from "./interfaces"
import * as identity from "./identity"
import * as geo from "./geometry"
import * as actions from "../behaviour/actions"

// functions to work with equipment and slots.
export const DEFAULT_SLOT_NAME = "Hands"

export async function thingInSlot(B: BookServer, actorId: string, thingOrId?: PlaneData|ThingData|string, slotName?: string) {
    const setup = await parseSlotSetup(B, actorId, thingOrId, slotName);
    let thing;
    // 1. find slots
    // TODO
    // 2. find closest to 0,0
    if (!thing) {
        thing = await findClosest(B, undefined, setup["plane"]["id"] );
    }
    return thing;
}

export async function transferToSlot(B: BookServer, actorId: string, thingOrId?: PlaneData|ThingData|string, slotName?: string) {
    const setup = await parseSlotSetup(B, actorId, thingOrId, slotName);
    // now drop
    await actions.action(B, {
        action:  actions.ACTION.TRANSFER,
        actorId: actorId,
        thingId: setup["thing"]["id"],
        planeId: setup["plane"]["id"],
        position: setup["position"],
        noVisit: true,
    } as actions.ActionTransfer)
}

export async function transferFromSlot(B: BookServer, actorId: string, thingOrId?: PlaneData|ThingData|string, 
                                       slotName?: string, position?: geo.Position) {
    const setup = await parseSlotSetup(B, actorId, thingOrId, slotName, position);
    const pickedThing = await thingInSlot(B, setup["plane"]["id"], slotName);
    if (pickedThing) {
        await actions.action(B, {
            action:  actions.ACTION.TRANSFER,
            actorId: actorId,
            thingId: setup["thing"]["id"],
            planeId: setup["plane"]["id"],
            position: setup["position"],
            noVisit: true,
        } as actions.ActionTransfer)
    }
}

async function parseSlotSetup(B: BookServer, actorId: string, thingOrId?: PlaneData|ThingData|string, 
                              slotName?: string, targetPosition?: geo.Position) {
    thingOrId = thingOrId || actorId;
    const id = thingOrId as string;
    let thing, plane;
    if (identity.isThingId(id)) {
        thing = await B.things.load(id);
    } else {
        if ((thingOrId as ThingData)["planes"]) {
            thing = thingOrId as ThingData;
        } else {
            plane = await B.planes.load(id);
            thing = { id: id };
        }
    }
    if (!plane) {
        plane = await B.planes.load(identity.getEquipmentId(B.id(), thing.id));
    }
    // find slot or just drop.
    const position = targetPosition || plane.spawn;
    return {
        thing: thing,
        plane: plane,
        position: position,
    }
}


async function findClosest(B: BookServer, fromPositionOrThing?: geo.Position|string, planeId?: string) {
    let thingId = fromPositionOrThing as string;
    let position = fromPositionOrThing as geo.Position;
    if (fromPositionOrThing && fromPositionOrThing["length"]) {
        const thing = await B.things.load(thingId);
        planeId = thing.hostPlaneId;
    } else {
        thingId = undefined;
    }
    const plane = await B.planes.load(planeId);
    fromPositionOrThing = fromPositionOrThing || plane.spawn;
    position = plane.things[thingId];
    const min = { id: undefined, dist: undefined }
    for (let id in plane.things) {
        if (!thingId || thingId != id) {
            const dist = geo.distance(position, plane.things[id]);
            if (min.id === undefined || min.dist > dist) {
                min.id = id;
                min.dist = dist;
            }
        }
    }
    const closestThing = await B.things.load(min.id);
    return closestThing;
}