import { BookServer } from "../model/book"
import { getBookId, getThingId } from "../model/identity"
import { deepCopy } from "../utils"
import * as network from "../network/discovery"
import * as geo from "../model/geometry"
import * as updates from "./updates"
import * as cl from "../commandline/commandline"
import { print } from "../commandline/print"


// Events.

export const EVENT = {
    TIMER: "timer",
    ENTER: "enter",
    LEAVE: "leave",
}

export const EVENT_ROLE = {
    SUBJECT: "subject",
    OBJECT:  "object",
    HOST:    "host",
    OBSERVER: "observer",
}

export const EVENT_TIMER_DURATION = 10; // ms

export interface Event {
    event:      string;
    actorId:    string;
    planeId?:   string;
    thingId?:   string;
}
export interface TimerEvent extends Event {
    delta: number;
}
export interface EventEnter extends Event {
    position: geo.Position;
}
export interface EventLeave extends Event {
}


// ------------------ emitting -------------------------
export async function emit(B: BookServer, event: Event) {
    for (let controller of B.controllers) {
        const hostId = getThingId(event.planeId);
        const actor = await B.things.load(controller.actorId);
        if (
            (actor.id == event.actorId) ||          // controller is the actor
            (actor.hostPlaneId == event.planeId) || // controller is on the plane where event happened
            (actor.id == hostId)                    // controller is the thing that owns the plane
           ){
            await controller.emit(event)
        }
    }
}
