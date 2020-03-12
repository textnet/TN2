import { BookServer } from "../../../model/book"
import { ThingData, PlaneData } from "../../../model/interfaces"
import { Anima } from "../../anima"
import * as geo from "../../../model/geometry"
import { deepCopy } from '../../../utils'


// filtering some stuff out
export interface WrittenThing {
    isWritten: boolean;
    id:string;
    // and other from thingAPI

    API?: string[];
    position?: geo.Position;
}

/**
 * Prepare data structure to be exported to Written Word (Lua VM).
 * NB: It is a specific structure
 */
export function writtenThing(A: Anima, thing: ThingData|WrittenThing) {
    if (thing["isWritten"]) return thing;
    const source = thing as ThingData;
    const result: WrittenThing = { isWritten: true, id: thing.id };
    for (let i of source.API) {
        result[i] = source[i];
    }
    const hostPlane = A.planes.load(source.hostPlaneId);
    if (hostPlane && hostPlane.things[source.id]) {
        result.position = deepCopy(hostPlane.things[source.id])
    }
    return result;
}


