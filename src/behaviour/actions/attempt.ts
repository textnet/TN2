import { BookServer } from "../../model/book"
import { deepCopy } from "../../utils"
import { ThingData, PlaneData, CONSTRAINTS, checkConstraint, ThingConstraint } from "../../model/interfaces"
import { switchPlaneId, isLimboPortalId } from "../../model/identity"
import * as geo from "../../model/geometry"
import * as updates from "../updates"
import * as events from "../events"
import * as actions from "../actions"
import * as cl from "../../commandline/commandline"
import * as equipment from "../../model/equipment"

async function attemptPickup(B: BookServer, action: actions.ActionAttempt) {
    const actor = await B.things.load(action.actorId);
    const inSlot = await equipment.thingInSlot(B, action.actorId, action.actorId, action.slotName);
    if (inSlot) {
        return await actions.action(B, {
                action:  actions.ACTION.UN_EQUIP,
                actorId: action.actorId,
                planeId: action.planeId,
                equipThingId: action.actorId,
                slotName: action.slotName,
                direction: action.direction,
        } as actions.ActionUnEquip);
    } else {
        const plane = await B.planes.load(action.planeId);
        const next: ThingData = await getNext(B, actor, plane, action.direction);
        if (!next) return false;        
        return await actions.action(B, {
                action:  actions.ACTION.EQUIP,
                actorId: action.actorId,
                planeId: action.planeId,
                thingId: next.id,
                equipThingId: action.actorId,
                slotName: action.slotName,
        } as actions.ActionEquip);
    }
}

async function attemptSummon(B: BookServer, action: actions.ActionAttempt) {
    const actor = await B.things.load(action.actorId);
    // proceed with action
    return await actions.action(B, {
            action:  actions.ACTION.SUMMON,
            actorId: action.actorId,
            planeId: action.planeId,
            prototypeId: action.summonPrototypeId,
            idPostfix: action.summonId,
            position: action.position,
            direction: action.direction,
            source: action.summonSource,
    } as actions.ActionSummon);
}

export async function attemptUse(B: BookServer, action: actions.ActionAttempt) {
    const plane = await B.planes.load(action.planeId);
    const actor = await B.things.load(action.actorId);
    const inSlot = await equipment.thingInSlot(B, action.actorId, action.actorId, action.slotName);
    if (inSlot) {
        return { 
            success: await actions.action(B, {
                action:  actions.ACTION.USE,
                actorId: actor.id,
                planeId: plane.id,
                thingId: inSlot.id,
                direction: action.direction,
                slotName: action.slotName,
            } as actions.ActionUse)
        }
    } else {
        return false;
    }
}

export async function action(B: BookServer, action: actions.ActionAttempt) {
    // try to do a proximal action:
    // - push
    // - enter
    // - pickup/putdown
    // - summon

    // 0. putdown and use
    // check if we can fit
    if (action.attempt == actions.ATTEMPT.PICKUP || action.attempt == actions.ATTEMPT.PUTDOWN) {
        return await attemptPickup(B, action)
    }
    // check if we can use instead of push
    if (action.attempt == actions.ATTEMPT.PUSH) {
        const wasUsed = await attemptUse(B, action);
        if (wasUsed) return wasUsed["result"];
    }
    // check if we can summon
    if (action.attempt == actions.ATTEMPT.SUMMON) {
        return await attemptSummon(B, action)
    }


    // 1. check if there is an object
    const actor = await B.things.load(action.actorId); // or thingId? unsure
    const plane = await B.planes.load(action.planeId);
    const next: ThingData = await getNext(B, actor, plane, action.direction);
    if (!next) return false;

    // 2. check appropriate constraint
    const constraintMap = {}
    constraintMap[actions.ATTEMPT.ENTER]  = CONSTRAINTS.ENTERABLE;
    constraintMap[actions.ATTEMPT.PUSH]   = CONSTRAINTS.PUSHABLE;
    constraintMap[actions.ATTEMPT.PICKUP] = CONSTRAINTS.PICKABLE;
    const constraintName = constraintMap[action.attempt];
    if (!checkConstraint(actor.physics, next.constraints[constraintName])) return false;

    // 3. perform definitive action
    switch(action.attempt) {
        // ----------------------------------------------------------------
        case actions.ATTEMPT.ENTER: // do transfer
            if (isLimboPortalId(next.id)) {
                return await actions.action(B, {
                    action:  actions.ACTION.FROM_LIMBO,
                    actorId: actor.id,
                    planeId: plane.id,
                } as actions.ActionFromLimbo);
            } else {
                return await actions.action(B, {
                    action:  actions.ACTION.TRANSFER,
                    actorId: actor.id,
                    planeId: switchPlaneId(plane.id, next.id),
                    thingId: actor.id,
                } as actions.ActionTransfer);                
            }
        // ----------------------------------------------------------------
        case actions.ATTEMPT.PUSH: // push!
            return await actions.action(B, {
                    action:  actions.ACTION.PUSH,
                    actorId: actor.id,
                    planeId: plane.id,
                    thingId: next.id,
                    direction: action.direction,
            } as actions.ActionPush);
        // ----------------------------------------------------------------
    }

}



async function getNext(B: BookServer, actor: ThingData, plane: PlaneData, dir?: geo.Direction) {
    if (!dir) {
        for (let i in geo.DIRECTION) {
            if (i != "NONE") {
                let a = await getNext(B, actor, plane, geo.DIRECTION[i]);
                if (a) return a;
                return undefined as ThingData;
            }
        }
    } else {
        if (geo.isIdle(dir)) return undefined as ThingData;
        for (let id in plane.things) {
            const candidate = await B.things.load(id);
            if (candidate.id != actor.id && await isNext(B, actor, candidate, plane, dir)) {
                return candidate;
            }
        }
    }
    return undefined as ThingData;
}

async function isNext(B: BookServer,  actor: ThingData, candidate: ThingData, plane: PlaneData, dir?: geo.Direction) {
    const actorBox     = geo.positionedBox(actor.physics.box, plane.things[actor.id]);
    const candidateBox = geo.positionedBox(candidate.physics.box, plane.things[candidate.id]);
    return geo.boxNextTo(dir, actorBox, candidateBox);
}



