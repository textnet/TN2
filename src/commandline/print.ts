import * as commandline from "./commandline";
import { LibraryServer } from "../model/library";
import { BookServer } from "../model/book"
import { BookData, ThingData, PlaneData } from "../model/interfaces"
import { isBookId, isThingId, getBookId } from "../model/identity"
import { Update } from "../behaviour/updates"
import { Action } from "../behaviour/actions"
import { Event  } from "../behaviour/events"



export function setup() {
    const NA = undefined;
    commandline.register("inspect", inspect, /(\S+)(\s+from\s+(\S+))?\s*/, ["id", NA, "fromId"]);
}
async function inspect(L: LibraryServer, params) {
    if (isBookId(params["id"]))  return inspectBook(L, params["id"])
    if (isThingId(params["id"])) return inspectThing(L, params["id"], params["fromId"])
    return inspectPlane(L, params["id"], params["fromId"])
}

async function inspectBook(L:LibraryServer, id: string) {
    const book = await L.loadBook(id);
    commandline.log(`Inspect: `+str(book))
    console.log(book)
}
async function inspectThing(L:LibraryServer, id: string, fromId?: string) {
    const B = L.bookServers[ getBookId(fromId || id) ];
    const thing = await B.things.load(id);
    commandline.log(`Inspect: `+str(thing))
    console.log(thing)    
}
async function inspectPlane(L:LibraryServer, id: string, fromId?: string) {
    const B = L.bookServers[ getBookId(fromId || id) ];
    const plane = await B.planes.load(id);
    commandline.log(`Inspect: `+str(plane))
    console.log(plane)
}


export function strThing(thing: ThingData) {
    return `${thing.sprite.symbol}:${thing.name} // ${thing.id}`
}

export function strPlane(plane: PlaneData) {
    return `/Plane:${plane.id}`
}
export function strBook(book: BookData) {
    return `/Book:${book.id}`;
}
export function strEvent(event: Event) {

}

export function str(data: ThingData|PlaneData|BookData) {
    if (data["planes"]) return strThing(data as ThingData);
    if (data["things"]) return strPlane(data as PlaneData);
    return strBook(data as BookData);
}

export function log(data: ThingData|PlaneData|BookData) {
    commandline.log(str(data))
}

export function print(data: Event|Update|Action) {
    if (data["event"])  commandline.log("Event:")
    if (data["action"]) commandline.log("Action:")
    if (data["update"]) commandline.log("Update:")
    console.log(data)
}