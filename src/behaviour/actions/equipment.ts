import { BookServer } from "../../model/book"
import { deepCopy } from "../../utils"
import * as interfaces from "../../model/interfaces"
import * as identity from "../../model/identity"
import * as geo from "../../model/geometry"
import * as updates from "../updates"
import * as events from "../events"
import * as actions from "../actions"
import * as cl from "../../commandline/commandline"
import * as print from "../../commandline/print"
import * as equipment from "../../model/equipment"

export async function equip(B: BookServer, action: actions.ActionEquip) {
    const actor = await B.things.load(action.actorId);
    const thing = await B.things.load(action.thingId);
    // 1. check constraints
    if (!interfaces.checkConstraint(actor.physics, thing.constraints[ interfaces.CONSTRAINTS.PICKABLE ])) return false;
    // 3. transfer
    if (!await equipment.transferToSlot(B, action.actorId, action.thingId, action.equipThingId, action.slotName)) return false;
    // 2. event
    await events.emit(B, {
        event: events.EVENT.EQUIP,
        planeId: action.planeId,
        actorId: actor.id,
        thingId: thing.id,
        equipId: action.equipThingId || actor.id,
        slotName: action.slotName,
    } as events.EventEquip);
    // @@
    console.log("@@ action.equip", action.slotName, action.thingId)
    await print.debugEquipment(B, action.actorId);
}

export async function reEquip(B: BookServer, action: actions.ActionReEquip) {
    const equipFrom = await B.things.load(action.equipFromId);
    const equipTo   = await B.things.load(action.equipToId);
    const item = await equipment.thingInSlot(B, action.actorId, action.equipFromId, action.slotFrom);
    if (equipFrom && equipTo && item) {
        // only send event, don't try to unEquip
        await events.emit(B, {
            event: events.EVENT.UN_EQUIP,
            planeId: action.planeId,
            actorId: action.actorId,
            thingId: item.id,
            equipId: equipFrom.id,
            slotName: action.slotFrom,
        } as events.EventUnEquip);
        // now equip!          
        return await equip(B, {
            action: actions.ACTION.EQUIP,
            actorId: action.actorId,
            planeId: action.planeId,
            thingId: item.id,
            slotName: action.slotTo
        } as actions.ActionEquip)
    }
}

export async function unEquip(B: BookServer, action: actions.ActionUnEquip) {
    const actor = await B.things.load(action.actorId);
    const plane = await B.planes.load(actor.hostPlaneId);
    const ownerId = action.equipThingId || actor.id;
    const thing = await equipment.thingInSlot(B, actor.id, ownerId, action.slotName);
    if (thing && ownerId) {
        // find position
        let dx=0, dy=0;
        if (action.direction.dx < 0) {
            dx = -actor.physics.box.w/2      -thing.physics.box.w/2
                 +actor.physics.box.anchor.x -thing.physics.box.anchor.x;
        }
        if (action.direction.dx > 0) {
            dx = +actor.physics.box.w/2      +thing.physics.box.w/2
                 +actor.physics.box.anchor.x -thing.physics.box.anchor.x;
        }
        if (action.direction.dy < 0) {
            dy = -actor.physics.box.h/2      -thing.physics.box.h/2
                 +actor.physics.box.anchor.y -thing.physics.box.anchor.y;
        } 
        if (action.direction.dy > 0) {
            dy = +actor.physics.box.h/2      +thing.physics.box.h/2
                 +actor.physics.box.anchor.y -thing.physics.box.anchor.y;
        }
        const vector: geo.Direction = { dx: dx, dy: dy }
        const position = geo.add(plane.things[actor.id], vector);
        const success = await equipment.directTransferUnequip(B, actor.id, thing, action.planeId, position);
        if (success) {
            console.log("@@ unequip success")
            await events.emit(B, {
                event: events.EVENT.UN_EQUIP,
                planeId: action.planeId,
                actorId: actor.id,
                thingId: thing.id,
                equipId: ownerId,
                slotName: action.slotName,
            } as events.EventUnEquip);                
        }
        return success;
    } else {
        return false;
    }
}






