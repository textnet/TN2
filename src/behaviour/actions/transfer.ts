import { BookServer } from "../../model/book"
import { ThingData, PlaneData, SAY } from "../../model/interfaces"
import { getBookId, createThingId, isLimbo } from "../../model/identity"
import { deepCopy } from "../../utils"
import * as geo from "../../model/geometry"
import * as updates from "../updates"
import * as events from "../events"
import * as actions from "../actions"
import * as cl from "../../commandline/commandline"
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

export async function action(B: BookServer, action: actions.ActionTransfer) {
    const thing: ThingData = await B.things.load(action.thingId);
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
    }
    await actions.action(B, actionLeave);
    await actions.action(B, actionEnter);
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
    const thingCopy = await B.copy(action.thingId, action.actorId);
    if (thingCopy) {
        cl.verboseLog(B, `ENTER local ${thing.id} to «${plane.id}» @ ${visit.x} ${visit.y}`)
        thing = thingCopy;
    } else {
        cl.verboseLog(B, `ENTER guest ${thing.id} to «${plane.id}» @ ${visit.x} ${visit.y}`)
        await B.registerGuest(thing.id);
    }
    // update host
    await updates.update(B, {
        update:      updates.UPDATE.HOST,
        actorId:     action.actorId,
        id:          thingId,
        hostPlaneId: plane.id,
        isUp:        action.isUp,
    } as updates.UpdateHostPlane) 
    // place thing
    await actions.handlers.place(B, {
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
    cl.verboseLog(B, `LEAVE ${action.thingId} from «${plane.id}» @ ${position.x} ${position.y}`)
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
