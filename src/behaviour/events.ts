import { BookServer } from "../model/book"
import { getBookId, getThingId } from "../model/identity"
import { deepCopy } from "../utils"
import * as network from "../network/discovery"
import * as geo from "../model/geometry"
import * as updates from "./updates"
import * as movement from "./actions/movement"
import * as cl from "../commandline/commandline"
import { print } from "../commandline/print"


// Events.

export const EVENT = {
    ANY:   "any",
    TIMER: "timer",
    ENTER: "enter",
    LEAVE: "leave",
    PUSH:  "push",
    HEAR:  "hear",
    PLACE: "place", // changes place on the plane
    COLLISION: "collision",
    MOVE_START:  "move_start",
    MOVE_FINISH: "move_finish",
    HALT:        "halt",
    WAYPOINT:    "waypoint",
}

export const EVENT_ROLE = {
    SUBJECT: "subject",
    OBJECT:  "object",
    HOST:    "host",
    OBSERVER: "observer",
}
export const EVENT_ROLE_DEFAULT = EVENT_ROLE.OBJECT;
export const EVENT_TIMER_DURATION = 10; // ms

export interface Event {
    event:      string;
    actorId:    string;
    planeId?:   string;
    thingId?:   string;
    isProxied:  boolean;
}
export interface TimerEvent extends Event {
    delta: number;
}
export interface EventPlace extends Event {
    position: geo.Position;
}
export interface EventCollision extends EventPlace {
    colliderId: string;
}
export interface EventEnter extends EventPlace {}
export interface EventLeave extends Event {}
export interface EventHear extends Event {
    what: string;
    loudness: number;
}
export interface EventWaypoint   extends Event {
    waypoint?: movement.Waypoint;
}
export interface EventMoveStartFinish extends EventWaypoint {}
export interface EventMoveFinish extends EventMoveStartFinish {}
export interface EventMoveStart  extends EventMoveStartFinish {}
export interface EventHalt       extends EventWaypoint {}
export interface EventAttempt extends Event {}
export interface EventPush extends EventAttempt {}



// ------------------ emitting -------------------------
export async function emit(B: BookServer, event: Event) {
    // get to all controllers
    if (B.controllers) {
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
    // get to the external plane -> passing the event
    if (!event.isProxied && !B.contains(event.planeId)) {
        const targetPlane = await B.planes.load(event.planeId);
        const proxiedEvent = deepCopy(event);
        proxiedEvent.isProxied = true;
        await B.emitEvent(getBookId(event.planeId), targetPlane.ownerId, proxiedEvent);
    }
}


