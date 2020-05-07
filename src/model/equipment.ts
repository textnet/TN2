import * as cl from "../commandline/commandline"
import { deepCopy } from "../utils"
import { BookServer } from "./book"
import { ThingData, PlaneData } from "./interfaces"
import * as identity from "./identity"
import * as geo from "./geometry"
import * as actions from "../behaviour/actions"
import * as spatials from "../behaviour/actions/spatials"

// functions to work with equipment and slots.
export const DEFAULT_SLOT_NAME = "Hands"
export const AUTO_PICKUP_SLOT_NAME = "Backpack"

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
    if (slotName) {
        const slots = await getSlots(B, ownerId);
        if (slots[slotName]) {
            for (let slot of slots[slotName]) {
                const thing = await findClosest(B, equipmentPlane, slot.position, slot.physics.box);
                if (thing) return thing;
            }
            return undefined;
        }
    }
    const thing = await findClosest(B, equipmentPlane);    
    return thing;
}

interface SlotData extends ThingData {
    position: geo.Position;
}

export async function getSlots(B: BookServer, ownerId: string, slotName?: string) {
    const equipmentPlane = await B.getEquipmentPlane(ownerId);
    const slots: Record<string, SlotData[]> = {}
    for (let id in equipmentPlane.things) {
        const thing = await B.things.load(id) as SlotData;
        if (thing.physics.slot) {
            thing.position = equipmentPlane.things[id];
            if (!slots[thing.name]) slots[thing.name] = [];
            slots[thing.name].push(thing);
        }
    }
    return slotName? slots[slotName] : slots;
}

export async function transferToSlot(B: BookServer, actorId: string, thingId: string,
                                     targetThingId?: string, slotName?: string) {
    const equipmentPlane = await B.getEquipmentPlane(targetThingId);
    const thing = await B.things.load(thingId);
    let position = equipmentPlane.spawn;
    const slots = slotName? await getSlots(B, targetThingId, slotName):undefined;
    let target: geo.Position;

    if (slots) {
        for (let i in slots) {
            const target = await spatials.findNextFitting(B, thing, equipmentPlane, slots[i].position);
            if (target) break;
        }
    } else {
        target = await spatials.findNextFitting(B, thing, equipmentPlane, position)
    }
    if (!target) {
        return;
    } else {
        return await actions.action(B, {
            action:   actions.ACTION.TRANSFER,
            actorId:  actorId,
            thingId:  thingId,
            planeId:  equipmentPlane.id,
            position: target,
            noVisit:  true,
        } as actions.ActionTransfer)        
    }
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

async function findClosest(B: BookServer, plane: PlaneData, position?: geo.Position, bounds?: geo.Box) {
    position = position || plane.spawn;
    bounds = bounds || plane.physics.box;
    const pBox = bounds? geo.positionedBox(bounds, position): undefined;
    const min = { id: undefined, dist: undefined }
    for (let id in plane.things) {
        const thing = await B.things.load(id)
        const thingBox = geo.positionedBox( thing.physics.box, plane.things[id] );
        if (!thing.physics.slot && (!bounds || geo.boxInBounds(thingBox, pBox))) {
            const dist = geo.distance(position, plane.things[id]);
            if (min.id === undefined || min.dist > dist) {
                min.id = id;
                min.dist = dist;
            }
        }
    }
    if (min.id) {
        const closestThing = await B.things.load(min.id);
        return closestThing;        
    } else return undefined;
}










