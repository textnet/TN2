import * as crypto from "crypto";
import { BookData, ThingData, PlaneData, ThingTemplate, 
         fixThingDefaults, fixPlaneDefaults,
         PLANE_DEFAULT, PLANE, SPAWN_DEFAULT } from "./interfaces"
import { LibraryServer } from "./library"
import { BookServer } from "./book"
import { pushDefaults, deepCopy } from "../utils"
import { createThingId, createPlaneId } from "./identity"
import * as actions from "../behaviour/actions"



const templateRegistry: Record<string, ThingTemplate> = {};
export const TEMPLATE_DEFAULT = "Something";
export const TEMPLATE_BOOK    = "Book";
import * as tBook      from "../things/book"
import * as tSomething from "../things/something"
export function registerAllTemplates() {
    registerTemplate(tBook.template);
    registerTemplate(tSomething.template);
}
export function registerTemplate(t: ThingTemplate) {
    templateRegistry[t.name] = t;
}
export function getTemplate(name) {
    return templateRegistry[name] || templateRegistry[TEMPLATE_DEFAULT];
}
registerAllTemplates();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export async function createFromThing(B: BookServer, fromId: string, id?: string, templateName?: string, differences?: any) {
    const modelThing = await B.things.load(fromId);
    if (!modelThing) {
        return createFromTemplate(B, templateName, id, differences);
    } else {
        const thingId = await createThingId(B, id);
        const thing = deepCopy(modelThing);
        thing.id = thingId;
        thing.planes = {}
        for (let planeName in modelThing.planes) {
            // duplicate plane
            const modelPlane = await B.planes.load(modelThing.planes[planeName])
            const plane: PlaneData = deepCopy(modelPlane);
            const planeId = createPlaneId(planeName, thingId);
            plane.id = planeId;
            plane.ownerId = thingId;
            plane.things = {};
            if (planeName == PLANE.LIMBO) {
                plane.things[thingId] = plane.spawn || deepCopy(SPAWN_DEFAULT);
            }
            fixPlaneDefaults(plane);
            await B.planes.save(plane);
            // copy things
            for (let innerId in modelPlane.things) {
                const innerCopy = await B.copy(innerId);
                innerCopy.hostPlaneId = plane.id;
                await B.things.save(innerCopy);
                plane.things[innerCopy.id] = plane.spawn || deepCopy(SPAWN_DEFAULT);
            }
            await B.planes.save(plane);
        }
        thing.hostPlaneId = createPlaneId(PLANE.LIMBO, thingId);
        if (differences) {
            for (let key in differences) {
                thing[key] =  differences[key];
            }
        }
        fixThingDefaults(thing)
        await B.things.save(thing)
        await B.awaken(thing.id)
        return thing;
    }
}

export async function createFromTemplate(B: BookServer, templateName?: string, id?: string, differences?: any) {
    const template = getTemplate(templateName);
    const thingId = await createThingId(B, id);
    const thing: ThingData = deepCopy(template.thing);
    thing.id = thingId;
    const planeNames = [ PLANE_DEFAULT, PLANE.LIMBO ];
    for (let planeName of planeNames) {
        const plane: PlaneData = deepCopy(template.plane);
        const planeId = createPlaneId(planeName, thingId);
        plane.id = planeId;
        plane.ownerId = thingId;
        fixPlaneDefaults(plane);
        await B.planes.save(plane);
        thing.planes[planeName] = planeId;
    }
    thing.hostPlaneId = createPlaneId(PLANE.LIMBO, thingId);
    if (differences) {
        for (let key in differences) {
            thing[key] =  differences[key];
        }
    } 
    fixThingDefaults(thing)
    await B.things.save(thing);
    await B.awaken(thing.id)
    return thing;
}