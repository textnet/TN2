/**
 * Written Word: Equipment
 * E.g. name, speed, background color.
 */

import { WrittenAnima } from "../detect"
// import { PlaneData, ThingData, PLANE_DEFAULT, SAY, API, CONSTRAINTS, COLORS } from 
import * as interfaces from "../../../model/interfaces"
import * as identity from "../../../model/identity"
import * as actions from "../../../behaviour/actions"
import * as updates from "../../../behaviour/updates"
import * as geo from "../../../model/geometry"
import * as equipment from "../../../model/equipment"

import { geoDirection, animaThing, writtenThing, WrittenThing, thingId } from "./thing"



/**
 * Equips
 * TBD
 */
export function equip( A: WrittenAnima, thing?: string|WrittenThing, owner?: string|WrittenThing, slot?:string ) {
    const item = animaThing(A, thing);
    const equipTo = animaThing(A, owner);

    actions.action(A.B, {
        action: actions.ACTION.EQUIP,
        actorId: A.thingId,
        planeId: equipTo.hostPlaneId,
        thingId: item.id,
        equipThingId: equipTo.id,
        slotName: slot,
    } as actions.ActionEquip);

    return true;
}

/**
 * Equips
 * TBD
 */
export function unEquip( A: WrittenAnima, owner?: string|WrittenThing, slot?:string, direction?: string|geo.Direction ) {
    const equipFrom = animaThing(A, owner);
    const dir = geoDirection(direction);

    actions.action(A.B, {
        action: actions.ACTION.UN_EQUIP,
        actorId: A.thingId,
        planeId: equipFrom.hostPlaneId,
        equipThingId: equipFrom.id,
        slotName: slot,
        direction: dir,
    } as actions.ActionUnEquip);

    return true;
}

/**
 * Equips
 * TBD
 */
export function reEquip( A: WrittenAnima, 
                        ownerFrom?: string|WrittenThing, slotFrom?:string,
                        ownerTo?:   string|WrittenThing, slotTo?:string) {
    const oTo = animaThing(A, ownerTo);
    const idFrom = thingId(A, ownerFrom);
    const idTo   = oTo.id;

    actions.action(A.B, {
        action: actions.ACTION.RE_EQUIP,
        actorId: A.thingId,
        planeId: oTo.hostPlaneId,
        equipFromId: idFrom,
        equipToId: idTo,
        slotFrom: slotFrom,
        slotTo:   slotTo,
    } as actions.ActionReEquip);

    return true;
}



