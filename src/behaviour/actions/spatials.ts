import { BookServer } from "../../model/book"
import { ThingData, PlaneData, SAY } from "../../model/interfaces"
import { getBookId, createThingId } from "../../model/identity"
import { deepCopy } from "../../utils"
import * as identity from "../../model/identity"
import * as model from "../../model/interfaces"
import * as geo from "../../model/geometry"
import * as updates from "../updates"
import * as events from "../events"
import * as actions from "../actions"
import * as cl from "../../commandline/commandline"
import { print } from "../../commandline/print"



export async function place(B: BookServer, action: actions.ActionPlace) {
    const actor = await B.things.load(action.actorId);
    const plane = await B.planes.load(action.planeId);
    const thing = await B.things.load(action.thingId);
    let colliderId: string;
    let position: geo.Position = undefined;
    if (action.fit && !action.force) {
        position = await findNextFitting(B, thing, plane, action.position);
        if (!position) return;
    } else {
        if (action.force) {
            position = deepCopy(action.position);
        } else {
            colliderId = await findCollisionId(B, thing, plane, action.position);
            if (!colliderId) {
                position = deepCopy(action.position);
            }
        }
    }
    if (!colliderId) {
        const plane = await B.planes.load(action.planeId);
        plane.things[thing.id] = position;
        await B.planes.save(plane);
        const event = {
            event:    action.isEnter? events.EVENT.ENTER : events.EVENT.PLACE,
            actorId:  action.actorId,
            planeId:  action.planeId,
            thingId:  thing.id,
            position: position,           
        } as events.EventPlace;
        await events.emit(B, event);
    } else {
        const thing = await B.things.load(action.thingId);
        thing.physics._inertia = deepCopy(geo.DIRECTION.NONE);
        await B.things.save(thing);
        const event = {
            event:    events.EVENT.COLLISION,
            actorId:  action.actorId,
            planeId:  action.planeId,
            thingId:  thing.id,
            colliderId: colliderId,
            position: action.position,           
        } as events.EventCollision;
        await events.emit(B, event);
    }
    return position;
}


/**
 * Backpack-like fitting: first try to fill the horisontal row, if not possible, shift down to the next row.
 */
export async function findNextFitting(B: BookServer, 
                                      thing: ThingData, 
                                      plane:PlaneData, 
                                      position: geo.Position, 
                                      pBox?: geo.PositionedBox,
                                      ) {
    const isEquip = identity.isEquipmentPlaneId(plane.id);
    const thingBoxSource = isEquip
                         ? model.getThingBox(thing, geo.fromPositionedBox(pBox))
                         : thing.physics.box;
    if (!thingBoxSource || !thingBoxSource.w || !thingBoxSource.h) {
        return position;
    }
    pBox = pBox || geo.positionedBox(plane.physics.box);
    let result = deepCopy(position);
    let stepY = 0;
    const thingShiftX = thingBoxSource.w/2 - (thingBoxSource.anchor ? thingBoxSource.anchor.x : 0);
    const thingShiftY = thingBoxSource.h/2 - (thingBoxSource.anchor ? thingBoxSource.anchor.y : 0);
    let step = 0;
    let firstTime = true;
    while (geo.isBoxEndlessY(pBox) || result.y < pBox.n[3]) {       
        if (step++ > 10000) break;
        let thingBox = geo.positionedBox(thingBoxSource, result);
        let collider = await findCollision(B, thing, plane, result, pBox);
        if (collider) {
            const colliderBoxSource = isEquip
                                    ? model.getThingBox(collider, geo.fromPositionedBox(pBox))
                                    : collider.physics.box;
            const colliderBox = geo.positionedBox(colliderBoxSource, plane.things[collider.id]);
            result.x = colliderBox.n[2] + thingShiftX;
            if (stepY == 0 || stepY > colliderBox.n[3]) {
                stepY = colliderBox.n[3];
            }
        } else {
            if (geo.boxInBounds(thingBox, pBox)) {
                return result;
            } else {
                if (stepY == 0) break;
                result.y = stepY + thingShiftY;
                result.x = position.x;
                stepY = 0;                    
            }
        }
    }
}

// will it fit here?
export async function findCollision(B: BookServer, 
                                    thing: ThingData, 
                                    plane: PlaneData, 
                                    position: geo.Position,
                                    pBox?: geo.PositionedBox) {
    if (thing.equipment.thingSlot) return; // slots never collide;
    const isEquip = identity.isEquipmentPlaneId(plane.id)
    const thingBox = isEquip
                   ? model.getThingBox(thing, geo.fromPositionedBox(pBox))
                   : thing.physics.box
    for (let id in plane.things) {
        if (id != thing.id) {
            const another = await B.things.load(id);
            const anotherPos = plane.things[id];
            const anotherBox = isEquip
                             ? model.getThingBox(another, geo.fromPositionedBox(pBox))
                             : another.physics.box
            if (!another.equipment.thingSlot &&
                geo.boxOverlap(
                geo.positionedBox(thingBox,   position),
                geo.positionedBox(anotherBox, anotherPos))) {
                return another;
            }
        }
    }
    return undefined;
}

export async function willFit(B: BookServer, thing: ThingData, plane: PlaneData, position: geo.Position) {
    return !(await findCollision(B, thing, plane, position));
}

export async function findCollisionId(B: BookServer, thing: ThingData, plane: PlaneData, position: geo.Position) {
    const collider = await findCollision(B, thing, plane, position);
    return collider? collider.id : undefined;
}




