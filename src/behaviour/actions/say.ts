import { BookServer } from "../../model/book"
import { ThingData, PlaneData, SAY } from "../../model/interfaces"
import { getBookId, createThingId } from "../../model/identity"
import { deepCopy } from "../../utils"
import * as geo from "../../model/geometry"
import * as updates from "../updates"
import * as events from "../events"
import * as actions from "../actions"
import * as cl from "../../commandline/commandline"
import { print } from "../../commandline/print"

export async function action(B: BookServer, action: actions.ActionSay) {
    if (action.loudness === undefined) action.loudness = SAY.SAY;
    const plane = await B.planes.load(action.planeId);
    const actor = await B.things.load(action.actorId);
    const recipients = [actor.id];
    if (action.loudness == SAY.SHOUT) {
        for (let id in plane.things) recipients.push(id);
    } else {
        // TODO spatial & proximity
    }
    for (let recipientId of recipients) {
        events.emit(B, {
            event: events.EVENT.HEAR,
            actorId: recipientId,
            thingId: actor.id,
            planeId: plane.id,
            what: action.what,
            loudness: action.loudness
        } as events.EventHear)        
    }
}