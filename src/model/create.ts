import * as crypto from "crypto";
import { BookData, ThingData, PlaneData, ThingTemplate, 
         fixThingDefaults, fixPlaneDefaults,
         PLANE_DEFAULT, PLANE, SPAWN_DEFAULT, LIMBO_PORTAL_TEMPLATE } from "./interfaces"
import { LibraryServer } from "./library"
import { BookServer } from "./book"
import { pushDefaults, deepCopy } from "../utils"
import { createThingId, createPlaneId, stripBookId, extractPlaneName, 
         getLimboPortalId, isLimboPortalId, getBookThingId, getEquipmentId } from "./identity"
import * as actions from "../behaviour/actions"



const templateRegistry: Record<string, ThingTemplate> = {};
export const TEMPLATE_DEFAULT = "Something";
export const TEMPLATE_BOOK    = "Book";
import * as tBook      from "../things/book"
import * as tSomething from "../things/something"
import * as tChest from "../things/chest"
import * as tPiano from "../things/piano"
import * as tJones from "../things/jones"
import * as tLimboPortal from "../things/limbo_portal"
import * as tSlot from "../things/slot"
import * as tMegaslot from "../things/slot_mega"
import * as tEquipment from "../things/equipment"
import * as tTent from "../things/tent"
import * as tHay from "../things/hay"

export function registerAllTemplates() {
    registerTemplate(tBook.template);
    registerTemplate(tSomething.template);
    registerTemplate(tChest.template);
    registerTemplate(tPiano.template);
    registerTemplate(tJones.template);
    registerTemplate(tLimboPortal.template);
    registerTemplate(tSlot.template);
    registerTemplate(tMegaslot.template);
    registerTemplate(tEquipment.template);
    registerTemplate(tTent.template);
    registerTemplate(tHay.template);
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
        const thingId = await createThingId(B, id || stripBookId(fromId));
        const thing = deepCopy(modelThing);
        thing.id = thingId;
        thing.planes = {}
        for (let planeName in modelThing.planes) {
            // duplicate plane
            const modelPlane = await B.planes.load(modelThing.planes[planeName])
            const plane = await createPlaneFromAnother(B, thingId, modelPlane, planeName, true);
            if (planeName == PLANE.LIMBO) {
                plane.things[thingId] = plane.spawn || deepCopy(SPAWN_DEFAULT);
            }
            await B.planes.save(plane);
            // copy things
            for (let innerId in modelPlane.things) {
                if (innerId == fromId) {
                    plane.things[thingId] = plane.things[innerId];
                } else {
                    const innerCopy = await B.copy(innerId);
                    innerCopy.hostPlaneId = plane.id;
                    await B.things.save(innerCopy);
                    plane.things[innerCopy.id] = plane.things[innerId];
                }
            }
            await B.planes.save(plane);
            thing.planes[planeName] = plane.id;
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

export async function createPlaneFromAnotherId(B: BookServer, ownerThingId: string, sourcePlaneId: string, 
                                               planeName?: string, skipLimboPortal?: boolean) {
    const originalPlane = await B.planes.load(sourcePlaneId);
    return createPlaneFromAnother(B, ownerThingId, originalPlane, planeName, skipLimboPortal);
}

export async function createPlaneFromAnother(B: BookServer, ownerThingId: string, sourcePlane: PlaneData, 
                                             planeName?: string, skipLimboPortal?: boolean) {
    planeName = planeName || extractPlaneName(sourcePlane.id);
    const plane: PlaneData = deepCopy(sourcePlane);
    const planeId = createPlaneId(planeName, ownerThingId);
    plane.id = planeId;
    plane.ownerId = ownerThingId;
    fixPlaneDefaults(plane);
    //
    if (planeName == PLANE.LIMBO && !skipLimboPortal) {
        const limboPortal = await createFromTemplate(B, LIMBO_PORTAL_TEMPLATE, 
                                                     stripBookId(getLimboPortalId(ownerThingId)));
        plane.things[limboPortal.id] = SPAWN_DEFAULT;
        limboPortal.hostPlaneId = plane.id;
        limboPortal.lostPlaneId = plane.id;
        await B.things.save(limboPortal);
    }
    //
    await B.planes.save(plane);
    return plane;    
}

export async function createEquipmentPlane(B: BookServer, thingId: string, source?: string|PlaneData) {
    // choose source of the copy
    const bookThingId = getBookThingId(B.id())
    const sourceId = source !== undefined ? (source["id"] || source) : undefined;
    const sourceThingId = (sourceId || bookThingId) as string;
    const sourceEquipId = getEquipmentId(B.id(), sourceThingId);
    const equipId = getEquipmentId(B.id(), thingId);
    const equipPlaneName = extractPlaneName(equipId);
    let plane;
    if (source && source["id"]) {
        plane = await createPlaneFromAnother(B, bookThingId, source as PlaneData, equipPlaneName, true)
    } else {
        plane = await createPlaneFromAnotherId(B, bookThingId, sourceEquipId, equipPlaneName, true)
    }
    return plane;
}

export async function createFromTemplate(B: BookServer, templateName?: string, id?: string, differences?: any) {
    const template = getTemplate(templateName);
    const thingId = await createThingId(B, id);
    const thing: ThingData = deepCopy(template.thing);
    thing.id = thingId;
    const planeNames = [ PLANE_DEFAULT, PLANE.LIMBO ];
    for (let planeName of planeNames) {
        const plane = await createPlaneFromAnother(B, thingId, template.plane, planeName, templateName == LIMBO_PORTAL_TEMPLATE);
        thing.planes[planeName] = plane.id;
    }
    thing.hostPlaneId = createPlaneId(PLANE.LIMBO, thingId);
    if (differences) {
        for (let key in differences) {
            thing[key] =  differences[key];
        }
    } 
    fixThingDefaults(thing)
    await B.things.save(thing);
    if (template.equipment) {
        const equip = await createEquipmentPlane(B, thing.id, template.equipment);
    }
    await B.awaken(thing.id)
    return thing;
}