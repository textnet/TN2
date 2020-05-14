import * as cl from "../commandline/commandline"
import { deepCopy } from "../utils"
import { BookServer } from "./book"
import * as identity from "./identity"
import * as geo from "./geometry"
import * as model from "./interfaces"
import * as actions from "../behaviour/actions"
import * as spatials from "../behaviour/actions/spatials"

// functions to work with equipment and slots.

interface TransferParameters {
    actorId:    string;
    thingId:    string;
    thing:      model.ThingData;
    equipPlane: model.PlaneData;
    slotName:   string;
    position?:  geo.Position;
}

export async function thingInHands(B: BookServer, actorId: string, ownerId: string) {
    const owner = await B.things.load(ownerId);
    return thingInSlot(B, actorId, ownerId);
}

export async function thingInSlot(B: BookServer, actorId: string, ownerId: string, slotName?: string) {
    // @@@
    const owner = await B.things.load(ownerId);
    slotName = slotName || owner.equipment.default;
    const equipmentPlane = await B.getEquipmentPlane(ownerId);
    const slots = await getSlots(B, ownerId);
    if (slots[slotName]) {
        for (let slot of slots[slotName]) {
            const thing = await findClosest(B, equipmentPlane, slot.position, slot.physics.box);
            console.log("@@ found?", thing?thing.id: "no at", slot.physics.box)
            if (thing) return thing;
        }
        return undefined;
    }
    const thing = await findClosest(B, equipmentPlane);    
    console.log("@@ no slots found?", thing?thing.id: "no")
    return thing;
}


export interface SlotMap extends Record<string, model.SlotData[]> {}
export interface SlotContents extends model.SlotData {
    equipmentContents: model.ThingData[];    
}
export interface EquipmentContents extends Record<string,SlotContents> {}

export async function getSlots(B: BookServer, ownerId: string, slotName?: string) {
    const owner = await B.things.load(ownerId);
    const equipmentPlane = await B.getEquipmentPlane(ownerId);
    const slots: SlotMap = {}
    for (let id in equipmentPlane.things) {
        const thing = await B.things.load(id) as model.SlotData;
        if (thing.equipment.thingSlot && (!slotName || thing.name == slotName)) {
            thing.position = equipmentPlane.things[id];
            if (!slots[thing.name]) slots[thing.name] = [];
            slots[thing.name].push(thing);
        }
    }
    return slots;
}

export async function getSlot(B: BookServer, owner: model.ThingData, pos: geo.Position) {
    const equipmentPlane = await B.getEquipmentPlane(owner.id);
    for (let id in equipmentPlane.things) {
        const thing = await B.things.load(id);
        if (thing.equipment.thingSlot && thing.name != owner.equipment.everything) {
            const box = model.getThingBox(thing);
            if (geo.inBounds(pos, box)) {
                const slot = thing as model.SlotData;
                slot.position = equipmentPlane.things[id];
                return slot
            }
        }            
    }
    return;
}
export async function getSlotByThingId(B: BookServer, owner: model.ThingData, thingId: string) {
    // also can be done via listing equipment and then scanning trough its structure
    const equipmentPlane = await B.getEquipmentPlane(owner.id);
    const pos = equipmentPlane[thingId];
    if (!pos) return;
    for (let id in equipmentPlane.things) {
        const candidate = await B.things.load(id);
        if (candidate.equipment.thingSlot && candidate.name != owner.equipment.everything) {
            const box = model.getThingBox(candidate);
            if (geo.inBounds(pos, box)) {
                const slot = candidate as model.SlotData;
                slot.position = equipmentPlane.things[id];
                return slot
            }
        }            
    }
    return;
}

