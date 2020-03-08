import { ok, error, log, register, call } from "./commandline"
import { getBookId, isBookId } from "../model/identity"
import { LibraryServer } from "../model/library"
import { BookServer } from "../model/book"
import { ThingData } from "../model/interfaces"
import { getBookServers } from "./base"

export function setup() {
    const NA = undefined;
    register("planes", list, /\s*(in\s+(\S+))?\s*/, [NA, "id"]);
}


async function list(L: LibraryServer, params) { 
    if (params["id"] && isBookId(params["id"])) {
        return listInBook(L, params["id"]);
    } else {
        if (params["id"]) {
            const bookId = getBookId(params["id"])
            const B = L.bookServers[bookId];
            const thing = await B.things.load(params["id"]);
            return listInThing(L, B, thing);
        } else {
            return listInBook(L);
        }
    }
}

async function listInBook(L: LibraryServer, bookId?: string) {
    const servers = await getBookServers(L, bookId);
    for (let server of servers) {
        const things = await server.things.all();
        for (let id in things) {
            listInThing(L, server, things[id]);    
        }
    }
}
async function listInThing(L: LibraryServer, B: BookServer, thing: ThingData) {
    if (B && thing) {
        for (let planeName in thing.planes) {
            log(`Plane ${thing.planes[planeName]}`)
        }
    }
}
