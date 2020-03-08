import { ok, error, log, register, call } from "./commandline";
import { LibraryServer } from "../model/library";
import { debugPeers } from "../network/discovery"
import { BookServer } from "../model/book"
import { config } from "../config"
import { getBookServers } from "./base"


export function setup() {
    const NA = undefined;
    register("things", list, /\s*(in\s+(\S+))?\s*/, [NA, "id"]);
}

/** THING-related commands:

    need a console!


 */

async function list(L: LibraryServer, params) {
    const books = await getBookServers(L, params["id"])
    for (let server of books) {
        log(`Book ${server.data.id}`);
        const things = await server.things.all();
        for (let thingId in things) {
            const thing = things[thingId];
            log(`  - ${thing.sprite.symbol}:${thing.name} // ${thing.id}`)
        }
    }
}

// export async function create(library: LibraryServer, paramList) {
//     const params = mapParams(paramList, ["id"])
//     return library.createBook(params["id"]);
// }
