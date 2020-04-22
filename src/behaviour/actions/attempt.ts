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

export async function action(B: BookServer, action: actions.ActionAttempt) {
    // try to do a proximal action:
    // - push
    // - enter
    // - pickup

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
        case actions.ATTEMPT.PICKUP: // pick up
            return await actions.action(B, {
                    action:  actions.ACTION.EQUIP,
                    actorId: actor.id,
                    planeId: plane.id,
                    thingId: next.id,
                    equipThingId: actor.id,
                    slotName: equipment.DEFAULT_SLOT_NAME,
            } as actions.ActionEquip);
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



