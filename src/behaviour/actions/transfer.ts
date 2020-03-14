import { BookServer } from "../../model/book"
import { ThingData, PlaneData, SAY } from "../../model/interfaces"
import { getBookId, createThingId } from "../../model/identity"
import { deepCopy } from "../../utils"
import * as geo from "../../model/geometry"
import * as updates from "../updates"
import * as events from "../events"
import * as actions from "../actions"
import * as cl from "../../commandline/commandline"
import { print } from "../../commandline/print"
import { Controller } from "../controller"


export async function action(B: BookServer, action: actions.ActionTransfer) {
    const thing: ThingData = await B.things.load(action.thingId);
    const actionLeave: actions.ActionLeave = {
        action: actions.ACTION.LEAVE,
        actorId: action.actorId,
        planeId: thing.hostPlaneId,
        thingId: action.thingId,
    }
    const actionEnter: actions.ActionEnter = {
        action: actions.ACTION.ENTER,
        actorId: action.actorId,
        planeId: action.planeId,
        thingId: action.thingId,
    }
    await leave(B, actionLeave);
    await enter(B, actionEnter);
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
        thing = thingCopy;
    } else {
        await B.registerGuest(thing.id);
    }
    // place thing
    await actions.handlers.place(B, {
        action:   actions.ACTION.PLACE,
        actorId:  action.actorId,
        planeId:  action.planeId,
        thingId:  thingId,
        position: visit,
        fit:      true,
        force:    false
    } as actions.ActionPlace)
    // update host
    await updates.update(B, {
        update:      updates.UPDATE.HOST,
        actorId:     action.actorId,
        id:          thingId,
        hostPlaneId: plane.id,
    } as updates.UpdateHostPlane)
    // emit event
    await events.emit(B, {
        event:    events.EVENT.ENTER,
        actorId:  action.actorId,
        planeId:  action.planeId,
        thingId:  thingId,
        position: visit,           
    } as events.EventEnter)
}

export async function leave(B: BookServer, action: actions.ActionLeave) {
    const plane = await B.planes.load(action.planeId);
    const position: geo.Position = plane.things[action.thingId];
    delete plane.things[action.thingId];
    await B.planes.save(plane);
    // update visit
    if (position) {
        await updates.update(B, {
            update: updates.UPDATE.VISITS,
            actorId: action.actorId,
            id: action.thingId,
            position: deepCopy(position)
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
