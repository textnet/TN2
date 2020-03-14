/**
 * Written Word: Tools for debugging.
 */
import * as cl from "../../../commandline/commandline"
import * as print from "../../../commandline/print"
import { WrittenThing, writtenThing } from "./thing"
import { WrittenAnima } from "../detect"
import * as geo from "../../../model/geometry"

import { FengariMap } from "../api"

/**
 * Dump the object using console.log
 * @param           {WrittenAnima} A
 * @optional @param {object}       obj
 */
export function debug( A: WrittenAnima, 
                       log?: any, where?: any, list?: string) {
    if (log)   console.log(log)
    if (where) _where(A, where);
    if (list)  _list(A, list);
}


async function _list( A: WrittenAnima, what: string) {
    let list;
    switch(what) {
        case "things":
        default:
                    const thing = await A.B.things.load(A.thingId);
                    const plane = await A.B.planes.load(thing.hostPlaneId);
                    list = [];
                    for (let id in plane.things) {
                        list.push(await A.B.things.load(id))
                    }
                    cl.log(`Things @ ${print.str(plane)}:`)

    }
    for (let item of list) {
        await _where(A, item)
    }

}

async function _where( A: WrittenAnima, target: any) {
    if (target == "self") target = A.thingId;
    const targetId = target?(target["id"] ||target):A.thingId;
    const animaThing = A.things.load(A.thingId);
    const thing = await A.B.things.load(targetId);
    if (thing) {
        const plane = await A.B.planes.load(thing.hostPlaneId);
        if (plane) {
            const pos = plane.things[thing.id];
            const name = print.str(thing);
            const planePrefix = (animaThing.hostPlaneId == plane.id)?"":`${print.str(plane)} -> `
            cl.log(`- {x:${pos.x}, y:${pos.x}, z:${pos.z}}<${geo.directionName(pos)}> ${name}`)
        }
    }
}