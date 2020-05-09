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
import * as equipment from "../model/equipment"

export function setup() {
    const NA = undefined;
    
    register("create slot", slot, 
        // create slot <name> as <template> in <thing> @ <x> <y>
        /(\S+)?(\s+as\s+(\S+))?(\s+in\s+(\S+))?(\s+@\s+(\S+)\s+(\S+))?\s*/,  
        ["name", NA, "template", NA, "thingId", NA, "x", "y"]);    

    register("create equipment for", create, 
        // create equipment for <thing> as <template> @ <x> <y>
        /(\S+)?(\s+as\s+(\S+))?(\s+@\s+(\S+)\s+(\S+))?\s*/,  
        ["thingId", NA, "template", NA, "x", "y"]);    

    register("equipment of", list, 
        // equipment of <thing> <slotName>
        /(\S+)?(\s+(\S+))?\s*/,  
        ["thingId", NA, "slotName"]);    

}

export async function list(L: LibraryServer, params) {
    const books = await getBookServers(L, params["thingId"])
    for (let server of books) {
        const thing = await server.things.load(params["thingId"]);
        const contents = await equipment.getEquipment(server, thing.id, params["slotName"]);
        let isEmpty = true;
        for (let slotName in contents) { isEmpty = false; break; }
        if (isEmpty) {
            log(`Equipment of `+print.str(thing)+` is empty.`);    
        } else {
            log(`Equipment of `+print.str(thing));
            for (let slotName in contents) {
                const isEquipmentSlot = params["slotName"] == thing.equipment.everything;
                const items = contents[slotName].equipmentContents;
                if (isEquipmentSlot) {
                    for (let item of items) {
                        log(`    -  `+print.str(item));
                    }
                } else {
                    if (slotName == thing.equipment.everything) continue;
                    if (!params["slotName"] || params["slotName"] == slotName) {
                        if (items.length == 0) log(`  ${slotName} is empty.`)
                        else
                        if (items.length == 1) log(`  ${slotName}: `+print.str(items[0]))
                        else {
                            log(`  ${slotName} (${items.length})`);
                            for (let item of items) {
                                log(`    -  `+print.str(item));
                            }
                        }
                    }
                }
            }
        }
    }
}

async function create(L: LibraryServer, params) {
    const bookId = identity.getBookId(params["thingId"])
    const B = (await getBookServers(L, bookId))[0];
    const thing = await B.things.load(params["thingId"]);
    const template = params["template"] || TEMPLATE_DEFAULT;
    let slotThing;
    // create a slot
    if (thing.equipment.everything) {
        slotThing = await slot(L, {
            name: thing.equipment.everything,
            thingId: thing.id,
            template: template,
            x: 0, y: 0,
            isEquipment: true
        })
    }
    // adjust plane
    const equipPlane = await B.getEquipmentPlane(params["thingId"]);
    equipPlane.spawn = geo.position(0,0);
    if (slotThing) {
        equipPlane.physics.box = slotThing.physics.box;    
    }
    await B.planes.save(equipPlane);
    log(`Created equipment for `+print.str(thing));
}

async function slot(L: LibraryServer, params) {
    const bookId = identity.getBookId(params["thingId"])
    const B = (await getBookServers(L, bookId))[0];
    const thing = await B.things.load(params["thingId"]);
    const name = params["name"] 
    const template = params["template"] || TEMPLATE_DEFAULT;
    const equipPlane = await B.getEquipmentPlane(thing.id);
    const slot = await createFromTemplate(B, template, name, {
        name: params["name"]
    });
    let position: geo.Position;
    if (params["x"] !== undefined) {
        position = geo.position(params["x"], params["y"])
    } else {
        position = equipPlane.spawn;
    }
    position.z = slot.physics.Z;
    await actions.action(B, {
        action: actions.ACTION.ENTER,
        actorId: thing.id,
        thingId: slot.id,
        planeId: equipPlane.id,
        position: position,
    } as actions.ActionEnter)
    log(`Created slot `+print.str(slot));
    return slot;
}
