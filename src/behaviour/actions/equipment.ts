import { BookServer } from "../../model/book"
import { deepCopy } from "../../utils"
import * as interfaces from "../../model/interfaces"
import * as identity from "../../model/identity"
import * as geo from "../../model/geometry"
import * as updates from "../updates"
import * as events from "../events"
import * as actions from "../actions"
import * as cl from "../../commandline/commandline"
import * as equipment from "../../model/equipment"

export async function equip(B: BookServer, action: actions.ActionEquip) {
    const actor = await B.things.load(action.actorId);
    const thing = await B.things.load(action.thingId);
    // 1. check constraints
    if (!interfaces.checkConstraint(actor.physics, thing.constraints[ interfaces.CONSTRAINTS.PICKABLE ])) return false;
    // 2. event
    await events.emit(B, {
        event: events.EVENT.EQUIP,
        planeId: thing.hostPlaneId,
        actorId: actor.id,
        thingId: thing.id,
        equipId: action.equipThingId,
        slotName: action.slotName,
    } as events.EventEquip);    
    // 3. transfer
    return await equipment.transferToSlot(B, action.thingId, action.equipThingId, action.slotName);
}

export async function reEquip(B: BookServer, action: actions.ActionReEquip) {
    const equipFrom = await B.things.load(action.equipFromId);
    const equipTo   = await B.things.load(action.equipToId);
    const item = await equipment.thingInSlot(B, action.actorId, action.equipFromId, action.slotFrom);
    if (equipFrom && equipTo && item) {
        // only send event, don't try to unEquip
        await events.emit(B, {
            event: events.EVENT.UN_EQUIP,
            planeId: equipFrom.hostPlaneId,
            actorId: action.actorId,
            thingId: item.id,
            equipId: equipFrom.id,
            slotName: action.slotFrom,
        } as events.EventUnEquip);
        // now equip!          
        return await equip(B, {
            action: actions.ACTION.EQUIP,
            actorId: action.actorId,
            planeId: equipTo.hostPlaneId,
            thingId: item.id,
            slotName: action.slotTo
        } as actions.ActionEquip)
    }
}

export async function unEquip(B: BookServer, action: actions.ActionUnEquip) {
    const actor = await B.things.load(action.actorId);
    const plane = await B.planes.load(actor.hostPlaneId);
    let thing: interfaces.ThingData;
    let ownerId: string;
    if (action.thingId) {
        thing = await B.things.load(action.thingId);
        ownerId = identity.getEquipmentOwnerId(thing.hostPlaneId);
    } else {
        ownerId = action.equipThingId;
        thing = await equipment.thingInSlot(B, actor.id, ownerId, action.slotName);
    }
    if (thing && ownerId) {
        // find position
        const vector: geo.Direction = {
            dx: actor.physics.box.w/2 + actor.physics.box.anchor.x + 
                thing.physics.box.w/2 - thing.physics.box.anchor.x,

            dy: actor.physics.box.h/2 + actor.physics.box.anchor.y + 
                thing.physics.box.h/2 - thing.physics.box.anchor.y,
        }
        //
        if (action.direction.dx == 0) vector.dx  = 0;
        if (action.direction.dx <  0) vector.dx *= -1;
        //
        if (action.direction.dy == 0) vector.dy  = 0;
        if (action.direction.dy <  0) vector.dy *= -1;
        //
        const position = geo.add(plane.things[actor.id], vector);
        // 1. event
        await events.emit(B, {
            event: events.EVENT.UN_EQUIP,
            planeId: thing.hostPlaneId,
            actorId: actor.id,
            thingId: thing.id,
            equipId: ownerId,
            slotName: action.slotName,
        } as events.EventUnEquip);    
        // 2. transfer
        return await equipment.transferFromSlot(B, action.thingId, ownerId, action.slotName, position);
    } else {
        return false;
    }
}