// NB: squashes all slots with the same name into one SlotContents
export async function getEquipment(B: BookServer, actorId: string, slotName?: string) {
    const equipmentPlane = await B.getEquipmentPlane(actorId);
    const slots = await getSlots(B, actorId, slotName);
    const targetThing = await B.things.load(actorId);
    const contents: EquipmentContents = {}

    let noSlots = slotName === undefined;
    for (let name in slots) {
        contents[name] = slots[name][0] as SlotContents;
        contents[name].equipmentContents = []
        noSlots = false;
    }
    if (noSlots) {
        contents[ targetThing.equipment.default ] = targetThing as SlotContents;
        contents[ targetThing.equipment.default ].equipmentContents = [];
    }
    for (let id in equipmentPlane.things) {
        const candidate = await B.things.load(id);
        const candidatePos = equipmentPlane.things[id];
        if (!candidate.equipment.thingSlot) {
            if (noSlots) {
                const name = targetThing.equipment.default;
                contents[name].equipmentContents.push(candidate);                
            }
            slotsLoop: for (let name in slots) {
                if (!slotName || name == slotName) {
                    for (let c in slots[name]) {
                        const container = slots[name][c];
                        if (fitsInSlot(container, candidate, candidatePos)) {
                            contents[name].equipmentContents.push(candidate);
                        }
                    }                    
                }
            }
        }
    }        
    return contents;
}

function fitsInSlot(slot: model.SlotData, thing: model.ThingData, pos: geo.Position) {
    if (!slot.physics.box || !thing.physics.box) return true;
    const thingBoxSource = model.getThingBox(thing, slot.physics.box);
    const thingBox = geo.positionedBox(thingBoxSource, pos);
    const slotBox  = geo.positionedBox(slot.physics.box, slot.position);
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
        let slotBox, position;
        for (let i in slots[slotName]) {
            const slot = slots[slotName][i];
            slotBox = geo.positionedBox(slot.physics.box, slot.position);
            position = slot.position;
            if (slot.equipment.thingBackpack) {
                const thingShiftX = thing.physics.box.w/2 - (thing.physics.box.anchor?thing.physics.box.anchor.x:0);
                const thingShiftY = thing.physics.box.h/2 - (thing.physics.box.anchor?thing.physics.box.anchor.y:0);
                const delta: geo.Direction = { dx: thingShiftX, dy: thingShiftY }
                position = geo.add(geo.position(slotBox.n[0], slotBox.n[1], position.z, position.direction), delta)
            }
            const thingBoxSource = model.getThingBox(thing, slot.physics.box);
            target = await spatials.findNextFitting(B, thing, equipmentPlane, position, slotBox, thingBoxSource);
            if (target) break;
        }
        if (!target && (!slots[slotName] && slotName==targetThing.equipment.default)) {
            const thingBoxSource = thing.equipment.thingSprite ? thing.equipment.thingSprite.size : thing.physics.box;
            target = await spatials.findNextFitting(
                B, thing, equipmentPlane, geo.position(0,0), 
                geo.positionedBox(equipmentPlane.physics.box),
                thingBoxSource
            );
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
                force:    true,
            } as actions.ActionTransfer)        
        }        
    }
}

export async function directTransferUnequip(B: BookServer, actorId: string, 
                                            thing: model.ThingData, targetPlaneId: string,                                  
                                            targetPosition: geo.Position) {
    if (thing) {
        console.log("@@ transferring back")
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

async function findClosest(B: BookServer, plane: model.PlaneData, position?: geo.Position, bounds?: geo.Box) {
    position = position || plane.spawn;
    bounds = bounds || plane.physics.box;
    const pBox = bounds? geo.positionedBox(bounds, position): undefined;
    const min = { id: undefined, dist: undefined }
    for (let id in plane.things) {
        const thing = await B.things.load(id)
        const thingBox = model.getThingBox(thing, bounds);
        const tBox = geo.positionedBox( thingBox, plane.things[id]);
        console.log("@@", thing.id, thingBox, bounds, plane.things[id], position)
        console.log("@@", tBox, pBox, geo.boxInBounds(tBox, pBox))
        if (!thing.equipment.thingSlot && (!bounds || geo.boxInBounds(tBox, pBox))) {
            const dist = geo.distance(position, plane.things[id]);
            console.log("@@ distance", dist)
            if (min.id === undefined || min.dist > dist) {
                console.log("@@ found!", min.id)
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










