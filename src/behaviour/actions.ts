import { BookServer } from "../model/book"
import { getBookId } from "../model/identity"
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

// --- handlers ---
export const handlers = {

    enter: async function(B: BookServer, action: ActionEnter) {
        const plane = await B.planes.load(action.planeId);
        const thing = await B.things.load(action.thingId);
        const visit = action.position || thing.visits[plane.id] || plane.spawn;
        // place thing
        await handlers.place(B, {
            action: ACTION.PLACE,
            actorId: action.actorId,
            planeId: action.planeId,
            thingId: action.thingId,
            position: visit,
            fit: true,
            force: false
        } as ActionPlace)
        // update host
        await updates.update(B, {
            update: updates.UPDATE.HOST,
            actorId: action.actorId,
            id: action.thingId,
            hostPlaneId: plane.id,
        } as updates.UpdateHostPlane)
        // emit event
        await events.emit(B, {
            event: events.EVENT.ENTER,
            actorId: action.actorId,
            planeId: action.planeId,
            thingId: action.thingId,
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
