import { BookServer } from "../../../model/book"
import { ThingData, PlaneData } from "../../../model/interfaces"
import { Anima } from "../../anima"
import * as geo from "../../../model/geometry"
import { deepCopy } from '../../../utils'
import * as identity from "../../../model/identity"


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
export function writtenThing(A: Anima, thing?: ThingData|WrittenThing|string): WrittenThing {
    if ((thing as string).length) return writtenThing(A, A.things.load(thing as string));
    if (thing["isWritten"])       return thing as WrittenThing;
    if (!thing)                   return writtenThing(A, A.thingId);
    const source = thing as ThingData;
    const result: WrittenThing = { isWritten: true, id: (thing as ThingData).id };
    for (let i of source.API) {
        result[i] = source[i];
    }
    const hostPlane = A.planes.load(source.hostPlaneId);
    if (hostPlane && hostPlane.things[source.id]) {
        result.position = deepCopy(hostPlane.things[source.id])
    }
    return result as WrittenThing;
}

export function geoDirection(d: geo.Direction|string) {
    if ((d as string).length !== undefined) return geo.toDir(d as string);
    else return d as geo.Direction
}

export function animaThing(A: Anima, thing?: ThingData|WrittenThing|string): ThingData {
    if (!thing) return animaThing(A, A.thingId);
    const result = thing["id"]? animaThing(A, thing["id"]) : A.things.load(thing as string);
    return result;
}

export function thingId(A: Anima, thing?: ThingData|WrittenThing|string) {
    let thingId = thing ? ( (thing as WrittenThing).id || (thing as string)) : A.thingId;
    return thingId;
}

export function animaPlane(A: Anima, plane: string, thing?: ThingData|WrittenThing|string): PlaneData {
    if (thing) {
        // get the planeId from thing+planeName
        let thingId = thing ? ( (thing as WrittenThing).id || (thing as string)) : A.thingId;
        let realThing = A.things.load(thingId);
        if (realThing) {
            plane = realThing.planes[plane]; 
        } 
    }
    return A.planes.load(plane)        
}


