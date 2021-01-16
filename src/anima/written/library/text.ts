/**
 * Written Word: Retrieving data about the world and things in it.
 * Unlike all the commands, these functions work in synchronous manner.
 */

import { ThingData, PlaneData, PLANE_DEFAULT } from "../../../model/interfaces"
import * as geo from "../../../model/geometry"
import { WrittenThing, writtenThing, animaThing, animaPlane } from "./thing"
import { WrittenAnima } from "../detect"
import * as actions_spatials from "../../../behaviour/actions/spatials"
import * as utils from "../../../utils"

import * as actions from "../../../behaviour/actions"
import * as updates from "../../../behaviour/updates"

import { FengariMap } from "../api"

/**
 * Get the text of the thing's plane
 * @param           {WrittenAnima} A
 * @optional @param {WrittenThing} thing @see "get.ts"
 * @optional @param {string}  plane
 * @optional @param {number}  line
 * @optional @param {string}  anchor
 */
export function get_text( A: WrittenAnima, 
                         thing?: ThingData|WrittenThing|string, 
                         plane?: string,
                         line?: number,
                         anchor?: string
                         ) {
    const aThing = animaThing(A, thing);
    if (!plane) plane = PLANE_DEFAULT
    const aPlane = animaPlane(A, plane, aThing);
    if (aPlane) {
        const text = aPlane.text;
        const lines = text.split("\n")
        if (line !== undefined) {
            if (lines.length > line) return lines[line];
            else                     return "";
        } 
        if (anchor !== undefined) {
            return utils.findAnchor(text, anchor).value;
        }
        return text;
    } else {
        return null;
    }
}

/**
 * Updates the text of the thing's plane
 * @param           {WrittenAnima} A
 * @optional @param {WrittenThing} thing @see "get.ts"
 * @optional @param {string}  plane
 * @optional @param {string}  text
 */
export function update_text( A: WrittenAnima, 
                         thing?: ThingData|WrittenThing|string, 
                         plane?: string,
                         text?: string
                         ) {
    return update_line(A, thing, plane, undefined, undefined, text)
}


/**
 * Updates only one line in the text of the thing's plane
 * @param           {WrittenAnima} A
 * @optional @param {WrittenThing} thing @see "get.ts"
 * @optional @param {string}  plane
 * @optional @param {number}  line
 * @optional @param {string}  anchor
 * @optional @param {string}  text
 * @optional @param {string}  special
 */
export function update_line( A: WrittenAnima, 
                         thing?: ThingData|WrittenThing|string, 
                         plane?: string,
                         line?: number,
                         anchor?: string,
                         text?: string,
                         special?: string,
                         ) {
    const aThing = animaThing(A, thing);
    if (!plane) plane = PLANE_DEFAULT
    const aPlane = animaPlane(A, plane, aThing);
    if (aPlane) {
        actions.action(A.B, {
            action: actions.ACTION.TEXT,
            planeId: aPlane.id,
            actorId: A.thingId,
            thingId: aThing.id,
            line: line,
            lineAnchor: anchor,
            text: text || "",
            special: special,
        } as actions.ActionText)
        return true;
    }
    return false;
}


/**
 * Inserts a new line BEFORE the one mentioned
 * @param           {WrittenAnima} A
 * @optional @param {WrittenThing} thing @see "get.ts"
 * @optional @param {string}  plane
 * @optional @param {number}  line
 * @optional @param {string}  anchor
 * @optional @param {string}  text
 */
export function insert_line( A: WrittenAnima, 
                         thing?: ThingData|WrittenThing|string, 
                         plane?: string,
                         line?: number,
                         anchor?: string,
                         text?: string,
                         ) {
    return update_line(A, thing, plane, line, anchor, text, "insert")
}

/**
 * Deletes the mentioned line
 * @param           {WrittenAnima} A
 * @optional @param {WrittenThing} thing @see "get.ts"
 * @optional @param {string}  plane
 * @optional @param {number}  line
 * @optional @param {string}  anchor
 */
export function delete_line( A: WrittenAnima, 
                         thing?: ThingData|WrittenThing|string, 
                         plane?: string,
                         line?: number,
                         anchor?: string,
                         ) {
    return update_line(A, thing, plane, line, anchor, "", "delete")
}