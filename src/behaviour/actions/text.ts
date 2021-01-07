import { BookServer } from "../../model/book"
import * as interfaces from "../../model/interfaces"

import { getBookId, createThingId } from "../../model/identity"
import { deepCopy } from "../../utils"
import * as geo from "../../model/geometry"
import * as updates from "../updates"
import * as events from "../events"
import * as actions from "../actions"
import * as cl from "../../commandline/commandline"
import { print } from "../../commandline/print"

export async function standUp(B: BookServer, action: actions.ActionStandUp) {
    const actor = await B.things.load(action.actorId);
    // 1. update kneeled state
    await updates.update(B, {
        update: updates.UPDATE.KNEELED,
        actorId: actor.id,
        id:      actor.id,
        isKneeled: false,
    } as updates.UpdateKneeled)    
    // 2. event
    await events.emit(B, {
        event: events.EVENT.STANDUP,
        planeId: action.planeId,
        actorId: actor.id,
        thingId: actor.id,
    } as events.EventStandUp);
    // 3. update text action
    return updateText(B, action as actions.ActionText);
}

export async function kneel(B: BookServer, action: actions.ActionKneel) {
    const actor = await B.things.load(action.actorId);
    // 1. update kneeled state
    await updates.update(B, {
        update: updates.UPDATE.KNEELED,
        actorId: actor.id,
        id:      actor.id,
        isKneeled: true,
    } as updates.UpdateKneeled)    
    // 2. event
    await events.emit(B, {
        event: events.EVENT.KNEEL,
        planeId: action.planeId,
        actorId: actor.id,
        thingId: actor.id,
    } as events.EventKneel);
}


export async function updateText(B: BookServer, action: actions.ActionText) {
    const plane = await B.planes.load(action.planeId);
    const actor = await B.things.load(action.actorId);
    const owner = await B.things.load(plane.ownerId);
    // 1. check constraints
    if (!interfaces.checkConstraint(actor.physics, owner.constraints[ interfaces.CONSTRAINTS.EDITABLE ])) return false;
    // 2. update text
    const shortenedText = action.text.replace(/(\s|\n)+$/, '');
    if (plane.text == shortenedText && 
        (!action.anchor || geo.isEqual(plane.textAnchor, action.anchor))) {
        return; // it is the same!
    } else {
        // do actual update
        await updates.update(B, {
            update: updates.UPDATE.TEXT,
            actorId: actor.id,
            id:      owner.id,
            planeId: plane.id,
            text:    action.text,
            anchor:  action.anchor,
        } as updates.UpdateText)
        // emit event
        await events.emit(B, {
            event: events.EVENT.TEXT,
            planeId: action.planeId,
            actorId: actor.id,
            thingId: owner.id,
            text:    action.text,
            anchor:  action.anchor,
        } as events.EventUpdateText);
    }
}