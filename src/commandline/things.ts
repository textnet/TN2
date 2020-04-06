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
import * as geo from "../model/geometry"

export function setup() {
    const NA = undefined;
    
    register("things", list,   
        /(in\s+(\S+))?\s*/,            
        [NA, "id"]);
    
    register("create thing", create, 
        // create thing <id> as <template> in <world> @ <x> <y>
        /(\S+)?(\s+as\s+(\S+))?(\s+in\s+(\S+))?(\s+@\s+(\S+)\s+(\S+))?\s*/,  
        ["id", NA, "template", NA, "bookId", NA, "x", "y"]);
    
    register("copy", copy,   
        // copy <id> to <id> @ <x> <y>
        /(\S+)(\s+to\s+(\S+))?(\s+@\s+(\S+)\s+(\S+))?\s*/,    
        ["fromId", NA, "toId", NA, "x", "y"]);
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
    const template = params["template"] || TEMPLATE_DEFAULT;
    let position: geo.Position;
    if (params["x"] !== undefined) {
        position = geo.position(params["x"], params["y"])
    }
    for (let server of books) {
        const id = params["id"];
        const thingData = await createFromTemplate(server, template, id)
        const bookThing = await server.things.load(server.data.thingId);
        await actions.action(server, {
            action: actions.ACTION.ENTER,
            actorId: thingData.id,
            thingId: thingData.id,
            planeId: bookThing.planes[ PLANE_DEFAULT ],
            position: position,
        } as actions.ActionEnter)
        log(`Created `+print.str(thingData));
    }
}

async function copy(L: LibraryServer, params) {
    const bookId = getBookId(params["fromId"]);
    const server = L.bookServers[bookId];
    if (server) {
        let id = params["toId"];
        const thingData = await createFromThing(server, params["fromId"], params["toId"])
        const source = await server.things.load(params["fromId"]);
        const sourcePlane = await server.planes.load(source.hostPlaneId);
        let position: geo.Position = sourcePlane.things[source.id];
        if (params["x"] !== undefined) {
            position = geo.position(params["x"], params["y"])
        }
        await actions.action(server, {
            action: actions.ACTION.ENTER,
            actorId: thingData.id,
            thingId: thingData.id,
            planeId: source.hostPlaneId,
            position: position,
        } as actions.ActionEnter)
        log(`Created (as copy) `+print.str(thingData));
    }
}

