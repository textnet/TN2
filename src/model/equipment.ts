import * as cl from "../commandline/commandline"
import { deepCopy } from "../utils"
import { BookServer } from "./book"
import { ThingData, PlaneData } from "./interfaces"
import * as identity from "./identity"
import * as geo from "./geometry"
import * as actions from "../behaviour/actions"

// functions to work with equipment and slots.
export const DEFAULT_SLOT_NAME = "Hands"

interface TransferParameters {
    actorId: string;
    thingId: string;
    thing: ThingData;
    equipPlane: PlaneData;
    slotName: string;
    position?: geo.Position;
}

export async function thingInHands(B: BookServer, actorId: string, ownerId: string) {
    return thingInSlot(B, actorId, ownerId, DEFAULT_SLOT_NAME);
}

export async function thingInSlot(B: BookServer, actorId: string, ownerId: string, slotName?: string) {
    const equipmentPlane = await B.getEquipmentPlane(ownerId);
    const thing = await findClosest(B, equipmentPlane);
    // TODO find in slots
    return thing;
}

export async function transferToSlot(B: BookServer, actorId: string, thingId: string,
                                     targetThingId?: string, slotName?: string) {
    const equipmentPlane = await B.getEquipmentPlane(targetThingId);
    const position = equipmentPlane.spawn;
    // TODO calculate slot position
    await actions.action(B, {
        action:   actions.ACTION.TRANSFER,
        actorId:  actorId,
        thingId:  thingId,
        planeId:  equipmentPlane.id,
        position: position,
        noVisit:  true,
    } as actions.ActionTransfer)
}

export async function directTransferUnequip(B: BookServer, actorId: string, 
                                            thing: ThingData, targetPlaneId: string,                                  
                                            targetPosition: geo.Position) {
    if (thing) {
        await actions.action(B, {
            action:   actions.ACTION.TRANSFER,
            actorId:  actorId,
            thingId:  thing.id,
            planeId:  targetPlaneId,
            position: targetPosition,
            noVisit:  true,
        } as actions.ActionTransfer)
    }
    return thing;
}

async function findClosest(B: BookServer, plane: PlaneData, position?: geo.Position) {
    position = position || plane.spawn;  
    const min = { id: undefined, dist: undefined }
    for (let id in plane.things) {
        const dist = geo.distance(position, plane.things[id]);
        if (min.id === undefined || min.dist > dist) {
            min.id = id;
            min.dist = dist;
        }
    }
    const closestThing = await B.things.load(min.id);
    return closestThing;
}










