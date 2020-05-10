import { WrittenAnima } from "../detect"

import * as actions from "../../../behaviour/actions"
import * as geo from "../../../model/geometry"

export function attempt( A: WrittenAnima, action: string, direction?: string|geo.Direction, slotName?:string ) {
    const thing = A.things.load(A.thingId);
    const plane = A.planes.load(thing.hostPlaneId);
    if (!direction) {
        direction = plane.things[thing.id].direction;
    } else {
        if ((direction as string).length) {
            direction = geo.toDir((direction as string).toUpperCase());
        }
    }
    actions.action(A.B, {
        action: actions.ACTION.ATTEMPT,
        actorId: thing.id,
        planeId: thing.hostPlaneId,
        direction: direction,
        slotName: slotName,
        attempt: action,
    } as actions.ActionAttempt);
}


export function enter( A: WrittenAnima, direction?: geo.Direction, slotName?: string ) {
    return attempt(A, actions.ATTEMPT.ENTER, direction);
}

export function push( A: WrittenAnima, direction?: geo.Direction, slotName?: string ) {
    return attempt(A, actions.ATTEMPT.PUSH, direction);
}

export function pickup( A: WrittenAnima, direction?: geo.Direction, slotName?:string ) {
    return attempt(A, actions.ATTEMPT.PICKUP, direction, slotName);
}

export function putdown( A: WrittenAnima, direction?: geo.Direction, slotName?:string ) {
    return attempt(A, actions.ATTEMPT.PUTDOWN, direction, slotName);
}

