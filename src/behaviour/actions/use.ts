import { BookServer } from "../../model/book"
import { deepCopy } from "../../utils"
import { ThingData, PlaneData, CONSTRAINTS, checkConstraint, ThingConstraint } from "../../model/interfaces"
import { switchPlaneId, isLimboPortalId } from "../../model/identity"
import * as geo from "../../model/geometry"
import * as physics from "../../model/physics"
import * as updates from "../updates"
import * as events from "../events"
import * as actions from "../actions"
import * as cl from "../../commandline/commandline"

export async function action(B: BookServer, action: actions.ActionUse) {
    // definitive use
    await events.emit(B, {
        event: events.EVENT.PUSH,
        planeId:   action.planeId,
        actorId:   action.actorId,
        thingId:   action.thingId,
        direction: action.direction,
        slotName:  action.slotName,
    } as events.EventUse);
}


