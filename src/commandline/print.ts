import * as commandline from "./commandline";
import { LibraryServer } from "../model/library";
import { BookServer } from "../model/book"
import { Anima } from "../anima/anima"
import { BookData, ThingData, PlaneData } from "../model/interfaces"
import { isBookId, isThingId, getBookId } from "../model/identity"
import { Update } from "../behaviour/updates"
import { Action } from "../behaviour/actions"
import { Event  } from "../behaviour/events"
import * as geo from "../model/geometry"


import * as equipmentCommands from "./equipment"


export function setup() {
    const NA = undefined;
    commandline.register("inspect", inspect, /(\S+)(\s+from\s+(\S+))?\s*/, ["id", NA, "fromId"]);
}

function getLibraryServer(L: LibraryServer|BookServer|Anima) {
    if ((L as Anima).B) L = (L as Anima).B;
    if ((L as BookServer).library) L = (L as BookServer).library;
    return L as LibraryServer
}

export async function inspect(L: LibraryServer|BookServer|Anima, params) {
    const server = getLibraryServer(L);
    if (isBookId(params["id"]))  return inspectBook(server, params["id"])
    if (isThingId(params["id"])) return inspectThing(server, params["id"], params["fromId"])
    return inspectPlane(server, params["id"], params["fromId"])
}

async function inspectBook(L:LibraryServer, id: string) {
    const book = await L.loadBook(id);
    commandline.log(`Inspect: `+str(book))
    console.log(book)
}
async function inspectThing(L:LibraryServer, id: string, fromId?: string) {
    const B = L.bookServers[ getBookId(fromId || id) ];
    const thing = await B.things.load(id);
    if (thing.sprite.base64) thing.sprite.base64 = thing.sprite.base64.substr(0,15)+"...";
    commandline.log(`Inspect: `+str(thing))
    console.log(thing)    
}
async function inspectPlane(L:LibraryServer, id: string, fromId?: string) {
    const B = L.bookServers[ getBookId(fromId || id) ];
    const plane = await B.planes.load(id);
    commandline.log(`Inspect: `+str(plane))
    console.log(plane)
}

export async function where(L:LibraryServer, thingId: string) {
    const B = L.bookServers[ getBookId(thingId) ];
    const thing = await B.things.load(thingId);
    if (thing) {
        const plane = await B.planes.load(thing.hostPlaneId);
        if (plane) {
            const pos = plane.things[thing.id];
            const name = str(thing);
            commandline.log(`${str(plane)} -> {x:${pos.x}, y:${pos.y}, z:${pos.z}}<${geo.directionName(pos)}> ${thing.id}`)
        }
    }
}


export function strThing(thing: ThingData, short?:boolean) {
    return `${thing.sprite.symbol}«${thing.name}»` + (short?"":` id:${thing.id}`);
}

export function strPlane(plane: PlaneData) {
    return `/Plane:${plane.id}`
}
export function strBook(book: BookData) {
    return `/Book:${book.id}`;
}
export function strEvent(event: Event) {

}

export function str(data: ThingData|PlaneData|BookData, short?: boolean) {
    if (data["planes"]) return strThing(data as ThingData, short);
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

export async function debugEquipment(B: BookServer, thingId: string) {
    await equipmentCommands.list(B.library, {thingId: thingId});
}
