import * as crypto from "crypto";
import { BookData, ThingData, PlaneData, ThingTemplate, 
         fixThingDefaults, fixPlaneDefaults,
         PLANE_DEFAULT, PLANE, SPAWN_DEFAULT } from "./interfaces"
import { LibraryServer } from "./library"
import { BookServer } from "./book"
import { pushDefaults, deepCopy } from "../utils"
import { createThingId, createPlaneId } from "./identity"



const templateRegistry: Record<string, ThingTemplate> = {};
export const TEMPLATE_DEFAULT = "Book";
export const TEMPLATE_BOOK    = "Book";
import * as tBook from "../things/book"
export function registerAllTemplates() {
    registerTemplate(tBook.template);
}
export function registerTemplate(t: ThingTemplate) {
    templateRegistry[t.name] = t;
}
export function getTemplate(name) {
    return templateRegistry[name] || templateRegistry[TEMPLATE_DEFAULT];
}
registerAllTemplates();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export async function createFromTemplate(B: BookServer, templateName: string, id?:string, differences?:any) {
    if (!B.data.thingId) {
        return createFromScratch(B, id, templateName, differences);
    } else {
        return createFromThing(B, B.data.thingId, id, templateName, differences);
    }
}

export async function createFromThing(B: BookServer, thingId: string, id?: string, templateName?: string, differences?: any) {
    const modelThing = await B.things.load(thingId);
    if (!modelThing) {
        return createFromScratch(B, templateName, id, differences);
    } else {
        const thingId = createThingId(B.data.id, id);
        const thing = modelThing;
        thing.planes = {}
        for (let planeName in modelThing.planes) {
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
        }
        thing.hostPlaneId = createPlaneId(PLANE.LIMBO, thingId);
        if (differences) {
            for (let key in differences) {
                thing[key] =  differences[key];
            }
        }
        fixThingDefaults(thing)
        return await B.things.save(thing);
    }
}

export async function createFromScratch(B: BookServer, id?: string, templateName?: string, differences?: any) {
    const template = getTemplate(templateName);
    const thingId = createThingId(B.data.id, id);
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
    return await B.things.save(thing);
}