import { ok, error, log, register, call } from "./commandline";
import { LibraryServer } from "../model/library";
import { debugPeers } from "../network/discovery"
import { BookServer } from "../model/book"
import { config } from "../config"
import { getBookServers } from "./base"
import { ThingData, PLANE_DEFAULT } from "../model/interfaces"
import { getBookId } from "../model/identity"

import { createFromTemplate, createFromThing, TEMPLATE_DEFAULT } from "../model/create"
import * as print from "./print"

import * as actions from "../behaviour/actions"

export function setup() {
    const NA = undefined;
    register("things",       list,   /(in\s+(\S+))?\s*/,            [NA, "id"]);
    register("create thing", create, /(\S+)?(\s+in\s+(\S+))?\s*/,   ["id", NA, "bookId"]);
    register("copy",         copy,   /(\S+)(\s+to\s+(\S+))?\s*/,    ["fromId", NA, "toId"]);
}


async function list(L: LibraryServer, params) {
    const books = await getBookServers(L, params["id"])
    for (let server of books) {
        log(`Book ${server.data.id}`);
        const things = await server.things.all();
        for (let thingId in things) {
            log(`  - `+print.str(things[thingId]))
        }
    }
}

async function create(L: LibraryServer, params) {
    const books = await getBookServers(L, params["bookId"])
    for (let server of books) {
        const thingData = await createFromTemplate(server, TEMPLATE_DEFAULT, params["id"])
        const bookThing = await server.things.load(server.data.thingId);
        await actions.action(server, {
            action: actions.ACTION.ENTER,
            actorId: thingData.id,
            thingId: thingData.id,
            planeId: bookThing.planes[ PLANE_DEFAULT ],
        } as actions.ActionEnter)
        log(`Created `+print.str(thingData));
    }
}

async function copy(L: LibraryServer, params) {
    const bookId = getBookId(params["fromId"]);
    const server = L.bookServers[bookId];
    if (server) {
        const thingData = await createFromThing(server, params["fromId"], params["toId"])
        const source = await server.things.load(params["fromId"]);
        const sourcePlane = await server.planes.load(source.hostPlaneId);
        await actions.action(server, {
            action: actions.ACTION.ENTER,
            actorId: thingData.id,
            thingId: thingData.id,
            planeId: source.hostPlaneId,
            position: sourcePlane.things[source.id],
        } as actions.ActionEnter)
        log(`Created (as copy) `+print.str(thingData));
    }
}

