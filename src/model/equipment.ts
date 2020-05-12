import * as cl from "../commandline/commandline"
import { deepCopy } from "../utils"
import { BookServer } from "./book"
import { ThingData, PlaneData } from "./interfaces"
import * as identity from "./identity"
import * as geo from "./geometry"
import * as actions from "../behaviour/actions"
import * as spatials from "../behaviour/actions/spatials"

// functions to work with equipment and slots.

interface TransferParameters {
    actorId: string;
    thingId: string;
    thing: ThingData;
    equipPlane: PlaneData;
    slotName: string;
    position?: geo.Position;
}

export async function thingInHands(B: BookServer, actorId: string, ownerId: string) {
    const owner = await B.things.load(ownerId);
    return thingInSlot(B, actorId, ownerId);
}

export async function thingInSlot(B: BookServer, actorId: string, ownerId: string, slotName?: string) {
    const owner = await B.things.load(ownerId);
    slotName = slotName || owner.equipment.default;
    const equipmentPlane = await B.getEquipmentPlane(ownerId);
    const slots = await getSlots(B, ownerId);
    if (slots[slotName]) {
        for (let slot of slots[slotName]) {
            const thing = await findClosest(B, equipmentPlane, slot.position, slot.physics.box);
            if (thing) return thing;
        }
        return undefined;
    }
    const thing = await findClosest(B, equipmentPlane);    
    return thing;
}

export interface SlotData extends ThingData {
    position: geo.Position;
}
export interface SlotMap extends Record<string, SlotData[]> {}
export interface SlotContents extends SlotData {
    equipmentContents: ThingData[];    
}
export interface EquipmentContents extends Record<string,SlotContents> {}

export async function getSlots(B: BookServer, ownerId: string, slotName?: string) {
    const owner = await B.things.load(ownerId);
    const equipmentPlane = await B.getEquipmentPlane(ownerId);
    const slots: SlotMap = {}
    for (let id in equipmentPlane.things) {
        const thing = await B.things.load(id) as SlotData;
        if (thing.physics.slot && (!slotName || thing.name == slotName)) {
            // @@ check
            console.log("@@   Slot:", thing.id)
            thing.position = equipmentPlane.things[id];
            if (!slots[thing.name]) slots[thing.name] = [];
            slots[thing.name].push(thing);
        }
    }
    return slots;
}


// NB: squashes all slots with the same name into one SlotContents
export async function getEquipment(B: BookServer, actorId: string, slotName?: string) {
    const equipmentPlane = await B.getEquipmentPlane(actorId);
    const slots = await getSlots(B, actorId, slotName);
    const targetThing = await B.things.load(actorId);
    const contents: EquipmentContents = {}

    console.log("@@ slots list; slotName=", slotName)
    let noSlots = slotName === undefined;
    for (let name in slots) {
        contents[name] = slots[name][0] as SlotContents;
        contents[name].equipmentContents = []
        noSlots = false;
        console.log("@@   slot:", name);
    }
    if (noSlots) {
        contents[ targetThing.equipment.default ] = targetThing as SlotContents;
        contents[ targetThing.equipment.default ].equipmentContents = [];
    }
    console.log("@@ things checking:")
    for (let id in equipmentPlane.things) {
        const candidate = await B.things.load(id);
        const candidatePos = equipmentPlane.things[id];
        // console.log("@@   thing:", candidate.id);
        if (!candidate.physics.slot) {
            // console.log("@@     not a slot!");
            if (noSlots) {
                console.log("@@    thing:", candidate.id)
                const name = targetThing.equipment.default;
                contents[name].equipmentContents.push(candidate);                
            }
            slotsLoop: for (let name in slots) {
                if (!slotName || name == slotName) {
                    for (let c in slots[name]) {
                        const container = slots[name][c];
                        if (fitsInSlot(container, candidate, candidatePos)) {
                            console.log("@@   thing:", candidate.id);
                            console.log("@@     found", container.id);
                            contents[name].equipmentContents.push(candidate);
                        }
                    }                    
                }
            }
        }
    }        
    return contents;
}

function fitsInSlot(slot: SlotData, thing: ThingData, pos: geo.Position) {
    if (!slot.physics.box || !thing.physics.box) return true;
    const slotBox  = geo.positionedBox(slot.physics.box, slot.position);
    const thingBox = geo.positionedBox(thing.physics.box, pos);
    return geo.boxInBounds(thingBox, slotBox);
}

export function isEmpty(contents: EquipmentContents) {
    for (let slotName in contents) {
        if (contents[slotName].equipmentContents.length > 0) return false;
    }
    return true;
}

export async function transferToSlot(B: BookServer, actorId: string, thingId: string,
                                     targetThingId?: string, slotName?: string) {
    targetThingId = targetThingId || actorId;    
    const targetThing = await B.things.load(targetThingId)
    const equipmentPlane = await B.getEquipmentPlane(targetThingId);
    const thing = await B.things.load(thingId);
    let target: geo.Position;
    slotName = slotName || targetThing.equipment.default;
    const slots = await getSlots(B, targetThingId, slotName);
    if (slots[slotName] || slotName==targetThing.equipment.default) {
        // there is a proper slot
        console.log("@@ transfer", slotName, slots)
        for (let i in slots[slotName]) {
            console.log("@@ - check", i)
            const slot = slots[slotName][i];
            const slotBox = geo.positionedBox(slot.physics.box, slot.position);
            let position = slot.position;
            if (slot.physics.slotBackpack) {
                const thingShiftX = thing.physics.box.w/2 - (thing.physics.box.anchor?thing.physics.box.anchor.x:0);
                const thingShiftY = thing.physics.box.h/2 - (thing.physics.box.anchor?thing.physics.box.anchor.y:0);
                const delta: geo.Direction = { dx: thingShiftX, dy: thingShiftY }
                position = geo.add(geo.position(slotBox.n[0], slotBox.n[1], position.z, position.direction), delta)
            }
            target = await spatials.findNextFitting(B, thing, equipmentPlane, position, slotBox);
            console.log(target, slotBox)
            if (target) break;
        }
        if (!target && (!slots[slotName] && slotName==targetThing.equipment.default)) {
            console.log("@@ - next fitting", geo.positionedBox(equipmentPlane.physics.box))
            target = await spatials.findNextFitting(
                B, thing, equipmentPlane, geo.position(0,0), 
                geo.positionedBox(equipmentPlane.physics.box)
            );
            console.log("@@ - result", target)
        }
        if (target) {
            target.z = 0; // slots are -1
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
}

export async function directTransferUnequip(B: BookServer, actorId: string, 
                                            thing: ThingData, targetPlaneId: string,                                  
                                            targetPosition: geo.Position) {
    if (thing) {
        return await actions.action(B, {
            action:   actions.ACTION.TRANSFER,
            actorId:  actorId,
            thingId:  thing.id,
            planeId:  targetPlaneId,
            position: targetPosition,
            noVisit:  true,
            fit: false,
        } as actions.ActionTransfer)
    } else {
        return;
    }
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










