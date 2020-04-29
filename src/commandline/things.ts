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
import * as identity from "../model/identity"

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

    register("create slot", slot, 
        // create slot <name> as <template> in <thing> @ <x> <y>
        /(\S+)?(\s+as\s+(\S+))?(\s+in\s+(\S+))?(\s+@\s+(\S+)\s+(\S+))?\s*/,  
        ["name", NA, "template", NA, "thingId", NA, "x", "y"]);    

    register("create equipment for", environment, 
        // create equipment for <thing> as <template> @ <x> <y>
        /(\S+)?(\s+as\s+(\S+))?(\s+@\s+(\S+)\s+(\S+))?\s*/,  
        ["thingId", NA, "template", NA, "x", "y"]);    

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

async function environment(L: LibraryServer, params) {
    const bookId = identity.getBookId(params["thingId"])
    const B = (await getBookServers(L, bookId))[0];
    const thing = await B.things.load(params["thingId"]);
    const template = params["template"] || TEMPLATE_DEFAULT;
    // create a slot
    const slotThing = await slot(L, {
        name: "Equipment",
        thingId: thing.id,
        template: template,
        x: 0, y: 0,
        isEquipment: true
    })
    // adjust plane
    const equipPlane = await B.getEquipmentPlane(params["thingId"]);
    equipPlane.spawn = geo.position(0,0);
    equipPlane.physics.box = slotThing.physics.box;
    await B.planes.save(equipPlane);
    log(`Created equipment for `+print.str(thing));
}

async function slot(L: LibraryServer, params) {
    const bookId = identity.getBookId(params["thingId"])
    const B = (await getBookServers(L, bookId))[0];
    const thing = await B.things.load(params["thingId"]);
    const name = params["name"] 
    const template = params["template"] || TEMPLATE_DEFAULT;
    let position: geo.Position;
    if (params["x"] !== undefined) {
        position = geo.position(params["x"], params["y"])
    }
    const equipPlane = await B.getEquipmentPlane(thing.id);
    const slot = await createFromTemplate(B, template, name);
    slot.name = params["name"] || slot.name;
    position.z = slot.physics.Z;
    await actions.action(B, {
        action: actions.ACTION.ENTER,
        actorId: thing.id,
        thingId: slot.id,
        planeId: equipPlane.id,
        position: position,
    } as actions.ActionEnter)
    log(`Created slot `+print.str(slot));
    // console.log(position)
    return slot;
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

