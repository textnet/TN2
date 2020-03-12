/**
 * Written Word: Tools for debugging.
 */
import * as cl from "../../../commandline/commandline"
import { WrittenThing, writtenThing } from "./thing"
import { WrittenAnima } from "../detect"

import { FengariMap } from "../api"

/**
 * Dump the object using console.log
 * @param           {WrittenAnima} A
 * @optional @param {object}       obj
 */
export function debug( A: WrittenAnima, 
                       log?: any) {
    if (obj) {
        console.log(obj)
    }
}
