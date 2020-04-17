import * as cl from "../../../commandline/commandline"
import { WrittenAnima } from "../detect"
import { ThingData, PlaneData } from "../../../model/interfaces"
import { WrittenThing, writtenThing, animaThing, animaPlane } from "./thing"
import * as geo from "../../../model/geometry"
import * as actions from "../../../behaviour/actions"
import * as movement from "../../../behaviour/actions/movement"


/**
 * Move a thing to position (x,y) and turn it to (direction).
 * Also accepts delta values (not to be used directly).
 * @param           {WrittenAnima} A
 * @optional @param {WrittenThing} thing @see "get.ts"
 * @optional @param {number}  x
 * @optional @param {number}  y
 * @optional @param {string}  direction
 * @optional @param {boolean} isDelta - (x,y) are relative?
 */
export function move_to( A: WrittenAnima, 
                         thing?: ThingData|WrittenThing|string, 
                         x?: number, y?: number, direction?: string, 
                         isDelta?: boolean) {
    const aThing = animaThing(A, thing);
    const aPlane = animaPlane(A, aThing.hostPlaneId);
    if (x === undefined) x = aPlane.things[aThing.id].x;
    if (y === undefined) y = aPlane.things[aThing.id].y;
    if (!direction) direction = geo.directionName(aPlane.things[aThing.id]);
    cl.verboseLog(`<${aThing.name}>.move_to( x=${x}, y=${y}, dir=${direction} )`)
    actions.action(A.B, {
        action:  actions.ACTION.MOVE,
        planeId: aThing.hostPlaneId,
        actorId: A.thingId,
        thingId: aThing.id,
        waypoint: {
            kind: movement.WAYPOINT.MOVE_TO,
            destination: geo.position(x, y, direction),
        }
    } as actions.ActionAddMovement);
}

/**
 * Move a thing by delta (dx,dy) and turn it to (direction).
 * (dx,dy) are relative to the current position.
 * Instead of (x,y) pair of (direction, distance) can be used.
 * @param           {WrittenAnima} A
 * @optional @param {WrittenThing} thing @see "get.ts"
 * @optional @param {number}  x
 * @optional @param {number}  y
 * @optional @param {string}  direction
 * @optional @param {string}  distance
 */
export function move_by(A: WrittenAnima, 
                        thing?: ThingData|WrittenThing|string,
                        dx?: number, dy?: number, 
                        direction?: string, distance?:number ) {
    const aThing = animaThing(A, thing);
    let dir: geo.Direction;
    if (dx === undefined) dx=0;
    if (dy === undefined) dy=0;
    if (direction) {
        dir = geo.toDir(direction, distance);
    } else {
        dir = { dx: dx, dy:dy } as geo.Direction;
    }
    cl.verboseLog(`<${aThing.name}>.move_by( dx=${dx}, dy=${dy}, dir=${direction}, dist=${distance} )`)
    console.log(dir)
    actions.action(A.B, {
        action:  actions.ACTION.MOVE,
        planeId: aThing.hostPlaneId,
        actorId: A.thingId,
        thingId: aThing.id,
        waypoint: {
            kind: movement.WAYPOINT.MOVE_BY,
            direction: dir,
            distance: distance,
        }
    } as actions.ActionAddMovement);
}

/**
 * Halts the programmed sequence of moves.
 * Whenever this command is issued, and artifact stops moving
 * even if it has not reached its destination.
 * @param           {WrittenAnima} A
 * @optional @param {WrittenThing} thing @see "get.ts"
 */
export function halt(A: WrittenAnima, 
                        thing?: ThingData|WrittenThing|string) {
    const aThing = animaThing(A, thing);
    cl.verboseLog(`<${aThing.name}>.halt()`)
    actions.action(A.B, {
        action:  actions.ACTION.HALT,
        planeId: aThing.hostPlaneId,
        actorId: A.thingId,
        thingId: aThing.id,
    } as actions.ActionAddMovement);
}

// TODO: place_at, fit_at