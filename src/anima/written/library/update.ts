/**
 * Written Word: Properties of worlds and artifacts.
 * E.g. name, speed, background color.
 */

import { WrittenAnima } from "../detect"
import { PlaneData, ThingData, PLANE_DEFAULT, SAY, API, CONSTRAINTS, COLORS } from "../../../model/interfaces"
import { isThingId, isBookId }  from "../../../model/identity"
import { BookServer } from "../../../model/book"
import * as actions from "../../../behaviour/actions"

import { FengariMap }          from "../api"
import { WrittenThing } from "./thing"

/**
 * Updates a thing or one of its planes.
 * Update is done asynchronously.
 * @param {WrittenAnima} A
 * @optional @param {FengariMap} all parameters, namely:
 *    - thing (default is self)
 *    - name, constraints, physics, colors, etc. from API
 *    - constraints.<constraint>
 *    - color.<color>
 *    - physics.<physics>
 */
export function update( A: WrittenAnima, params: FengariMap) {
    const thing = params.get("thing") as WrittenThing;
    let thingId = A.thingId;
    if (thing && thing["id"]) {
        thingId = thing["id"];
    }
    const properties = {}
    for (let key of API) {
        properties[key] = params.get(key)
    }
    for (let c in CONSTRAINTS) {
        const key = "constraints."+CONSTRAINTS[c];
        properties[key] = params.get(key);
    }
    for (let c in COLORS) {
        const key = "colors."+COLORS[c];
        properties[key] = params.get(key);
    }
    for (let p in PHYSICS) {
        const key = "physics."+PHYSICS[c];
        properties[key] = params.get(key);

    }
    // TODO: ACTION
    // updateProperties(O.P, artifact, properties); // nb: async
    return true;
}

const PHYSICS = {
    BOX: "box",
    SPEED: "speed"
}
