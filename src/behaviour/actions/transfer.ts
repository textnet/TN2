import { BookServer } from "../../model/book"
import { ThingData, PlaneData, SAY, PLANE } from "../../model/interfaces"
import { getBookId, createThingId, isLimbo, createPlaneId, getLimboPortalId, isLimboPortalId } from "../../model/identity"
import { deepCopy } from "../../utils"
import * as geo from "../../model/geometry"
import * as updates from "../updates"
import * as events from "../events"
import * as actions from "../actions"
import * as cl from "../../commandline/commandline"
import * as identity from "../../model/identity"
import { print, inspect } from "../../commandline/print"
import { Controller } from "../controller"


export async function transferUp(B: BookServer, action: actions.ActionTransferUp) {
    const thing: ThingData = await B.things.load(action.actorId);
    if (thing.visitsStack.length > 1) {
        const prevPlaneId = thing.visitsStack[ thing.visitsStack.length-2]; 
        await actions.action(B, {
            action: actions.ACTION.TRANSFER,
            actorId: action.actorId,
            thingId: action.actorId,
            planeId: prevPlaneId,
            isUp: true,
        } as actions.ActionTransfer)
    }
}

export async function transferToLimbo(B: BookServer, action: actions.ActionToLimbo) {
    await turnLimboPortal(B, action.actorId, "UP");
    await actions.action(B, {
        action:  actions.ACTION.TRANSFER,
        actorId: action.actorId,
        thingId: action.actorId,
        planeId: createPlaneId(PLANE.LIMBO, action.actorId),
    } as actions.ActionTransfer)
}

export async function transferFromLimbo(B: BookServer, action: actions.ActionFromLimbo) {
    const thing: ThingData = await B.things.load(action.actorId);
    const lostPlane = await B.planes.load(thing.lostPlaneId);
    if (lostPlane) {
        // plane is available, going there
        await actions.action(B, {
            action:  actions.ACTION.TRANSFER,
            actorId: action.actorId,
            thingId: action.actorId,
            planeId: thing.lostPlaneId,
        } as actions.ActionTransfer)
    } else {
        // plane is not available, need to switch the limbo portal to "UP"
        await turnLimboPortal(B, thing, "UP");
    }
}

export async function turnLimboPortal(B: BookServer, actor: string|ThingData, direction: string) {
    if (!actor["id"]) {
        return await turnLimboPortal(B, await B.things.load(actor as string), direction);
    }
    actor = actor as ThingData;
    const limboId = createPlaneId(PLANE.LIMBO, actor.id)
    const limboPortalId = getLimboPortalId(actor.id);
    const limbo = await B.planes.load(limboId);
    if (geo.directionName(limbo.things[limboPortalId]) != direction) {
        const position = deepCopy(limbo.things[limboPortalId]);
        position.direction = geo.toDir(direction);
        await actions.action(B, {
            action:   actions.ACTION.PLACE,
            actorId:  actor.id,
            thingId:  limboPortalId,
            planeId:  limboId,
            position: position,
            force: true,
        } as actions.ActionPlace);
    }
}


export async function action(B: BookServer, action: actions.ActionTransfer) {
    const thing: ThingData = await B.things.load(action.thingId);
    if (action.planeId == thing.hostPlaneId) {
        const actionPlace: actions.ActionPlace = {
            action:  actions.ACTION.PLACE,
            actorId: action.actorId,
            planeId: action.planeId,
            thingId: action.thingId,
            position: action.position,
        }
        return await actions.action(B, actionPlace);
    } else {
        const actionLeave: actions.ActionLeave = {
            action:  actions.ACTION.LEAVE,
            actorId: action.actorId,
            planeId: thing.hostPlaneId,
            thingId: action.thingId,
        }
        const actionEnter: actions.ActionEnter = {
            action:  actions.ACTION.ENTER,
            actorId: action.actorId,
            planeId: action.planeId,
            thingId: action.thingId,
            isUp:    action.isUp,
            noVisit: action.noVisit,
            position: action.position,
        }
        await actions.action(B, actionLeave);
        return await actions.action(B, actionEnter);        
    }
}

// check if the this should be treated as a guest
export async function isGuest(B: BookServer, action: actions.ActionIsGuest) {
    const thing = await B.things.load(action.thingId);
    if (B.data.thingId == action.thingId)        return true; // don't copy book
    if (await B.library.isBound(action.thingId)) return true; // don't copy console
    if (B.isControlled(action.thingId))          return true; // don't copy animas
}    

export async function enter(B: BookServer, action: actions.ActionEnter) {
    const plane = await B.planes.load(action.planeId);
    let   thing = await B.things.load(action.thingId);
    const visit = action.position || thing.visits[plane.id] || plane.spawn;
    let thingId = action.thingId;
    const thingCopy = await B.getOrCopy(action.thingId, action.actorId);
    if (thingCopy) {
        // cl.verboseLog(B, `ENTER local ${thing.id} to «${plane.id}» @ ${visit.x} ${visit.y}`)
        thing = thingCopy; // replace thing with get-or-copy result
    } else {
        // cl.verboseLog(B, `ENTER guest ${thing.id} to «${plane.id}» @ ${visit.x} ${visit.y}`)
        await B.registerGuest(thing.id);
    }
    // update host
    await updates.update(B, {
        update:      updates.UPDATE.HOST,
        actorId:     action.actorId,
        id:          thingId,
        hostPlaneId: plane.id,
        isUp:        action.isUp,
        noVisit:     action.noVisit,
    } as updates.UpdateHostPlane) 
    // place thing
    return await actions.handlers.place(B, {
        action:   actions.ACTION.PLACE,
        actorId:  action.actorId,
        planeId:  action.planeId,
        thingId:  thingId,
        position: visit,
        fit:      true,
        force:    false,
        isEnter:  true,
    } as actions.ActionPlace)
}

export async function leave(B: BookServer, action: actions.ActionLeave) {
    const plane = await B.planes.load(action.planeId);
    const position: geo.Position = deepCopy(plane.things[action.thingId]);
    delete plane.things[action.thingId];
    await B.planes.save(plane);
    // update visit
    if (position) {
        await updates.update(B, {
            update: updates.UPDATE.VISITS,
            actorId: action.actorId,
            planeId: action.planeId,
            id: action.thingId,
            position: position,
        } as updates.UpdateVisits)
    }
    // halt
    await actions.action(B, {
        action: actions.ACTION.HALT,
        actorId: action.actorId,
        thingId: action.thingId,
        planeId: action.planeId,
    } as actions.ActionHaltMovement)
    // emit event
    await events.emit(B, {
        event: events.EVENT.LEAVE,
        actorId: action.actorId,
        planeId: action.planeId,
        thingId: action.thingId,
    } as events.EventLeave)
    // deregister if guest
    await B.deregisterGuest(action.thingId);
}
