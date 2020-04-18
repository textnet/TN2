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
    const planeProperties = {
        format: params.get("format"),
        spawn: geo.position(params.get("spawn").get("x"), params.get("spawn").get("y")),
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
export function physics( A: WrittenAnima, thing: WrittenThing|string, 
                         plane?: string, 
                         width?: number, height?: number, Z?: number,
                         speed?: number, friction?: number, 
                         mass?: string, force?: string, gravity?: string, value?:number,
                         direction?: string, minimal?: number, maximal?: number) {
    // TODO
    return true;
}
