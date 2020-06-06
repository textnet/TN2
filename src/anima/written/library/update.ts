/**
 * Written Word: Properties of worlds and artifacts.
 * E.g. name, speed, background color.
 */

import { WrittenAnima } from "../detect"
import { PlaneData, ThingData, PLANE_DEFAULT, SAY, API, CONSTRAINTS, COLORS } from "../../../model/interfaces"
import { isThingId, isBookId }  from "../../../model/identity"
import { BookServer } from "../../../model/book"
import * as actions from "../../../behaviour/actions"
import * as updates from "../../../behaviour/updates"
import * as geo from "../../../model/geometry"

import { FengariMap }          from "../api"
import { WrittenThing, thingId } from "./thing"

/**
 * Updates a thing or one of its planes.
 * Update is done asynchronously.
 * @param {WrittenAnima} A
 * @optional @param {FengariMap} all parameters, namely:
 *    - thing (default is self)
 *    - name, API if present
 */
export function update( A: WrittenAnima, params: FengariMap) {
    let thing = params.get("thing") as WrittenThing;
    const skip = ["colors", "constraints", "physics"];
    const properties = {}
    for (let key of API) {
        if (skip.indexOf(key) < 0) {
            properties[key] = params.get(key) 
        }
    }
    // TODO: plane properties
    let spawn = undefined;
    if (params.get("spawn")) {
        spawn = geo.position(params.get("spawn").get("x"), params.get("spawn").get("y"));
    }
    const planeProperties = {
        format: params.get("format"),
        spawn: spawn,
    }
    updates.update(A.B, {
        update: updates.UPDATE.PROPERTIES,
        actorId: A.controller.actorId,
        id: thingId(A, thing),
        plane: params.get("plane") || undefined,
        thingProperties: properties,
        planeProperties: planeProperties,
    } as updates.UpdateProperties)
    return true;
}




/**
 * Updates constraints.
 * @param {WrittenAnima} A
 * @optional @param {FengariMap} all parameters, namely:
 *    - thing (default is self)
 *    - name/constraint
 *    - value
 */
export function constraints( A: WrittenAnima, thing: WrittenThing|string, name?: string, constraint?:string, value?:string) {
    name = name || constraint;
    if (name === undefined || value === undefined) {
        return false;
    }
    const constraints = {};
    constraints[name] = value;
    updates.update(A.B, {
        update: updates.UPDATE.PROPERTIES,
        actorId: A.controller.actorId,
        id: thingId(A, thing),
        thingProperties: { constraints: constraints },
    } as updates.UpdateProperties)
    return true;
}

/**
 * Updates colors.
 * @param {WrittenAnima} A
 * @optional @param {FengariMap} all parameters, namely:
 *    - thing (default is self)
 *    - name/color
 *    - value
 */
export function colors( A: WrittenAnima, thing: WrittenThing|string, name?: string, color?:string, value?:string) {
    name = name || color;
    if (name === undefined || value === undefined) {
        return false;
    }
    const colors = {};
    colors[name] = value;
    updates.update(A.B, {
        update: updates.UPDATE.PROPERTIES,
        actorId: A.controller.actorId,
        id: thingId(A, thing),
        thingProperties: { colors: colors },
    } as updates.UpdateProperties)
    return true;
}

/**
 * Updates equipment parameters.
 * @param {WrittenAnima} A
 * @optional @param {FengariMap} all parameters, namely:
 *    - default, autopicking, everything slot-names
 *    - scaleSlots - if inventory has to be scaled visually
 *    - thingSprite - special sprite for the thing 
 *    - thingScale - should we scale this thing up to the slot
 */
export function equipment( A: WrittenAnima, thing: WrittenThing|string, 
            dflt: string, autopicking: string, everything: string,
            scaleSlots: number,
            thingSprite: any,
            thingScale: boolean,
    ) {
    updates.update(A.B, {
        update: updates.UPDATE.PROPERTIES,
        actorId: A.controller.actorId,
        id: thingId(A, thing),
        thingProperties: { 
            equipment: {
                default: dflt,
                autopicking: autopicking,
                everything: everything,
                scaleSlots: scaleSlots,
                thingSprite: thingSprite,
                thingScale: thingScale,
            }
        },
    } as updates.UpdateProperties)
    return true;
}

/**
 * Updates physics.
 * @param {WrittenAnima} A
 * @optional @param {FengariMap} all parameters, namely:
 *    - thing (default is self)
 *    - plane (default is not plane)
 *    - width, height, Z, speed -> if thing
 *    - friction -> if plane
 *    - mass, force, gravity, value
 *    - direction, minimal, maximal
 */
export function physics( A: WrittenAnima, thing: WrittenThing|string, plane?: string, 
                         width?: number, height?: number, 
                         anchorX?: number, anchorY?: number,
                         isSlot?: boolean,
                         Z?: number,
                         speed?: number, friction?: number, 
                         mass?: string, force?: string, gravity?: string, value?:number,
                         direction?: string,
                         minimal?: number, maximal?: number) {
    let preparedBox: geo.Box = { 
        w: width, h: height,
    };
    if (anchorX && anchorY) {
        preparedBox.anchor = { x: anchorX, y: anchorY };
    }
    if (!width || !height) preparedBox = undefined;
    const prepared = {mass:{}, force:{}, gravity:{} }
    updates.update(A.B, {
        update: updates.UPDATE.PROPERTIES,
        actorId: A.controller.actorId,
        id: thingId(A, thing),
        plane: plane,
        thingProperties: { 
            physics: {
                slot: isSlot,
                box: preparedBox,
                Z: Z,
                speed: speed,
                mass:  accumulate(mass, value),
                force: accumulate(force, value),
            }
        },
        planeProperties: {
            physics: {
                friction: friction,
                gravity: accumulate(gravity, {
                    acceleration: value,
                    direction: geo.toDir(direction, 1),
                    minimalMass: minimal,
                    maximalMass: maximal,
                }),
            }
        }
    } as updates.UpdateProperties)
    return true;
}

function accumulate(name: string, value: any, accumulator?: any) {
    if (name === undefined) return;
    if (accumulator == undefined) accumulator = {};
    accumulator[name] = value;
    return accumulator;
}

/**
 * Updates physics seasons only.
 * @param {WrittenAnima} A
 * @optional @param {FengariMap} all parameters, namely:
 *    - thing (default is self)
 *    - plane (default is not plane)
 *    - width, height, Z, speed -> if thing
 *    - friction -> if plane
 *    - mass, force, gravity, value
 *    - direction, minimal, maximal
 */
export function seasons( A: WrittenAnima, thing: WrittenThing|string, plane?: string, 
                         season?: string, times?: number[], names?: string[]) {
    updates.update(A.B, {
        update: updates.UPDATE.PROPERTIES,
        actorId: A.controller.actorId,
        id: thingId(A, thing),
        plane: plane,
        planeProperties: {
            seasons: accumulate(season, { times: times, names: names }),
        }
    } as updates.UpdateProperties)
    return true;
}
