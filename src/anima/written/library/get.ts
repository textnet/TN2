/**
 * Written Word: Retrieving data about the world and artifacts in it.
 * Unlike all the commands, these functions work in synchronous manner.
 */

import { ThingData, PlaneData, PLANE_DEFAULT } from "../../../model/interfaces"
import { WrittenThing, writtenThing } from "./thing"
import { WrittenAnima } from "../detect"

import { FengariMap } from "../api"

/**
 * Get list of artifacts that suffice a number of (optional) criteria.
 * All criteria are optional.
 * @param           {WrittenAnima} A
 * @optional @param {WrittenThing} host
 * @optional @param {string} plane
 *                            - none    = the default plane
 *                            - "upper" = the world where the observer's thing is placed
 *                            - any string = codename of the plane (e.g. "material")
 * @optional @param {string} id
 * @optional @param {string} name (not unique! useful for filtering)
 * @returns         {WrittenThing[]}
 */
export function get_artifacts( A: WrittenAnima, 
                               host?: WrittenThing, plane?: string, id?: string, name?: string) {
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
    let result = [];
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
 * Get one artifact matching the criteria. First if there are multiple.
 * All criteria are optional.
 * See the `get_artifacts` format.
 * @returns         {WrittenThing|false} 
 */
export function get_artifact( A: WrittenAnima, 
                              host?: WrittenThing, plane?: string, id?: string, name?: string) {
    const result = get_artifacts(A, host, plane, id, name);
    if (result.length > 0) return result[0];
    else return false;
}

/**
 * Get the artifact of the observer.
 * @param   {WrittenAnima} A
 * @returns {WrittenThing} 
 */
export function get_myself( A: WrittenAnima ) {
    const thing = A.things.load(A.thingId);
    return writtenThing(A, thing);
}




