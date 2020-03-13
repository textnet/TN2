import { BookServer } from "../model/book"
import { ThingData, PlaneData } from "../model/interfaces"
import { getBookId, createThingId } from "../model/identity"
import { deepCopy } from "../utils"
import * as network from "../network/discovery"
import * as geo from "../model/geometry"
import * as updates from "./updates"
import * as events from "./events"
import * as cl from "../commandline/commandline"
import { print } from "../commandline/print"

// actions happen on a plane

export const ACTION = {
    ENTER: "enter",
    LEAVE: "leave",
    TRANSFER: "transfer",
    IS_GUEST: "isGuest",
    PLACE: "place",
}

export interface Action {
    action: string;
    actorId: string;
    planeId: string;
}
export interface ActionEnter extends Action {
    thingId: string;
    position?: geo.Position;
}
export interface ActionLeave extends Action {
    thingId: string;
}
export interface ActionTransfer extends Action {
    thingId: string;
}
export interface ActionIsGuest extends Action {
    thingId: string;
}

export interface ActionPlace extends Action {
    thingId: string;
    position: geo.Position;
    fit?: boolean;
    force?: boolean;
}

// --- dispatcher ---
export async function action(B: BookServer, action: Action) {
    const targetBookId = getBookId(action.planeId)
    const message: network.MessageAction = {
        name: network.MESSAGE.ACTION,
        action: action,
    }
    // print(action)
    return await B.sendMessage(targetBookId, message)
}
const dispatchAction = action;

// --- handlers ---
export const handlers = {

    transfer: async(B: BookServer, action: ActionTransfer)=>{
        const thing: ThingData = await B.things.load(action.thingId);
        const actionLeave: ActionLeave = {
            action: ACTION.LEAVE,
            actorId: action.actorId,
            planeId: thing.hostPlaneId,
            thingId: action.thingId,
        }
        const actionEnter: ActionEnter = {
            action: ACTION.ENTER,
            actorId: action.actorId,
            planeId: action.planeId,
            thingId: action.thingId,
        }
        await handlers.leave(B, actionLeave);
        await handlers.enter(B, actionEnter);
    },
    // check if can transwer ownership
    isGuest: async(B: BookServer, action: ActionIsGuest)=>{
        const thing = await B.things.load(action.thingId);
        if (B.data.thingId == action.thingId)        return true; // don't copy book
        if (await B.library.isBound(action.thingId)) return true; // don't copy console
        if (B.isControlled(action.thingId))          return true; // don't copy animas
        return false;
    },


    enter: async function(B: BookServer, action: ActionEnter) {
        const plane = await B.planes.load(action.planeId);
        let   thing = await B.things.load(action.thingId);
        const visit = action.position || thing.visits[plane.id] || plane.spawn;
        let thingId = action.thingId;
        const thingCopy = await B.copy(action.thingId, action.actorId);
        if (thingCopy) {
            thing = thingCopy;
        } else {
            // TODO subscribe on events
        }
        // place thing
        await handlers.place(B, {
            action:   ACTION.PLACE,
            actorId:  action.actorId,
            planeId:  action.planeId,
            thingId:  thingId,
            position: visit,
            fit:      true,
            force:    false
        } as ActionPlace)
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
    },

    place: async function(B: BookServer, action: ActionPlace) {
        const plane = await B.planes.load(action.planeId);
        const thing = await B.things.load(action.thingId);
        // TODO spatial;
        plane.things[thing.id] = deepCopy(action.position);
        await B.planes.save(plane);
    },

    leave: async function(B: BookServer, action: ActionLeave) {
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

    },

}
