import { BookServer } from "../../model/book"
import { ThingData, PlaneData, SAY } from "../../model/interfaces"
import { getBookId, createThingId } from "../../model/identity"
import { deepCopy } from "../../utils"
import * as geo from "../../model/geometry"
import * as physics from "../../model/physics"
import * as updates from "../updates"
import * as events from "../events"
import * as actions from "../actions"
import * as cl from "../../commandline/commandline"
import { print } from "../../commandline/print"

export const WAYPOINT = {
    MOVE_TO: "move_to",
    MOVE_BY: "move_by",
    STAY:    "stay",
    HALT:    "halt",
}
export const MAX_TIME     = 60*1000;   // movement more than 1 minute long is done.
export const MAX_DISTANCE = 1000*1000; // movement more than 1M units is done.

export interface Waypoint {
    kind: string; // WAYPOINT.*
    timeLeft?:  number; 
}
export interface WaypointMoveTo extends Waypoint {
    destination: geo.Position;
}
export interface WaypointMoveBy extends Waypoint {
    direction: geo.Direction;
}
export interface WaypointStay extends Waypoint {
}

export async function add(B: BookServer, action: actions.ActionAddMovement) {
    const plane = await B.planes.load(action.planeId);
    const thing = await B.things.load(action.thingId);
    const wp = prepareWaypoint(thing, plane, action.waypoint)
    if (!B.waypoints[action.thingId]) {
        B.waypoints[action.thingId] = [ wp ];
        await events.emit(B, {
            event: events.EVENT.MOVE_START,
            planeId: thing.hostPlaneId,
            actorId: thing.id,
            thingId: thing.id,
            waypoint: action.waypoint,
        } as events.EventMoveStart)
    } else {
        B.waypoints[action.thingId].push(wp);
    }
}

function prepareWaypoint(thing: ThingData, plane: PlaneData, waypoint: Waypoint) {
    const wp = deepCopy(waypoint);
    const hasDuration = wp.timeLeft;
    if (!hasDuration) wp.timeLeft = MAX_TIME;
    switch (wp.kind) {
        case WAYPOINT.MOVE_BY:
                const wMoveBy = wp as WaypointMoveBy;
                if (hasDuration) 
                    wMoveBy.direction = geo.scale(wMoveBy.direction, MAX_DISTANCE);
                break;
    }    
    return wp;
}

export async function halt(B: BookServer, action: actions.ActionHaltMovement) {
    const plane = await B.planes.load(action.planeId);
    const thing = await B.things.load(action.thingId);
    if (B.waypoints[action.thingId] && B.waypoints[action.thingId].length > 0) {
        const waypoint = B.waypoints[action.thingId][0];
        await events.emit(B, {
            event: events.EVENT.HALT,
            actorId: thing.id,
            thingId: thing.id,
            planeId: thing.hostPlaneId,
            waypoint: waypoint,
        } as events.EventHalt)        
        await events.emit(B, {
            event: events.EVENT.MOVE_FINISH,
            actorId: thing.id,
            thingId: thing.id,
            planeId: thing.hostPlaneId,
            waypoint: waypoint,
        } as events.EventMoveFinish)
    }
    delete B.waypoints[action.thingId];    
}

// process waypoints; modify things but do not save them
// returns normalized _momentum vector
export function process(B: BookServer, thing: ThingData, plane: PlaneData, timeDelta: number) {
    if (B.waypoints[thing.id] && B.waypoints[thing.id].length > 0) {
        const waypoint = B.waypoints[thing.id][0];
        let vector: geo.Direction;
        switch (waypoint.kind) {

            case WAYPOINT.MOVE_TO:
                        const wMoveTo = (waypoint as WaypointMoveTo);
                        vector = geo.normalize(geo.vector(plane.things[thing.id], wMoveTo.destination));
                        break;

            case WAYPOINT.MOVE_BY:
                        const wMoveBy = (waypoint as WaypointMoveBy);
                        vector = geo.normalize(wMoveBy.direction);
                        break;

            case WAYPOINT.STAY:
            default:    break;
                        
        }
        if (vector) {
            const velocity = physics.velocity(thing.physics, plane.physics, timeDelta);
            vector = geo.scale(vector, velocity);
        }
        waypoint.timeLeft -= timeDelta;
        return vector;
    }
}

// returns alternate position
export function checkWaypoint(B: BookServer, thing: ThingData, newPosition: geo.Position, increment: geo.Direction) {
    let result: geo.Position = newPosition;
    if (B.waypoints[thing.id] && B.waypoints[thing.id].length > 0) {
        const waypoint = B.waypoints[thing.id][0];
        let arrival = waypoint.timeLeft <= 0;
        switch (waypoint.kind) {
            case WAYPOINT.MOVE_TO:
                        const wMoveTo = (waypoint as WaypointMoveTo);
                        if (geo.distance(newPosition, wMoveTo.destination) <= geo.PROXIMITY.STOP) {
                            result = wMoveTo.destination;
                            arrival = true;
                        }
                        break;
            case WAYPOINT.MOVE_BY:
                        const wMoveBy = (waypoint as WaypointMoveBy);
                        if (geo.lengthDir(wMoveBy.direction) <= geo.PROXIMITY.STOP) {
                            arrival = true;
                        } else {
                            geo.accumulateDirection(wMoveBy.direction, increment, -1);
                        }
                        break;
        }
        if (arrival) {
            B.waypoints[thing.id].shift();
            if (B.waypoints[thing.id].length == 0) {
                events.emit(B, {
                    event: events.EVENT.MOVE_FINISH,
                    actorId: thing.id,
                    thingId: thing.id,
                    planeId: thing.hostPlaneId,
                    waypoint: waypoint,
                } as events.EventMoveFinish)
                delete B.waypoints[thing.id];
            } else {
                events.emit(B, {
                    event: events.EVENT.WAYPOINT,
                    actorId: thing.id,
                    thingId: thing.id,
                    planeId: thing.hostPlaneId,
                    waypoint: waypoint,
                } as events.EventWaypoint)
            }
        }
    }    
    return result;
}



