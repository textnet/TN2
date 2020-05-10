/**
 * Written Word: Retrieving data about the world and things in it.
 * Unlike all the commands, these functions work in synchronous manner.
 */

import { ThingData, PlaneData, PLANE_DEFAULT } from "../../../model/interfaces"
import * as geo from "../../../model/geometry"
import { WrittenThing, writtenThing } from "./thing"
import { WrittenAnima } from "../detect"
import * as actions_spatials from "../../../behaviour/actions/spatials"

import { FengariMap } from "../api"

/**
 * Get list of things that suffice a number of (optional) criteria.
 * All criteria are optional.
 * @param           {WrittenAnima} A
 * @optional @param {string} plane
 *                            - none    = the default plane
 *                            - "upper" = the world where the anima's thing is placed
 *                            - any string = codename of the plane (e.g. "material")
 * @optional @param {string} id
 * @optional @param {string} name (not unique! useful for filtering)
 * @returns         {WrittenThing[]}
 */
export function get_things( A: WrittenAnima, 
                            plane?: string, id?: string, name?: string) {
    const thing = A.things.load(A.thingId);
    let _plane: PlaneData;
    plane = plane || PLANE_DEFAULT;
    switch (plane) {
        case "upper": //---------  
                        if (thing.hostPlaneId) {
                            _plane = A.planes.load(thing.hostPlaneId);
                        }
                        break;
        default: //--------------
                        if (thing.planes[plane]) {
                            _plane = A.planes.load(thing.planes[plane]);
                        }
    }
    let result: WrittenThing[] = [];
    if (_plane) {
        for (let _id in _plane.things) {
            const _thing = A.things.load(_id);
            if (!name || _thing.name == name) {
                if (!id || _id == id) {
                    result.push(writtenThing(A, _thing));
                }
            }
        }
    }
    return result;
}

/**
 * Get one thing matching the criteria. First if there are multiple.
 * All criteria are optional.
 * See the `get_things` format.
 * @returns         {WrittenThing|false} 
 */
export function get_thing( A: WrittenAnima, 
                              plane?: string, id?: string, name?: string) {
    const result = get_things(A, plane, id, name);
    if (result.length > 0) return result[0];
    else return false;
}

/**
 * Get the thing of the anima.
 * @param   {WrittenAnima} A
 * @returns {WrittenThing} 
 */
export function get_myself( A: WrittenAnima ) {
    const thing = A.things.load(A.thingId);
    return writtenThing(A);
}



/**
 * Get the thing that is closest to the anima.
 * Can filter by `name`.
 * @param {WrittenAnia} A
 * @param {string}      name
 * @returns {object}    Written Word thing data
 */
export function get_closest( A: WrittenAnima, name?: string) {
    let all = get_things(A, "upper", undefined, name);
    let myself = get_myself(A);
    let closestDist = -1;
    let closest: WrittenThing;
    for (let a of all) {
        if (a.id != myself.id) {
            const d = dist(myself, a);
            if (closestDist < 0 || d < closestDist) {
                closestDist = d;
                closest = a;
            }
        }
    }
    if (closest) {
        return closest;    
    } else {
        return false;
    }
    
}

/**
 * Internal: calculate distance between centers of two thing data objects.
 * @param {object}   a
 * @param {object}   b
 * @returns {number} distance between a.pos and b.pos
 */
function dist(a: WrittenThing, b: WrittenThing) {
    return Math.sqrt((a.position.x - b.position.x)*(a.position.x - b.position.x)
                    +(a.position.y - b.position.y)*(a.position.y - b.position.y));
}



/**
 * Get the thing that is directly next to the anima.
 * @param {WrittenAnima} A
 * @param {string}       direction (e.g. "up" or number in 0-360)
 * @returns {object}     Written Word thing data
 */
export function get_next( A: WrittenAnima, direction: string|number) {
    const thing = A.things.load(A.thingId);
    let dir = geo.toDir(""+direction);
    if (geo.isIdle(dir)) {
        const rotation = parseInt(""+direction, 10);
        if (rotation != NaN) {
            dir = geo.toDir("NONE", 1, rotation);
        }
    }
    if (geo.isIdle(dir)) {
        dir = undefined;
    }
    return writtenThing(A, getNextThing(A, thing, dir));
}


export function getNextThing(A: WrittenAnima, thing: ThingData, dir?: geo.Direction) {
    if (!dir) {
        let a;
        for (let i of [geo.DIRECTION.UP,   geo.DIRECTION.DOWN,
                       geo.DIRECTION.LEFT, geo.DIRECTION.RIGHT,]) {
            a = getNextThing(A, thing, i);
        }
        if (a) return a;
        return undefined;
    } else {
        const plane = A.planes.load(thing.hostPlaneId);
        if (plane) {
            const thingPosition = plane.things[thing.id];
            const thingBox = geo.positionedBox(thing.physics.box, thingPosition);
            for (let id in plane.things) {
                if (id != thing.id) {
                    const candidate = A.things.load(id);
                    const box = geo.positionedBox(candidate.physics.box, plane.things[id]);
                    if (geo.boxNextTo(dir, thingBox, box)) {
                        return candidate;
                    }
                }
            }
        }
    }
    return undefined;
}